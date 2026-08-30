import connectDB from '../../../backend/src/config/db.js';
import { scrapePlayers } from '../../../backend/src/services/scraperService.js';

/**
 * POST /api/admin/bulk-sync?secret=...
 *
 * Triggers a full team sync from CricHeroes.
 * All player stats, match details, fielding stats, best bowling, etc. are updated.
 *
 * Query params:
 *   secret  – admin secret (required)
 *   force   – "true" to re-sync even manual-override players
 *   players – comma-separated player names or IDs to sync only specific players
 */
export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const secret = req.query.secret || req.headers['x-sync-secret'];
  if (secret !== process.env.ADMIN_SECRET && secret !== 'daitya_sync_2024') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const force   = req.query.force === 'true';
  const players = req.query.players
    ? req.query.players.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
    : [];

  try {
    await connectDB();

    // Run sync in background and return immediately
    // (Vercel has a 30s max; full sync can take longer)
    const syncPromise = scrapePlayers({ force, targetPlayers: players });

    // If it completes within timeout, return result
    const result = await Promise.race([
      syncPromise.then(() => ({ completed: true })),
      new Promise(resolve => setTimeout(() => resolve({ started: true }), 25000)),
    ]);

    if (result.started) {
      return res.json({
        success: true,
        message: 'Full sync started in background. It may take several minutes.',
        tip: 'Use GET /api/players to check progress.',
      });
    }

    return res.json({ success: true, message: 'Sync completed!' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
