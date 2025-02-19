import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import bodyParser from 'body-parser';
import db from '../Database/db.js'; // Adjust the path accordingly

const app = express();
app.use(cors())
app.use(bodyParser.json());
const port = 3000;

// Endpoint for account creation
app.post('/createAccount', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    await db.none('INSERT INTO users(username, email, password) VALUES($1, $2, $3)', [username, email, password]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
// Endpoint for user login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await db.oneOrNone('SELECT id, username, email FROM users WHERE username = $1 AND password = $2', [username, password]);

    if (result) {
      res.json({ success: true, user: result });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
// Endpoint for fetching user information
app.get('/userData/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const result = await db.oneOrNone('SELECT id, username, email FROM users WHERE username = $1', [username]);

    if (result) {
      res.json({ success: true, user: result });
    } else {
      res.json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user information:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get('/get-word', async (req, res) => {
  try {
    // Fetch words from Datamuse API
    const { length } = req.query;
    const response = await fetch("https://api.datamuse.com/words?sp=" + "?".repeat(length) + "&max=1000");
    const data = await response.json();

    // Filter words between 3-8 letters
    const validWords = data
      .map(entry => entry.word.toLowerCase())
      .filter(word => word.length >= 3 && word.length <= 8);

    if (validWords.length > 0) {
      // Select a random word from the filtered list
      const randomWord = validWords[Math.floor(Math.random() * validWords.length)];
      res.json({ word: randomWord });
    } else {
      res.status(404).send("No words found.");
    }
  } catch (error) {
    console.error("Error fetching word:", error);
    res.status(500).send("Error fetching word.");
  }
});
app.get("/achievements/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    let result = await db.oneOrNone("SELECT * FROM achievements WHERE user_id=$1", [user_id]);

    // If no record exists, insert a default row
    if (!result) {
      result = await db.one(
        "INSERT INTO achievements (user_id, score, bronze, silver, gold) VALUES ($1, 0, 0, 0, 0) RETURNING *",
        [user_id]
      );
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching achievements:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/achievements/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const { score, bronze, silver, gold } = req.body;
  try {
    const result = await db.oneOrNone(`update achievements 
      set score = coalesce($1, score),
      bronze = coalesce($2, bronze),
      silver = coalesce($3, silver), 
      gold = coalesce($4, gold)
    where user_id = $5
    returning *`,
      [score, bronze, silver, gold, user_id]);
    if (!result) {
      return res.status(404).json({ message: "User achievements not found." })
    }
    res.json({ message: "Achievements updated successfully", data: result})
  } catch (error) {
    console.error("Error updating achievements: ", error);
    res.status(500).json({ message: "Server error" });
  }
});
app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});
