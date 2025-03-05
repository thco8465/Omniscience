import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import bodyParser from 'body-parser';
import db from './Database/db.mjs'; // Adjust the path accordingly

import leaderboardRoutes from './endpoints/leaderboards.mjs'

const app = express();
app.use(cors())
app.use(bodyParser.json());
app.use('/leaderboard', leaderboardRoutes);
const PORT = process.env.PORT;

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
    const response = await fetch(`https://api.datamuse.com/words?sp=${'?'.repeat(length)}&max=1000&md=d`);
    const data = await response.json();

    // Filter words that have definitions
    const validWords = data
      .filter(entry => entry.defs) // Only keep words that have definitions
      .map(entry => ({
        word: entry.word.toLowerCase(),
        definition: entry.defs[0] // Get the first definition (if there are multiple)
      }))
      .filter(wordObj => wordObj.word.length >= 3 && wordObj.word.length <= 8);

    if (validWords.length > 0) {
      // Select a random word from the filtered list
      const randomWordObj = validWords[Math.floor(Math.random() * validWords.length)];
      res.json({
        word: randomWordObj.word,
        definition: randomWordObj.definition
      });
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
app.get("/profile/equipped/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    const query = `
      SELECT 
        (SELECT i.image_url FROM user_items ui
         JOIN items i ON ui.item_id = i.id
         WHERE ui.user_id = $1 AND ui.equipped = true AND i.type = 'background'
         LIMIT 1) AS background,

        (SELECT i.image_url FROM user_items ui
         JOIN items i ON ui.item_id = i.id
         WHERE ui.user_id = $1 AND ui.equipped = true AND i.type = 'avatar'
         LIMIT 1) AS avatar,

        (SELECT i.style_class FROM user_items ui
         JOIN items i ON ui.item_id = i.id
         WHERE ui.user_id = $1 AND ui.equipped = true AND i.type = 'card'
         LIMIT 1) AS card;
    `;

    const result = await db.oneOrNone(query, [user_id]);

    // Return the image_url for each equipped item
    res.json({
      background: result.background || null,
      avatar: result.avatar || null,
      card: result.card || null
    });
  } catch (error) {
    console.error("Error fetching equipped items:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//Equip a cosmetic
app.post("/profile/equip", async (req,res) => {
  const {userId, itemId, type} = req.body;
  try{
    //unequip previous item of the same type
    await db.none(`
      update user_items
      set equipped = false
      where user_id=$1
      and item_id in (
      select id from items where type=$2
      )`
    , [userId, type]);

    //Equip the selected item
    await db.none(`
      update user_items
      set equipped = true
      where user_id=$1
      and item_id = $2`,
    [userId, itemId]);

    res.json({message: `${type} equipped successfully!`});
  } catch(error){
    console.error("Error equipping item:", error);
    res.status(500).json({message: "Server error"});
  }
})
//Display cosmetics bought 
app.get("/profile/:type/:user_id", async (req, res) => {
  const { user_id, type } = req.params;

  // Ensure type is one of the allowed values
  const allowedTypes = ["background", "avatar", "card"];
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ message: "Invalid type specified" });
  }

  try {
    const result = await db.manyOrNone(
      `SELECT ui.equipped, i.*
       FROM user_items ui
       JOIN items i ON ui.item_id = i.id
       WHERE ui.user_id = $1 AND i.type = $2`,
      [user_id, type]
    );

    res.json(result);
  } catch (error) {
    console.error(`Error fetching ${type} cosmetics for user ${user_id}:`, error);
    res.status(500).json({ message: "Server error" });
  }
});

//Change medals earned 
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
    res.json({ message: "Achievements updated successfully", data: result })
  } catch (error) {
    console.error("Error updating achievements: ", error);
    res.status(500).json({ message: "Server error" });
  }
});
//Display Items from the store 
app.get("/store/:user_id", async (req,res) => {
  const {user_id} = req.params;

  try{
    const avilableItems = await db.any(
      `select * from items
      where id not in (select item_id from user_items where user_id=$1)`,
      [user_id]
    );
    res.json(avilableItems);
  }catch(error){
    console.error("Error fetching store items:", error);
    res.status(500).json({message: "Server Error"});
  }
});
//When a user buys an item from the store
app.post("/store/:user_id", async (req, res) => {
  const { user_id } = req.params; // Get user_id from URL params
  const { item_id } = req.body; // Get item_id from request body

  try {
    // Start a transaction
    await db.tx(async (t) => {
      // Get the user's current gold, silver, and bronze from the achievements table
      const userAchievements = await t.oneOrNone(
        `SELECT gold, silver, bronze FROM achievements WHERE user_id = $1`,
        [user_id]
      );

      if (!userAchievements) {
        // Directly return here, no need to send response after transaction
        throw new Error("User achievements not found");
      }

      // Get the item's price details (gold, silver, bronze)
      const item = await t.oneOrNone(
        `SELECT price_gold, price_silver, price_bronze FROM items WHERE id = $1`,
        [item_id]
      );

      if (!item) {
        throw new Error("Item not found");
      }

      // Check if the user has enough currency for the item
      if (item.price_gold > 0 && userAchievements.gold < item.price_gold) {
        throw new Error("Not enough gold");
      }
      if (item.price_silver > 0 && userAchievements.silver < item.price_silver) {
        throw new Error("Not enough silver");
      }
      if (item.price_bronze > 0 && userAchievements.bronze < item.price_bronze) {
        throw new Error("Not enough bronze");
      }

      // Deduct the currency from the achievements table based on the item's price type
      if (item.price_gold > 0) {
        await t.none(
          `UPDATE achievements SET gold = gold - $1 WHERE user_id = $2`,
          [item.price_gold, user_id]
        );
      }
      if (item.price_silver > 0) {
        await t.none(
          `UPDATE achievements SET silver = silver - $1 WHERE user_id = $2`,
          [item.price_silver, user_id]
        );
      }
      if (item.price_bronze > 0) {
        await t.none(
          `UPDATE achievements SET bronze = bronze - $1 WHERE user_id = $2`,
          [item.price_bronze, user_id]
        );
      }

      // Insert the item into the user's items table (set equipped to false)
      await t.none(
        `INSERT INTO user_items (user_id, item_id, equipped)
         VALUES ($1, $2, false)`,
        [user_id, item_id]
      );
    });

    // Respond once, after the transaction is complete
    res.status(200).json({ message: "Item purchased successfully" });
  } catch (error) {
    console.error("Error processing purchase:", error);

    // Handle specific errors for better response messages
    if (error.message === "User achievements not found") {
      return res.status(404).json({ message: "User achievements not found" });
    }
    if (error.message === "Item not found") {
      return res.status(404).json({ message: "Item not found" });
    }
    if (error.message.startsWith("Not enough")) {
      return res.status(400).json({ message: error.message });
    }

    // Catch-all for any unexpected errors
    res.status(500).json({ message: "Server Error" });
  }
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
