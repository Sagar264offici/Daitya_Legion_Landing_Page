import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Player from "../models/Player.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getPlayers = async (req, res) => {
  try {
    let players = await Player.find({}).sort({ matches: -1 });

    if (!players || players.length === 0) {
      console.log("No players found in DB, using JSON fallback");
      const dataPath = path.join(__dirname, "../../data/players.json");
      
      let rawData;
      try {
        rawData = fs.readFileSync(dataPath, "utf-8");
      } catch (readErr) {
        console.error("Error reading players.json:", readErr.message);
        return res.status(500).json({ message: "No players found and fallback data unavailable" });
      }

      let jsonPlayers;
      try {
        jsonPlayers = JSON.parse(rawData);
      } catch (parseErr) {
        console.error("Error parsing players.json:", parseErr.message);
        return res.status(500).json({ message: "Invalid player data format" });
      }

      // Convert to mongoose docs and save to DB
      await Promise.all(
        jsonPlayers.map(async (p) => {
          const existing = await Player.findOne({ external_id: p.external_id });
          if (!existing) {
            const playerDoc = new Player(p);
            await playerDoc.save();
          }
        }),
      );

      // Fetch fresh from DB
      players = await Player.find({}).sort({ matches: -1 });
    }

    res.json(players);
  } catch (error) {
    console.error(`Error fetching players: ${error.message}`);
    res.status(500).json({ message: "Server Error" });
  }
};

export const createPlayer = async (req, res) => {
  try {
    const { name, role, matches, runs, wickets, external_id } = req.body;
    // Handle both 'titles' and 'titles[]' from FormData
    const titles = req.body.titles || req.body['titles[]'];
    let image_url = "";

    if (req.file) {
      image_url = req.file.path;
    }

    // titles might come as an array or a string
    const titlesArray = Array.isArray(titles) ? titles : (titles ? [titles] : []);

    const player = new Player({
      name,
      role,
      matches,
      runs,
      wickets,
      external_id: external_id || `manual-${Date.now()}`,
      image_url,
      titles: titlesArray,
      is_manual_override: true,
    });

    const createdPlayer = await player.save();
    res.status(201).json(createdPlayer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePlayer = async (req, res) => {
  try {
    const { name, role, matches, runs, wickets, external_id } = req.body;
    // Handle both 'titles' and 'titles[]' from FormData
    const titles = req.body.titles || req.body['titles[]'];
    const player = await Player.findById(req.params.id);

    if (player) {
      player.name = name || player.name;
      player.role = role || player.role;
      player.matches = matches !== undefined ? matches : player.matches;
      player.runs = runs !== undefined ? runs : player.runs;
      player.wickets = wickets !== undefined ? wickets : player.wickets;
      player.external_id = external_id || player.external_id;
      player.is_manual_override = true;

      if (titles !== undefined) {
        player.titles = Array.isArray(titles) ? titles : (titles ? [titles] : []);
      }

      if (req.file) {
        player.image_url = req.file.path;
      }

      const updatedPlayer = await player.save();
      res.json(updatedPlayer);
    } else {
      res.status(404).json({ message: "Player not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);

    if (player) {
      await player.deleteOne();
      res.json({ message: "Player removed" });
    } else {
      res.status(404).json({ message: "Player not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
