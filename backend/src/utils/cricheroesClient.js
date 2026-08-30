/**
 * CricHeroes REST API client
 *
 * Uses the public REST API at https://api.cricheroes.in
 * with the website's embedded API key. No scraping needed.
 */

import crypto from 'crypto';

const API_HOST = 'https://api.cricheroes.in';
const API_KEY  = 'cr!CkH3r0s';
const DAITYA_TEAM_ID = '11183415';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const REQUEST_DELAY_MS = 400;   // 400ms between API calls (much faster than scraping)
const FETCH_TIMEOUT_MS  = 15000;

// ── Rate limiter ─────────────────────────────────────────────────────────────
let _lastReq = 0;
async function rateLimit() {
  const diff = Date.now() - _lastReq;
  if (diff < REQUEST_DELAY_MS) await new Promise(r => setTimeout(r, REQUEST_DELAY_MS - diff));
  _lastReq = Date.now();
}

// ── Core fetcher ─────────────────────────────────────────────────────────────

/**
 * Make a request to the CricHeroes REST API.
 * @param {string} endpoint - e.g. '/api/v1/team/get-team-member/11183415'
 * @returns {object|null} - parsed JSON response data
 */
export async function apiFetch(endpoint) {
  await rateLimit();
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const url = `${API_HOST}${endpoint}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent':  UA,
        'Accept':      'application/json',
        'api-key':     API_KEY,
        'device-type': 'web',
        'udid':        crypto.randomUUID(),
      },
      signal: controller.signal,
    });
    clearTimeout(tid);

    if (!res.ok) throw new Error(`HTTP ${res.status} for ${endpoint}`);
    const json = await res.json();
    if (!json.status) {
      console.warn(`  ⚠️  API returned status=false for ${endpoint}:`, json.error?.message);
      return null;
    }
    return json.data ?? json;
  } catch (e) {
    clearTimeout(tid);
    if (e.name === 'AbortError') {
      console.warn(`  ⏰ Timeout for ${endpoint}`);
      return null;
    }
    throw e;
  }
}

// ── Team endpoints ───────────────────────────────────────────────────────────

/** Get all team members with player_id, name, profile_photo */
export async function getTeamMembers() {
  const data = await apiFetch(`/api/v1/team/get-team-member/${DAITYA_TEAM_ID}`);
  if (!data?.members) return [];
  return data.members.map(m => ({
    external_id:    String(m.player_id),
    name:           m.name,
    image_url:      m.profile_photo || '',
    role:           m.playing_role || 'Unknown',
    slug:           m.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '') || '',
    is_captain:     m.is_captain === 1,
    is_admin:       m.is_admin === 1,
    batter_category: m.batter_category || '',
    bowler_category: m.bowler_category || '',
  }));
}

/** Get team profile info (logo, name, etc.) */
export async function getTeamProfile() {
  return await apiFetch(`/api/v1/team/get-team-profile-info/${DAITYA_TEAM_ID}`);
}

/** Get team aggregate statistics */
export async function getTeamStatistics() {
  return await apiFetch(`/api/v1/team/get-team-statistic/${DAITYA_TEAM_ID}`);
}

// ── Player endpoints ─────────────────────────────────────────────────────────

/**
 * Get a player's full batting & bowling statistics.
 * Returns { statistics: { batting: [...], bowling: [...] } }
 */
export async function getPlayerStatistics(playerId) {
  return await apiFetch(`/api/v1/player/get-player-statistic/${playerId}`);
}

/**
 * Get a player's match history (paginated, 10 per page).
 * Returns array of match objects.
 */
export async function getPlayerMatches(playerId, page = 1) {
  const data = await apiFetch(`/api/v1/player/get-player-match/${playerId}?pageno=${page}`);
  if (!data) return [];
  // Data comes as { '0': {...}, '1': {...}, ... } or an array
  const matches = Array.isArray(data) ? data : Object.values(data);
  return matches.filter(m => m && m.match_id);
}

/**
 * Get all player matches (all pages).
 */
export async function getAllPlayerMatches(playerId) {
  const allMatches = [];
  let page = 1;
  const maxPages = 10; // safety limit

  while (page <= maxPages) {
    const matches = await getPlayerMatches(playerId, page);
    if (matches.length === 0) break;
    allMatches.push(...matches);
    if (matches.length < 10) break; // last page
    page++;
  }
  return allMatches;
}

/**
 * Get player gamification (badges/titles).
 */
export async function getPlayerGamification(playerId) {
  const data = await apiFetch(`/api/v1/player/get-player-gamification/${playerId}`);
  if (!Array.isArray(data)) return [];
  return data.map(b => b.name).filter(Boolean);
}

/**
 * Get player awards (MOM, etc.)
 */
export async function getPlayerAwards(playerId) {
  const data = await apiFetch(`/api/v1/player/get-player-award-new/${playerId}/overall`);
  if (!Array.isArray(data)) return [];
  return data;
}

/**
 * Get player tournament filters
 */
export async function getPlayerTournaments(playerId) {
  return await apiFetch(`/api/v1/player/get-player-filter-new/${playerId}`);
}

// ── Scorecard endpoints ──────────────────────────────────────────────────────

/**
 * Get scorecard summary for a match.
 */
export async function getScorecardSummary(matchId) {
  return await apiFetch(`/api/v1/scorecard/get-summary-scorecard/${matchId}`);
}

/**
 * Get mini scorecard (live/latest innings data).
 */
export async function getMiniScorecard(matchId) {
  return await apiFetch(`/api/v1/scorecard/get-mini-scorecard/${matchId}`);
}

/**
 * Get match detailed info.
 */
export async function getMatchDetailedInfo(matchId) {
  return await apiFetch(`/api/v1/scorecard/get-match-detailed-info/${matchId}`);
}

// ── Stat parsing helpers ─────────────────────────────────────────────────────

/**
 * Parse the statistics array from getPlayerStatistics into a flat object.
 * Input:  { statistics: { batting: [{title, value}, ...], bowling: [...] } }
 * Output: { matches, innings, runs, average, ... }
 */
export function parsePlayerStats(statsResponse) {
  if (!statsResponse?.statistics) return {};

  const parseArray = (arr) => {
    const result = {};
    for (const item of (arr || [])) {
      const key = item.title?.toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/highest_runs/, 'high_score')
        .replace(/avg/, 'average')
        .replace(/sr/, 'strike_rate');
      result[key] = item.value;
    }
    return result;
  };

  const bat = parseArray(statsResponse.statistics.batting);
  const bowl = parseArray(statsResponse.statistics.bowling);

  return {
    batting: {
      total_runs:  parseInt(bat.runs) || 0,
      innings:     parseInt(bat.innings) || 0,
      average:     parseFloat(bat.average) || 0,
      strike_rate: parseFloat(bat.strike_rate) || 0,
      high_score:  parseInt(bat.high_score) || 0,
      fours:       parseInt(bat['4s']) || 0,
      sixes:       parseInt(bat['6s']) || 0,
      fifties:     parseInt(bat['50s']) || 0,
      hundreds:    parseInt(bat['100s']) || 0,
      matches:     parseInt(bat.matches) || 0,
      ducks:       parseInt(bat.ducks) || 0,
      not_outs:    parseInt(bat.not_out) || 0,
      thirties:    parseInt(bat['30s']) || 0,
      won:         parseInt(bat.won) || 0,
      lost:        parseInt(bat.loss) || 0,
    },
    bowling: {
      wickets:    parseInt(bowl.wickets) || 0,
      economy:    parseFloat(bowl.economy) || 0,
      overs:      parseFloat(bowl.overs) || 0,
      average:    parseFloat(bowl.average) || 0,
      best_bowling: bowl.best_bowling || '—',
      strike_rate:  parseFloat(bowl.strike_rate) || 0,
      maidens:    parseInt(bowl.maidens) || 0,
      five_w:     parseInt(bowl['5w']) || parseInt(bowl['5_wickets']) || 0,
      runs:       parseInt(bowl.runs) || 0,
      wides:      parseInt(bowl.wides) || 0,
      no_balls:   parseInt(bowl.no_balls) || 0,
    },
  };
}

/**
 * Parse a CricHeroes match into our match_history format.
 */
export function parseMatchForHistory(match, daityaTeamId = DAITYA_TEAM_ID) {
  const isDaityaA = String(match.team_a_id) === daityaTeamId;
  const isDaityaB = String(match.team_b_id) === daityaTeamId;

  return {
    match_id: String(match.match_id),
    date: new Date(match.match_start_time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    opponent: isDaityaA ? match.team_b : match.team_a,
    won: String(match.winning_team_id) === daityaTeamId,
    my_score:  (isDaityaA ? match.team_a_summary : match.team_b_summary) || '—',
    opp_score: (isDaityaA ? match.team_b_summary : match.team_a_summary) || '—',
    result: match.match_summary?.summary || '',
    ground: match.ground_name || '',
    city: match.city_name || '',
    match_type: match.match_type || '',
    ball_type: match.ball_type || '',
    toss: match.toss_details || '',
    tournament: match.tournament_name || '',
    cricheroes_url: `https://cricheroes.com/scorecard/${match.match_id}/match-details`,
    performance: {
      batting: { runs: 0, balls: 0, fours: 0, sixes: 0, strike_rate: 0, how_out: 'DNB' },
      bowling: { wickets: 0, overs: '0', runs: 0, economy: 0 },
    },
  };
}

// ── Blacklists ───────────────────────────────────────────────────────────────

export const BLACKLIST_IDS = ['1', '3', '21556092', '38569177', '14546201'];
export const BLACKLIST_NAMES = [
  'Vikram Singh', 'Aditya Jethuri', 'Aryan Singh', 'Pranjal', 'Pranjal Rawat',
  'Paritosh Dhyani', 'Abhideep Gupta', 'Ujjwal Sati', 'Vaibhav', 'Piyush',
  'Piyush ', 'Armaan Rawat', 'Armaan', 'Arman Rawat', 'Gaurav Kothiyal',
  'Himanshu Bisht', 'Saksham',
];

export { DAITYA_TEAM_ID, API_HOST };
