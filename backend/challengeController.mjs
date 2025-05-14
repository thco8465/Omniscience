import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './Database/db.mjs';

// Get the directory path for current file (correct way for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read modifiers.json asynchronously
const modifiers = JSON.parse(await fs.readFile(path.join(__dirname, './modifiers.json'), 'utf-8'));

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

// Generate or fetch today's challenge
async function getDailyChallenge(req, res) {
  const today = getTodayDate();

  try {
    // Check if today's challenge already exists
    const existing = await db.query(
      'SELECT * FROM daily_challenges WHERE date = $1',
      [today]
    );
    console.log(existing[0])
    if (existing.length > 0) {
      return res.json(existing[0]);
    }

    // Pick random game from modifiers
    const gameNames = Object.keys(modifiers);
    console.log('game names:', gameNames)
    const game = getRandomElement(gameNames);
    const variation = getRandomElement(modifiers[game]);

    // Insert into daily_challenges
    const insert = await db.query(
      `INSERT INTO daily_challenges (date, game, variation, goal, reward)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [today, game, variation.name, variation.description, 1] // reward is static for now
    );

    res.json(insert.rows[0]);
  } catch (err) {
    console.error('Error getting daily challenge:', err);
    res.status(500).json({ error: 'Failed to get daily challenge' });
  }
}

// Mark challenge completed by user
async function completeChallenge(req, res) {
  const { userId } = req.body;
  const today = getTodayDate();

  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    await db.query(
      `INSERT INTO user_challenge_log (user_id, date, completed)
       VALUES ($1, $2, true)
       ON CONFLICT (user_id, date) DO UPDATE SET completed = true`,
      [userId, today]
    );

    res.json({ message: 'Challenge marked as complete' });
  } catch (err) {
    console.error('Error marking challenge complete:', err);
    res.status(500).json({ error: 'Failed to complete challenge' });
  }
}

// Get user's streak and today's completion
async function getChallengeStatus(req, res) {
  const { userId } = req.params;
  const today = getTodayDate();

  try {
    const logs = await db.query(
      `SELECT date, completed FROM user_challenge_log
       WHERE user_id = $1
       ORDER BY date DESC`,
      [userId]
    );

    let streak = 0;
    let currentDate = new Date(today);
    const completedDates = new Set(logs.filter(r => r.completed).map(r => r.date.toISOString().split('T')[0]));
    console.log('completedDates: ', completedDates)
    // Count consecutive days
    while (completedDates.has(currentDate.toISOString().split('T')[0])) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    const todayComplete = completedDates.has(today);

    res.json({ todayComplete, streak });
  } catch (err) {
    console.error('Error getting challenge status:', err);
    res.status(500).json({ error: 'Failed to fetch status' });
  }
}

export {
  getDailyChallenge,
  completeChallenge,
  getChallengeStatus
};
