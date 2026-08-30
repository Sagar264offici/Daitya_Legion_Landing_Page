import Player from '../models/Player.js';
import Team from '../models/Team.js';
import {
  getTeamMembers, getTeamStatistics, getPlayerStatistics, getAllPlayerMatches,
  getPlayerGamification, getPlayerAwards, parsePlayerStats, parseMatchForHistory,
  DAITYA_TEAM_ID,
} from '../utils/cricheroesClient.js';

// ── Main scrape entry point ──────────────────────────────────────────────────

export const scrapePlayers = async (options = {}) => {
  const { force = false, targetPlayers = [] } = options;
  console.log(`🚀 Starting LIVE SYNC via CricHeroes REST API (force=${force})...`);

  // 1. Fetch team members (includes batter_category + bowler_category)
  const members = await getTeamMembers();
  console.log(`👥 Found ${members.length} team members`);

  const filtered = targetPlayers.length > 0
    ? members.filter(m =>
        targetPlayers.includes(m.name.toLowerCase()) ||
        targetPlayers.includes(m.external_id)
      )
    : members;

  console.log(`🎯 Targeting ${filtered.length} players for sync.`);

  // 2. Process each player
  for (const m of filtered) {
    console.log(`\n👤 Processing ${m.name} (${m.external_id})...`);
    try {
      const existing = await Player.findOne({ external_id: m.external_id });
      if (existing?.is_manual_override && !force) {
        console.log(`    ⚠️  Skipping ${m.name} (Manual Override Active)`);
        continue;
      }

      // Fetch player statistics
      const statsResp = await getPlayerStatistics(m.external_id);
      const parsed = parsePlayerStats(statsResp);

      // Fetch match history
      const allMatches = await getAllPlayerMatches(m.external_id);
      console.log(`    📋 Found ${allMatches.length} matches`);

      // Fetch gamification badges (match achievements like "3 Qwickies")
      const gamificationBadges = await getPlayerGamification(m.external_id);

      // Fetch awards
      const awards = await getPlayerAwards(m.external_id);
      const motm = awards.filter(a => a.name?.toLowerCase().includes('man of the match') ||
                                       a.name?.toLowerCase().includes('fighter of the match')).length;

      // Merge batter_category + bowler_category + gamification badges into titles
      const categories = [m.batter_category, m.bowler_category]
        .filter(Boolean);
      const badgeNames = gamificationBadges.filter(Boolean);
      const titles = [...new Set([...categories, ...badgeNames])];
      console.log(`    🏷️  Titles: ${titles.join(', ') || 'none'}`);

      // Parse match history
      const processedHistory = allMatches
        .filter(mh => mh.match_result === 'Resulted')
        .map(mh => parseMatchForHistory(mh));

      // Build the DB payload
      const dbPayload = {
        external_id:      m.external_id,
        name:             m.name,
        role:             m.role || 'Unknown',
        image_url:        m.image_url,
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
        general: {
          dob:           '',
          batting_style: '',
          bowling_style: '',
        },
        match_history:  processedHistory,
        last_synced_at: new Date(),
      };

      // Upsert into DB
      if (existing && (!existing.is_manual_override || force)) {
        await Player.updateOne({ external_id: m.external_id }, { $set: dbPayload });
      } else if (!existing) {
        await Player.create(dbPayload);
      }

      console.log(`    ✅ Updated ${m.name}: Runs=${dbPayload.runs}, Wkts=${dbPayload.wickets}, Titles=[${titles.join(', ')}]`);
    } catch (e) {
      console.error(`    ❌ Error processing ${m.name}:`, e.message);
    }
  }

  // 3. Update team aggregate stats
  console.log('\n📊 Updating team stats...');
  try {
    const teamStatsResp = await getTeamStatistics();
    const teamStatsArr = Array.isArray(teamStatsResp) ? teamStatsResp : [];
    const statsMap = {};
    for (const s of teamStatsArr) statsMap[s.title] = s.value;

    await Team.findOneAndUpdate({ name: 'Daitya Legion' }, {
      total_matches:   parseInt(statsMap['Matches']) || 0,
      win_percentage:  statsMap['Win'] || '0%',
      total_tournaments: 0,
      last_updated:    Date.now(),
    }, { upsert: true });
    console.log(`✅ Team stats: ${statsMap['Matches']} matches, ${statsMap['Win']} win rate`);
  } catch (e) {
    console.error('⚠️  Failed to update team stats:', e.message);
  }

  // 4. Compute aggregate stats from player data
  const players = await Player.find({});
  await Team.findOneAndUpdate({ name: 'Daitya Legion' }, {
    total_runs:    players.reduce((a, p) => a + (p.runs || 0), 0),
    total_wickets: players.reduce((a, p) => a + (p.wickets || 0), 0),
    total_fifties: players.reduce((a, p) => a + (p.batting?.fifties || 0), 0),
    total_hundreds: players.reduce((a, p) => a + (p.batting?.hundreds || 0), 0),
    total_five_w:  players.reduce((a, p) => a + (p.bowling?.five_w || 0), 0),
  }, { upsert: true });

  console.log(`\n🎉 Sync complete! ${filtered.length} players updated via CricHeroes REST API.`);
};

export default scrapePlayers;
