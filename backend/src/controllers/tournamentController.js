import Tournament from '../models/Tournament.js';

// ─── GET ALL TOURNAMENTS (public) ─────────────────────────────────────────────
export const getTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find({})
      .populate('matches')
      .sort({ year: -1, createdAt: -1 });
    res.json(tournaments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET SINGLE TOURNAMENT (public) ───────────────────────────────────────────
export const getTournamentById = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id).populate('matches');
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
    res.json(tournament);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── CREATE TOURNAMENT (protected) ────────────────────────────────────────────
export const createTournament = async (req, res) => {
  try {
    const tournament = new Tournament(req.body);
    const saved = await tournament.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ─── UPDATE TOURNAMENT (protected) ────────────────────────────────────────────
export const updateTournament = async (req, res) => {
  try {
    const updated = await Tournament.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('matches');
    if (!updated) return res.status(404).json({ message: 'Tournament not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ─── DELETE TOURNAMENT (protected) ────────────────────────────────────────────
export const deleteTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
    await tournament.deleteOne();
    res.json({ message: 'Tournament deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
