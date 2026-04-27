import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { scrapePlayers } from '../src/services/scraperService.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to MongoDB');

    console.log(`🚀 Starting Full Team Deep Sync to fix data structures...`);

    await scrapePlayers({ 
        force: true
    });

    console.log('\n✨ Deep Sync completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Sync failed:', err);
    process.exit(1);
  }
}

run();
