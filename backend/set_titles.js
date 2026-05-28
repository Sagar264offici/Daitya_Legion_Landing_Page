import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Player from './src/models/Player.js';

dotenv.config();

async function run() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGO_URI or MONGODB_URI is required');

  await mongoose.connect(uri);

  const player = await Player.findOneAndUpdate(
    {
      $or: [
        { external_id: '41644117' },
        { name: { $regex: /^Sagar Pathak$/i } },
      ],
    },
    { $addToSet: { titles: 'Aspirant' } },
    { returnDocument: 'after' },
  );

  if (!player) throw new Error('Sagar Pathak not found');

  console.log(`Updated ${player.name} titles: ${(player.titles || []).join(', ')}`);
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
