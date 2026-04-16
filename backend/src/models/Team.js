import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'Daitya Legion' },
    logo_url: { type: String, default: 'https://cricheroes.com/assets/images/team-placeholder.png' },
    total_matches: { type: Number, default: 0 },
    total_runs: { type: Number, default: 0 },
    total_wickets: { type: Number, default: 0 },
    total_fifties: { type: Number, default: 0 },
    total_hundreds: { type: Number, default: 0 },
    total_five_w: { type: Number, default: 0 },
    total_tournaments: { type: Number, default: 0 },
    win_percentage: { type: String, default: "0%" },
    best_win: { type: String, default: "" },
    best_win_margin: { type: Number, default: 0 },
    best_win_url: { type: String, default: "" },
    last_updated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const Team = mongoose.models.Team || mongoose.model('Team', teamSchema);
export default Team;
