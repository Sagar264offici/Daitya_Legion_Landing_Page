import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema(
  {
    external_id: {
      type: String,
      index: true,
    },
    name: {
      type: String,
    },
    role: {
      type: String,
      default: 'Unknown',
    },
    titles: [{ type: String }],
    matches: {
      type: Number,
      default: 0,
    },
    runs: {
      type: Number,
      default: 0,
    },
    wickets: {
      type: Number,
      default: 0,
    },
    catches: { type: Number, default: 0 },
    run_outs: { type: Number, default: 0 },
    man_of_the_match: { type: Number, default: 0 },
    tournaments: { type: Number, default: 0 },
    image_url: {
      type: String,
      default: '',
    },
    is_manual_override: {
      type: Boolean,
      default: false,
    },
    batting: {
      average: { type: Number, default: 0 },
      strike_rate: { type: Number, default: 0 },
      high_score: { type: Number, default: 0 },
      total_runs: { type: Number, default: 0 },
      innings: { type: Number, default: 0 },
      fours: { type: Number, default: 0 },
      sixes: { type: Number, default: 0 },
      fifties: { type: Number, default: 0 },
      hundreds: { type: Number, default: 0 }
    },
    bowling: {
      wickets: { type: Number, default: 0 },
      economy: { type: Number, default: 0 },
      overs: { type: Number, default: 0 },
      average: { type: Number, default: 0 },
      five_w: { type: Number, default: 0 },
      best_bowling: { type: String, default: '0/0' }
    },
    general: {
      dob: { type: String, default: '' },
      batting_style: { type: String, default: '' },
      bowling_style: { type: String, default: '' }
    },
    recent_form: [
      {
        date: String,
        match: String,
        score: String,
        result: String,
      }
    ],
    match_history: [
      {
        match_id: String,
        date: String,
        opponent: String,
        opp_logo: String,
        ground: String,
        city: String,
        match_type: String,
        result: String,
        won: Boolean,
        my_score: String,
        opp_score: String,
        my_overs: String,
        opp_overs: String,
        toss: String,
        cricheroes_url: String,
        performance: {
          batting: {
            runs: { type: Number, default: 0 },
            balls: { type: Number, default: 0 },
            fours: { type: Number, default: 0 },
            sixes: { type: Number, default: 0 },
            strike_rate: { type: Number, default: 0 },
            how_out: { type: String, default: 'DNB' }
          },
          bowling: {
            wickets: { type: Number, default: 0 },
            overs: { type: Number, default: 0 },
            runs: { type: Number, default: 0 },
            economy: { type: Number, default: 0 }
          }
        }
      }
    ]
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Player', playerSchema);
