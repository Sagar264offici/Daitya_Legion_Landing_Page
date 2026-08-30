import connectDB from '../../../backend/src/config/db.js';
import Player from '../../../backend/src/models/Player.js';
import {
  getPlayerStatistics, getAllPlayerMatches, getPlayerGamification,
  getPlayerAwards, parsePlayerStats, parseMatchForHistory,
} from '../../../backend/src/utils/cricheroesClient.js';

// ── Full player sync via REST API ────────────────────────────────────────────
async function syncPlayerFull(playerId) {
  // 1. Get stats
  const statsResp = await getPlayerStatistics(playerId);
  const parsed = parsePlayerStats(statsResp);

  // 2. Get match history
  const allMatches = await getAllPlayerMatches(playerId);

  // 3. Get badges + categories from team member data
  const gamificationBadges = await getPlayerGamification(playerId);
  let memberCategories = [];
  try {
    const { getTeamMembers } = await import('../../../backend/src/utils/cricheroesClient.js');
    const members = await getTeamMembers();
    const member = members.find(m => m.external_id === String(playerId));
    if (member) memberCategories = [member.batter_category, member.bowler_category].filter(Boolean);
  } catch (_) {}
  const titles = [...new Set([...memberCategories, ...gamificationBadges])];

  // 4. Get awards
  const awards = await getPlayerAwards(playerId);
  const motm = awards.filter(a => a.name?.toLowerCase().includes('man of the match') ||
                                   a.name?.toLowerCase().includes('fighter of the match')).length;

  // 5. Parse matches
  const processedHistory = allMatches
    .filter(mh => mh.match_result === 'Resulted')
    .map(mh => parseMatchForHistory(mh));

  // 6. Build payload
  const payload = {
    external_id:      String(playerId),
    name:             '',
    image_url:        '',
    role:             'Unknown',
    matches:          parsed.batting?.matches || parsed.batting?.innings || 0,
    runs:             parsed.batting?.total_runs || 0,
    wickets:          parsed.bowling?.wickets || 0,
    catches:          0,
    run_outs:         0,
    stumpings:        0,
    man_of_the_match: motm || 0,
    tournaments:      0,
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
    general: { dob: '', batting_style: '', bowling_style: '' },
    match_history:  processedHistory,
    last_synced_at: new Date(),
  };

  // Preserve existing name/image if not set from stats
  const existing = await Player.findOne({ external_id: String(playerId) });
  if (existing) {
    payload.name = payload.name || existing.name;
    payload.image_url = payload.image_url || existing.image_url;
  }

  await Player.findOneAndUpdate(
    { external_id: payload.external_id }, payload,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return {
    name: payload.name || `Player ${playerId}`,
    matches: payload.matches, runs: payload.runs, wickets: payload.wickets,
    fifties: payload.batting.fifties, hundreds: payload.batting.hundreds,
    best_bowling: payload.bowling.best_bowling,
    match_count: processedHistory.length,
    external_id: payload.external_id,
  };
}

// ── API handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  const secret = req.query.secret || req.headers['x-sync-secret'];
  if (secret !== process.env.ADMIN_SECRET && secret !== 'daitya_sync_2024') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { playerId } = req.query;
  if (!playerId) {
    return res.status(400).json({
      error: 'playerId required',
      usage: '?playerId=41997128&secret=daitya_sync_2024',
    });
  }

  try {
    await connectDB();
    const player = await syncPlayerFull(playerId);
    res.json({ success: true, player });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
