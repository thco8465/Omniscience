import { Server } from 'socket.io';
import db from '../Database/db.mjs';
import axios from 'axios'; // Assuming you are using axios for API requests.

const activeGames = {};
const connectedUsers = {};
let waitingCustomGames = {}
let wordleNamespace


function generateRandomWord() {
    const words = ["apple", "spear", "crank", "grape", "melon"];
    const word = words[Math.floor(Math.random() * words.length)]
    //console.log(word)
    return word;
}

// Initialize Wordle WebSocket server
function initializeWordle(io) {
    disconnectAllPlayers(io)

    wordleNamespace = io.of('/wordle'); // Create a separate namespace for Wordle

    wordleNamespace.on('connection', (socket) => {
        console.log(`Player connected to Wordle: ${socket.id}`);
        socket.removeAllListeners('');

        socket.on('quickplay', () => {
            let assignedGame = null;

            // Try to find an available game with one player waiting
            for (const gameId in activeGames) {
                if (activeGames[gameId].players.length === 1) {
                    assignedGame = gameId;
                    break;
                }
            }

            if (assignedGame) {
                // Join existing game
                console.log(`Player ${socket.id} joining game ${assignedGame}`);
                socket.join(assignedGame);
                const game = activeGames[assignedGame];
                game.players.push({ id: socket.id, number: 2 });
                game.waiting = false
                // Notify players
                socket.emit('gameAssigned', { gameId: assignedGame, playerNumber: 2 });
                wordleNamespace.to(assignedGame).emit('gameStateUpdate', game);
            } else {
                // Create new game
                const gameId = generateGameId();
                console.log(`Game created with ID: ${gameId} by ${socket.id}`);
                activeGames[gameId] = {
                    targetWord: generateRandomWord(),
                    gameId: gameId,
                    guesses_1: [],
                    guesses_2: [],
                    feedback_1: [],
                    feedback_2: [],
                    currentPlayer: 1,
                    score_1: 0,
                    score_2: 0,
                    keyStates_1: {},
                    keyStates_2: {},
                    players: [{ id: socket.id, number: 1 }],
                    currentGuess_1: "", // Track the current guess
                    currentGuess_2: "",
                    username_1: "player 1",
                    username_2: "player 2",
                    waiting: true,
                    gameOver: false,
                    replay_1: false,
                    replay_2: false,
                    turn: 1,
                    avatar_1: '',
                    avatar_2: '',
                };

                socket.join(gameId);
                socket.emit('gameCreated', { gameId, playerNumber: 1 });
            }
        })
        socket.on('custom', ({ invitedPlayer }) => {
            const invitingPlayerId = socket.id;
            const invitingUsername = connectedUsers[invitingPlayerId]; // Assuming you store socket.id -> username mappings

            if (!invitedPlayer || !connectedUsers[invitedPlayer]) {
                socket.emit('inviteFailed', { message: "Player not found or offline." });
                return;
            }

            const invitedSocketId = connectedUsers[invitedPlayer];

            // Send an invite to the invited player
            io.to(invitedSocketId).emit('gameInvite', {
                from: invitingUsername,
                fromId: invitingPlayerId
            });
        });
        socket.on('getUsername', async (gameId, id, playerNum) => {
            const name = await fetchUsername(id)
            const game = activeGames[gameId]
            game[`username_${playerNum}`] = name[0].username
            //console.log('name: ', name[0].username)
            wordleNamespace.to(gameId).emit('receiveUsername', name[0].username, playerNum)
        })
        socket.on('getAvatar', async (gameId, id, playerNum) => {
            const avatar = await fetchAvatar(id);
            const game = activeGames[gameId];

            if (avatar.length > 0) {
                console.log(`✅ Fetched avatar for Player ${playerNum}:`, avatar[0].avatar);
                game[`avatar_${playerNum}`] = avatar[0].avatar;

                // Ensure the event is emitted
                wordleNamespace.to(gameId).emit('receiveAvatar', avatar[0].avatar, playerNum);
                console.log(`🚀 Emitting receiveAvatar -> Player ${playerNum}: ${avatar[0].avatar}`);
            } else {
                console.log(`❌ No avatar found for Player ${playerNum}`);
            }
        });
        socket.on('requestAllAvatars', (gameId) => {
            const game = activeGames[gameId];
        
            if (game) {
                console.log(`Resending avatars for game ${gameId}:`, game.avatar_1, game.avatar_2);
                
                if (game.avatar_1) {
                    socket.emit('receiveAvatar', game.avatar_1, 1);  // Send only to this socket
                }
                if (game.avatar_2) {
                    socket.emit('receiveAvatar', game.avatar_2, 2);
                }
            }
        });
        
        // Handle letter input
        socket.on('addLetter', ({ gameId, player, letter }) => {
            const game = activeGames[gameId];
            if (!game || game.currentPlayer !== player) return;

            // Ensure the letter is a string and convert it to uppercase
            if (typeof letter === 'string') {
                // Add the letter to the current guess, but only if it's not longer than the target word length
                if (game[`currentGuess_${player}`].length < game.targetWord.length) {
                    game[`currentGuess_${player}`] += letter.toUpperCase();
                }
            } else {
                console.error('Invalid letter:', letter);
            }
            //console.log('add letter')
            // Emit the updated game state to all players in the game
            wordleNamespace.to(gameId).emit('gameStateUpdate', game);
        });

        // Handle deleting a letter
        socket.on('deleteLetter', ({ gameId, player }) => {
            const game = activeGames[gameId];
            if (!game || game.currentPlayer !== player) return;

            // Remove the last letter from the current guess
            game[`currentGuess_${player}`] = game[`currentGuess_${player}`].slice(0, -1);

            // Emit the updated game state to all players in the game
            wordleNamespace.to(gameId).emit('gameStateUpdate', game);
        });
        // Handle submitting a guess
        socket.on('submitGuess', async (guessData) => {
            // Switch turns only if two players are present
            console.log('Guess submitted: ', guessData);
            const game = activeGames[guessData.gameId];
            //console.log(game)
            if (game && game.players.length !== 2) {
                return;
            }
            if (!game || game.currentPlayer !== guessData.player) return;

            // Validate the word before processing
            const isValid = await validateWord(guessData.guess);
            if (!isValid) {
                socket.emit('gameError', { message: 'Invalid word!' });
                return;
            }

            // Process the guess
            const feedback = processGuess(game, guessData.player, guessData.guess);

            game[`guesses_${guessData.player}`].push(guessData.guess);
            game[`feedback_${guessData.player}`].push(feedback);

            game.turn = game.turn === 1 ? 2 : 1;

            // Check if player guessed correctly
            if (guessData.guess.toLowerCase() === game.targetWord.toLowerCase()) {
                game.gameOver = true
                wordleNamespace.to(guessData.gameId).emit('gameStateUpdate', game);
                wordleNamespace.to(guessData.gameId).emit('gameOver', { message: `Player ${guessData.player} wins!` });
                //delete activeGames[guessData.gameId]; // Remove game from active games
                return;
            }

            // **Check if both players are out of guesses**
            if (checkGameOver(game)) {
                game.gameOver = true
                wordleNamespace.to(guessData.gameId).emit('gameStateUpdate', game);
                wordleNamespace.to(guessData.gameId).emit('gameOver', { message: `Game Over! The word was ${game.targetWord}` });
                //delete activeGames[guessData.gameId];
                return;
            }

            // Switch turns
            if (!game.gameOver) {
                game[`currentGuess_${game.currentPlayer}`] = ""
                game.currentPlayer = game.currentPlayer === 1 ? 2 : 1;
            }
            // Broadcast updated game state
            wordleNamespace.to(guessData.gameId).emit('gameStateUpdate', game);
        });
        socket.on('replay', async (playerNumber, gameId) => {
            const game = activeGames[gameId];
            game[`replay_${playerNumber}`] = true;
            wordleNamespace.to(gameId).emit('gameStateUpdate', game);

            // Check if both players have chosen to replay
            if (game.replay_1 && game.replay_2) {
                console.log('Both players want to replay, resetting game...');

                // Reset replay flags
                game.replay_1 = false;
                game.replay_2 = false;

                // Emit resetGame from backend to all clients in the game room
                wordleNamespace.to(gameId).emit('resetGame', gameId);
            }
        });
        socket.on('resetGame', (gameId) => {
            console.log('resetGame: gameId', gameId)
            //undefined fix 
            let game = activeGames[gameId]
            console.log(game)
            game.targetWord = generateRandomWord()
            game.guesses_1 = []
            game.guesses_2 = []
            game.feedback_1 = [],
                game.feedback_2 = [],
                game.currentPlayer = 1,
                game.score_1 = 0,
                game.score_2 = 0,
                game.keyStates_1 = {},
                game.keyStates_2 = {},
                // players: [{ id: socket.id, number: 1 }],
                game.currentGuess_1 = "", // Track the current guess
                game.currentGuess_2 = "",
                // username_1: "",
                // username_2: "",
                game.waiting = false,
                game.gameOver = false,
                wordleNamespace.to(gameId).emit('gameStateUpdate', game);
        });

        // Optionally, you can handle other events such as player disconnection
        socket.on('PlayerDisconnect', () => {
            console.log(`Player disconnected: ${socket.id}`);

            for (const gameId in activeGames) {
                const game = activeGames[gameId];
                const playerIndex = game.players.findIndex(player => player.id === socket.id);

                if (playerIndex !== -1) {
                    game.players.splice(playerIndex, 1);

                    if (game.players.length === 0) {
                        delete activeGames[gameId]; // Remove empty games
                        console.log(`Game ${gameId} removed.`);
                    } else {
                        wordleNamespace.to(gameId).emit('playerDisconnected', { message: `Player ${socket.id} disconnected.` });
                    }

                    break;
                }
            }
        });
        socket.on('registerUsername', (username) => {
            connectedUsers[username] = socket.id
            socket.username = username;  // Associate username with the socket
        });
        // Handle the 'clearSentInvite' event
        socket.on('clearSentInvite', async ({ inviteId }) => {
            try {
                // Delete the invite from the database
                const result = await db.query('DELETE FROM aainvites WHERE id = $1 RETURNING *', [inviteId]);

                // Check if the invite was deleted
                if (result.length > 0) {
                    const deletedInvite = result[0];

                    // Notify the sender of the invite that it has been cleared
                    const senderSocket = getSocketByUsername(deletedInvite.from_username);
                    if (senderSocket) {
                        senderSocket.emit('inviteCleared', { inviteId: deletedInvite.id });
                    }

                    // Optionally, you can notify the recipient too (even though it may be redundant here)
                    const recipientSocket = getSocketByUsername(deletedInvite.to_username);
                    if (recipientSocket) {
                        recipientSocket.emit('inviteCleared', { inviteId: deletedInvite.id });
                    }
                }
            } catch (error) {
                console.error('Error clearing invite:', error);
            }
        });

        // Fetch the invites for the player
        socket.on('fetchInvites', async (username) => {
            let invitesReceived = null;
            let invitesSent = null;

            if (username) {
                try {
                    // Retrieve invites from database
                    console.log('inside fetch', username)
                    invitesReceived = await db.query('SELECT * FROM aainvites WHERE to_username = $1 and status = $2 limit 10', [username, 'Pending']);
                    invitesSent = await db.query('SELECT * FROM aainvites WHERE from_username = $1 limit 10', [username]);
                    //console.log(invitesReceived)
                    //console.log(invitesSent)

                    // Send invites to client
                    socket.emit('invitesReceived', invitesReceived ? invitesReceived : []);
                    socket.emit('invitesSent', invitesSent ? invitesSent : []);

                } catch (error) {
                    console.error('Error fetching invites:', error);
                    socket.emit('invitesReceived', []);
                    socket.emit('invitesSent', []);
                }
            } else {
                socket.emit('invitesReceived', []);
                socket.emit('invitesSent', []);
            }
        });

        // Handle sending an invite
        socket.on('send_invite', async ({ to, from }) => {  // Match the new payload
            //console.log(`Received invite from ${from} to ${to}`);

            const userExists = await db.query('SELECT * FROM users WHERE username = $1', [to]);
            //console.log(userExists)
            if (userExists.length > 0) {
                const result = await db.query(
                    'INSERT INTO aainvites (from_username, to_username, status) VALUES ($1, $2, $3) RETURNING *',
                    [from, to, 'Pending']
                );

                // Notify the recipient
                const recipientSocket = getSocketByUsername(to);
                const senderSocket = getSocketByUsername(from)
                //console.log(recipientSocket)
                if (recipientSocket) {
                    recipientSocket.emit('inviteReceived', result[0]);
                }
                if (senderSocket) {
                    senderSocket.emit('inviteSent', result[0])
                }
            } else {
                socket.emit('error', 'User not found');
            }
        });
        // Handle accepting an invite
        socket.on('acceptInvite', async ({ inviteId }) => {
            try {
                const inviteResult = await db.query(`select * from aainvites where id = $1`, [inviteId])
                if (inviteResult.length == 0) {
                    socket.emit('inviteFailed', { message: "invite not found or already accepted/declined" })
                    return;
                }

                const invite = inviteResult[0];
                const { from_username, to_username } = invite

                const fromSocket = getSocketByUsername(from_username)
                const toSocket = getSocketByUsername(to_username)

                if (!fromSocket || !toSocket) {
                    socket.emit('inviteFailed', { message: "One of the players is no longer online." });
                    return;
                }

                // Update the invite status in the database
                await db.query('UPDATE aainvites SET status = $1 WHERE id = $2', ['Accepted', inviteId]);

                const gameId = generateGameId();
                console.log(`Game created with ID: ${gameId} between ${from_username} and ${to_username}`);
                activeGames[gameId] = {
                    targetWord: generateRandomWord(),
                    gameId: gameId,
                    guesses_1: [],
                    guesses_2: [],
                    feedback_1: [],
                    feedback_2: [],
                    currentPlayer: 1,
                    score_1: 0,
                    score_2: 0,
                    keyStates_1: {},
                    keyStates_2: {},
                    players: [{ id: fromSocket.id, number: 1 }, { id: toSocket.id, number: 2 }],
                    currentGuess_1: "",
                    currentGuess_2: "",
                    username_1: from_username,
                    username_2: to_username,
                    waiting: false,
                    gameOver: false,
                    replay_1: false,
                    replay_2: false,
                    turn: 1,
                    avatar_1: '',
                    avatar_2: '',
                };

                // Join both players to the game room
                fromSocket.join(gameId);
                toSocket.join(gameId);

                // Notify both players
                wordleNamespace.to(gameId).emit('inviteAccepted', { roomId: gameId, players: [from_username, to_username] });

                // Notify both players that the game has started
                wordleNamespace.to(gameId).emit('gameStateUpdate', activeGames[gameId]);
            } catch (error) {
                console.error('Error accepting invite:', error);
                socket.emit('inviteFailed', { message: "Error processing invite." });
            }
        });

        socket.on('getIds', async ({ username }) => {
            try {
                const result = await db.query('SELECT id FROM users WHERE username = $1', [username]);
                if (result.length === 0) {
                    socket.emit('error', 'Invite not found or already accepted/declined');
                    return;
                }
                console.log('acceptInvite');
            } catch (error) {
                console.log('id not found by username')
            }
            socket.emit('ReceiveId', result)
        }
        )
        // Handle declining an invite
        socket.on('declineInvite', async ({ inviteId }) => {
            // Update the invite status in the database
            const result = await db.query('UPDATE aainvites SET status = $1 WHERE id = $2 RETURNING *', ['Declined', inviteId]);

            // Notify the sender of the invite status
            const senderSocket = getSocketByUsername(result[0].from_username);  // Find sender's socket
            if (senderSocket) {
                senderSocket.emit('inviteStatusUpdated', result[0]);
            }

            const recipientSocket = getSocketByUsername(result[0].to_username); // Find recipient's socket
            if (recipientSocket) {
                recipientSocket.emit('inviteStatusUpdated', result[0]);
            }

        });
        socket.on('disconnect', () => {
            console.log(`Player disconnected: ${socket.id}`);

            for (const gameId in activeGames) {
                const game = activeGames[gameId];

                // Find the disconnected player
                const playerIndex = game.players.findIndex(player => player.id === socket.id);

                if (playerIndex !== -1) {
                    game.players.splice(playerIndex, 1);
                    console.log(`Removed player ${socket.id} from game ${gameId}`);

                    if (game.players.length === 0) {
                        delete activeGames[gameId]; // Remove the game if no players remain
                        console.log(`Game ${gameId} removed.`);
                    } else {
                        wordleNamespace.to(gameId).emit('playerDisconnected', { message: `Player ${socket.id} disconnected.` });
                    }

                    break;
                }
            }
        });
    });
}
async function fetchUsername(id) {
    const username = await db.query(
        `SELECT username
        FROM users
        WHERE id = $1`,
        [id]
    );
    return username
}
async function fetchAvatar(id) {
    try {
        const avatarResult = await db.query(
            `SELECT ui.user_id, i.image_url AS avatar
            FROM user_items ui
            JOIN items i ON ui.item_id = i.id AND i.type = 'avatar'
            WHERE ui.user_id = $1 AND ui.equipped = true`,
            [id]
        );
        return avatarResult

    } catch (error) {
        console.log('avatar failed to get with userId: ', id)
    }
}

// Helper function to process a guess and give feedback
function processGuess(game, player_num, guess) {
    const normalizedGuess = guess.toLowerCase();
    const normalizedTarget = game.targetWord.toLowerCase();
    const feedback = [];
    const targetCounts = {};

    for (const char of normalizedTarget) {
        targetCounts[char] = (targetCounts[char] || 0) + 1;
    }

    let correct = 0;

    normalizedGuess.split("").forEach((char, idx) => {
        if (char === normalizedTarget[idx]) {
            feedback[idx] = "correct";
            correct++;
            targetCounts[char]--;
            game[`keyStates_${player_num}`][char] = "correct";
        }
    });

    normalizedGuess.split("").forEach((char, idx) => {
        if (feedback[idx]) return;
        if (targetCounts[char] > 0) {
            feedback[idx] = "present";
            targetCounts[char]--;
            game[`keyStates_${player_num}`][char] = "present";
        } else {
            feedback[idx] = "absent";
            if (!game[`keyStates_${player_num}`][char]) {
                game[`keyStates_${player_num}`][char] = "absent";
            }
        }
    });

    game[`score_${player_num}`] = correct;
    return feedback;
}
function checkGameOver(game) {
    const maxGuesses = 6;

    const player1OutOfGuesses = game.guesses_1.length >= maxGuesses &&
        game.guesses_1[game.guesses_1.length - 1].toLowerCase() !== game.targetWord.toLowerCase();

    const player2OutOfGuesses = game.guesses_2.length >= maxGuesses &&
        game.guesses_2[game.guesses_2.length - 1].toLowerCase() !== game.targetWord.toLowerCase();

    return player1OutOfGuesses && player2OutOfGuesses;
}

// Helper function to validate if a word is in the dictionary
async function validateWord(word) {
    try {
        const response = await axios.get('https://api.datamuse.com/words', { params: { sp: word, max: 1 } });
        return response.data.length > 0 && response.data[0].word.toLowerCase() === word.toLowerCase();
    } catch (error) {
        console.error("Error validating word:", error);
        return false;
    }
}
// Helper function to generate a unique gameId

function generateGameId() {
    return 'game-' + Math.random().toString(36).substr(2, 9);
}
function disconnectAllPlayers(io) {
    for (const gameId in activeGames) {
        const game = activeGames[gameId];

        // If no players are in the game, remove it
        if (!game.players || game.players.length === 0) {
            console.log(`Removing inactive game: ${gameId}`);
            delete activeGames[gameId];
        }
    }
    const wordleNamespace = io.of('/wordle');

    // Iterate through all connected sockets in the namespace
    wordleNamespace.sockets.forEach((socket) => {
        console.log(`Disconnecting player: ${socket.id}`);
        socket.disconnect(true); // Force disconnect the socket
    });

    console.log('All players have been disconnected.');
}
const getSocketByUsername = (username) => {
    return wordleNamespace.sockets.get(connectedUsers[username]);
};


export { initializeWordle };
