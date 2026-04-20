import connectDB from "../../backend/src/config/db.js";
import Team from "../../backend/src/models/Team.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();
    const team = await Team.findOne({ name: "Daitya Legion" });
    if (!team) {
      return res.json({
        name: "Daitya Legion",
        logo_url: "https://cricheroes.com/assets/images/team-placeholder.png",
        total_matches: 0,
        total_runs: 0,
        total_wickets: 0,
      });
    }
    res.json(team);
  } catch (error) {
    console.error("Team handler error:", error);
    res.status(500).json({ error: "Server Error" });
  }
}
