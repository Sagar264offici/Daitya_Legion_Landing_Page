/**
 * seed_rpl_v3.js  — run from backend/ directory
 * node seed_rpl_v3.js
 *
 * Idempotent: safe to run multiple times.
 * Seeds / updates RPL Match 1 with:
 *   - Player of the Match : Ashraya Maithani (37 runs + 3/28)
 *   - Star bowlers        : Sagar Pathak 2/17,  Rohan Rayal 2/24
 */

import mongoose from 'mongoose';
import dotenv   from 'dotenv';
import Tournament from './src/models/Tournament.js';
import Player     from './src/models/Player.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) { console.error('❌ MONGO_URI missing in .env'); process.exit(1); }

/* ── Constants ────────────────────────────────────────────────────────────── */
const MATCH_ID      = 'rpl-2026-match1';
const SCORECARD_URL = 'https://cricheroes.com/scorecard/23878814/rishikesh-premier-league-/dynamic-devils-vs-daitya-legion/summary';
const TOURNAMENT_URL= 'https://cricheroes.com/tournament-profile/rishikesh-premier-league';

/* ── Tournament match document ────────────────────────────────────────────── */
const matchDoc = {
  match_id:        MATCH_ID,
  date:            '12 Apr 2026',
  opponent:        'Dynamic Devils',
  our_score:       '164/3',
  opp_score:       '160/10',
  our_overs:       '18.4',
  opp_overs:       '19.2',
  result:          'won',
  result_status:   'won',
  ground:          'IDPL Ground',
  city:            'Rishikesh',
  cricheroes_url:  SCORECARD_URL,
  player_of_match: 'Ashraya Maithani',
  highlights:
    'Ashraya Maithani was the star — 37 runs with the bat and a clinical 3/28 with the ball, earning him Player of the Match. ' +
    'Sagar Pathak was lethal, conceding just 17 runs in 2.2 overs for 2 wickets. ' +
    'Rohan Rayal was equally devastating with 2/24 — his spell broke the Dynamic Devils\' middle order. ' +
    'Saksham\'s explosive 44* off 28 balls sealed the 7-wicket win in style.',
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
      performance: '2/24 (3 Ov) — Decisive middle-order breakthrough',
    },
    {
      player_name: 'Saksham',
      category:    'batting',
      performance: '44* (28b, 6×4, 1×6) — Explosive unbeaten finish',
    },
  ],
};

/* ── Player aggregate updates ─────────────────────────────────────────────── */
const PLAYER_UPDATES = [
  {
    pattern: /saksham/i,
    batting: { runs: 44, balls: 28, fours: 6, sixes: 1, strike_rate: 157.14, how_out: 'Not Out' },
    bowling: { wickets: 1, overs: 2, runs: 23, economy: 11.5 },
  },
  {
    pattern: /maithani|ashraya/i,
    batting: { runs: 37, balls: 42, fours: 5, sixes: 0, strike_rate: 88.09, how_out: 'Out' },
    bowling: { wickets: 3, overs: 3, runs: 28, economy: 9.33 },
    isMotm: true,
  },
  {
    pattern: /sagar pathak/i,
    batting: { runs: 0, balls: 0, fours: 0, sixes: 0, strike_rate: 0, how_out: 'DNB' },
    bowling: { wickets: 2, overs: 2.2, runs: 17, economy: 7.28 },
  },
  {
    pattern: /bruce wayne/i,
    batting: { runs: 0, balls: 0, fours: 0, sixes: 0, strike_rate: 0, how_out: 'DNB' },
    bowling: { wickets: 1, overs: 4, runs: 23, economy: 5.75 },
  },
  {
    pattern: /deepak/i,
    batting: { runs: 0, balls: 0, fours: 0, sixes: 0, strike_rate: 0, how_out: 'DNB' },
    bowling: { wickets: 1, overs: 1, runs: 11, economy: 11.0 },
  },
  {
    pattern: /ansh/i,
    batting: { runs: 0, balls: 1, fours: 0, sixes: 0, strike_rate: 0, how_out: 'Out' },
    bowling: { wickets: 0, overs: 0, runs: 0, economy: 0 },
  },
];

/* ── Run ──────────────────────────────────────────────────────────────────── */
async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB connected\n');

  /* 1 ─ Update Player docs ------------------------------------------------ */
  for (const pu of PLAYER_UPDATES) {
    const player = await Player.findOne({ name: pu.pattern });
    if (!player) { console.log(`  ⚠️  Player not found: ${pu.pattern}`); continue; }

    const alreadyHas = player.match_history?.some(m => m.match_id === MATCH_ID);
    if (!alreadyHas) {
      player.match_history.unshift({
        match_id: MATCH_ID,
        date: matchDoc.date, opponent: matchDoc.opponent,
        ground: matchDoc.ground, city: matchDoc.city,
        match_type: 'T20', result: 'Won by 7 wickets', won: true,
        my_score: matchDoc.our_score, opp_score: matchDoc.opp_score,
        my_overs: matchDoc.our_overs, opp_overs: matchDoc.opp_overs,
        toss: 'Daitya Legion won the toss and elected to field',
        cricheroes_url: SCORECARD_URL,
        performance: { batting: pu.batting, bowling: pu.bowling },
      });

      // Aggregate batting
      if (pu.batting.runs > 0) {
        player.runs = (player.runs || 0) + pu.batting.runs;
        player.batting = player.batting || {};
        player.batting.total_runs = (player.batting.total_runs || 0) + pu.batting.runs;
        player.batting.fours      = (player.batting.fours || 0) + pu.batting.fours;
        player.batting.sixes      = (player.batting.sixes || 0) + pu.batting.sixes;
        if (pu.batting.runs > (player.batting.high_score || 0)) player.batting.high_score = pu.batting.runs;
        if (pu.batting.how_out !== 'DNB') player.batting.innings = (player.batting.innings || 0) + 1;
        if (pu.batting.runs >= 50) player.batting.fifties = (player.batting.fifties || 0) + 1;
      }
      // Aggregate bowling
      if (pu.bowling.wickets > 0 || pu.bowling.overs > 0) {
        player.wickets = (player.wickets || 0) + pu.bowling.wickets;
        player.bowling = player.bowling || {};
        player.bowling.wickets = (player.bowling.wickets || 0) + pu.bowling.wickets;
        player.bowling.overs   = parseFloat(((player.bowling.overs || 0) + pu.bowling.overs).toFixed(1));
      }
      player.matches = (player.matches || 0) + 1;
      if (pu.isMotm) player.man_of_the_match = (player.man_of_the_match || 0) + 1;

      await player.save();
      console.log(`  ✅ Player updated: ${player.name}`);
    } else {
      console.log(`  ℹ️  ${player.name} — already has RPL Match 1`);
    }
  }

  /* 2 ─ Upsert Tournament ------------------------------------------------- */
  let t = await Tournament.findOne({ name: 'Rishikesh Premier League' });

  if (!t) {
    await Tournament.create({
      name: 'Rishikesh Premier League', short_name: 'RPL 2026',
      type: 'T20', year: 2026, status: 'ongoing',
      matches_played: 1, wins: 1, losses: 0,
      result: 'Ongoing', cricheroes_url: TOURNAMENT_URL,
      matches: [matchDoc],
    });
    console.log('\n🏆 RPL Tournament created with Match 1');
  } else {
    const idx = t.matches?.findIndex(m => m.match_id === MATCH_ID);
    if (idx === -1 || idx === undefined) {
      // Add the match
      t.matches.unshift(matchDoc);
      t.matches_played = (t.matches_played || 0) + 1;
      t.wins           = (t.wins           || 0) + 1;
      t.status         = 'ongoing';
      await t.save();
      console.log('\n🏆 RPL Tournament updated — Match 1 added');
    } else {
      // Patch star performers + highlights in place
      t.matches[idx].player_of_match = matchDoc.player_of_match;
      t.matches[idx].highlights      = matchDoc.highlights;
      t.matches[idx].star_performers = matchDoc.star_performers;
      t.markModified('matches');
      await t.save();
      console.log('\n🏆 RPL Match 1 star performers updated in place');
    }
  }

  /* 3 ─ Seed other tournaments if missing ---------------------------------- */
  const others = [
    {
      name: 'Daitya Legion VS Bakery 11s BLITZ Trophy Series',
      short_name: 'BLITZ 2025', type: 'T20', year: 2025,
      status: 'completed', matches_played: 5, wins: 3, losses: 2,
      result: 'Winners', cricheroes_url: '',
    },
    {
      name: 'DL VS Bakery 11s — The Guard Of Honour Test Series',
      short_name: 'Guard of Honour', type: 'Test', year: 2025,
      status: 'completed', matches_played: 2, wins: 1, losses: 1,
      result: 'Series Drawn', cricheroes_url: '',
    },
  ];
  for (const o of others) {
    const exists = await Tournament.findOne({ name: o.name });
    if (!exists) {
      await Tournament.create(o);
      console.log(`✅ Seeded: ${o.name}`);
    }
  }

  console.log('\n🎉 All done!');
  process.exit(0);
}

run().catch(err => { console.error('❌', err.message); process.exit(1); });
