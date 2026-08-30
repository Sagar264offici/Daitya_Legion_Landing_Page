import connectDB from '../../../backend/src/config/db.js';
import Player from '../../../backend/src/models/Player.js';
import Team from '../../../backend/src/models/Team.js';
import crypto from 'crypto';

const API_HOST = 'https://api.cricheroes.in';
const API_KEY  = 'cr!CkH3r0s';
const DAITYA_TEAM_ID = '11183415';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function apiFetch(endpoint) {
  const res = await fetch(`${API_HOST}${endpoint}`, {
    headers: {
      'User-Agent': UA, Accept: 'application/json',
      'api-key': API_KEY, 'device-type': 'web', 'udid': crypto.randomUUID(),
    },
  });
  const json = await res.json();
  if (!json.status) return null;
  return json.data ?? json;
}

function parseStats(resp) {
  if (!resp?.statistics) return {};
  const p = (arr) => Object.fromEntries((arr || []).map(i => [
    i.title.toLowerCase().replace(/\s+/g, '_').replace(/highest_runs/, 'high_score').replace(/^avg$/, 'average').replace(/^sr$/, 'strike_rate'),
    i.value,
  ]));
  const bat = p(resp.statistics.batting);
  const bowl = p(resp.statistics.bowling);
  return {
    batting: {
      total_runs: parseInt(bat.runs) || 0, innings: parseInt(bat.innings) || 0,
      average: parseFloat(bat.average) || 0, strike_rate: parseFloat(bat.strike_rate) || 0,
      high_score: parseInt(bat.high_score) || 0, fours: parseInt(bat['4s']) || 0,
      sixes: parseInt(bat['6s']) || 0, fifties: parseInt(bat['50s']) || 0,
      hundreds: parseInt(bat['100s']) || 0, matches: parseInt(bat.matches) || 0,
    },
    bowling: {
      wickets: parseInt(bowl.wickets) || 0, economy: parseFloat(bowl.economy) || 0,
      overs: parseFloat(bowl.overs) || 0, average: parseFloat(bowl.average) || 0,
      best_bowling: bowl.best_bowling || '—', five_w: parseInt(bowl['5w']) || 0,
    },
  };
}

export default async function handler(req, res) {
  const secret = req.query.secret || req.headers['x-sync-secret'];
  if (secret !== process.env.ADMIN_SECRET && secret !== 'daitya_sync_2024') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await connectDB();

    // Get team members
    const membersData = await apiFetch(`/api/v1/team/get-team-member/${DAITYA_TEAM_ID}`);
    if (!membersData?.members) return res.status(500).json({ error: 'Failed to fetch team members' });

    const results = [];
    for (const m of membersData.members) {
      const pid = String(m.player_id);
      try {
        const statsResp = await apiFetch(`/api/v1/player/get-player-statistic/${pid}`);
        const parsed = parseStats(statsResp);

        const matchesResp = await apiFetch(`/api/v1/player/get-player-match/${pid}`);
        const matches = matchesResp ? Object.values(matchesResp).filter(x => x?.match_id) : [];
        const processedHistory = matches
          .filter(mh => mh.match_result === 'Resulted')
          .map(mh => ({
            match_id: String(mh.match_id),
            date: new Date(mh.match_start_time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            opponent: String(mh.team_a_id) === DAITYA_TEAM_ID ? mh.team_b : mh.team_a,
            won: String(mh.winning_team_id) === DAITYA_TEAM_ID,
            my_score: (String(mh.team_a_id) === DAITYA_TEAM_ID ? mh.team_a_summary : mh.team_b_summary) || '—',
            opp_score: (String(mh.team_a_id) === DAITYA_TEAM_ID ? mh.team_b_summary : mh.team_a_summary) || '—',
            result: mh.match_summary?.summary || '',
            cricheroes_url: `https://cricheroes.com/scorecard/${mh.match_id}/match-details`,
            performance: {
              batting: { runs: 0, balls: 0, fours: 0, sixes: 0, strike_rate: 0, how_out: 'DNB' },
              bowling: { wickets: 0, overs: '0', runs: 0, economy: 0 },
            },
          }));

        // Get badges
        const badges = await apiFetch(`/api/v1/player/get-player-gamification/${pid}`);
        const titles = Array.isArray(badges) ? badges.map(b => b.name).filter(Boolean) : [];

        const payload = {
          external_id: pid, name: m.name, image_url: m.profile_photo || '',
          matches: parsed.batting?.matches || 0, runs: parsed.batting?.total_runs || 0,
          wickets: parsed.bowling?.wickets || 0, titles,
          batting: parsed.batting || {}, bowling: parsed.bowling || {},
          match_history: processedHistory, last_synced_at: new Date(),
        };

        const existing = await Player.findOne({ external_id: pid });
        if (existing) {
          payload.name = payload.name || existing.name;
          payload.image_url = payload.image_url || existing.image_url;
          if (existing.is_manual_override) {
            results.push({ name: m.name, status: 'skipped (manual override)' });
            continue;
          }
        }

        await Player.findOneAndUpdate({ external_id: pid }, { $set: payload }, { upsert: true });
        results.push({ name: m.name, runs: payload.runs, wickets: payload.wickets, matches: payload.matches });
      } catch (e) {
        results.push({ name: m.name, error: e.message });
      }
    }

    // Update team stats
    const players = await Player.find({});
    await Team.findOneAndUpdate({ name: 'Daitya Legion' }, {
      total_matches: Math.max(...players.map(p => p.matches || 0), 0),
      total_runs: players.reduce((a, p) => a + (p.runs || 0), 0),
      total_wickets: players.reduce((a, p) => a + (p.wickets || 0), 0),
      last_updated: Date.now(),
    }, { upsert: true });

    res.json({ success: true, synced: results.length, players: results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
