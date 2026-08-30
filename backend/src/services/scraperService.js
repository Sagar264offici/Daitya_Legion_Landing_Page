import Player from '../models/Player.js';
import Match from '../models/Match.js';
import Team from '../models/Team.js';
import {
  getBuildId, fetchJSON, fetchText, URLs, parseStatement,
  parseFieldingFromDismissal, aggregateFielding, computeBestBowling,
  computeMilestones, getTeamMembers, DAITYA_TEAM_ID,
} from '../utils/cricheroesClient.js';

const MAX_MATCH_PAGES    = 50;
const CONCURRENCY_LIMIT  = 3;   // parallel match-detail fetches

// ── Semaphore for concurrent requests ────────────────────────────────────────
class Semaphore {
  constructor(max) { this._max = max; this._active = 0; this._queue = []; }
  async acquire() {
    if (this._active < this._max) { this._active++; return; }
    await new Promise(r => this._queue.push(r));
  }
  release() { this._active--; if (this._queue.length) this._queue.shift()(); }
}

// ── Fetch match details from scorecard ───────────────────────────────────────

export async function fetchMatchDetails(matchId, buildId, teamASlug, teamBSlug) {
  console.log(`    🔍 Deep Scouting Match ${matchId}...`);
  try {
    const slug = `${teamASlug}-vs-${teamBSlug}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const url  = URLs.scorecard(buildId, matchId, slug);
    let json   = await fetchJSON(url);

    if (!json?.pageProps) return null;

    // Handle redirect
    if (json.pageProps.__N_REDIRECT) {
      const redir  = json.pageProps.__N_REDIRECT.split('?')[0];
      const parts  = redir.split('/');
      const newSlug = parts[parts.length - 1] === 'scorecard' ? parts[parts.length - 2] : parts[parts.length - 1];
      json = await fetchJSON(URLs.scorecard(buildId, matchId, newSlug));
    }

    const pg        = json?.pageProps;
    if (!pg) return null;

    const scorecard = pg.scorecard || [];
    const summary   = pg.summaryData?.data || {};
    const result_status =
      String(summary.winning_team_id) === DAITYA_TEAM_ID ? 'won' :
      summary.winning_team_id == 0 ? 'no_result' : 'lost';

    // Partnerships & fall of wickets
    const partnerships = [];
    const fow          = [];
    scorecard.forEach((inning, idx) => {
      const inningNo = idx + 1;
      const pData = Array.isArray(inning.partnership) ? inning.partnership
        : (inning.partnership && typeof inning.partnership === 'object' ? Object.values(inning.partnership) : []);
      pData.forEach(p => partnerships.push({
        batsmen: [p.batsman_1_name, p.batsman_2_name],
        runs:    parseInt(p.runs) || 0,
        balls:   parseInt(p.balls) || 0,
        inning:  inningNo,
      }));

      const fData = Array.isArray(inning.fall_of_wicket) ? inning.fall_of_wicket
        : (inning.fall_of_wicket && typeof inning.fall_of_wicket === 'object' ? Object.values(inning.fall_of_wicket) : []);
      fData.forEach(f => fow.push({
        wicket_no: parseInt(f.wicket_number) || 0,
        score:     f.score || '',
        over:      f.over || '',
        player:    f.player_name || '',
        inning:    inningNo,
      }));
    });

    // Player performances (batting + bowling)
    const performances = [];
    const getOrCreate = (name) => {
      let p = performances.find(x => x.player_name === name);
      if (!p) {
        p = {
          player_id: null, player_name: name,
          runs: 0, balls: 0, fours: 0, sixes: 0, strike_rate: 0,
          how_out: 'DNB',
          wickets: 0, overs_bowled: '0', runs_conceded: 0, economy: 0,
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
          const p   = getOrCreate(b.name);
          p.runs       = parseInt(b.runs) || 0;
          p.balls      = parseInt(b.balls) || 0;
          p.fours      = parseInt(b['4s']) || 0;
          p.sixes      = parseInt(b['6s']) || 0;
          p.strike_rate = parseFloat(b.SR) || 0;
          p.how_out    = b.how_to_out || 'DNB';

          // Extract fielding stats from dismissal
          const f = parseFieldingFromDismissal(p.how_out);
          p.catches   += f.catches;
          p.run_outs  += f.run_outs;
          p.stumpings += f.stumpings;
        });
      } else {
        (inning.bowling || []).forEach(bw => {
          const p   = getOrCreate(bw.name);
          p.wickets       = parseInt(bw.wickets) || 0;
          p.overs_bowled  = bw.overs || '0';
          p.runs_conceded = parseInt(bw.runs) || 0;
          p.economy       = parseFloat(bw.economy_rate) || 0;
        });
      }
    });

    return {
      match_id:               String(matchId),
      date:                   new Date(summary.start_datetime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      opponent:               String(summary.team_a_id) === DAITYA_TEAM_ID ? summary.team_b_name : summary.team_a_name,
      ground:                 summary.ground_name,
      city:                   summary.city_name,
      match_type:             summary.match_type,
      ball_type:              summary.ball_type,
      our_score:              String(summary.team_a_id) === DAITYA_TEAM_ID ? summary.team_a_score : summary.team_b_score,
      opp_score:              String(summary.team_a_id) === DAITYA_TEAM_ID ? summary.team_b_score : summary.team_a_score,
      our_overs:              String(summary.team_a_id) === DAITYA_TEAM_ID ? summary.team_a_over   : summary.team_b_over,
      opp_overs:              String(summary.team_a_id) === DAITYA_TEAM_ID ? summary.team_b_over   : summary.team_a_over,
      toss:                   summary.toss_details,
      result:                 summary.match_summary?.summary || '',
      result_status,
      partnerships,
      fall_of_wicket:         fow,
      power_plays:            pg.miniScorecard?.power_play || [],
      player_performances:    performances,
      cricheroes_url:         `https://cricheroes.com/scorecard/${matchId}/match-details`,
      raw_data:               pg,
    };
  } catch (e) {
    console.error(`    ❌ Error fetching match details ${matchId}:`, e.message);
    return null;
  }
}

// ── Fetch full paginated match history for a player ──────────────────────────

async function fetchFullMatchHistory(playerId, buildId, slug) {
  const all = [];
  let page = 1;
  let next = true;

  while (next && page <= MAX_MATCH_PAGES) {
    console.log(`    📄 Fetching Match History Page ${page}...`);
    const json = await fetchJSON(URLs.matches(buildId, playerId, slug, page));
    if (!json?.pageProps) break;

    const matches = json.pageProps.matches?.data || [];
    all.push(...matches);

    const nextPage = json.pageProps.matches?.page?.next;
    if (nextPage && nextPage.includes('page=')) {
      page++;
    } else {
      next = false;
    }
  }
  return all;
}

// ── Main scrape entry point ──────────────────────────────────────────────────

export const scrapePlayers = async (options = {}) => {
  const { force = false, targetPlayers = [] } = options;
  console.log(`🚀 Starting ENHANCED LIVE SYNC (force=${force})...`);

  const buildId = await getBuildId(force);
  const members = await getTeamMembers(buildId);
  const filtered = targetPlayers.length > 0
    ? members.filter(m =>
        targetPlayers.includes(m.name.toLowerCase()) ||
        targetPlayers.includes(m.external_id)
      )
    : members;

  console.log(`🎯 Targeting ${filtered.length} players for deep sync.`);

  const semaphore = new Semaphore(CONCURRENCY_LIMIT);

  for (const m of filtered) {
    console.log(`\n👤 Processing ${m.name} (${m.external_id})...`);
    try {
      const existing = await Player.findOne({ external_id: m.external_id });
      if (existing?.is_manual_override && !force) {
        console.log(`    ⚠️  Skipping ${m.name} (Manual Override Active)`);
        continue;
      }

      // 1. Fetch player stats from CricHeroes
      const statsUrl = URLs.stats(buildId, m.external_id, m.slug);
      const statsJson = await fetchJSON(statsUrl);
      const info = statsJson?.pageProps?.playerInfo?.data;
      if (!info) { console.log(`    ⚠️  No playerInfo for ${m.name}`); continue; }

      const extras = parseStatement(info.player_statement);

      // 2. Fetch full match history (paginated)
      const history = await fetchFullMatchHistory(m.external_id, buildId, m.slug);

      // 3. Process each match (concurrent, rate-limited)
      const processedHistory = [];
      let realHighScore = extras.high_score || 0;
      const bowlingPerfs = []; // for best bowling
      const allBattingPerfs = []; // for fifties/hundreds
      let totalCatches = 0, totalRunOuts = 0, totalStumpings = 0;
      let totalMotm = 0;

      // First pass: queue all match detail fetches concurrently
      const matchDetailPromises = history
        .filter(mh => mh.match_result === 'Resulted')
        .map(async (mh) => {
          await semaphore.acquire();
          try {
            // Check if match already exists and is fresh
            let matchDoc = await Match.findOne({ match_id: String(mh.match_id) });
            if (!matchDoc || force) {
              const detailed = await fetchMatchDetails(mh.match_id, buildId, mh.team_a, mh.team_b);
              if (detailed) {
                matchDoc = await Match.findOneAndUpdate(
                  { match_id: detailed.match_id }, detailed, { upsert: true, new: true }
                );
              }
            }
            return { mh, matchDoc };
          } finally {
            semaphore.release();
          }
        });

      const results = await Promise.all(matchDetailPromises);

      for (const { mh, matchDoc } of results) {
        if (!matchDoc) continue;

        const cleanString = str => (str || '').replace(/_/g, ' ').replace(/[!._]+$/, '').trim().toLowerCase();
        const cleanPlayerName = cleanString(m.name);
        const firstName = cleanPlayerName.split(' ')[0];

        // Find this player's performance in the match
        const rawPerf = matchDoc.player_performances.find(p =>
          cleanString(p.player_name).includes(firstName)
        );

        const playerPerf = {
          batting: {
            runs:        rawPerf?.runs || 0,
            balls:       rawPerf?.balls || 0,
            fours:       rawPerf?.fours || 0,
            sixes:       rawPerf?.sixes || 0,
            strike_rate: rawPerf?.strike_rate || 0,
            how_out:     rawPerf?.how_out || 'DNB',
          },
          bowling: {
            wickets:  rawPerf?.wickets || 0,
            overs:    rawPerf?.overs_bowled || '0',
            runs:     rawPerf?.runs_conceded || 0,
            economy:  rawPerf?.economy || 0,
          },
        };

        // Track stats
        if (playerPerf.batting.runs > realHighScore) realHighScore = playerPerf.batting.runs;
        if (playerPerf.bowling.wickets > 0) {
          bowlingPerfs.push({
            wickets: playerPerf.bowling.wickets,
            runs:    playerPerf.bowling.runs,
            overs:   playerPerf.bowling.overs,
          });
        }
        allBattingPerfs.push(playerPerf);
        totalCatches   += rawPerf?.catches || 0;
        totalRunOuts   += rawPerf?.run_outs || 0;
        totalStumpings += rawPerf?.stumpings || 0;

        processedHistory.push({
          match_id:  String(mh.match_id),
          date:      new Date(mh.match_start_time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          opponent:  String(mh.team_a_id) === DAITYA_TEAM_ID ? mh.team_b : mh.team_a,
          result:    mh.match_summary?.summary || '',
          won:       String(mh.winning_team_id) === DAITYA_TEAM_ID,
          my_score:  (String(mh.team_a_id) === DAITYA_TEAM_ID ? mh.team_a_summary : mh.team_b_summary) || '—',
          opp_score: (String(mh.team_a_id) === DAITYA_TEAM_ID ? mh.team_b_summary : mh.team_a_summary) || '—',
          performance: playerPerf,
        });
      }

      // 4. Compute derived stats
      const bestBowling   = computeBestBowling(bowlingPerfs);
      const { fifties, hundreds } = computeMilestones(processedHistory);

      // 5. Build the DB payload with ALL fields
      const dbPayload = {
        external_id:   m.external_id,
        name:          info.name,
        role:          info.playing_role || m.role,
        image_url:     info.profile_photo,
        matches:       info.total_matches || 0,
        runs:          info.total_runs || 0,
        wickets:       info.total_wickets || 0,
        catches:       totalCatches,
        run_outs:      totalRunOuts,
        stumpings:     totalStumpings,
        man_of_the_match: extras.man_of_the_match || 0,
        tournaments:   extras.tournaments || 0,
        titles:        info.badges?.map(b => b.name) || extras.titles || [],
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
          average:       info.total_wickets > 0 && extras.overs > 0
            ? Math.round((extras.overs * 6 / info.total_wickets) * 100) / 100
            : 0,
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

      // 6. Upsert into DB
      if (existing && (!existing.is_manual_override || force)) {
        await Player.updateOne({ external_id: m.external_id }, { $set: dbPayload });
      } else if (!existing) {
        await Player.create(dbPayload);
      }

      console.log(`    ✅ Updated ${m.name}: HS=${realHighScore}, BB=${bestBowling}, Catches=${totalCatches}, 50s=${fifties}, 100s=${hundreds}`);
    } catch (e) {
      console.error(`    ❌ Error processing ${m.name}:`, e.message);
    }
  }

  // 7. Update team aggregate stats
  console.log('\n📊 Updating team stats...');
  const players = await Player.find({});
  const teamStats = {
    total_matches:  Math.max(...players.map(p => p.matches || 0), 0),
    total_runs:     players.reduce((a, p) => a + (p.runs || 0), 0),
    total_wickets:  players.reduce((a, p) => a + (p.wickets || 0), 0),
    total_fifties:  players.reduce((a, p) => a + (p.batting?.fifties || 0), 0),
    total_hundreds: players.reduce((a, p) => a + (p.batting?.hundreds || 0), 0),
    total_five_w:   players.reduce((a, p) => a + (p.bowling?.five_w || 0), 0),
    total_tournaments: Math.max(...players.map(p => p.tournaments || 0), 0),
    win_percentage: (() => {
      const totalMatches = players.reduce((a, p) => a + (p.match_history?.length || 0), 0);
      const totalWins    = players.reduce((a, p) => a + (p.match_history?.filter(m => m.won).length || 0), 0);
      return totalMatches > 0 ? Math.round(totalWins / totalMatches * 100) + '%' : '0%';
    })(),
    last_updated: Date.now(),
  };
  await Team.findOneAndUpdate({ name: 'Daitya Legion' }, teamStats, { upsert: true });
  console.log(`✅ Sync complete. Team stats updated.`);
};

export default scrapePlayers;
