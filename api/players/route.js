import connectDB from "../../backend/src/config/db.js";
import {
    createPlayer,
    deletePlayer,
    getPlayers,
    updatePlayer,
} from "../../backend/src/controllers/playerController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  getPlayerStatistics, getAllPlayerMatches, getPlayerGamification,
  getPlayerAwards, parsePlayerStats, parseMatchForHistory,
} from "../../backend/src/utils/cricheroesClient.js";

// ── Enhanced single-player sync ──────────────────────────────────────────────
async function syncOnePlayer(playerId) {
  // 1. Get player stats from REST API
  const statsResp = await getPlayerStatistics(playerId);
  const parsed = parsePlayerStats(statsResp);

  // 2. Get match history
  const allMatches = await getAllPlayerMatches(playerId);
  const processedHistory = allMatches
    .filter(mh => mh.match_result === 'Resulted')
    .map(mh => parseMatchForHistory(mh));

  // 3. Get badges
  const titles = await getPlayerGamification(playerId);
  const awards = await getPlayerAwards(playerId);
  const motm = awards.filter(a => a.name?.toLowerCase().includes('man of the match') ||
                                   a.name?.toLowerCase().includes('fighter of the match')).length;

  const Player = (await import("../../backend/src/models/Player.js")).default;

  const payload = {
    external_id:      String(playerId),
    matches:          parsed.batting?.matches || parsed.batting?.innings || 0,
    runs:             parsed.batting?.total_runs || 0,
    wickets:          parsed.bowling?.wickets || 0,
    man_of_the_match: motm || 0,
    titles,
    batting: {
      average:     parsed.batting?.average || 0,
      strike_rate: parsed.batting?.strike_rate || 0,
      high_score:  parsed.batting?.high_score || 0,
      total_runs:  parsed.batting?.total_runs || 0,
      innings:     parsed.batting?.innings || 0,
      fours:       parsed.batting?.fours || 0,
      sixes:       parsed.batting?.sixes || 0,
      fifties:     parsed.batting?.fifties || 0,
      hundreds:    parsed.batting?.hundreds || 0,
    },
    bowling: {
      wickets:       parsed.bowling?.wickets || 0,
      economy:       parsed.bowling?.economy || 0,
      overs:         parsed.bowling?.overs || 0,
      average:       parsed.bowling?.average || 0,
      five_w:        parsed.bowling?.five_w || 0,
      best_bowling:  parsed.bowling?.best_bowling || '—',
    },
    match_history:  processedHistory,
    last_synced_at: new Date(),
  };

  // Preserve existing name/image
  const existing = await Player.findOne({ external_id: payload.external_id });
  if (existing) {
    payload.name = existing.name;
    payload.image_url = existing.image_url;
  }

  const updated = await Player.findOneAndUpdate(
    { external_id: payload.external_id },
    { $set: payload },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return {
    name: updated.name, image_url: updated.image_url,
    matches: updated.matches, runs: updated.runs, wickets: updated.wickets,
    fifties: updated.batting?.fifties, hundreds: updated.batting?.hundreds,
    best_bowling: updated.bowling?.best_bowling,
    match_count: processedHistory.length,
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
      const result = await syncOnePlayer(playerId);
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
