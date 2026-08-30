/**
 * Shared CricHeroes API client – used by scraperService, api/players, api/admin sync, etc.
 *
 * Features:
 *   • Build ID caching (refreshes only when stale)
 *   • Rate limiting between requests
 *   • Retry with exponential back-off
 *   • AbortController timeout on every fetch
 *   • Fielding-stats parser (catches / run-outs / stumpings from how_to_out)
 */

const DAITYA_TEAM_ID = '11183415';

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const REQUEST_DELAY_MS = 1200;
const FETCH_TIMEOUT_MS  = 30000;
const BUILD_ID_TTL_MS   = 30 * 60 * 1000; // 30 min

// ── Rate limiter ─────────────────────────────────────────────────────────────
let _lastRequestTime = 0;

async function rateLimit() {
  const now  = Date.now();
  const diff = now - _lastRequestTime;
  if (diff < REQUEST_DELAY_MS) {
    await new Promise(r => setTimeout(r, REQUEST_DELAY_MS - diff));
  }
  _lastRequestTime = Date.now();
}

// ── Build ID cache ───────────────────────────────────────────────────────────
let _buildId       = null;
let _buildIdFetchedAt = 0;

export async function getBuildId(force = false) {
  const now = Date.now();
  if (!force && _buildId && (now - _buildIdFetchedAt) < BUILD_ID_TTL_MS) {
    return _buildId;
  }

  const html = await fetchText('https://cricheroes.com/');
  const match = html.match(/"buildId"\s*:\s*"([^"]+)"/);
  if (!match) throw new Error('Could not extract buildId from CricHeroes');

  _buildId           = match[1];
  _buildIdFetchedAt  = now;
  return _buildId;
}

// ── Core fetchers ────────────────────────────────────────────────────────────

/**
 * Fetch raw text from a URL (rate-limited, with timeout).
 */
export async function fetchText(url) {
  await rateLimit();
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept:       'text/html',
        Referer:      'https://cricheroes.com/',
      },
      signal: controller.signal,
    });
    clearTimeout(tid);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res.text();
  } catch (e) {
    clearTimeout(tid);
    throw e;
  }
}

/**
 * Fetch JSON from a CricHeroes _next/data URL.
 * Retries up to `retries` times with exponential back-off.
 * Returns null on 404.
 */
export async function fetchJSON(url, retries = 3) {
  await rateLimit();
  for (let i = 0; i < retries; i++) {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          Accept:       'application/json',
          Referer:      'https://cricheroes.com/',
        },
        signal: controller.signal,
      });
      clearTimeout(tid);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      clearTimeout(tid);
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
  return null;
}

// ── Convenience URL builders ─────────────────────────────────────────────────

export const URLs = {
  stats: (buildId, playerId, slug) =>
    `https://cricheroes.com/_next/data/${buildId}/player-profile/${playerId}/${slug}/stats.json?playerId=${playerId}&slug=${slug}`,

  matches: (buildId, playerId, slug, page = 1) =>
    `https://cricheroes.com/_next/data/${buildId}/player-profile/${playerId}/${slug}/matches.json?playerId=${playerId}&slug=${slug}` +
    (page > 1 ? `&page=${page}` : ''),

  scorecard: (buildId, matchId, slug) =>
    `https://cricheroes.com/_next/data/${buildId}/scorecard/${matchId}/${slug}/scorecard/scorecard.json?matchId=${matchId}`,

  teamMembers: (buildId, slug = 'daitya-legion') =>
    `https://cricheroes.com/_next/data/${buildId}/team-profile/${DAITYA_TEAM_ID}/${slug}/members.json?teamId=${DAITYA_TEAM_ID}&teamName=${slug}&tab=members`,

  teamProfile: (buildId, slug = 'daitya-legion') =>
    `https://cricheroes.com/_next/data/${buildId}/team-profile/${DAITYA_TEAM_ID}/${slug}.json`,
};

// ── Player statement parser ──────────────────────────────────────────────────

export function parseStatement(ps = '') {
  if (!ps) return {};
  const n = rx => { const m = ps.match(rx); return m ? parseFloat(m[1]) : 0; };
  return {
    innings:          n(/With (\d+) turns at the crease/),
    high_score:       n(/top score of <b>([^<]+)<\/b>/),
    batting_average:  n(/average of <b>([^<]+)<\/b>/),
    strike_rate:      n(/strike rate of <b>([^<]+)<\/b>/),
    sixes:            n(/<b>(\d+) sixes<\/b>/),
    fours:            n(/<b>(\d+) fours<\/b>/),
    overs:            n(/bowled <b>([^<]+)<\/b> overs/),
    total_wickets:    n(/taking <b>(\d+)<\/b> wickets/),
    economy:          n(/economy rate of <b>([^<]+)<\/b>/),
    catches:          n(/Taking <b>(\d+)<\/b> catches/),
    run_outs:         n(/making <b>(\d+)<\/b> run outs/),
    man_of_the_match: n(/has won <b>(\d+)<\/b> Man of the Match/),
    tournaments:      n(/played in <b>(\d+)<\/b> different tournaments/),
  };
}

// ── Fielding stats from batting dismissal strings ────────────────────────────
//
// CricHeroes how_to_out examples:
//   "c PlayerName b BowlerName"         → catch
//   "c & b BowlerName"                  → catch
//   "run out (PlayerName)"              → run out
//   "st PlayerName b BowlerName"        → stumping
//   "Not Out" / "DNB"                  → nothing

export function parseFieldingFromDismissal(howOut = '') {
  if (!howOut || howOut === 'DNB') return { catches: 0, run_outs: 0, stumpings: 0 };
  const low = howOut.toLowerCase();
  return {
    catches:   /^c\s+/.test(low) && !low.startsWith('c & b') ? 1 : 0,
    run_outs:  /^run\s+out/i.test(low) ? 1 : 0,
    stumpings: /^st\s+/.test(low) ? 1 : 0,
  };
}

/**
 * Aggregate fielding stats from an array of match performances.
 */
export function aggregateFielding(matchPerformances = []) {
  let catches = 0, run_outs = 0, stumpings = 0;
  for (const perf of matchPerformances) {
    const f = parseFieldingFromDismissal(perf.how_out);
    catches   += f.catches;
    run_outs  += f.run_outs;
    stumpings += f.stumpings;
  }
  return { catches, run_outs, stumpings };
}

// ── Compute best bowling from a list of per-match bowling figures ─────────────

/**
 * @param {Array<{wickets: number, runs: number, overs: string|number}>} bowlingPerfs
 * @returns {string} e.g. "3/15"
 */
export function computeBestBowling(bowlingPerfs = []) {
  let best = '—';
  let bestW = -1, bestR = 9999;
  for (const b of bowlingPerfs) {
    const w = b.wickets ?? 0;
    const r = b.runs    ?? 0;
    if (w > bestW || (w === bestW && r < bestR)) {
      bestW = w; bestR = r;
      best = `${w}/${r}`;
    }
  }
  return bestW >= 0 ? best : '—';
}

// ── Compute fifties & hundreds from match history ────────────────────────────

export function computeMilestones(matchHistory = []) {
  let fifties = 0, hundreds = 0;
  for (const m of matchHistory) {
    const runs = m.performance?.batting?.runs ?? 0;
    if (runs >= 100) hundreds++;
    else if (runs >= 50) fifties++;
  }
  return { fifties, hundreds };
}

// ── Blacklists ───────────────────────────────────────────────────────────────

export const BLACKLIST_IDS = ['1', '3', '21556092', '38569177', '14546201'];
export const BLACKLIST_NAMES = [
  'Vikram Singh', 'Aditya Jethuri', 'Aryan Singh', 'Pranjal', 'Pranjal Rawat',
  'Paritosh Dhyani', 'Abhideep Gupta', 'Ujjwal Sati', 'Vaibhav', 'Piyush',
  'Piyush ', 'Armaan Rawat', 'Armaan', 'Arman Rawat', 'Gaurav Kothiyal',
  'Himanshu Bisht', 'Saksham',
];

// ── Team member list ─────────────────────────────────────────────────────────

export async function getTeamMembers(buildId) {
  console.log('  👥 Fetching team member list...');
  try {
    const slugs = ['daitya-legion', 'daitya-legion-'];
    for (const slug of slugs) {
      const url   = URLs.teamMembers(buildId, slug);
      const json  = await fetchJSON(url);
      const data  = json?.pageProps?.memberList?.data;
      if (data && Array.isArray(data)) {
        return data
          .map(m => ({
            external_id: String(m.player_id || m.member_id),
            name:        m.name,
            image_url:   m.profile_photo,
            role:        m.playing_role,
            slug:        m.slug || m.name.toLowerCase().replace(/\s+/g, '-'),
          }))
          .filter(m =>
            !BLACKLIST_IDS.includes(m.external_id) &&
            !BLACKLIST_NAMES.includes(m.name)
          );
      }
    }
  } catch (_) { /* fall through */ }

  // HTML fallback
  try {
    const html = await fetchText('https://cricheroes.com/team-profile/11183415/daitya-legion/members');
    const links = [...html.matchAll(/href="\/player-profile\/(\d+)\/([^"]+)/g)];
    const seen  = new Set();
    const out   = [];
    for (const [, id, slug] of links) {
      if (seen.has(id) || BLACKLIST_IDS.includes(id)) continue;
      seen.add(id);
      const name = decodeURIComponent(slug.replace(/-/g, ' '));
      if (BLACKLIST_NAMES.includes(name)) continue;
      out.push({ external_id: id, name, slug, role: 'Unknown' });
    }
    return out;
  } catch (_) {
    return [];
  }
}

export { DAITYA_TEAM_ID, USER_AGENT };
