import connectDB from '../../../backend/src/config/db.js';
import Player from '../../../backend/src/models/Player.js';
import Match from '../../../backend/src/models/Match.js';
import {
  getBuildId, fetchJSON, URLs, parseStatement, computeBestBowling,
  computeMilestones, parseFieldingFromDismissal, DAITYA_TEAM_ID,
} from '../../../backend/src/utils/cricheroesClient.js';

const MAX_MATCH_PAGES = 50;

// ── Fetch paginated match history ────────────────────────────────────────────
async function fetchFullHistory(playerId, buildId, slug) {
  const all = [];
  let page = 1;
  while (page <= MAX_MATCH_PAGES) {
    const json = await fetchJSON(URLs.matches(buildId, playerId, slug, page));
    if (!json?.pageProps) break;
    const matches = json.pageProps.matches?.data || [];
    all.push(...matches);
    const next = json.pageProps.matches?.page?.next;
    if (next && next.includes('page=')) page++; else break;
  }
  return all;
}

// ── Fetch match detail from scorecard endpoint ───────────────────────────────
async function fetchMatchDetail(matchId, buildId, teamASlug, teamBSlug) {
  try {
    const slug = `${teamASlug}-vs-${teamBSlug}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let json = await fetchJSON(URLs.scorecard(buildId, matchId, slug));
    if (!json?.pageProps) return null;

    if (json.pageProps.__N_REDIRECT) {
      const redir  = json.pageProps.__N_REDIRECT.split('?')[0];
      const parts  = redir.split('/');
      const newSlug = parts[parts.length - 1] === 'scorecard' ? parts[parts.length - 2] : parts[parts.length - 1];
      json = await fetchJSON(URLs.scorecard(buildId, matchId, newSlug));
    }

    const pg = json?.pageProps;
    if (!pg) return null;

    const scorecard = pg.scorecard || [];
    const summary   = pg.summaryData?.data || {};
    const result_status =
      String(summary.winning_team_id) === DAITYA_TEAM_ID ? 'won' :
      summary.winning_team_id == 0 ? 'no_result' : 'lost';

    const partnerships = [];
    const fow = [];
    scorecard.forEach((inning, idx) => {
      const inningNo = idx + 1;
      const pData = Array.isArray(inning.partnership) ? inning.partnership
        : (inning.partnership && typeof inning.partnership === 'object' ? Object.values(inning.partnership) : []);
      pData.forEach(p => partnerships.push({
        batsmen: [p.batsman_1_name, p.batsman_2_name],
        runs: parseInt(p.runs) || 0, balls: parseInt(p.balls) || 0, inning: inningNo,
      }));
      const fData = Array.isArray(inning.fall_of_wicket) ? inning.fall_of_wicket
        : (inning.fall_of_wicket && typeof inning.fall_of_wicket === 'object' ? Object.values(inning.fall_of_wicket) : []);
      fData.forEach(f => fow.push({
        wicket_no: parseInt(f.wicket_number) || 0, score: f.score || '', over: f.over || '',
        player: f.player_name || '', inning: inningNo,
      }));
    });

    const performances = [];
    const getOrCreate = (name) => {
      let p = performances.find(x => x.player_name === name);
      if (!p) {
        p = {
          player_id: null, player_name: name,
          runs: 0, balls: 0, fours: 0, sixes: 0, strike_rate: 0,
          how_out: 'DNB', wickets: 0, overs_bowled: '0', runs_conceded: 0, economy: 0,
          catches: 0, run_outs: 0, stumpings: 0,
        };
        performances.push(p);
      }
      return p;
    };

    scorecard.forEach(inning => {
      const isDaitya = String(inning.team_id) === DAITYA_TEAM_ID;
      if (isDaitya) {
        (inning.batting || []).forEach(b => {
          const p = getOrCreate(b.name);
          p.runs = parseInt(b.runs) || 0;
          p.balls = parseInt(b.balls) || 0;
          p.fours = parseInt(b['4s']) || 0;
          p.sixes = parseInt(b['6s']) || 0;
          p.strike_rate = parseFloat(b.SR) || 0;
          p.how_out = b.how_to_out || 'DNB';
          const f = parseFieldingFromDismissal(p.how_out);
          p.catches += f.catches;
          p.run_outs += f.run_outs;
          p.stumpings += f.stumpings;
        });
      } else {
        (inning.bowling || []).forEach(bw => {
          const p = getOrCreate(bw.name);
          p.wickets = parseInt(bw.wickets) || 0;
          p.overs_bowled = bw.overs || '0';
          p.runs_conceded = parseInt(bw.runs) || 0;
          p.economy = parseFloat(bw.economy_rate) || 0;
        });
      }
    });

    return {
      match_id: String(matchId),
      date: new Date(summary.start_datetime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      opponent: String(summary.team_a_id) === DAITYA_TEAM_ID ? summary.team_b_name : summary.team_a_name,
      ground: summary.ground_name, city: summary.city_name,
      match_type: summary.match_type, ball_type: summary.ball_type,
      our_score: String(summary.team_a_id) === DAITYA_TEAM_ID ? summary.team_a_score : summary.team_b_score,
      opp_score: String(summary.team_a_id) === DAITYA_TEAM_ID ? summary.team_b_score : summary.team_a_score,
      our_overs: String(summary.team_a_id) === DAITYA_TEAM_ID ? summary.team_a_over : summary.team_b_over,
      opp_overs: String(summary.team_a_id) === DAITYA_TEAM_ID ? summary.team_b_over : summary.team_a_over,
      toss: summary.toss_details,
      result: summary.match_summary?.summary || '', result_status,
      partnerships, fall_of_wicket: fow,
      power_plays: pg.miniScorecard?.power_play || [],
      player_performances: performances,
      cricheroes_url: `https://cricheroes.com/scorecard/${matchId}/match-details`,
      raw_data: pg,
    };
  } catch (e) {
    console.error(`Error fetching match ${matchId}:`, e.message);
    return null;
  }
}

// ── Full player sync with scorecard details ──────────────────────────────────
async function syncPlayerFull(playerId, slug, buildId) {
  // 1. Fetch player stats
  const statsJson = await fetchJSON(URLs.stats(buildId, playerId, slug));
  const info = statsJson?.pageProps?.playerInfo?.data;
  if (!info) throw new Error(`No playerInfo for ${playerId}/${slug}`);

  const extras = parseStatement(info.player_statement || '');

  // 2. Fetch full match history
  const history = await fetchFullHistory(playerId, buildId, slug);
  console.log(`  📋 Found ${history.length} matches for ${info.name}`);

  // 3. Process each match with scorecard details
  const processedHistory = [];
  const bowlingPerfs = [];
  let totalCatches = 0, totalRunOuts = 0, totalStumpings = 0;
  let realHighScore = extras.high_score || 0;

  for (const mh of history) {
    if (mh.match_result !== 'Resulted') continue;

    let matchDoc = await Match.findOne({ match_id: String(mh.match_id) });
    if (!matchDoc) {
      const detailed = await fetchMatchDetail(mh.match_id, buildId, mh.team_a, mh.team_b);
      if (detailed) {
        matchDoc = await Match.findOneAndUpdate(
          { match_id: detailed.match_id }, detailed, { upsert: true, new: true }
        );
      }
    }

    const cleanString = str => (str || '').replace(/_/g, ' ').replace(/[!._]+$/, '').trim().toLowerCase();
    const cleanPlayerName = cleanString(info.name);
    const firstName = cleanPlayerName.split(' ')[0];
    const rawPerf = matchDoc?.player_performances.find(p => cleanString(p.player_name).includes(firstName));

    const playerPerf = {
      batting: {
        runs: rawPerf?.runs || 0, balls: rawPerf?.balls || 0,
        fours: rawPerf?.fours || 0, sixes: rawPerf?.sixes || 0,
        strike_rate: rawPerf?.strike_rate || 0, how_out: rawPerf?.how_out || 'DNB',
      },
      bowling: {
        wickets: rawPerf?.wickets || 0, overs: rawPerf?.overs_bowled || '0',
        runs: rawPerf?.runs_conceded || 0, economy: rawPerf?.economy || 0,
      },
    };

    if (playerPerf.batting.runs > realHighScore) realHighScore = playerPerf.batting.runs;
    if (playerPerf.bowling.wickets > 0) {
      bowlingPerfs.push({ wickets: playerPerf.bowling.wickets, runs: playerPerf.bowling.runs, overs: playerPerf.bowling.overs });
    }
    totalCatches   += rawPerf?.catches || 0;
    totalRunOuts   += rawPerf?.run_outs || 0;
    totalStumpings += rawPerf?.stumpings || 0;

    processedHistory.push({
      match_id: String(mh.match_id),
      date: new Date(mh.match_start_time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      opponent: String(mh.team_a_id) === DAITYA_TEAM_ID ? mh.team_b : mh.team_a,
      won: String(mh.winning_team_id) === DAITYA_TEAM_ID,
      my_score: (String(mh.team_a_id) === DAITYA_TEAM_ID ? mh.team_a_summary : mh.team_b_summary) || '—',
      opp_score: (String(mh.team_a_id) === DAITYA_TEAM_ID ? mh.team_b_summary : mh.team_a_summary) || '—',
      result: mh.match_summary?.summary || '',
      cricheroes_url: `https://cricheroes.com/scorecard/${mh.match_id}/match-details`,
      performance: playerPerf,
    });
  }

  // 4. Compute derived stats
  const bestBowling = computeBestBowling(bowlingPerfs);
  const { fifties, hundreds } = computeMilestones(processedHistory);

  // 5. Build payload
  const payload = {
    external_id:   String(info.player_id || playerId),
    name:          info.name || slug,
    image_url:     info.profile_photo || '',
    role:          info.playing_role || 'Unknown',
    matches:       info.total_matches || 0,
    runs:          info.total_runs || 0,
    wickets:       info.total_wickets || 0,
    catches:       totalCatches,
    run_outs:      totalRunOuts,
    stumpings:     totalStumpings,
    man_of_the_match: extras.man_of_the_match || 0,
    tournaments:   extras.tournaments || 0,
    titles:        info.badges?.map(b => b.name) || [],
    batting: {
      average:     extras.batting_average || 0,
      strike_rate: extras.strike_rate || 0,
      high_score:  realHighScore,
      total_runs:  info.total_runs || 0,
      innings:     extras.innings || 0,
      fours:       extras.fours || 0,
      sixes:       extras.sixes || 0,
      fifties,
      hundreds,
    },
    bowling: {
      wickets:       info.total_wickets || 0,
      economy:       extras.economy || 0,
      overs:         extras.overs || 0,
      average:       info.total_wickets > 0 && extras.overs > 0 ? Math.round((extras.overs * 6 / info.total_wickets) * 100) / 100 : 0,
      five_w:        0,
      best_bowling:  bestBowling,
    },
    general: {
      dob:           info.dob || '',
      batting_style: info.batting_hand || '',
      bowling_style: info.bowling_style || '',
    },
    match_history:  processedHistory,
    last_synced_at: new Date(),
  };

  await Player.findOneAndUpdate(
    { external_id: payload.external_id }, payload,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return {
    name: payload.name, image_url: payload.image_url,
    matches: payload.matches, runs: payload.runs, wickets: payload.wickets,
    catches: payload.catches, run_outs: payload.run_outs, stumpings: payload.stumpings,
    fifties, hundreds, best_bowling: bestBowling,
    match_count: processedHistory.length, external_id: payload.external_id,
  };
}

// ── API handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // Auth check
  const secret = req.query.secret || req.headers['x-sync-secret'];
  if (secret !== process.env.ADMIN_SECRET && secret !== 'daitya_sync_2024') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { playerId, slug } = req.query;
  if (!playerId || !slug) {
    return res.status(400).json({
      error: 'playerId and slug required',
      usage: '?playerId=11341711&slug=ansh&secret=daitya_sync_2024',
    });
  }

  try {
    await connectDB();
    const buildId = await getBuildId();
    const player = await syncPlayerFull(playerId, slug, buildId);
    res.json({ success: true, player });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
