/**
 * seed_rpl_match1_v2.js
 * Re-seeds Rishikesh Premier League Match 1 safely (idempotent).
 * Dynamic Devils vs Daitya Legion — 12 Apr 2026 — Won by 7 wickets
 *
 * Player of the Match : Ashraya Maithani (37 runs + 3/28)
 * Star Bowlers        : Sagar Pathak 2/17, Rohan Rayal (key spell)
 *
 * Run: node backend/scripts/seed_rpl_match1_v2.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Player from '../models/Player.js';
import Tournament from '../models/Tournament.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) { console.error('❌ MONGO_URI missing'); process.exit(1); }

/* ── Match constants ──────────────────────────────────────────────────────── */
const MATCH_ID       = 'rpl-2026-match1';
const MATCH_DATE     = '12 Apr 2026';
const OPPONENT       = 'Dynamic Devils';
const GROUND         = 'IDPL Ground';
const CITY           = 'Rishikesh';
const OUR_SCORE      = '164/3';
const OPP_SCORE      = '160/10';
const OUR_OVERS      = '18.4';
const OPP_OVERS      = '19.2';
const TOSS           = 'Daitya Legion won the toss and elected to field';
const RESULT         = 'won';
const SCORECARD_URL  = 'https://cricheroes.com/scorecard/23878814/rishikesh-premier-league-/dynamic-devils-vs-daitya-legion/summary';
const TOURNAMENT_URL = 'https://cricheroes.com/tournament-profile/rishikesh-premier-league';

/* ── Player performances (for Player docs) ────────────────────────────────── */
const PERFORMANCES = [
  {
    namePattern: /saksham/i,
    batting: { runs: 44, balls: 28, fours: 6, sixes: 1, strike_rate: 157.14, how_out: 'Not Out' },
    bowling: { wickets: 1, overs: 2, runs: 23, economy: 11.5 },
  },
  {
    namePattern: /maithani|ashraya/i,
    batting: { runs: 37, balls: 42, fours: 5, sixes: 0, strike_rate: 88.09, how_out: 'Out' },
    bowling: { wickets: 3, overs: 3, runs: 28, economy: 9.33 },
    isPlayerOfMatch: true,
  },
  {
    namePattern: /sagar pathak/i,
    batting: { runs: 0, balls: 0, fours: 0, sixes: 0, strike_rate: 0, how_out: 'DNB' },
    bowling: { wickets: 2, overs: 2.2, runs: 17, economy: 7.28 },
  },
  {
    namePattern: /bruce wayne/i,
    batting: { runs: 0, balls: 0, fours: 0, sixes: 0, strike_rate: 0, how_out: 'DNB' },
    bowling: { wickets: 1, overs: 4, runs: 23, economy: 5.75 },
  },
  {
    namePattern: /deepak/i,
    batting: { runs: 0, balls: 0, fours: 0, sixes: 0, strike_rate: 0, how_out: 'DNB' },
    bowling: { wickets: 1, overs: 1, runs: 11, economy: 11.0 },
  },
  {
    namePattern: /ansh/i,
    batting: { runs: 0, balls: 1, fours: 0, sixes: 0, strike_rate: 0, how_out: 'Out' },
    bowling: { wickets: 0, overs: 0, runs: 0, economy: 0 },
  },
];

/* ── Tournament match document ────────────────────────────────────────────── */
const matchDoc = {
  match_id:       MATCH_ID,
  date:           MATCH_DATE,
  opponent:       OPPONENT,
  our_score:      OUR_SCORE,
  opp_score:      OPP_SCORE,
  our_overs:      OUR_OVERS,
  opp_overs:      OPP_OVERS,
  result:         RESULT,
  result_status:  'won',
  ground:         GROUND,
  city:           CITY,
  cricheroes_url: SCORECARD_URL,
  player_of_match: 'Ashraya Maithani',
  highlights: 'Ashraya Maithani was the star of the show — 37 runs with the bat and a devastating 3/28 with the ball. ' +
              'Sagar Pathak was lethal with 2/17 in just 2.2 overs, and Rohan Rayal provided the decisive breakthrough ' +
              'to seal Daitya Legion\'s commanding 7-wicket win in the RPL opener.',
  star_performers: [
    {
      player_name: 'Ashraya Maithani',
      category:    'batting',
      performance: '37 runs (42b, 5×4) + 3/28 (3 Ov) — Player of the Match',
    },
    {
      player_name: 'Sagar Pathak',
      category:    'bowling',
      performance: '2/17 (2.2 Ov) — Incredible spell',
    },
    {
      player_name: 'Rohan Rayal',
      category:    'bowling',
      performance: 'Key wicket-taking spell — decisive breakthrough',
    },
    {
      player_name: 'Saksham',
      category:    'batting',
      performance: '44* (28b, 6×4, 1×6) — Explosive finish',
    },
  ],
};

/* ── Runner ───────────────────────────────────────────────────────────────── */
const run = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  let updated = 0, skipped = 0;

  /* 1. Update player docs */
  for (const perf of PERFORMANCES) {
    const player = await Player.findOne({ name: perf.namePattern });
    if (!player) {
      console.log(`  ⚠️  Not found: ${perf.namePattern}`);
      skipped++;
      continue;
    }

    const already = player.match_history?.some(m => m.match_id === MATCH_ID);
    if (already) {
      console.log(`  ℹ️  ${player.name} — already has RPL Match 1, skipping player`);
      skipped++;
      continue;
    }

    player.match_history.unshift({
      match_id: MATCH_ID, date: MATCH_DATE, opponent: OPPONENT,
      ground: GROUND, city: CITY, match_type: 'T20',
      result: 'Won by 7 wickets', won: true,
      my_score: OUR_SCORE, opp_score: OPP_SCORE,
      my_overs: OUR_OVERS, opp_overs: OPP_OVERS,
      toss: TOSS, cricheroes_url: SCORECARD_URL,
      performance: { batting: perf.batting, bowling: perf.bowling },
    });

    // Aggregate stats
    if (perf.batting.runs > 0) {
      player.runs = (player.runs || 0) + perf.batting.runs;
      player.batting = player.batting || {};
      player.batting.total_runs  = (player.batting.total_runs  || 0) + perf.batting.runs;
      player.batting.fours       = (player.batting.fours       || 0) + perf.batting.fours;
      player.batting.sixes       = (player.batting.sixes       || 0) + perf.batting.sixes;
      if (perf.batting.runs > (player.batting.high_score || 0)) player.batting.high_score = perf.batting.runs;
      if (perf.batting.how_out !== 'DNB') player.batting.innings = (player.batting.innings || 0) + 1;
      if (perf.batting.runs >= 50) player.batting.fifties = (player.batting.fifties || 0) + 1;
    }
    if (perf.bowling.wickets > 0 || perf.bowling.overs > 0) {
      player.wickets = (player.wickets || 0) + perf.bowling.wickets;
      player.bowling = player.bowling || {};
      player.bowling.wickets = (player.bowling.wickets || 0) + perf.bowling.wickets;
      player.bowling.overs   = parseFloat(((player.bowling.overs || 0) + perf.bowling.overs).toFixed(1));
    }
    player.matches = (player.matches || 0) + 1;
    if (perf.isPlayerOfMatch) player.man_of_the_match = (player.man_of_the_match || 0) + 1;

    await player.save();
    console.log(`  ✅ Updated player: ${player.name}`);
    updated++;
  }

  /* 2. Upsert tournament */
  let tournament = await Tournament.findOne({ name: 'Rishikesh Premier League' });

  if (tournament) {
    const hasMatch = tournament.matches?.some(m => m.match_id === MATCH_ID);
    if (!hasMatch) {
      tournament.matches.unshift(matchDoc);          // newest first
      tournament.matches_played = (tournament.matches_played || 0) + 1;
      tournament.wins           = (tournament.wins           || 0) + 1;
      tournament.status         = 'ongoing';
      await tournament.save();
      console.log('\n🏆 RPL tournament updated — Match 1 added');
    } else {
      // Match already exists — update its star_performers & highlights in place
      const idx = tournament.matches.findIndex(m => m.match_id === MATCH_ID);
      if (idx !== -1) {
        tournament.matches[idx].player_of_match  = matchDoc.player_of_match;
        tournament.matches[idx].highlights        = matchDoc.highlights;
        tournament.matches[idx].star_performers   = matchDoc.star_performers;
        tournament.markModified('matches');
        await tournament.save();
        console.log('\n🏆 RPL Match 1 star performers / highlights updated');
      } else {
        console.log('\nℹ️  RPL Match 1 already in tournament — no changes');
      }
    }
  } else {
    await Tournament.create({
      name:           'Rishikesh Premier League',
      short_name:     'RPL 2026',
      type:           'T20',
      year:           2026,
      status:         'ongoing',
      matches_played: 1,
      wins:           1,
      losses:         0,
      result:         'Ongoing',
      cricheroes_url: TOURNAMENT_URL,
      matches:        [matchDoc],
    });
    console.log('\n🏆 RPL tournament created with Match 1');
  }

  console.log(`\n📊 Summary — Players updated: ${updated}, skipped: ${skipped}`);
  process.exit(0);
};

run().catch(err => { console.error('❌', err); process.exit(1); });
