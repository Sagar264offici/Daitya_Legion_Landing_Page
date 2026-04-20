import connectDB from "../../backend/src/config/db.js";
import {
    createPlayer,
    deletePlayer,
    getPlayers,
    updatePlayer,
} from "../../backend/src/controllers/playerController.js";
import { protect } from "../middleware/authMiddleware.js";

export default async function handler(req, res) {
  await connectDB();

  // GET all players (public)
  if (req.method === "GET") {
    try {
      return getPlayers(req, res);
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  }

  // Protect other methods
  const authResult = protect(req, res);
  if (authResult && authResult.statusCode) return;

  // POST create player
  if (req.method === "POST") {
    try {
      // Temp: skip multer, assume image_url in body
      req.file = null; // No file handling yet
      return createPlayer(req, res);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // PUT update player
  if (req.method === "PUT") {
    try {
      const id = req.query.id || req.params?.id;
      if (!id) return res.status(400).json({ message: "Player ID required" });
      
      // Ensure req.params has id for the controller
      req.params = { ...req.params, id };

      // Handle both 'titles' and 'titles[]' from FormData
      if (req.body['titles[]'] && !req.body.titles) {
        req.body.titles = req.body['titles[]'];
      }

      req.file = null; 
      return updatePlayer(req, res);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // DELETE player
  if (req.method === "DELETE") {
    try {
      const id = req.query.id || req.params?.id;
      if (!id) return res.status(400).json({ message: "Player ID required" });
      
      req.params = { ...req.params, id };
      return deletePlayer(req, res);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
