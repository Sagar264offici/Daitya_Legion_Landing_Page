import Player from '../models/Player.js';
import Match from '../models/Match.js';
import Team from '../models/Team.js';

const DAITYA_TEAM_ID = '11183415';
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const REQUEST_DELAY_MS = 1500;
const FETCH_TIMEOUT_MS = 30000;
const MAX_MATCH_PAGES = 50;

const BLACKLIST_IDS = ['1', '3', '21556092', '38569177', '14546201'];
const BLACKLIST_NAMES = ['Vikram Singh', 'Aditya Jethuri', 'Aryan Singh', 'Pranjal', 'Pranjal Rawat', 'Paritosh Dhyani', 'Abhideep Gupta', 'Ujjwal Sati', 'Vaibhav', 'Piyush', 'Piyush ', 'Armaan Rawat', 'Armaan', 'Arman Rawat', 'Gaurav Kothiyal', 'Himanshu Bisht', 'Saksham'];

let lastRequestTime = 0;

async function rateLimit() {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < REQUEST_DELAY_MS) {
    await new Promise(r => setTimeout(r, REQUEST_DELAY_MS - elapsed));
  }
  lastRequestTime = Date.now();
}

async function fetchText(url) {
  await rateLimit();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, 'Accept': 'text/html', 'Referer': 'https://cricheroes.com/' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res.text();
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}

async function fetchJSON(url, retries = 3) {
  await rateLimit();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json', 'Referer': 'https://cricheroes.com/' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      const delay = Math.pow(2, i) * 1000;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

export async function getBuildId() {
  const html = await fetchText('https://cricheroes.com/');
  const match = html.match(/"buildId"\s*:\s*"([^"]+)"/);
  if (!match) throw new Error('Could not find buildId');
  return match[1];
}

function parseStatement(ps) {
  if (!ps) return {};
  const num = (regex) => {
    const m = ps.match(regex);
    return m ? parseFloat(m[1]) : 0;
  };
  return {
    innings: num(/With (\d+) turns at the crease/),
    high_score: num(/top score of <b>([^<]+)<\/b>/),
    batting_average: num(/average of <b>([^<]+)<\/b>/),
    strike_rate: num(/strike rate of <b>([^<]+)<\/b>/),
    sixes: num(/<b>(\d+) sixes<\/b>/),
    fours: num(/<b>(\d+) fours<\/b>/),
    overs: num(/bowled <b>([^<]+)<\/b> overs/),
    total_wickets: num(/taking <b>(\d+)<\/b> wickets/),
    economy: num(/economy rate of <b>([^<]+)<\/b>/),
    catches: num(/Taking <b>(\d+)<\/b> catches/),
    run_outs: num(/making <b>(\d+)<\/b> run outs/),
    man_of_the_match: num(/has won <b>(\d+)<\/b> Man of the Match awards/),
    tournaments: num(/played in <b>(\d+)<\/b> different tournaments/),
    titles: Array.from(ps.matchAll(/class="badge[^>]+>([^<]+)<\/span>/g)).map(m => m[1].trim())
  };
}

export async function fetchMatchDetails(matchId, buildId, teamASlug, teamBSlug) {
  console.log(`    🔍 Deep Scouting Match ${matchId}...`);
  try {
    const slug = `${teamASlug}-vs-${teamBSlug}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const url = `https://cricheroes.com/_next/data/${buildId}/scorecard/${matchId}/${slug}/scorecard/scorecard.json?matchId=${matchId}`;
    
    let json = await fetchJSON(url);
    if (!json || !json.pageProps) return null;

    if (json.pageProps.__N_REDIRECT) {
        const redir = json.pageProps.__N_REDIRECT.split('?')[0];
        const parts = redir.split('/');
        const newSlug = parts[parts.length - 1] === 'scorecard' ? parts[parts.length - 2] : parts[parts.length - 1];
        const retryUrl = `https://cricheroes.com/_next/data/${buildId}/scorecard/${matchId}/${newSlug}/scorecard/scorecard.json?matchId=${matchId}`;
        json = await fetchJSON(retryUrl);
    }

    const pg = json.pageProps;
    const scorecard = pg.scorecard || [];
    const summary = pg.summaryData?.data || {};

    const result_status = summary.winning_team_id == DAITYA_TEAM_ID ? 'won' : (summary.winning_team_id == 0 ? 'no_result' : 'lost');

    const partnerships = [];
    const fow = [];
    scorecard.forEach((inning, idx) => {
        const inningNo = idx + 1;
        const pData = Array.isArray(inning.partnership) ? inning.partnership : (inning.partnership && typeof inning.partnership === 'object' ? Object.values(inning.partnership) : []);
        pData.forEach(p => partnerships.push({ 
            batsmen: [p.batsman_1_name, p.batsman_2_name],
            runs: parseInt(p.runs) || 0,
            balls: parseInt(p.balls) || 0,
            inning: inningNo
        }));

        const fData = Array.isArray(inning.fall_of_wicket) ? inning.fall_of_wicket : (inning.fall_of_wicket && typeof inning.fall_of_wicket === 'object' ? Object.values(inning.fall_of_wicket) : []);
        fData.forEach(f => fow.push({
            wicket_no: parseInt(f.wicket_number) || 0,
            score: f.score || '',
            over: f.over || '',
            player: f.player_name || '',
            inning: inningNo
        }));
    });

    const performances = [];
    scorecard.forEach(inning => {
        (inning.batting || []).forEach(b => {
             performances.push({
                player_id: null,
                player_name: b.name,
                runs: parseInt(b.runs) || 0,
                balls: parseInt(b.balls) || 0,
                fours: parseInt(b['4s']) || 0,
                sixes: parseInt(b['6s']) || 0,
                strike_rate: parseFloat(b.SR) || 0,
                how_out: b.how_to_out || 'DNB'
             });
        });
        (inning.bowling || []).forEach(bw => {
            const existing = performances.find(p => p.player_name === bw.name);
            const bowlerData = {
                wickets: parseInt(bw.wickets) || 0,
                overs_bowled: bw.overs || '0',
                runs_conceded: parseInt(bw.runs) || 0,
                economy: parseFloat(bw.economy_rate) || 0
            };
            if (existing) {
                Object.assign(existing, bowlerData);
            } else {
                performances.push({ player_name: bw.name, ...bowlerData });
            }
        });
    });

    return {
        match_id: String(matchId),
        date: new Date(summary.start_datetime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        opponent: String(summary.team_a_id) === DAITYA_TEAM_ID ? summary.team_b_name : summary.team_a_name,
        ground: summary.ground_name,
        city: summary.city_name,
        match_type: summary.match_type,
        ball_type: summary.ball_type,
        our_score: String(summary.team_a_id) === DAITYA_TEAM_ID ? summary.team_a_score : summary.team_b_score,
        opp_score: String(summary.team_a_id) === DAITYA_TEAM_ID ? summary.team_b_score : summary.team_a_score,
        our_overs: String(summary.team_a_id) === DAITYA_TEAM_ID ? summary.team_a_over : summary.team_b_over,
        opp_overs: String(summary.team_a_id) === DAITYA_TEAM_ID ? summary.team_b_over : summary.team_a_over,
        toss: summary.toss_details,
        result: summary.match_summary?.summary || '',
        result_status,
        partnerships,
        fall_of_wicket: fow,
        power_plays: pg.miniScorecard?.power_play || [],
        player_performances: performances,
        cricheroes_url: `https://cricheroes.com/scorecard/${matchId}/match-details`,
        raw_data: pg
    };
  } catch (e) {
    console.error(`    ❌ Error fetching match details ${matchId}:`, e.message);
    return null;
  }
}

async function fetchFullMatchHistory(playerId, buildId, slug) {
  const allMatchesInfo = [];
  let currentPageUrl = `https://cricheroes.com/_next/data/${buildId}/player-profile/${playerId}/${slug}/matches.json?playerId=${playerId}&slug=${slug}`;
  let page = 1;

  while (currentPageUrl) {
    console.log(`    📄 Fetching Match History Page ${page}...`);
    const json = await fetchJSON(currentPageUrl);
    if (!json || !json.pageProps) break;

    const matches = json.pageProps.matches?.data || [];
    allMatchesInfo.push(...matches);

    const next = json.pageProps.matches?.page?.next;
    if (next && next.includes('page=')) {
        const pageNum = next.match(/page=(\d+)/)?.[1];
        currentPageUrl = `https://cricheroes.com/_next/data/${buildId}/player-profile/${playerId}/${slug}/matches.json?playerId=${playerId}&slug=${slug}&page=${pageNum}`;
        page++;
    } else {
        currentPageUrl = null;
    }
  }
  return allMatchesInfo;
}

async function getTeamMembers(buildId) {
  console.log('    👥 Fetching team member list...');
  try {
    const slugs = ['daitya-legion', 'daitya-legion-'];
    for (const slug of slugs) {
        const dataUrl = `https://cricheroes.com/_next/data/${buildId}/team-profile/11183415/${slug}/members.json?teamId=11183415&teamName=${slug}&tab=members`;
        const json = await fetchJSON(dataUrl);
        if (json?.pageProps?.memberList?.data) {
            const members = json.pageProps.memberList.data;
            return members.map(m => ({
                external_id: String(m.player_id || m.member_id),
                name: m.name,
                image_url: m.profile_photo,
                role: m.playing_role,
                slug: m.slug || m.name.toLowerCase().replace(/\s+/g, '-')
            })).filter(m => !BLACKLIST_IDS.includes(m.external_id) && !BLACKLIST_NAMES.includes(m.name));
        }
    }
  } catch(e) {}

  try {
    const html = await fetchText('https://cricheroes.com/team-profile/11183415/daitya-legion/members');
    const links = [...html.matchAll(/href="\/player-profile\/(\d+)\/([^/"]+)/g)];
    const seen = new Set();
    const members = [];
    for (const [, id, slug] of links) {
      if (seen.has(id) || BLACKLIST_IDS.includes(id)) continue;
      seen.add(id);
      const name = decodeURIComponent(slug.replace(/-/g, ' '));
      if (BLACKLIST_NAMES.includes(name)) continue;
      members.push({ external_id: id, name, slug, role: 'Unknown' });
    }
    return members;
  } catch (e) {
    return [];
  }
}

export const scrapePlayers = async (options = {}) => {
  const { force = false, targetPlayers = [] } = options;
  console.log(`🚀 Starting DEEP SOURCE OVERHAUL Sync...`);
  const buildId = await getBuildId();

  const members = await getTeamMembers(buildId);
  const filteredMembers = targetPlayers.length > 0 ? members.filter(m => targetPlayers.includes(m.name.toLowerCase()) || targetPlayers.includes(m.external_id)) : members;

  console.log(`🎯 Targeting ${filteredMembers.length} players for deep sync.`);

  for (const m of filteredMembers) {
    console.log(`\n👤 Processing ${m.name} (${m.external_id})...`);
    try {
        const statsUrl = `https://cricheroes.com/_next/data/${buildId}/player-profile/${m.external_id}/${m.slug}/stats.json`;
        const statsJson = await fetchJSON(statsUrl);
        const info = statsJson?.pageProps?.playerInfo?.data;
        if (!info) continue;

        const extras = parseStatement(info.player_statement);
        const history = await fetchFullMatchHistory(m.external_id, buildId, m.slug);
        
        const processedHistory = [];
        let realHighScore = extras.high_score || 0;

        for (const mh of history) {
            if (mh.match_result !== 'Resulted') continue;

            let matchDoc = await Match.findOne({ match_id: String(mh.match_id) });
            if (!matchDoc || force) {
                const detailedMatch = await fetchMatchDetails(mh.match_id, buildId, mh.team_a, mh.team_b);
                if (detailedMatch) {
                    matchDoc = await Match.findOneAndUpdate({ match_id: detailedMatch.match_id }, detailedMatch, { upsert: true, new: true });
                }
            }

            const firstName = m.name.split(' ')[0].toLowerCase();
            const playerPerf = matchDoc?.player_performances.find(p => p.player_name.toLowerCase().includes(firstName)) || {
                batting: { runs: 0, balls: 0, fours: 0, sixes: 0, strike_rate: 0, how_out: 'DNB' },
                bowling: { wickets: 0, overs_bowled: '0', runs_conceded: 0, economy: 0 }
            };

            if (playerPerf.batting?.runs > realHighScore) realHighScore = playerPerf.batting.runs;

            processedHistory.push({
                match_id: String(mh.match_id),
                date: new Date(mh.match_start_time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                opponent: String(mh.team_a_id) === DAITYA_TEAM_ID ? mh.team_b : mh.team_a,
                result: mh.match_summary?.summary || '',
                won: String(mh.winning_team_id) === DAITYA_TEAM_ID,
                my_score: (String(mh.team_a_id) === DAITYA_TEAM_ID ? mh.team_a_summary : mh.team_b_summary) || '—',
                opp_score: (String(mh.team_a_id) === DAITYA_TEAM_ID ? mh.team_b_summary : mh.team_a_summary) || '—',
                performance: playerPerf
            });
        }

        const dbPayload = {
            external_id: m.external_id,
            name: info.name,
            role: info.playing_role || m.role,
            image_url: info.profile_photo,
            matches: info.total_matches || 0,
            runs: info.total_runs || 0,
            wickets: info.total_wickets || 0,
            titles: info.badges?.map(b => b.name) || extras.titles || [],
            batting: {
                average: extras.batting_average || 0,
                strike_rate: extras.strike_rate || 0,
                high_score: realHighScore,
                total_runs: info.total_runs || 0,
                innings: extras.innings || 0,
                fours: extras.fours || 0,
                sixes: extras.sixes || 0
            },
            bowling: {
                wickets: info.total_wickets || 0,
                economy: extras.economy || 0,
                overs: extras.overs || 0,
                best_bowling: 'N/A'
            },
            match_history: processedHistory
        };

        const existing = await Player.findOne({ external_id: m.external_id });
        if (existing && (!existing.is_manual_override || force)) {
            await Player.updateOne({ external_id: m.external_id }, { $set: dbPayload });
        } else if (!existing) {
            await Player.create(dbPayload);
        }

        console.log(`    ✅ Updated ${m.name}. HS: ${realHighScore}`);
    } catch (e) {
        console.error(`    ❌ Error processing ${m.name}:`, e.message);
    }
  }

  const players = await Player.find({});
  const teamStats = {
      total_matches: Math.max(...players.map(p => p.matches || 0), 0),
      total_runs: players.reduce((a, p) => a + (p.runs || 0), 0),
      total_wickets: players.reduce((a, p) => a + (p.wickets || 0), 0),
      last_updated: Date.now()
  };
  await Team.findOneAndUpdate({ name: 'Daitya Legion' }, teamStats, { upsert: true });
};
