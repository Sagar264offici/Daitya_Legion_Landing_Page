import mongoose from 'mongoose';
import Player from './src/models/Player.js';

async function run() {
  await mongoose.connect('mongodb+srv://nooneisusingthismail_db_user:cMHPAJMlm863rVKL@cluster0.nemhgne.mongodb.net/daitya');
  const players = await Player.find({}, 'name titles');
  players.forEach(p => console.log(p.name, p.titles));
  process.exit(0);
}
run();
