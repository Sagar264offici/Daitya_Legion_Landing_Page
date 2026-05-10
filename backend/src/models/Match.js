import mongoose from 'mongoose';

const playerPerformanceSchema = new mongoose.Schema({
  player_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  player_name: { type: String, required: true },
  // Batting
  runs: { type: Number, default: 0 },
  balls: { type: Number, default: 0 },
  fours: { type: Number, default: 0 },
  sixes: { type: Number, default: 0 },
  strike_rate: { type: Number, default: 0 },
  how_out: { type: String, default: 'DNB' }, // e.g. "Caught", "Bowled", "Not Out", "DNB"
  // Bowling
  wickets: { type: Number, default: 0 },
  overs_bowled: { type: String, default: '0' },
  runs_conceded: { type: Number, default: 0 },
  economy: { type: Number, default: 0 },
  // Fielding
  catches: { type: Number, default: 0 },
  run_outs: { type: Number, default: 0 },
  // MVP
  mvp_points: { type: Number, default: 0, min: 0, max: 10 },
}, { _id: false });

const partnershipSchema = new mongoose.Schema({
  batsmen: [String],
  runs: { type: Number, default: 0 },
  balls: { type: Number, default: 0 },
  inning: { type: Number, default: 1 }
}, { _id: false });

const fowSchema = new mongoose.Schema({
  wicket_no: { type: Number },
  score: { type: String },
  over: { type: String },
  player: { type: String },
  inning: { type: Number, default: 1 }
}, { _id: false });

const matchSchema = new mongoose.Schema({
  match_id: { type: String, index: true }, // CricHeroes Match ID
  date: { type: String, required: true },
  opponent: { type: String, required: true },
  ground: { type: String, default: '' },
  city: { type: String, default: '' },
  match_type: { type: String, default: 'T20' },
  ball_type: { type: String, default: 'Leather' },
  
  // Scores
  our_score: { type: String, default: '' },
  opp_score: { type: String, default: '' },
  our_overs: { type: String, default: '' },
  opp_overs: { type: String, default: '' },
  toss: { type: String, default: '' },
  result: { type: String, required: true }, // e.g., "won by 7 wickets"
  result_status: { type: String, enum: ['won', 'lost', 'no_result', 'drawn'], required: true },

  // Pro Data
  partnerships: [partnershipSchema],
  fall_of_wicket: [fowSchema],
  power_plays: [mongoose.Schema.Types.Mixed],
  
  // Post-match analysis
  insights: { type: String, default: '' },
  highlights: { type: String, default: '' },
  player_of_match: { type: String, default: '' },
  star_performers: [
    {
      player_name: { type: String },
      category: { type: String, enum: ['batting', 'bowling', 'fielding', 'allround'] },
      performance: { type: String },
      _id: false,
    }
  ],
  
  // CricHeroes Meta
  cricheroes_url: { type: String, default: '' },
  raw_data: { type: mongoose.Schema.Types.Mixed }, // Store the original JSON snapshot
  
  // Per-player data
  player_performances: [playerPerformanceSchema],
}, { timestamps: true });

export default mongoose.model('Match', matchSchema);
