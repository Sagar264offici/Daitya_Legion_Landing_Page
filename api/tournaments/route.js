import connectDB from "../../backend/src/config/db.js";
import {
    getTournaments,
    getTournamentById,
    createTournament,
    updateTournament,
    deleteTournament
} from "../../backend/src/controllers/tournamentController.js";
import { protect } from "../middleware/authMiddleware.js";

export default async function handler(req, res) {
  await connectDB();

  // GET
  if (req.method === "GET") {
    try {
      return getTournaments(req, res);
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  }

  // Protect other methods
  const authResult = protect(req, res);
  if (authResult && authResult.statusCode) return;

  // POST
  if (req.method === "POST") {
    try {
      return createTournament(req, res);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // PUT
  if (req.method === "PUT") {
    try {
      const id = req.query.id;
      if (!id) return res.status(400).json({ message: "Tournament ID required" });
      req.params = { id };
      return updateTournament(req, res);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // DELETE
  if (req.method === "DELETE") {
    try {
      const id = req.query.id;
      if (!id) return res.status(400).json({ message: "Tournament ID required" });
      req.params = { id };
      return deleteTournament(req, res);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
