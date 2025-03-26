import { Server } from 'socket.io';
import db from '../Database/db.mjs';
import axios from 'axios'; // Assuming you are using axios for API requests.

const activeGames = {};

function generateRandomWord() {
    const words = ["apple", "spear", "crank", "grape", "melon"];
    const word = words[Math.floor(Math.random() * words.length)]
    //console.log(word)
    return word;
}

// Initialize Wordle WebSocket server
function initializeWordle(io) {
    disconnectAllPlayers(io)

    const wordleNamespace = io.of('/wordle'); // Create a separate namespace for Wordle

    wordleNamespace.on('connection', (socket) => {
        console.log(`Player connected to Wordle: ${socket.id}`);
        socket.removeAllListeners('');

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
                username_1: "",
                username_2: "",
                waiting: true,
                gameOver: false,
            };

            socket.join(gameId);
            socket.emit('gameCreated', { gameId, playerNumber: 1 });
        }
        socket.on('getUsername', async (gameId, id, playerNum) => {
            const name = await fetchUsername(id)
            const game = activeGames[gameId]
            game[`username_${playerNum}`] = name[0].username
            //console.log('name: ', name[0].username)
            wordleNamespace.to(gameId).emit('receiveUsername', name[0].username, playerNum)
        })
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

            // Check if player guessed correctly
            if (guessData.guess.toLowerCase() === game.targetWord.toLowerCase()) {
                wordleNamespace.to(guessData.gameId).emit('gameStateUpdate', game);
                wordleNamespace.to(guessData.gameId).emit('gameOver', { message: `Player ${guessData.player} wins!` });
                delete activeGames[guessData.gameId]; // Remove game from active games
                return;
            }

            // **Check if both players are out of guesses**
            if (checkGameOver(game)) {
                wordleNamespace.to(guessData.gameId).emit('gameStateUpdate', game);
                wordleNamespace.to(guessData.gameId).emit('gameOver', { message: `Game Over! The word was ${game.targetWord}` });
                delete activeGames[guessData.gameId];
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

export { initializeWordle };
