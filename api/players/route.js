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

  // 3. Get badges + categories from team member data
  const gamificationBadges = await getPlayerGamification(playerId);
  // Fetch team members to get batter_category / bowler_category
  let memberCategories = [];
  try {
    const { getTeamMembers } = await import('../../backend/src/utils/cricheroesClient.js');
    const members = await getTeamMembers();
    const member = members.find(m => m.external_id === String(playerId));
    if (member) memberCategories = [member.batter_category, member.bowler_category].filter(Boolean);
  } catch (_) {}
  const titles = [...new Set([...memberCategories, ...gamificationBadges])];
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

  // ── GET /api/players?action=bulk-sync&secret=... ──
  if (req.method === 'GET' && req.query.action === 'bulk-sync') {
    const { secret } = req.query;
    const SYNC_SECRET = process.env.ADMIN_SECRET || 'daitya_sync_2024';
    if (secret !== SYNC_SECRET) return res.status(401).json({ error: 'Unauthorized' });

    const API_HOST = 'https://api.cricheroes.in';
    const API_KEY = 'cr!CkH3r0s';
    const DAITYA_TEAM_ID = '11183415';
    const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

    async function apiFetch(ep) {
      const crypto = await import('crypto');
      const r = await fetch(API_HOST + ep, {
        headers: { 'User-Agent': UA, Accept: 'application/json', 'api-key': API_KEY, 'device-type': 'web', 'udid': crypto.randomUUID() },
      });
      const j = await r.json();
      return j.status ? (j.data ?? j) : null;
    }

    function parseStats(resp) {
      if (!resp?.statistics) return {};
      const p = (arr) => Object.fromEntries((arr || []).map(i => [
        i.title.toLowerCase().replace(/\s+/g, '_').replace(/highest_runs/, 'high_score').replace(/^avg$/, 'average').replace(/^sr$/, 'strike_rate'), i.value,
      ]));
      const bat = p(resp.statistics.batting), bowl = p(resp.statistics.bowling);
      return {
        batting: { total_runs: parseInt(bat.runs)||0, innings: parseInt(bat.innings)||0, average: parseFloat(bat.average)||0, strike_rate: parseFloat(bat.strike_rate)||0, high_score: parseInt(bat.high_score)||0, fours: parseInt(bat['4s'])||0, sixes: parseInt(bat['6s'])||0, fifties: parseInt(bat['50s'])||0, hundreds: parseInt(bat['100s'])||0, matches: parseInt(bat.matches)||0 },
        bowling: { wickets: parseInt(bowl.wickets)||0, economy: parseFloat(bowl.economy)||0, overs: parseFloat(bowl.overs)||0, average: parseFloat(bowl.average)||0, best_bowling: bowl.best_bowling||'—', five_w: parseInt(bowl['5w'])||0 },
      };
    }

    try {
      const membersData = await apiFetch('/api/v1/team/get-team-member/' + DAITYA_TEAM_ID);
      if (!membersData?.members) return res.status(500).json({ error: 'Failed to fetch team members' });
      const results = [];
      for (const m of membersData.members) {
        const pid = String(m.player_id);
        try {
          const statsResp = await apiFetch('/api/v1/player/get-player-statistic/' + pid);
          const parsed = parseStats(statsResp);
          const matchesResp = await apiFetch('/api/v1/player/get-player-match/' + pid);
          const matches = matchesResp ? Object.values(matchesResp).filter(x => x?.match_id) : [];
          const history = matches.filter(mh => mh.match_result === 'Resulted').map(mh => ({
            match_id: String(mh.match_id),
            date: new Date(mh.match_start_time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            opponent: String(mh.team_a_id) === DAITYA_TEAM_ID ? mh.team_b : mh.team_a,
            won: String(mh.winning_team_id) === DAITYA_TEAM_ID,
            my_score: (String(mh.team_a_id) === DAITYA_TEAM_ID ? mh.team_a_summary : mh.team_b_summary) || '—',
            opp_score: (String(mh.team_a_id) === DAITYA_TEAM_ID ? mh.team_b_summary : mh.team_a_summary) || '—',
            result: mh.match_summary?.summary || '',
            cricheroes_url: 'https://cricheroes.com/scorecard/' + mh.match_id + '/match-details',
            performance: { batting: { runs: 0, balls: 0, fours: 0, sixes: 0, strike_rate: 0, how_out: 'DNB' }, bowling: { wickets: 0, overs: '0', runs: 0, economy: 0 } },
          }));
          const badges = await apiFetch('/api/v1/player/get-player-gamification/' + pid);
          const gamTitles = Array.isArray(badges) ? badges.map(b => b.name).filter(Boolean) : [];
          const catTitles = [m.batter_category, m.bowler_category].filter(Boolean);
          const titles = [...new Set([...catTitles, ...gamTitles])];
          const payload = {
            external_id: pid, name: m.name, image_url: m.profile_photo || '',
            matches: parsed.batting?.matches||0, runs: parsed.batting?.total_runs||0, wickets: parsed.bowling?.wickets||0,
            titles, batting: parsed.batting||{}, bowling: parsed.bowling||{},
            match_history: history, last_synced_at: new Date(),
          };
          const existing = await Player.findOne({ external_id: pid });
          if (existing) { payload.name = payload.name || existing.name; payload.image_url = payload.image_url || existing.image_url; if (existing.is_manual_override) { results.push({ name: m.name, status: 'skipped' }); continue; } }
          await Player.findOneAndUpdate({ external_id: pid }, { $set: payload }, { upsert: true });
          results.push({ name: m.name, runs: payload.runs, wickets: payload.wickets, matches: payload.matches });
        } catch (e) { results.push({ name: m.name, error: e.message }); }
      }
      return res.json({ success: true, synced: results.length, players: results });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

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
