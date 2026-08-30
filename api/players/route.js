import connectDB from "../../backend/src/config/db.js";
import {
    createPlayer,
    deletePlayer,
    getPlayers,
    updatePlayer,
} from "../../backend/src/controllers/playerController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  getBuildId, fetchJSON, URLs, parseStatement, computeBestBowling,
  computeMilestones, aggregateFielding, parseFieldingFromDismissal,
} from "../../backend/src/utils/cricheroesClient.js";

// ── Enhanced single-player sync ──────────────────────────────────────────────
async function syncOnePlayer(playerId, slug) {
  const buildId = await getBuildId();

  // 1. Fetch player stats
  const statsJson = await fetchJSON(URLs.stats(buildId, playerId, slug));
  const info = statsJson?.pageProps?.playerInfo?.data;
  if (!info) throw new Error(`No playerInfo from CricHeroes for ${playerId}/${slug}`);

  const ex = parseStatement(info.player_statement || '');

  // 2. Fetch match history (first 2 pages for quick sync)
  let matchHistory = [];
  let bowlingPerfs = [];
  let totalCatches = 0, totalRunOuts = 0, totalStumpings = 0;

  for (let page = 1; page <= 2; page++) {
    try {
      const matchJson = await fetchJSON(URLs.matches(buildId, playerId, slug, page));
      const matches = matchJson?.pageProps?.matches?.data || [];
      if (matches.length === 0) break;

      matchHistory.push(...matches.map(m => ({
        match_id: String(m.match_id),
        date: new Date(m.match_start_time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        opponent: String(m.team_a_id) === '11183415' ? m.team_b : m.team_a,
        won: String(m.winning_team_id) === '11183415',
        my_score: (String(m.team_a_id) === '11183415' ? m.team_a_summary : m.team_b_summary) || '—',
        opp_score: (String(m.team_a_id) === '11183415' ? m.team_b_summary : m.team_a_summary) || '—',
        result: m.match_summary?.summary || '',
        cricheroes_url: `https://cricheroes.com/scorecard/${m.match_id}/match-details`,
        performance: {
          batting: { runs: 0, balls: 0, fours: 0, sixes: 0, strike_rate: 0, how_out: 'DNB' },
          bowling: { wickets: 0, overs: '0', runs: 0, economy: 0 },
        },
      })), { page });
    } catch (_) { break; }
  }

  // 3. Compute derived stats
  const { fifties, hundreds } = computeMilestones(matchHistory);
  const bestBowling = computeBestBowling(bowlingPerfs);

  const Player = (await import("../../backend/src/models/Player.js")).default;

  const payload = {
    external_id:      String(info.player_id || playerId),
    name:             info.name || slug,
    image_url:        info.profile_photo || '',
    role:             info.playing_role || 'Unknown',
    matches:          info.total_matches || 0,
    runs:             info.total_runs || 0,
    wickets:          info.total_wickets || 0,
    catches:          ex.catches || 0,
    run_outs:         ex.run_outs || 0,
    stumpings:        0,
    man_of_the_match: ex.man_of_the_match || 0,
    tournaments:      ex.tournaments || 0,
    batting: {
      average:     ex.batting_average || 0,
      strike_rate: ex.strike_rate || 0,
      high_score:  ex.high_score || 0,
      total_runs:  info.total_runs || 0,
      innings:     ex.innings || 0,
      fours:       ex.fours || 0,
      sixes:       ex.sixes || 0,
      fifties,
      hundreds,
    },
    bowling: {
      wickets:      info.total_wickets || 0,
      economy:      ex.economy || 0,
      overs:        ex.overs || 0,
      average:      info.total_wickets > 0 && ex.overs > 0 ? Math.round((ex.overs * 6 / info.total_wickets) * 100) / 100 : 0,
      five_w:       0,
      best_bowling: bestBowling,
    },
    general: {
      dob:           info.dob || '',
      batting_style: info.batting_hand || '',
      bowling_style: info.bowling_style || '',
    },
    match_history:  matchHistory,
    last_synced_at: new Date(),
  };

  const updated = await Player.findOneAndUpdate(
    { external_id: payload.external_id },
    { $set: payload },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return {
    name: updated.name, image_url: updated.image_url,
    matches: updated.matches, runs: updated.runs, wickets: updated.wickets,
    catches: updated.catches, run_outs: updated.run_outs, stumpings: updated.stumpings,
    fifties: updated.batting?.fifties, hundreds: updated.batting?.hundreds,
    best_bowling: updated.bowling?.best_bowling,
    external_id: updated.external_id,
  };
}

// ── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  await connectDB();

  // ── GET /api/players?action=sync&playerId=...&slug=...&secret=... ──
  if (req.method === 'GET' && req.query.action === 'sync') {
    const { playerId, slug, secret } = req.query;
    const SYNC_SECRET = process.env.ADMIN_SECRET || 'daitya_sync_2024';

    if (secret !== SYNC_SECRET) {
      return res.status(401).json({ error: 'Unauthorized. Pass ?secret=daitya_sync_2024' });
    }
    if (!playerId || !slug) {
      return res.status(400).json({
        error: 'Missing params',
        usage: '/api/players?action=sync&playerId=11341711&slug=ansh&secret=daitya_sync_2024',
        knownPlayers: {
          ansh:    '?action=sync&playerId=11341711&slug=ansh&secret=daitya_sync_2024',
          bruce:   '?action=sync&playerId=BRUCE_ID&slug=bruce-wayne&secret=daitya_sync_2024',
          ujjwal:  '?action=sync&playerId=16628521&slug=ujjwal-sati&secret=daitya_sync_2024',
        }
      });
    }

    try {
      const result = await syncOnePlayer(playerId, slug);
      return res.json({ success: true, synced: result });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // ── GET /api/players (normal - public) ──────────────────────────────────
  if (req.method === "GET") {
    try {
      const { id } = req.query;
      if (id) {
        const Player = (await import("../../backend/src/models/Player.js")).default;
        const player = await Player.findById(id);
        if (player) return res.json(player);
      }
      return getPlayers(req, res);
    } catch (error) {
      console.error("Vercel player route error:", error);
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  }

  // Protect other methods
  const authResult = protect(req, res);
  if (authResult && authResult.statusCode) return;

  if (req.method === "POST") {
    try {
      req.file = null;
      return createPlayer(req, res);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  if (req.method === "PUT") {
    try {
      const id = req.query.id || req.params?.id;
      if (!id) return res.status(400).json({ message: "Player ID required" });
      req.params = { ...req.params, id };
      if (req.body['titles[]'] && !req.body.titles) req.body.titles = req.body['titles[]'];
      req.file = null;
      return updatePlayer(req, res);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  if (req.method === "DELETE") {
    try {
      const id = req.query.id || req.params?.id;
      if (!id) return res.status(400).json({ message: "Player ID required" });
      req.params = { ...req.params, id };
      return deletePlayer(req, res);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
