// POST /api/players/bulk-seed
// Body: { secret: "daitya_sync_2024", players: [...] }
import connectDB from "../../../backend/src/config/db.js";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  const { secret, players } = req.body;
  const SYNC_SECRET = process.env.ADMIN_SECRET || 'daitya_sync_2024';

  if (secret !== SYNC_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!Array.isArray(players) || players.length === 0) {
    return res.status(400).json({ error: 'players array required in body' });
  }

  try {
    await connectDB();
    const Player = (await import('../../../backend/src/models/Player.js')).default;

    const results = [];
    for (const p of players) {
      if (!p.external_id) continue;

      const update = {
        external_id:      String(p.external_id),
        name:             p.name,
        image_url:        p.image_url || '',
        role:             p.role || 'Unknown',
        matches:          p.matches || 0,
        runs:             p.runs || 0,
        wickets:          p.wickets || 0,
        catches:          p.catches || 0,
        run_outs:         p.run_outs || 0,
        man_of_the_match: p.man_of_the_match || 0,
        tournaments:      p.tournaments || 0,
        titles:           p.titles || [],
        is_manual_override: p.is_manual_override ?? true,
      };

      if (p.batting) {
        update.batting = {
          average:     p.batting.average || 0,
          strike_rate: p.batting.strike_rate || 0,
          high_score:  p.batting.high_score || 0,
          total_runs:  p.batting.total_runs || p.runs || 0,
          innings:     p.batting.innings || 0,
          fours:       p.batting.fours || 0,
          sixes:       p.batting.sixes || 0,
          fifties:     p.batting.fifties || 0,
          hundreds:    p.batting.hundreds || 0,
        };
      }

      if (p.bowling) {
        update.bowling = {
          wickets:      p.bowling.wickets || 0,
          economy:      p.bowling.economy || 0,
          overs:        p.bowling.overs || 0,
          average:      p.bowling.average || 0,
          five_w:       p.bowling.five_w || 0,
          best_bowling: p.bowling.best_bowling || '—',
        };
      }

      if (p.general) {
        update.general = {
          dob:           p.general.dob || '',
          batting_style: p.general.batting_style || '',
          bowling_style: p.general.bowling_style || '',
        };
      }

      // Keep match_history if provided
      if (Array.isArray(p.match_history) && p.match_history.length > 0) {
        update.match_history = p.match_history;
      }

      const result = await Player.findOneAndUpdate(
        { external_id: update.external_id },
        { $set: update },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      results.push({ name: result.name, external_id: result.external_id, ok: true });
    }

    return res.json({ success: true, updated: results.length, players: results });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
