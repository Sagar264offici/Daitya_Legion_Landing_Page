import connectDB from "../../backend/src/config/db.js";
import {
    createMatch,
    deleteMatch,
    getMatches,
} from "../../backend/src/controllers/matchController.js";
import { protect } from "../middleware/authMiddleware.js";

export default async function handler(req, res) {
  await connectDB();

  // GET all matches (public)
  if (req.method === "GET") {
    try {
      return getMatches(req, res);
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  }

  // Protect POST/DELETE
  protect(req, res);
  // If reached here, auth passed (protect called next(), ignored)

  // POST create match
  if (req.method === "POST") {
    try {
      return createMatch(req, res);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // DELETE match/:id
  if (req.method === "DELETE" && req.query.id) {
    try {
      req.params.id = req.query.id;
      return deleteMatch(req, res);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
