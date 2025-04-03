<template>
    <div class="game-container">
        <div v-if="gameState === 'start' && userId !== -1" class="betting-panel">
            <h2>Place Your Bet</h2>
            <div class="medals-display">
                <div class="medal-count">
                    <span> 🥉{{ userMedals.bronze }}</span>
                </div>
                <div class="medal-count">
                    <span> 🥈 {{ userMedals.silver }}</span>
                </div>
                <div class="medal-count">
                    <span> 🥇 {{ userMedals.gold }}</span>
                </div>
            </div>

            <div class="bet-controls">
                <div class="bet-type">
                    <h3>Bronze</h3>
                    <div class="bet-buttons">
                        <button @click="decreaseBet('bronze')" :disabled="currentBet.bronze <= 0">-</button>
                        <span>{{ currentBet.bronze }}</span>
                        <button @click="increaseBet('bronze')"
                            :disabled="currentBet.bronze >= userMedals.bronze">+</button>
                    </div>
                </div>

                <div class="bet-type">
                    <h3>Silver</h3>
                    <div class="bet-buttons">
                        <button @click="decreaseBet('silver')" :disabled="currentBet.silver <= 0">-</button>
                        <span>{{ currentBet.silver }}</span>
                        <button @click="increaseBet('silver')"
                            :disabled="currentBet.silver >= userMedals.silver">+</button>
                    </div>
                </div>

                <div class="bet-type">
                    <h3>Gold</h3>
                    <div class="bet-buttons">
                        <button @click="decreaseBet('gold')" :disabled="currentBet.gold <= 0">-</button>
                        <span>{{ currentBet.gold }}</span>
                        <button @click="increaseBet('gold')" :disabled="currentBet.gold >= userMedals.gold">+</button>
                    </div>
                </div>
            </div>

            <button @click="startGame" class="deal-button" :disabled="!isBetValid">
                Deal Cards
            </button>
        </div>
        <!-- Display a message if the user is not logged in -->
        <div v-if="gameState === 'start' && userId === -1" class="login-prompt">
            <h2>You need to log in to place a bet</h2>
            <button @click="startGame">Play for Fun!</button>
            <button @click="redirectToLogin">Log In</button>
        </div>

        <div v-if="gameState !== 'start'">
            <div class="dealer">
                <h2>Dealer's Hand ({{ dealerDisplayTotal }})</h2>
                <div class="cards">
                    <transition-group name="card-fade">
                        <img v-for="(card, index) in dealerCards" :key="card"
                            :src="getCardImage(card, index === 1 && gameState === 'playing')" class="card" />
                    </transition-group>
                </div>
            </div>
            <div class="player">
                <h2>Your Hand ({{ playerTotal }})</h2>
                <div class="cards">
                    <transition-group name="card-fade">
                        <img v-for="(card, index) in playerCards" :key="card" :src="getCardImage(card)" class="card" />
                    </transition-group>
                </div>
            </div>
            <div class="buttons">
                <button v-if="gameState === 'playing'" @click="hit">Hit</button>
                <button v-if="gameState === 'playing'" @click="stand">Stand</button>
                <button v-if="gameState === 'gameover' && userId !== -1" @click="resetGame">Place New Bet</button>
                <button v-if="gameState === 'gameover' && userId === -1" @click="startGame">Play Again</button>

            </div>
            <h2 v-if="gameState === 'gameover'" :class="resultClass">{{ resultMessage }}</h2>
            <div v-if="gameState === 'gameover' && userId !== -1 && getBetTotal() > 0" class="bet-result">
                <div v-if="betWon" class="winnings">
                    <h3>You won: </h3>
                    <div class="medals-display">
                        <div v-if="currentBet.bronze > 0" class="medal-count">
                            <span>+{{ currentBet.bronze }}</span>
                        </div>
                        <div v-if="currentBet.silver > 0" class="medal-count">
                            <span>+{{ currentBet.silver }}</span>
                        </div>
                        <div v-if="currentBet.gold > 0" class="medal-count">
                            <span>+{{ currentBet.gold }}</span>
                        </div>
                    </div>
                </div>
                <div v-else class="losses">
                    <h3>You lost: </h3>
                    <div class="medals-display">
                        <div v-if="currentBet.bronze > 0" class="medal-count">
                            <span>-{{ currentBet.bronze }}</span>
                        </div>
                        <div v-if="currentBet.silver > 0" class="medal-count">
                            <span>-{{ currentBet.silver }}</span>
                        </div>
                        <div v-if="currentBet.gold > 0" class="medal-count">
                            <span>-{{ currentBet.gold }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            gameState: 'start',
            deck: [],
            dealerCards: [],
            playerCards: [],
            resultMessage: '',
            betWon: false,
            userMedals: {
                bronze: 0,
                silver: 0,
                gold: 0
            },
            currentBet: {
                bronze: 0,
                silver: 0,
                gold: 0
            },
            userId: this.$store.state.user?.id ?? -1
        };
    },
    computed: {
        playerTotal() {
            return this.calculateTotal(this.playerCards);
        },
        dealerTotal() {
            return this.calculateTotal(this.dealerCards);
        },
        dealerDisplayTotal() {
            if (this.gameState === 'playing') {
                // When one card is hidden, only show the value of the first card
                const firstCardValue = this.getCardValue(this.dealerCards[0]);
                return firstCardValue;
            }
            return this.dealerTotal;
        },
        isBetValid() {
            return this.currentBet.bronze >= 0 || this.currentBet.silver >= 0 || this.currentBet.gold >= 0;
        },
        resultClass() {
            return this.betWon ? 'win-message' : 'lose-message';
        }
    },
    created() {
        if (this.userId !== -1) {
            this.fetchUserAchievements();
        }
    },
    methods: {
        redirectToLogin(){
            this.$router.push({name: 'Login'})
        },
        getBetTotal() {
            return this.currentBet.bronze + this.currentBet.silver + this.currentBet.gold;
        },
        async fetchUserAchievements() {
            if (this.userId === -1) {
                console.log("User is not logged in");
                return;
            }
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            try {
                const response = await axios.get(`${API_URL}/achievements/${this.userId}`);
                this.userMedals = {
                    bronze: response.data.bronze,
                    silver: response.data.silver,
                    gold: response.data.gold
                };
            } catch (error) {
                console.error('Failed to fetch user achievements:', error);
            }
        },
        increaseBet(medalType) {
            if (this.currentBet[medalType] < this.userMedals[medalType]) {
                this.currentBet[medalType]++;
            }
        },
        decreaseBet(medalType) {
            if (this.currentBet[medalType] > 0) {
                this.currentBet[medalType]--;
            }
        },
        resetGame() {
            this.gameState = 'start';
            this.dealerCards = [];
            this.playerCards = [];
            this.resultMessage = '';
            this.betWon = false;
            this.fetchUserAchievements(); // Refresh medal count
            this.currentBet = {
                bronze: 0,
                silver: 0,
                gold: 0
            };
        },
        startGame() {
            if (this.userId === -1) {
                this.resultMessage = 'You must log in to place a bet';
                this.deck = this.shuffleDeck();
                this.playerCards = [this.drawCard(), this.drawCard()];
                this.dealerCards = [this.drawCard(), this.drawCard()];
                this.gameState = 'playing';
                return;
            }
            if (!this.isBetValid) return;

            this.deck = this.shuffleDeck();
            this.playerCards = [this.drawCard(), this.drawCard()];
            this.dealerCards = [this.drawCard(), this.drawCard()];
            this.gameState = 'playing';
            this.resultMessage = '';

            // Check for natural blackjack
            if (this.playerTotal === 21) {
                this.checkForBlackjack();
            }
        },
        hit() {
            this.playerCards.push(this.drawCard());
            if (this.playerTotal > 21) {
                this.gameState = 'gameover';
                this.resultMessage = 'You busted! Dealer wins.';
                this.betWon = false;
                this.updateAchievements(false);
            }
        },
        stand() {
            // Reveal dealer's second card first
            this.gameState = 'dealer-turn';

            // Then dealer draws until 17 or higher
            while (this.dealerTotal < 17) {
                this.dealerCards.push(this.drawCard());
            }
            this.determineWinner();
        },
        determineWinner() {
            this.gameState = 'gameover';

            if (this.dealerTotal > 21) {
                this.resultMessage = 'Dealer busted! You win!';
                this.betWon = true;
            } else if (this.playerTotal > this.dealerTotal) {
                this.resultMessage = 'You win!';
                this.betWon = true;
            } else if (this.playerTotal < this.dealerTotal) {
                this.resultMessage = 'Dealer wins!';
                this.betWon = false;
            } else {
                this.resultMessage = 'It\'s a tie!';
                this.betWon = false;
            }

            this.updateAchievements(this.betWon);
        },
        checkForBlackjack() {
            if (this.playerTotal === 21 && this.playerCards.length === 2) {
                if (this.dealerTotal === 21 && this.dealerCards.length === 2) {
                    this.gameState = 'gameover';
                    this.resultMessage = 'Both have Blackjack! Push.';
                    this.betWon = false; // Tie means no winnings
                    this.updateAchievements(false);
                } else {
                    this.gameState = 'gameover';
                    this.resultMessage = 'Blackjack! You win!';
                    this.betWon = true;
                    // For blackjack, payout is 3:2
                    this.updateAchievements(true, 1.5);
                }
            }
        },
        async updateAchievements(isWin, multiplier = 1) {
            if (this.userId === -1) {
                console.log("User not logged in. Skipping achievements update")
                return;
            }
            let updatedMedals = { ...this.userMedals };
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';


            if (isWin) {
                // Calculate winnings with multiplier
                const bronzeWin = Math.floor(this.currentBet.bronze * multiplier);
                const silverWin = Math.floor(this.currentBet.silver * multiplier);
                const goldWin = Math.floor(this.currentBet.gold * multiplier);

                updatedMedals.bronze += bronzeWin;
                updatedMedals.silver += silverWin;
                updatedMedals.gold += goldWin;
            } else {
                // Subtract bet amounts for loss
                updatedMedals.bronze -= this.currentBet.bronze;
                updatedMedals.silver -= this.currentBet.silver;
                updatedMedals.gold -= this.currentBet.gold;
            }

            try {
                await axios.post(`${API_URL}/achievements/${this.userId}`, {
                    bronze: updatedMedals.bronze,
                    silver: updatedMedals.silver,
                    gold: updatedMedals.gold
                });

                // Update local state after successful API call
                this.userMedals = updatedMedals;
            } catch (error) {
                console.error('Failed to update achievements:', error);
            }
        },
        drawCard() {
            if (this.deck.length === 0) {
                this.deck = this.shuffleDeck();
            }
            return this.deck.pop();
        },
        shuffleDeck() {
            const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
            const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
            let deck = [];

            for (let suit of suits) {
                for (let value of values) {
                    deck.push(`${value}_of_${suit}`);
                }
            }

            // Fisher-Yates shuffle algorithm for better randomization
            for (let i = deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [deck[i], deck[j]] = [deck[j], deck[i]];
            }

            return deck;
        },
        getCardValue(card) {
            if (!card) return 0;

            const value = card.split('_of_')[0];
            if (value === 'ace') return 11;
            if (['jack', 'queen', 'king'].includes(value)) return 10;
            return parseInt(value);
        },
        calculateTotal(cards) {
            if (!cards || cards.length === 0) return 0;

            let total = 0;
            let aces = 0;

            for (const card of cards) {
                const value = card.split('_of_')[0];

                if (value === 'ace') {
                    aces++;
                } else if (['jack', 'queen', 'king'].includes(value)) {
                    total += 10;
                } else {
                    total += parseInt(value);
                }
            }

            // Add aces - each ace can be 1 or 11
            for (let i = 0; i < aces; i++) {
                if (total + 11 <= 21) {
                    total += 11;
                } else {
                    total += 1;
                }
            }

            return total;
        },
        getCardImage(card, isFaceDown = false) {
            if (isFaceDown) {
                return 'cards/back.png';
            }
            return `cards/${card}.png`;
        }
    }
};
</script>

<style scoped>
.game-container {
    text-align: center;
    max-width: 800px;
    min-width: 400px;
    margin: 0 auto;
    padding: 20px;
    background-color: rgba(245, 245, 245, .8); /* Light gray */
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.dealer,
.player {
    margin-bottom: 20px;
}

.cards {
    display: flex;
    justify-content: center;
    gap: 10px;
    min-height: 140px;
    margin: 15px 0;
}

.login-prompt{
    
}

.card {
    width: 100px;
    height: auto;
    transition: transform 0.3s ease-in-out;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5);
    border-radius: 5px;
}

.card:hover {
    transform: translateY(-10px);
}

.buttons {
    margin: 20px 0;
}

button {
    padding: 10px 20px;
    margin: 0 5px;
    background-color: rgba(76, 175, 80, .5); /* Green */
    color: rgba(255, 255, 255, 1); /* White */
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
}

button:hover:not(:disabled) {
    background-color: rgba(69, 160, 73, .5); /* Darker green */
}

button:disabled {
    background-color: rgba(204, 204, 204, .5); /* Gray */
    cursor: not-allowed;
}

.card-fade-enter-active,
.card-fade-leave-active {
    transition: all 0.5s;
}

.card-fade-enter-from,
.card-fade-leave-to {
    opacity: 0;
    transform: translateY(30px);
}

/* Betting Panel Styles */
.betting-panel {
    background-color: rgba(255, 255, 255, .7); /* White */
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.medals-display {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin: 15px 0;
}

.medal-count {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 18px;
    font-weight: bold;
}

.medal-icon {
    width: 30px;
    height: 30px;
}

.bet-controls {
    display: flex;
    justify-content: space-around;
    margin: 20px 0;
}

.bet-type {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.bet-buttons {
    display: flex;
    align-items: center;
    gap: 10px;
}

.bet-buttons button {
    width: 30px;
    height: 30px;
    padding: 0;
    font-size: 20px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.bet-buttons span {
    font-size: 18px;
    font-weight: bold;
    min-width: 30px;
}

.deal-button {
    background-color: rgba(33, 150, 243, 1); /* Blue */
    padding: 12px 24px;
    font-size: 18px;
    margin-top: 15px;
}

.deal-button:hover:not(:disabled) {
    background-color: rgba(11, 125, 218, 1); /* Darker blue */
}

.bet-result {
    margin: 20px 0;
    padding: 15px;
    border-radius: 8px;
    background-color: rgba(248, 248, 248, 1); /* Light gray */
}

.winnings {
    color: rgba(76, 175, 80, 1); /* Green */
}

.losses {
    color: rgba(244, 67, 54, 1); /* Red */
}

.win-message {
    color: rgba(76, 175, 80, 1); /* Green */
}

.lose-message {
    color: rgba(244, 67, 54, 1); /* Red */
}

</style>