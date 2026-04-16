import Match from '../models/Match.js';
import Player from '../models/Player.js';

// ─── GET ALL MATCHES (public) ─────────────────────────────────────────────────
export const getMatches = async (req, res) => {
  try {
    const matches = await Match.find({}).sort({ date: -1 });
    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── CREATE MATCH + UPDATE PLAYER STATS (protected) ──────────────────────────
export const createMatch = async (req, res) => {
  try {
    const {
      date, opponent, ground, city, match_type,
      our_score, opp_score, our_overs, opp_overs,
      toss, result, insights, highlights, cricheroes_url,
      player_performances,
    } = req.body;

    const result_status = result?.toLowerCase().includes('won') ? 'won' 
      : result?.toLowerCase().includes('lost') ? 'lost' 
      : result?.toLowerCase().includes('draw') ? 'drawn' 
      : 'no_result';

    // 1. Save the Match document
    const match = new Match({
      date, opponent, ground, city, match_type,
      our_score, opp_score, our_overs, opp_overs,
      toss, result, result_status, insights, highlights, cricheroes_url,
      player_performances: player_performances || [],
    });
    const savedMatch = await match.save();

    // 2. Update each player's match_history and aggregate stats
    if (player_performances && player_performances.length > 0) {
      for (const perf of player_performances) {
        if (!perf.player_id) continue;

        const player = await Player.findById(perf.player_id);
        if (!player) continue;

        // Build the match_history entry
        const historyEntry = {
          match_id: savedMatch._id,
          date,
          opponent,
          ground,
          city,
          match_type: match_type || 'T20',
          result: result === 'won' ? 'Won' : result === 'lost' ? 'Lost' : 'No Result',
          won: result === 'won',
          my_score: our_score,
          opp_score: opp_score,
          my_overs: our_overs,
          opp_overs: opp_overs,
          toss,
          cricheroes_url: cricheroes_url || '',
          performance: {
            batting: {
              runs: perf.runs || 0,
              balls: perf.balls || 0,
              fours: perf.fours || 0,
              sixes: perf.sixes || 0,
              strike_rate: perf.strike_rate || (perf.balls > 0 ? parseFloat(((perf.runs / perf.balls) * 100).toFixed(2)) : 0),
              how_out: perf.how_out || 'DNB',
            },
            bowling: {
              wickets: perf.wickets || 0,
              overs: perf.overs_bowled || '0',
              runs: perf.runs_conceded || 0,
              economy: perf.economy || 0,
            },
          },
        };

        // Push to match_history (unshift to keep latest first)
        player.match_history.unshift(historyEntry);

        // Recalculate aggregated stats
        player.matches = (player.matches || 0) + 1;
        player.runs = (player.runs || 0) + (perf.runs || 0);
        player.wickets = (player.wickets || 0) + (perf.wickets || 0);
        player.catches = (player.catches || 0) + (perf.catches || 0);
        player.run_outs = (player.run_outs || 0) + (perf.run_outs || 0);

        // MVP → man_of_the_match if points >= 8
        if ((perf.mvp_points || 0) >= 8) {
          player.man_of_the_match = (player.man_of_the_match || 0) + 1;
        }

        // Batting aggregate
        player.batting.total_runs = (player.batting.total_runs || 0) + (perf.runs || 0);
        player.batting.fours = (player.batting.fours || 0) + (perf.fours || 0);
        player.batting.sixes = (player.batting.sixes || 0) + (perf.sixes || 0);
        if (perf.how_out && !perf.how_out.toLowerCase().includes('dnb')) {
          player.batting.innings = (player.batting.innings || 0) + 1;
        }
        if (perf.runs >= 50) player.batting.fifties = (player.batting.fifties || 0) + 1;
        if (perf.runs >= 100) player.batting.hundreds = (player.batting.hundreds || 0) + 1;
        if ((perf.runs || 0) > (player.batting.high_score || 0)) {
          player.batting.high_score = perf.runs;
        }

        // Recalc batting average (runs / dismissals)
        const dismissals = player.match_history.filter(
          m => m.performance?.batting?.how_out &&
            !m.performance.batting.how_out.toLowerCase().includes('not out') &&
            m.performance.batting.how_out.toLowerCase() !== 'dnb'
        ).length;
        player.batting.average = dismissals > 0 ? parseFloat((player.batting.total_runs / dismissals).toFixed(2)) : player.batting.total_runs;

        // Bowling aggregate
        if (perf.overs_bowled && parseFloat(perf.overs_bowled) > 0) {
          const prevOvers = parseFloat(player.bowling.overs || 0);
          const newOvers = parseFloat(perf.overs_bowled || 0);
          player.bowling.overs = parseFloat((prevOvers + newOvers).toFixed(1));

          // Recalc economy
          const totalRunsConceded = player.match_history.reduce((sum, m) => sum + (m.performance?.bowling?.runs || 0), 0);
          const totalOvers = player.match_history.reduce((sum, m) => sum + parseFloat(m.performance?.bowling?.overs || 0), 0);
          player.bowling.economy = totalOvers > 0 ? parseFloat((totalRunsConceded / totalOvers).toFixed(2)) : 0;
        }

        // Best bowling check
        const currentBest = player.bowling.best_bowling || '0/0';
        const [bW] = currentBest.split('/').map(Number);
        if ((perf.wickets || 0) > bW) {
          player.bowling.best_bowling = `${perf.wickets}/${perf.runs_conceded || 0}`;
        }

        player.is_manual_override = true;
        await player.save();
      }
    }

    res.status(201).json(savedMatch);
  } catch (err) {
    console.error('createMatch error:', err);
    res.status(400).json({ message: err.message });
  }
};

// ─── DELETE MATCH (protected) ─────────────────────────────────────────────────
export const deleteMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    await match.deleteOne();
    res.json({ message: 'Match removed' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
