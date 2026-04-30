import mongoose from 'mongoose';
import Player from '../src/models/Player.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = 'mongodb+srv://nooneisusingthismail_db_user:cMHPAJMlm863rVKL@cluster0.nemhgne.mongodb.net/daitya';

async function updateRoster() {
  try {
    console.log('Connecting to Daitya Legion Database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    // 1. Remove Aaroosh and Yug
    console.log('\n--- Removing Players ---');
    const deleteRes = await Player.deleteMany({ name: { $in: [/Aaroosh/i, /Yug/i] } });
    console.log(`Removed ${deleteRes.deletedCount} players matching Aaroosh/Yug.`);

    // 2. Update Titles
    console.log('\n--- Updating Titles ---');
    
    // Aman: Classicist, Aspirant
    const amanRes = await Player.updateMany(
      { name: /Aman/i }, 
      { $addToSet: { titles: { $each: ['Classicist', 'Aspirant'] } } }
    );
    console.log(`Aman: Updated ${amanRes.modifiedCount} records.`);

    // Deepak: Classicist
    const deepakRes = await Player.updateMany(
      { name: /Deepak/i }, 
      { $addToSet: { titles: 'Classicist' } }
    );
    console.log(`Deepak: Updated ${deepakRes.modifiedCount} records.`);

    // Ashraya: Steady Batter, Aspirant
    const ashrayaRes = await Player.updateMany(
      { name: /Ashraya/i }, 
      { $addToSet: { titles: { $each: ['Steady Batter', 'Aspirant'] } } }
    );
    console.log(`Ashraya: Updated ${ashrayaRes.modifiedCount} records.`);

    // Ansh: Classicist, Aspirant
    const anshRes = await Player.updateMany(
      { name: /Ansh/i }, 
      { $addToSet: { titles: { $each: ['Classicist', 'Aspirant'] } } }
    );
    console.log(`Ansh: Updated ${anshRes.modifiedCount} records.`);

    // Aarav: Steady Batter, Aspirant
    const aaravRes = await Player.updateMany(
      { name: /Aarav/i }, 
      { $addToSet: { titles: { $each: ['Steady Batter', 'Aspirant'] } } }
    );
    console.log(`Aarav: Updated ${aaravRes.modifiedCount} records.`);

    console.log('\nUpdate Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to update roster:', error);
    process.exit(1);
  }
}

updateRoster();
