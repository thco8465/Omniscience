//Change medals earned 
import express from 'express'
import db from '../../Database/db.js'

const router = express.Router();


// Get leaderboard for a specific game
// router.get('/:gameName', async (req, res) => {
//     const { gameName } = req.params;
//     try {
//         // const result = await db.query(
//         //     `SELECT user_id, game_name, score, create_at FROM leaderboards WHERE game_name = $1 ORDER BY score DESC LIMIT 10`,
//         //     [gameName]
//         // );
//         const result = await db.query(
//             `SELECT 
//                 lb.user_id, 
//                 lb.game_name, 
//                 lb.score, 
//                 lb.create_at, 
//                 u.username, 
//                 i.image_url AS avatar
//             FROM leaderboards lb
//             LEFT JOIN users u ON lb.user_id = u.id
//             LEFT JOIN user_items ui ON u.id = ui.user_id
//             LEFT JOIN items i ON ui.item_id = i.id AND i.type = 'avatar'
//             WHERE lb.game_name = $1 AND ui.equipped = true
//             ORDER BY lb.score DESC
//             LIMIT 10`,
//             [gameName]
//         );
//         console.log(result)
//         // Check if result is an array or has rows
//         const leaderboardData = Array.isArray(result) ? result : result.rows;

//         if (!leaderboardData || leaderboardData.length === 0) {
//             // Return default message if no leaderboard data exists
//             return res.json([{
//                 user_id: null,
//                 game_name: gameName,
//                 score: 0,
//                 create_at: new Date(),
//                 username: null,
//                 avatar: null,
//                 message: 'No leaders for this game yet'
//             }]);
//         }

//         res.json(leaderboardData);
//     } catch (err) {
//         console.error('Error fetching leaderboards:', err);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });
router.get('/:gameName', async (req, res) => {
    const { gameName } = req.params;
    try {
        // Step 1: Get the leaderboard for the specific game
        const leaderboardResult = await db.query(
            `SELECT user_id, game_name, score, create_at 
            FROM leaderboards 
            WHERE game_name = $1 
            ORDER BY score DESC 
            LIMIT 10`,
            [gameName]
        );

        const leaderboardData = leaderboardResult.rows || leaderboardResult;

        if (!leaderboardData || leaderboardData.length === 0) {
            return res.json([{
                user_id: null,
                game_name: gameName,
                score: 0,
                create_at: new Date(),
                username: null,
                avatar: null,
                message: 'No leaders for this game yet'
            }]);
        }

        console.log("Leaderboard Data:", leaderboardData);

        // Step 2: Get the unique user IDs from the leaderboard
        const userIds = [...new Set(leaderboardData.map(entry => entry.user_id))];
        console.log("Unique User IDs:", userIds);

        // Step 3: Get the usernames for the users in the leaderboard
        const usernamesResult = await db.query(
            `SELECT id, username 
            FROM users 
            WHERE id = ANY($1)`,
            [userIds]
        );

        console.log("Usernames Result:", usernamesResult); 

        const usernames = usernamesResult.reduce((acc, user) => {
            acc[user.id] = user.username;
            return acc;
        }, {});
        
        console.log("Usernames:", usernames);

        // Step 4: Get the avatars for the users in the leaderboard
        const avatarsResult = await db.query(
            `SELECT ui.user_id, i.image_url AS avatar
            FROM user_items ui
            JOIN items i ON ui.item_id = i.id AND i.type = 'avatar'
            WHERE ui.user_id = ANY($1) AND ui.equipped = true`,
            [userIds]
        );

        console.log("Avatars Result:", avatarsResult); 

        const avatars = avatarsResult.reduce((acc, avatar) => {
            acc[avatar.user_id] = avatar.avatar;
            return acc;
        }, {});

        console.log("Avatars:", avatars);

        // Step 5: Combine all data into the final response
        const leaderboardWithDetails = leaderboardData.map(entry => {
            const user = entry.user_id;
            return {
                ...entry,
                username: usernames[user] || null,
                avatar: avatars[user] || null
            };
        });

        res.json(leaderboardWithDetails);

    } catch (err) {
        console.error('Error fetching leaderboards:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



router.get('/:userId/:gameName', async (req, res) => {
    //console.log("Received request with params:", req.params); // Debugging

    const { userId, gameName } = req.params;

    try {
        const result = await db.query(
            `SELECT user_id, score, create_at FROM leaderboards WHERE user_id = $1 AND game_name = $2 ORDER BY score DESC`,
            [parseInt(userId), gameName] // Convert userId to integer
        );

        //console.log("Database query result:", result); // Debugging

        // Check if result is an array or has rows
        const leaderboardData = Array.isArray(result) ? result : result.rows;

        if (!leaderboardData || leaderboardData.length === 0) {
            return res.status(404).json({ error: "No leaderboard entry found for this user in this game" });
        }

        res.json(leaderboardData);
    } catch (err) {
        console.error("Error fetching user leaderboard entry:", err);
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});

//post a new leaderboard entry or update an existing one
router.post('/:gameName', async (req, res) => {
    const { gameName } = req.params;
    const { user_id, score } = req.body;

    //Validate input
    if (!user_id || score === undefined) {
        return res.status(400).json({ error: 'Missing required fields: user_id or score' });
    }
    try {
        await db.query(`
            insert into leaderboards (user_id, game_name, score) values ($1, $2, $3)`,
            [user_id, gameName, score]);
        res.status(200).json({ message: 'Leaaderboard entry added/updated successfully' });
    } catch (err) {
        console.error('Error posting leaderboard entry:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;

