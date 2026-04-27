import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Player from '../src/models/Player.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrate() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGO_URI or MONGODB_URI missing');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('🔗 Connected to MongoDB');

    const players = await Player.find({});
    console.log(`🔍 Found ${players.length} players to check.`);

    for (const player of players) {
      let updated = false;
      if (player.match_history && player.match_history.length > 0) {
        player.match_history = player.match_history.map(m => {
          // Check if performance is in the old flat format
          if (m.performance && !m.performance.batting && m.performance.runs !== undefined) {
            updated = true;
            return {
              ...m.toObject ? m.toObject() : m,
              performance: {
                batting: {
                  runs: m.performance.runs || 0,
                  balls: m.performance.balls || 0,
                  fours: m.performance.fours || 0,
                  sixes: m.performance.sixes || 0,
                  strike_rate: m.performance.strike_rate || 0,
                  how_out: m.performance.how_out || 'DNB'
                },
                bowling: {
                  wickets: m.performance.wickets || 0,
                  overs: m.performance.overs_bowled || '0',
                  runs: m.performance.runs_conceded || 0,
                  economy: m.performance.economy || 0
                }
              }
            };
          }
          return m;
        });
      }

      if (updated) {
        await player.save();
        console.log(`✅ Migrated match history for: ${player.name}`);
      }
    }

    console.log('✨ Migration completed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
