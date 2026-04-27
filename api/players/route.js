import connectDB from "../../backend/src/config/db.js";
import {
    createPlayer,
    deletePlayer,
    getPlayers,
    updatePlayer,
} from "../../backend/src/controllers/playerController.js";
import { protect } from "../middleware/authMiddleware.js";

// ── CricHeroes player sync helpers ──────────────────────────────────────────
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function chFetch(url, json = true) {
  const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': json ? 'application/json' : 'text/html', 'Referer': 'https://cricheroes.com/' } });
  if (!r.ok) throw new Error(`CricHeroes HTTP ${r.status} → ${url}`);
  return json ? r.json() : r.text();
}

async function getBuildId() {
  const html = await chFetch('https://cricheroes.com/', false);
  const m = html.match(/"buildId"\s*:\s*"([^"]+)"/);
  if (!m) throw new Error('buildId not found in CricHeroes HTML');
  return m[1];
}

function parseStatement(ps = '') {
  const n = (rx) => { const m = ps.match(rx); return m ? parseFloat(m[1]) : 0; };
  return {
    innings:         n(/With (\d+) turns at the crease/),
    high_score:      n(/top score of <b>([^<]+)<\/b>/),
    batting_average: n(/average of <b>([^<]+)<\/b>/),
    strike_rate:     n(/strike rate of <b>([^<]+)<\/b>/),
    sixes:           n(/<b>(\d+) sixes<\/b>/),
    fours:           n(/<b>(\d+) fours<\/b>/),
    overs:           n(/bowled <b>([^<]+)<\/b> overs/),
    total_wickets:   n(/taking <b>(\d+)<\/b> wickets/),
    economy:         n(/economy rate of <b>([^<]+)<\/b>/),
    catches:         n(/Taking <b>(\d+)<\/b> catches/),
    run_outs:        n(/making <b>(\d+)<\/b> run outs/),
    man_of_the_match:n(/has won <b>(\d+)<\/b> Man of the Match/),
    tournaments:     n(/played in <b>(\d+)<\/b> different tournaments/),
  };
}

async function syncOnePlayer(playerId, slug) {
  const buildId = await getBuildId();

  const statsUrl = `https://cricheroes.com/_next/data/${buildId}/player-profile/${playerId}/${slug}/stats.json?playerId=${playerId}&slug=${slug}`;
  const statsJson = await chFetch(statsUrl);
  const info = statsJson?.pageProps?.playerInfo?.data;
  if (!info) throw new Error(`No playerInfo from CricHeroes for ${playerId}/${slug}`);

  const ex = parseStatement(info.player_statement || '');

  // Try to get best bowling from match history
  let bestBowling = '—';
  let bestW = 0, bestR = 9999;
  try {
    const matchUrl = `https://cricheroes.com/_next/data/${buildId}/player-profile/${playerId}/${slug}/matches.json?playerId=${playerId}&slug=${slug}`;
    const matchJson = await chFetch(matchUrl);
    const matches = matchJson?.pageProps?.matches?.data || [];
    for (const m of matches) {
      // We don't have individual scorecard here, skip detailed perf
      void m;
    }
  } catch (_) { /* optional */ }

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
      fifties:     0,
      hundreds:    0,
    },
    bowling: {
      wickets:      info.total_wickets || 0,
      economy:      ex.economy || 0,
      overs:        ex.overs || 0,
      average:      0,
      five_w:       0,
      best_bowling: bestBowling,
    },
    general: {
      dob:           info.dob || '',
      batting_style: info.batting_hand || '',
      bowling_style: info.bowling_style || '',
    },
  };

  const updated = await Player.findOneAndUpdate(
    { external_id: payload.external_id },
    { $set: payload },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return { name: updated.name, image_url: updated.image_url, matches: updated.matches, runs: updated.runs, wickets: updated.wickets, external_id: updated.external_id };
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
