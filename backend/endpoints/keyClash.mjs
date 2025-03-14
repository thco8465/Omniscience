import express from 'express';
import { Server } from 'socket.io';

const router = express.Router();
const games = {}; // Store active games in memory
let io; // Define io outside so it can be initialized later
let waitingPlayer = null; // Track a player waiting for an opponent

function initializeKeyClash(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: '*', // Adjust as needed
            methods: ['GET', 'POST'],
        }
    });

    io.on('connection', (socket) => {
        console.log(`Player connected: ${socket.id}`);

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
                    players: [waitingPlayer, socket.id],
                    scores: { player1: 0, player2: 0 },
                    ready: { player1: false, player2: false },
                    stageStarted: false,
                    wins: { player1: 0, player2: 0 },
                };

                waitingPlayer = null;
            }
        });

        // Player readiness handling
        socket.on('playerReady', (playerID) => {
            const roomId = getPlayerRoom(socket.id);
            if (roomId && games[roomId]) {
                const playerKey = playerID === 'player1' ? 'player1' : 'player2';
                games[roomId].ready[playerKey] = true;

                // Check if both players are ready to start the game
                if (games[roomId].ready.player1 && games[roomId].ready.player2) {
                    io.to(roomId).emit('startGame');  // Notify both players that the game is starting
                }
            }
        });

        socket.on('keyGenerated', (key) => {
            const roomId = getPlayerRoom(socket.id);
            // console.log('Key received:', key);
            if (roomId) {
                io.to(roomId).emit('keyGenerated', key);
            }
        });

        socket.on('keyPress', ({ playerID, key }) => {
            const roomId = getPlayerRoom(socket.id);
            if (roomId && games[roomId]) {
                io.to(roomId).emit('keyPress', { playerID, key });
            }
        });

        socket.on('updateScore', ({ player, score }) => {
            // console.log('score updated', player, score)
            const roomId = getPlayerRoom(socket.id);
            if (roomId && games[roomId]) {
                games[roomId].scores[player] = score;
                io.to(roomId).emit('updateScore', { player, score });
            }
        });

        socket.on('startStage', (stageNumber) => {
            const roomId = getPlayerRoom(socket.id);
            if (roomId && games[roomId]) {
                if (!games[roomId].stageStarted) {
                    console.log(`Starting stage ${stageNumber} in room ${roomId}`);
                    io.to(roomId).emit('startStage', stageNumber);
                    games[roomId].stageStarted = true;
                }
            }
        });

        socket.on('endStage', (results) => {
            const roomId = getPlayerRoom(socket.id);
            if (!roomId || !games[roomId]) return;

            // Prevent duplicate processing
            if (!games[roomId].stageStarted) return;

            console.log('stage ended', results);

            // Update wins based on the stage winner from results
            if (results.stageWinner === 1 || results.stageWinner === 2) {
                games[roomId].wins[`player${results.stageWinner}`]++;
            }

            // Store the latest scores
            games[roomId].scores = results.scores;

            // Mark stage as complete
            games[roomId].stageStarted = false;

            // Create a complete state to send to clients
            const gameState = {
                stageWinner: results.stageWinner,
                wins: games[roomId].wins,
                scores: games[roomId].scores
            };

            // Send consistent state to all players
            io.to(roomId).emit('endStage', gameState);

            // Check for game over
            const maxWins = Math.ceil(MAX_STAGES / 2); // Define MAX_STAGES as a constant
            if (games[roomId].wins.player1 >= maxWins) {
                handleGameOver(roomId, 1);
                return;
            } else if (games[roomId].wins.player2 >= maxWins) {
                handleGameOver(roomId, 2);
                return;
            }

            // Schedule the next stage after a delay
            setTimeout(() => {
                // Only proceed if game still exists (players haven't disconnected)
                if (games[roomId]) {
                    const nextStage = calculateNextStage(roomId);
                    startNextStage(roomId, nextStage);
                }
            }, 3000);
        });

        // Helper functions
        function calculateNextStage(roomId) {
            // Track the current stage in the game state
            if (!games[roomId].currentStage) {
                games[roomId].currentStage = 1;
            } else {
                games[roomId].currentStage++;
            }
            return games[roomId].currentStage;
        }

        function startNextStage(roomId, stageNumber) {
            if (!games[roomId]) return;

            games[roomId].stageStarted = true;
            games[roomId].scores = { player1: 0, player2: 0 };

            console.log(`Starting stage ${stageNumber} in room ${roomId}`);
            io.to(roomId).emit('startStage', stageNumber);
        }

        function handleGameOver(roomId, winner) {
            if (!games[roomId]) return;

            console.log(`endGame ${roomId}`, games[roomId], winner);
            io.to(roomId).emit('gameOver', `Player ${winner} wins the game!`);

            // Optional: clean up game resources after a delay
            setTimeout(() => {
                if (games[roomId]) {
                    console.log(`Deleting game data for room ${roomId}`);
                    delete games[roomId];
                }
            }, 10000);
        }
        socket.on('resetGame', () => {
            const roomId = getPlayerRoom(socket.id);
            if (roomId && games[roomId]) {
                games[roomId].scores = { player1: 0, player2: 0 };
                games[roomId].ready = { player1: false, player2: false };
                io.to(roomId).emit('resetGame');
            }
        });

        socket.on('endGame', (winner) => {
            const roomId = getPlayerRoom(socket.id);
            console.log('endGame', roomId, games[roomId], winner)
            if (roomId && games[roomId]) {
                io.to(roomId).emit('gameOver', `Player ${winner} wins!`);

                // Delay deletion to allow clients to process game over state
                setTimeout(() => {
                    if (games[roomId]) {
                        console.log(`Deleting game data for room ${roomId}`);
                        delete games[roomId];
                    }
                }, 5000); // 5 seconds delay
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
                if (games[roomId].players.includes(socket.id)) {
                    console.log(`Player ${socket.id} disconnected from room ${roomId}`);

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

    })
}

// Helper function to find a player's room
const getPlayerRoom = (socketId) => {
    return Object.keys(games).find(room => games[room].players.includes(socketId));
};

export { router, initializeKeyClash };