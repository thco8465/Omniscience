import { Server } from 'socket.io';
import db from '../Database/db.mjs'


const games = {}; // Store active games in memory
let io; // Define io outside so it can be initialized later
let waitingPlayer = null; // Track a player waiting for an opponent
const connectedUsers = {}

// Game constants
const MAX_STAGES = 5;
const STAGE_DURATION = 10; // Duration in seconds

function initializeKeyClash(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: '*', // Adjust as needed
            methods: ['GET', 'POST'],
        }
    });

    io.on('connection', (socket) => {
        console.log(`Player connected: ${socket.id}`);
        socket.on('registerUsername', (username) => {
            connectedUsers[username] = socket.id
            socket.username = username;  // Associate username with the socket
        });
        // Handle the 'clearSentInvite' event
        socket.on('clearSentInvite', async ({ inviteId }) => {
            try {
                // Delete the invite from the database
                const result = await db.query('DELETE FROM invites WHERE id = $1 RETURNING *', [inviteId]);

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
                    invitesReceived = await db.query('SELECT * FROM invites WHERE to_username = $1 and status = $2 limit 10', [username, 'Pending']);
                    invitesSent = await db.query('SELECT * FROM invites WHERE from_username = $1 limit 10', [username]);
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
                    'INSERT INTO invites (from_username, to_username, status) VALUES ($1, $2, $3) RETURNING *',
                    [from, to, 'Pending']
                );

                // Notify the recipient
                const recipientSocket = getSocketByUsername(to);
                const senderSocket = getSocketByUsername(from)
                //console.log(recipientSocket)
                if (recipientSocket) {
                    recipientSocket.emit('inviteReceived', result[0]);
                }
                if(senderSocket){
                    senderSocket.emit('inviteSent', result[0])
                }
            } else {
                socket.emit('error', 'User not found');
            }
        });
        // Handle accepting an invite
        socket.on('acceptInvite', async ({ inviteId }) => {
            try {
                const result = await db.query('UPDATE invites SET status = $1 WHERE id = $2 RETURNING *', ['Accepted', inviteId]);
                if (result.length === 0) {
                    socket.emit('error', 'Invite not found or already accepted/declined');
                    return;
                }
                console.log('acceptInvite')

                const invite = result[0];
                const senderSocket = getSocketByUsername(invite.from_username);
                const recipientSocket = getSocketByUsername(invite.to_username);

                if (senderSocket && recipientSocket) {
                    const roomId = `game-${invite.from_username}-${invite.to_username}`;

                    // Join both players to the game room
                    senderSocket.join(roomId);
                    recipientSocket.join(roomId);
                    console.log('inside sender and recipient')

                    // Notify both players
                    io.to(roomId).emit('gameStarted', {
                        roomId,
                        players: [invite.from_username, invite.to_username]
                    });
                    console.log('emit to sender')
                    // Notify the sender that the recipient accepted
                    senderSocket.emit('inviteAccepted', {
                        roomId,
                        players: [invite.from_username, invite.to_username]
                    });

                    // Initialize the game state
                    games[roomId] = {
                        //playerSockets: { player1: senderSocket.id, player2: recipientSocket.id },
                        //usernames: { player1: invite.from_username, player2: invite.to_username },
                        scores: { player1: 0, player2: 0 },
                        players: [waitingPlayer, socket.id],
                        total_scores: { player1: 0, player2: 0 },
                        ready: { player1: false, player2: false },
                        stageStarted: false,
                        currentStage: 1,
                        wins: { player1: 0, player2: 0 },
                        usernames: { player1: '', player: '' },
                        stageTimer: null
                    };


                    console.log(`Game started between ${invite.from_username} and ${invite.to_username}`);
                } else {
                    socket.emit('error', 'Player(s) not found or not connected');
                }
            } catch (error) {
                console.error('Error accepting invite:', error);
                socket.emit('error', 'Failed to accept the invite');
            }
        });

        // Handle declining an invite
        socket.on('declineInvite', async ({ inviteId }) => {
            // Update the invite status in the database
            const result = await db.query('UPDATE invites SET status = $1 WHERE id = $2 RETURNING *', ['Declined', inviteId]);

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
        socket.on('requestPlayerID', () => {
            if (!waitingPlayer) {
                waitingPlayer = socket.id;
                socket.emit('assignPlayer', 'player1');
                io.emit('player1Joined');
            } else {
                const roomId = `game-${waitingPlayer}`;
                socket.join(roomId);
                const player1Socket = io.sockets.sockets.get(waitingPlayer);
                if (player1Socket) {
                    player1Socket.join(roomId);
                }

                // Inform both players of their roles and that both players have joined
                io.to(waitingPlayer).emit('assignPlayer', 'player1');
                socket.emit('assignPlayer', 'player2');

                io.to(roomId).emit('player1Joined');
                io.to(roomId).emit('player2Joined');

                // Initialize game state
                games[roomId] = {
                    //playerSockets: { player1: senderSocket.id, player2: recipientSocket.id },
                    //usernames: { player1: invite.from_username, player2: invite.to_username },
                    scores: { player1: 0, player2: 0 },
                    players: [waitingPlayer, socket.id],
                    total_scores: { player1: 0, player2: 0 },
                    ready: { player1: false, player2: false },
                    stageStarted: false,
                    currentStage: 1,
                    wins: { player1: 0, player2: 0 },
                    usernames: { player1: '', player2: '' },
                    stageTimer: null
                };


                waitingPlayer = null;
            }
        });
        // Player readiness handling
        socket.on('playerReady', async (playerID, id) => {
            const roomId = getPlayerRoom(socket.id);
            if (roomId && games[roomId]) {

                const playerKey = playerID === 'player1' ? 'player1' : 'player2';
                games[roomId].ready[playerKey] = true;
                const user = await fetchUsername(id)
                console.log(user)
                if (user) {
                    games[roomId].usernames[playerKey] = user
                }
                // Broadcast player readiness to all players in the room
                io.to(roomId).emit(`${playerKey}Ready`);

                // Check if both players are ready to start the game
                if (games[roomId].ready.player1 && games[roomId].ready.player2) {
                    io.to(roomId).emit('startGame');

                    // Start first stage after a short delay
                    setTimeout(() => {
                        if (games[roomId]) {
                            startStage(roomId, 1);
                        }
                    }, 1000);
                }
            }
        });

        socket.on('startGame', () => {
            const roomId = getPlayerRoom(socket.id);
            if (roomId && games[roomId]) {
                io.to(roomId).emit('startGame');

                // Start first stage after a short delay
                setTimeout(() => {
                    if (games[roomId]) {
                        startStage(roomId, 1);
                    }
                }, 1000);
            }
        });
        socket.on('getUsernames', () => {
            const roomId = getPlayerRoom(socket.id);
            if (roomId && games[roomId]) {
                console.log('getUsernames called: ', games[roomId].usernames);

                io.to(roomId).emit('receiveUsernames', {
                    player1: games[roomId].usernames.player1[0]?.username || "player 1",
                    player2: games[roomId].usernames.player2[0]?.username || "player 2"
                });
            }
        });


        socket.on('keyGenerated', (key) => {
            const roomId = getPlayerRoom(socket.id);
            if (roomId) {
                // Only relay keys from player1 to prevent duplicates
                if (getPlayerRole(socket.id, roomId) === 'player1') {
                    io.to(roomId).emit('keyGenerated', key);
                }
            }
        });

        socket.on('keyPress', ({ playerID, key }) => {
            const roomId = getPlayerRoom(socket.id);
            if (roomId && games[roomId]) {
                io.to(roomId).emit('keyPress', { playerID, key });
            }
        });

        socket.on('updateScore', ({ player, score }) => {
            const roomId = getPlayerRoom(socket.id);
            if (!roomId || !games[roomId]) return;

            const playerKey = getPlayerRole(socket.id, roomId);
            if (!playerKey) return;

            games[roomId].scores[playerKey] += score;
            games[roomId].total_scores[playerKey] += score;
            io.to(roomId).emit('updateScore', { player: playerKey, score });
        });


        socket.on('timerEnded', (currentStage) => {
            const roomId = getPlayerRoom(socket.id);
            if (roomId && games[roomId] && games[roomId].currentStage === currentStage) {
                // Notify all clients that the timer has ended
                io.to(roomId).emit('timerEnded');

                // Clear the server-side timer if it exists
                if (games[roomId].stageTimer) {
                    clearTimeout(games[roomId].stageTimer);
                    games[roomId].stageTimer = null;
                }

                // End the stage
                endStage(roomId);
            }
        });

        socket.on('endStage', (results) => {
            const roomId = getPlayerRoom(socket.id);
            if (!roomId || !games[roomId]) return;

            // Prevent duplicate processing
            if (!games[roomId].stageStarted) return;

            // Make sure the stage being ended matches the current stage
            if (results.currentStage !== games[roomId].currentStage) {
                console.log(`Stage mismatch: client=${results.currentStage}, server=${games[roomId].currentStage}`);
                return;
            }

            console.log('Stage ended', results);

            // Clear any active stage timer
            if (games[roomId].stageTimer) {
                clearTimeout(games[roomId].stageTimer);
                games[roomId].stageTimer = null;
            }

            endStage(roomId, results);
        });

        socket.on('resetGame', () => {
            const roomId = getPlayerRoom(socket.id);
            if (roomId && games[roomId]) {
                // Clear any active timers
                if (games[roomId].stageTimer) {
                    clearTimeout(games[roomId].stageTimer);
                    games[roomId].stageTimer = null;
                }

                // Reset game state
                games[roomId].scores = { player1: 0, player2: 0 };
                games[roomId].total_scores = { player1: 0, player2: 0 }
                games[roomId].ready = { player1: false, player2: false };
                games[roomId].stageStarted = false;
                games[roomId].currentStage = 1;
                games[roomId].wins = { player1: 0, player2: 0 };
                games[roomId].stageTimer = null
                io.to(roomId).emit('resetGame');
            }
        });

        socket.on('disconnect', () => {
            console.log(`Player disconnected: ${socket.id}`);

            // If the player was waiting for an opponent, remove them
            if (waitingPlayer === socket.id) {
                waitingPlayer = null;
                return;
            }

            // Find the room the player was in
            for (const roomId in games) {
                //console.log("roomId:", roomId);
                //console.log("games object:", games);
                //console.log("games[roomId]:", games[roomId]);

                if (games[roomId] && games[roomId].players.includes(socket.id)) {
                    console.log(`Player ${socket.id} disconnected from room ${roomId}`);

                    // Clear any active timers
                    if (games[roomId].stageTimer) {
                        clearTimeout(games[roomId].stageTimer);
                        games[roomId].stageTimer = null;
                    }

                    // Remove the player from the game
                    games[roomId].players = games[roomId].players.filter(id => id !== socket.id);

                    // Notify remaining players
                    io.to(roomId).emit('playerDisconnected', socket.id);

                    // If no players left, delete the game
                    if (games[roomId].players.length === 0) {
                        console.log(`No players left in room ${roomId}, deleting game.`);
                        delete games[roomId];
                    }
                    break;
                }
            }
        });
    });
    async function fetchUsername(id) {
        const username = await db.query(
            `SELECT username
            FROM users
            WHERE id = $1`,
            [id]
        );
        return username
    }
    // Helper functions
    function startStage(roomId, stageNumber) {
        if (!games[roomId]) return;

        games[roomId].stageStarted = true;
        games[roomId].currentStage = stageNumber;
        games[roomId].scores = { player1: 0, player2: 0 };

        console.log(`Starting stage ${stageNumber} in room ${roomId}`);

        // Notify clients to start the stage
        io.to(roomId).emit('startStage', stageNumber);

        // Set up server-side timer for stage duration
        let timeRemaining = STAGE_DURATION;

        // Clear any existing timer
        if (games[roomId].stageTimer) {
            clearTimeout(games[roomId].stageTimer);
        }

        // Create a new timer that will end the stage after STAGE_DURATION
        games[roomId].stageTimer = setTimeout(() => {
            if (games[roomId] && games[roomId].stageStarted) {
                io.to(roomId).emit('timerEnded');
                endStage(roomId);
            }
        }, STAGE_DURATION * 1000);

        // Optionally, broadcast timer updates every second
        const timerInterval = setInterval(() => {
            if (!games[roomId] || !games[roomId].stageStarted) {
                clearInterval(timerInterval);
                return;
            }

            timeRemaining--;
            io.to(roomId).emit('updateTimer', timeRemaining);

            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
            }
        }, 1000);
    }

    function endStage(roomId, results = null) {
        if (!games[roomId] || !games[roomId].stageStarted) return;

        // Mark stage as complete
        games[roomId].stageStarted = false;

        // If results are provided, use them; otherwise, determine based on server state
        let gameState;
        if (results) {
            // Update wins based on the stage winner from results
            if (results.stageWinner === 1 || results.stageWinner === 2) {
                games[roomId].wins[`player${results.stageWinner}`]++;
            }

            // Store the latest scores
            games[roomId].scores = results.scores;
            //games[roomId].total_scores = results.total_scores

            gameState = {
                stageWinner: results.stageWinner,
                wins: games[roomId].wins,
                scores: games[roomId].scores,
                total_scores: games[roomId].total_scores
            };
        } else {
            // Determine winner based on server-side scores
            let stageWinner;
            if (games[roomId].scores.player1 > games[roomId].scores.player2) {
                stageWinner = 1;
                games[roomId].wins.player1++;
            } else if (games[roomId].scores.player2 > games[roomId].scores.player1) {
                stageWinner = 2;
                games[roomId].wins.player2++;
            } else {
                stageWinner = 3; // Tie
            }

            gameState = {
                stageWinner: stageWinner,
                wins: games[roomId].wins,
                scores: games[roomId].scores,
                total_scores: games[roomId].total_scores
            };
        }

        // Send consistent state to all players
        io.to(roomId).emit('endStage', gameState);

        // Check for game over
        const maxWins = Math.ceil(MAX_STAGES / 2);
        if (games[roomId].wins.player1 >= maxWins) {
            handleGameOver(roomId, 1);
            return;
        } else if (games[roomId].wins.player2 >= maxWins) {
            handleGameOver(roomId, 2);
            return;
        } else if (games[roomId].currentStage >= 5) {
            handleGameOver(roomId, 3);
            return
        }

        // Schedule the next stage after a delay
        setTimeout(() => {
            // Only proceed if game still exists (players haven't disconnected)
            if (games[roomId]) {
                const nextStage = games[roomId].currentStage + 1;

                // Notify clients about the next stage
                io.to(roomId).emit('nextStage', nextStage);

                // Start the next stage
                startStage(roomId, nextStage);
            }
        }, 3000);
    }

    function handleGameOver(roomId, winner) {
        if (!games[roomId]) return;
        const total_scores = games[roomId].total_scores
        //console.log(total_scores)

        console.log(`Game over in ${roomId}, Player ${winner} wins!`);
        if (winner == 3) {
            io.to(roomId).emit('gameOver', `Total Scores: Player 1 - ${total_scores.player1}, Player 2- ${total_scores.player2}. It's a tie game!`);
        } else {
            io.to(roomId).emit('gameOver', `Total Scores: Player 1 - ${total_scores.player1}, Player 2- ${total_scores.player2}. Player ${winner} wins the game!`);
        }

        // Clear any active timers
        if (games[roomId].stageTimer) {
            clearTimeout(games[roomId].stageTimer);
            games[roomId].stageTimer = null;
        }

        // Optional: clean up game resources after a delay
        // setTimeout(() => {
        //     if (games[roomId]) {
        //         console.log(`Deleting game data for room ${roomId}`);
        //         delete games[roomId];
        //     }
        // }, 10000);
    }
}

// Helper function to find a player's room
const getPlayerRoom = (socketId) => {
    return Object.keys(games).find(room => games[room].players.includes(socketId));
};
const getSocketByUsername = (username) => {
    return io.sockets.sockets.get(connectedUsers[username]);
};


// Helper function to determine if socket is player1 or player2
const getPlayerRole = (socketId, roomId) => {
    if (!games[roomId]?.players) return null;

    const index = games[roomId].players.indexOf(socketId);
    return index === 0 ? 'player1' : index === 1 ? 'player2' : null;
};
export { initializeKeyClash }