import connectDB from '../../../backend/src/config/db.js';
import Player from '../../../backend/src/models/Player.js';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json', 'Referer': 'https://cricheroes.com/' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, 'Accept': 'text/html', 'Referer': 'https://cricheroes.com/' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function getBuildId() {
  const html = await fetchText('https://cricheroes.com/');
  const m = html.match(/"buildId"\s*:\s*"([^"]+)"/);
  if (!m) throw new Error('buildId not found');
  return m[1];
}

function parseStatement(ps) {
  if (!ps) return {};
  const num = (r) => { const m = ps.match(r); return m ? parseFloat(m[1]) : 0; };
  return {
    innings: num(/With (\d+) turns at the crease/),
    high_score: num(/top score of <b>([^<]+)<\/b>/),
    batting_average: num(/average of <b>([^<]+)<\/b>/),
    strike_rate: num(/strike rate of <b>([^<]+)<\/b>/),
    sixes: num(/<b>(\d+) sixes<\/b>/),
    fours: num(/<b>(\d+) fours<\/b>/),
    overs: num(/bowled <b>([^<]+)<\/b> overs/),
    total_wickets: num(/taking <b>(\d+)<\/b> wickets/),
    economy: num(/economy rate of <b>([^<]+)<\/b>/),
    catches: num(/Taking <b>(\d+)<\/b> catches/),
    run_outs: num(/making <b>(\d+)<\/b> run outs/),
    man_of_the_match: num(/has won <b>(\d+)<\/b> Man of the Match/),
    tournaments: num(/played in <b>(\d+)<\/b> different tournaments/),
  };
}

async function syncPlayer(playerId, slug, buildId) {
  const statsUrl = `https://cricheroes.com/_next/data/${buildId}/player-profile/${playerId}/${slug}/stats.json?playerId=${playerId}&slug=${slug}`;
  const statsJson = await fetchJSON(statsUrl);
  const info = statsJson?.pageProps?.playerInfo?.data;
  if (!info) throw new Error(`No playerInfo for ${playerId}/${slug}`);

  const extras = parseStatement(info.player_statement);

  // Fetch match history (first page)
  let matchHistory = [];
  try {
    const matchUrl = `https://cricheroes.com/_next/data/${buildId}/player-profile/${playerId}/${slug}/matches.json?playerId=${playerId}&slug=${slug}`;
    const matchJson = await fetchJSON(matchUrl);
    const matches = matchJson?.pageProps?.matches?.data || [];
    matchHistory = matches.slice(0, 30).map(m => ({
      match_id: String(m.match_id),
      date: new Date(m.match_start_time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      opponent: String(m.team_a_id) === '11183415' ? m.team_b : m.team_a,
      won: String(m.winning_team_id) === '11183415',
      my_score: (String(m.team_a_id) === '11183415' ? m.team_a_summary : m.team_b_summary) || '—',
      opp_score: (String(m.team_a_id) === '11183415' ? m.team_b_summary : m.team_a_summary) || '—',
      result: m.match_summary?.summary || '',
      cricheroes_url: `https://cricheroes.com/scorecard/${m.match_id}/match-details`,
      performance: { batting: { runs: 0, balls: 0, fours: 0, sixes: 0, strike_rate: 0, how_out: 'DNB' }, bowling: { wickets: 0, overs: 0, runs: 0, economy: 0 } }
    }));
  } catch(e) { /* match history optional */ }

  const payload = {
    external_id: String(info.player_id || playerId),
    name: info.name,
    image_url: info.profile_photo || '',
    role: info.playing_role || 'Unknown',
    matches: info.total_matches || 0,
    runs: info.total_runs || 0,
    wickets: info.total_wickets || 0,
    catches: extras.catches || 0,
    run_outs: extras.run_outs || 0,
    man_of_the_match: extras.man_of_the_match || 0,
    tournaments: extras.tournaments || 0,
    match_history: matchHistory,
    batting: {
      average: extras.batting_average || 0,
      strike_rate: extras.strike_rate || 0,
      high_score: extras.high_score || 0,
      total_runs: info.total_runs || 0,
      innings: extras.innings || 0,
      fours: extras.fours || 0,
      sixes: extras.sixes || 0,
      fifties: 0,
      hundreds: 0,
    },
    bowling: {
      wickets: info.total_wickets || 0,
      economy: extras.economy || 0,
      overs: extras.overs || 0,
      average: 0,
      five_w: 0,
      best_bowling: '—',
    },
    general: {
      dob: info.dob || '',
      batting_style: info.batting_hand || '',
      bowling_style: info.bowling_style || '',
    },
  };

  await Player.findOneAndUpdate(
    { external_id: payload.external_id },
    payload,
    { upsert: true, new: true }
  );

  return payload;
}

export default async function handler(req, res) {
  // Simple secret check
  const secret = req.query.secret || req.headers['x-sync-secret'];
  if (secret !== process.env.ADMIN_SECRET && secret !== 'daitya_sync_2024') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { playerId, slug } = req.query;
  if (!playerId || !slug) {
    return res.status(400).json({ error: 'playerId and slug required. Example: ?playerId=11341711&slug=ansh&secret=daitya_sync_2024' });
  }

  try {
    await connectDB();
    const buildId = await getBuildId();
    const player = await syncPlayer(playerId, slug, buildId);
    res.json({ success: true, player: { name: player.name, image_url: player.image_url, matches: player.matches, runs: player.runs } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
