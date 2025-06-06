import { Server } from 'socket.io';
import db from '../Database/db.mjs'


const games = {}; // Store active games in memory
let io; // Define io outside so it can be initialized later
let waitingQuickplay = null; // Queue for Quickplay players
let waitingCustomGames = {}; // Object to track waiting players by room ID
let keyClashNamespace
const connectedUsers = {}

// Game constants
const MAX_STAGES = 5;
const STAGE_DURATION = 10; // Duration in seconds

function initializeWebSocketServer(httpServer) {
    if (!io) {
        io = new Server(httpServer, {
            cors: {
                origin: '*', // Adjust as needed
                methods: ['GET', 'POST'],
            },
        });
    }
    return io;
}

function initializeKeyClash(io) {
    keyClashNamespace = io.of('/keyclash')

    keyClashNamespace.on('connection', (socket) => {
        console.log(`Player connected to key clash: ${socket.id}`);
        socket.on('registerUsername', (username) => {
            connectedUsers[username] = socket.id
            socket.username = username;  // Associate username with the socket
        });
        // Handle the 'clearSentInvite' event
        socket.on('clearSentInvite', async ({ inviteId }) => {
            try {
                // Delete the invite from the database
                const result = await db.query('DELETE FROM public.invites WHERE id = $1 RETURNING *', [inviteId]);

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
                    invitesReceived = await db.query('SELECT * FROM public.invites WHERE to_username = $1 and status = $2 limit 10', [username, 'Pending']);
                    invitesSent = await db.query('SELECT * FROM public.invites WHERE from_username = $1 limit 10', [username]);
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

            const userExists = await db.query('SELECT * FROM public.users WHERE username = $1', [to]);
            //console.log(userExists)
            if (userExists.length > 0) {
                const result = await db.query(
                    'INSERT INTO public.invites (from_username, to_username, status) VALUES ($1, $2, $3) RETURNING *',
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
                const result = await db.query('UPDATE invites SET status = $1 WHERE id = $2 RETURNING *', ['Accepted', inviteId]);
                if (result.length === 0) {
                    socket.emit('error', 'Invite not found or already accepted/declined');
                    return;
                }
                console.log('acceptInvite');

                const invite = result[0];
                const senderSocket = getSocketByUsername(invite.from_username);
                const recipientSocket = getSocketByUsername(invite.to_username);

                if (senderSocket && recipientSocket) {
                    const roomId = `game-${invite.from_username}-${invite.to_username}`;

                    // Join both players to the game room
                    senderSocket.join(roomId);
                    recipientSocket.join(roomId);
                    console.log('inside sender and recipient');

                    // Notify both players that the game has started
                    keyClashNamespace.to(roomId).emit('gameStarted', {
                        roomId,
                        players: [invite.from_username, invite.to_username]
                    });
                    console.log('emit to both players');

                    // Notify both the sender and recipient that the invite was accepted
                    keyClashNamespace.to(roomId).emit('inviteAccepted', {
                        roomId,
                        players: [invite.from_username, invite.to_username]
                    });

                    // Initialize the game state
                    games[roomId] = {
                        scores: { player1: 0, player2: 0 },
                        players: [invite.from_username, invite.to_username], // Correct the player identifiers
                        total_scores: { player1: 0, player2: 0 },
                        ready: { player1: false, player2: false },
                        stageStarted: false,
                        currentStage: 1,
                        wins: { player1: 0, player2: 0 },
                        usernames: { player1: invite.from_username, player2: invite.to_username },
                        user_ids: { player1: 0, player2: 0 },
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

        socket.on('getIds', async ({ username }) => {
            try {
                const result = await db.query('SELECT id FROM public.users WHERE username = $1', [username]);
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
        socket.on('requestPlayerID', ({ gameType, customRoomId }) => {
            if (gameType == 'quickplay') {
                if (!waitingQuickplay) {
                    waitingQuickplay = socket.id;
                    socket.emit('assignPlayer', 'player1');
                    keyClashNamespace.emit('player1Joined');
                } else {
                    const roomId = `game-${waitingQuickplay}`;
                    socket.join(roomId);
                    const player1Socket = keyClashNamespace.sockets.get(waitingQuickplay);
                    if (player1Socket) {
                        player1Socket.join(roomId);
                    }

                    // Inform both players of their roles and that both players have joined
                    keyClashNamespace.to(waitingQuickplay).emit('assignPlayer', 'player1');
                    socket.emit('assignPlayer', 'player2');

                    keyClashNamespace.to(roomId).emit('player1Joined');
                    keyClashNamespace.to(roomId).emit('player2Joined');

                    // Initialize game state
                    games[roomId] = {
                        //playerSockets: { player1: senderSocket.id, player2: recipientSocket.id },
                        //usernames: { player1: invite.from_username, player2: invite.to_username },
                        scores: { player1: 0, player2: 0 },
                        players: [waitingQuickplay, socket.id],
                        total_scores: { player1: 0, player2: 0 },
                        ready: { player1: false, player2: false },
                        stageStarted: false,
                        currentStage: 1,
                        wins: { player1: 0, player2: 0 },
                        usernames: { player1: '', player2: '' },
                        stageTimer: null
                    };
                    waitingQuickplay = null;
                }
            } else if (gameType === 'custom') {
                if (!customRoomId) {
                    socket.emit('error', 'Custom game must have a roomId');
                    return;
                }

                if (!waitingCustomGames[customRoomId]) {
                    waitingCustomGames[customRoomId] = socket.id;
                    socket.emit('assignPlayer', 'player1');
                } else {
                    const roomId = `game-${customRoomId}`;
                    socket.join(roomId);
                    const player1Socket = keyClashNamespace.sockets.get(waitingCustomGames[customRoomId]);

                    if (player1Socket) {
                        console.log('socket1 exists')
                        player1Socket.join(roomId);
                    }
                    keyClashNamespace.to(waitingCustomGames[customRoomId]).emit('assignPlayer', 'player1'); socket.emit('assignPlayer', 'player2');
                    keyClashNamespace.to(roomId).emit('player1Joined');
                    keyClashNamespace.to(roomId).emit('player2Joined');

                    games[roomId] = {
                        scores: { player1: 0, player2: 0 },
                        players: [waitingCustomGames[customRoomId], socket.id],
                        total_scores: { player1: 0, player2: 0 },
                        ready: { player1: false, player2: false },
                        stageStarted: false,
                        currentStage: 1,
                        wins: { player1: 0, player2: 0 },
                        usernames: { player1: '', player2: '' },
                        stageTimer: null
                    };

                    delete waitingCustomGames[customRoomId];
                }
            }
        });
        // Player readiness handling
        socket.on('playerReady', async (playerID, id) => {
            const roomId = getPlayerRoom(socket.id);
            if (roomId && games[roomId]) {

                const playerKey = playerID === 'player1' ? 'player1' : 'player2';
                games[roomId].ready[playerKey] = true;
                const user = await fetchUsername(id)
                console.log('playerkey, playerid: ', playerKey, playerID)
                if (user) {
                    games[roomId].usernames[playerKey] = user
                }
                // Broadcast player readiness to all players in the room
                keyClashNamespace.to(roomId).emit(`${playerKey}Ready`);

                // Check if both players are ready to start the game
                if (games[roomId].ready.player1 && games[roomId].ready.player2) {
                    keyClashNamespace.to(roomId).emit('startGame');

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
                keyClashNamespace.to(roomId).emit('startGame');

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

                keyClashNamespace.to(roomId).emit('receiveUsernames', {
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
                    keyClashNamespace.to(roomId).emit('keyGenerated', key);
                }
            }
        });

        socket.on('keyPress', ({ playerID, key }) => {
            const roomId = getPlayerRoom(socket.id);
            if (roomId && games[roomId]) {
                keyClashNamespace.to(roomId).emit('keyPress', { playerID, key });
            }
        });

        socket.on('updateScore', ({ player, score }) => {
            const roomId = getPlayerRoom(socket.id);
            if (!roomId || !games[roomId]) return;

            const playerKey = getPlayerRole(socket.id, roomId);
            if (!playerKey) return;

            games[roomId].scores[playerKey] += score;
            games[roomId].total_scores[playerKey] += score;
            keyClashNamespace.to(roomId).emit('updateScore', { player: playerKey, score });
        });


        socket.on('timerEnded', (currentStage) => {
            const roomId = getPlayerRoom(socket.id);
            if (roomId && games[roomId] && games[roomId].currentStage === currentStage) {
                // Notify all clients that the timer has ended
                keyClashNamespace.to(roomId).emit('timerEnded');

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
                keyClashNamespace.to(roomId).emit('resetGame');
            }
        });

        socket.on('disconnect', () => {
            console.log(`Player disconnected: ${socket.id}`);

            // If the player was waiting for an opponent, remove them
            const roomId = getPlayerRoom(socket.id);
            if (waitingQuickplay === socket.id) {
                waitingQuickplay = null;
                return;
            }
            if (waitingCustomGames[roomId] === socket.id) {
                waitingCustomGames = null;
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

                    // Notify remaining players
                    const key = getPlayerRole(socket.id, roomId);  // Gets 'player1' or 'player2'
                    //console.log(games[roomId].usernames, games[roomId].usernames[key], games[roomId].usernames[key][0].username)
                    const name = games[roomId].usernames[key]?.[0]?.username || `${key} (unknown)`;  // Access the correct player's username
                    keyClashNamespace.to(roomId).emit('playerDisconnected', name);

                    // Remove the player from the game
                    games[roomId].players = games[roomId].players.filter(id => id !== socket.id);



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
            FROM public.users
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
        keyClashNamespace.to(roomId).emit('startStage', stageNumber);

        // Set up server-side timer for stage duration
        let timeRemaining = STAGE_DURATION;

        // Clear any existing timer
        if (games[roomId].stageTimer) {
            clearTimeout(games[roomId].stageTimer);
        }

        // Create a new timer that will end the stage after STAGE_DURATION
        games[roomId].stageTimer = setTimeout(() => {
            if (games[roomId] && games[roomId].stageStarted) {
                keyClashNamespace.to(roomId).emit('timerEnded');
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
            keyClashNamespace.to(roomId).emit('updateTimer', timeRemaining);

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
        keyClashNamespace.to(roomId).emit('endStage', gameState);

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
                keyClashNamespace.to(roomId).emit('nextStage', nextStage);

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
            keyClashNamespace.to(roomId).emit('gameOver', `Total Scores: Player 1 - ${total_scores.player1}, Player 2- ${total_scores.player2}. It's a tie game!`);
        } else {
            keyClashNamespace.to(roomId).emit('gameOver', `Total Scores: Player 1 - ${total_scores.player1}, Player 2- ${total_scores.player2}. Player ${winner} wins the game!`);
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
    return keyClashNamespace.sockets.get(connectedUsers[username]);
};


// Helper function to determine if socket is player1 or player2
const getPlayerRole = (socketId, roomId) => {
    if (!games[roomId]?.players) return null;

    const index = games[roomId].players.indexOf(socketId);
    return index === 0 ? 'player1' : index === 1 ? 'player2' : null;
};

export { initializeKeyClash, initializeWebSocketServer }