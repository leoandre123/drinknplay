<template>
    <div class="reaction-game-container">
        <div class="players-grid">
            <MiniPlayerCard v-for="(player, index) in sortedPlayers" :key="player.id || player.name" :player="player"
                :place="index" :is-winner="player.id === winner" />
        </div>
        <div class="game-area">
            <h1>REACTION GAME</h1>
            <p>Count the figures in the picture as fast as you can!</p>
            <div v-if="countdown != 0" class="countdown-container">
                <p>{{ countdownText }}</p>
            </div>

            <div v-if="roundActive && !showRoundResult" class="picture-container">
                <img v-for="(pos, i) in positions" :key="i" :src="mascot" class=" figure" :style="{
                    left: pos.leftVh + 'vh',
                    top: pos.topVh + 'vh'
                }" />
            </div>
            <div v-else class="round-result">
                <h2 v-if="winnerName">Winner: {{ winnerName }}</h2>
                <h2 v-if="showRoundResult && !winnerName" >No winner this round</h2>
            </div>

        </div>
    </div>

</template>

<script>
import { socket } from "../../../socket";
import mascot from "@/assets/mascot.png";
import MiniPlayerCard from "@/components/MiniPlayerCard.vue";
import { context } from "../../../context";

export default {
    name: "ReactionGameHostView",
    components: {
        MiniPlayerCard

    },
    data() {
        return {
            gameStarted: false,
            figureCount: 0,
            mascot,
            playerScores: new Map(),
            countdown: 6,
            amount: 0,
            countdownActive: false,
            countdownInterval: null,
            tickSound: null,
            goSound: null,
            winner: null,
            winnerName: null,
            positions: [],
            showRoundResult: false,
            roundActive: false,

        };
    },

    created() {
        socket.on("reaction:startRound", ({ figureCount, positions }) => {
            this.figureCount = figureCount;
            this.winner = null;
            this.positions = positions;
            this.showRoundResult = false;
            this.roundActive = false;
            this.startCountdown();
        });

        socket.on("reaction:playerAmount", ({ playerId, amount }) => {
            const p = context.state.players.find(x => x.id === playerId);
            if (p) p.amount = amount;
        });

        socket.on("reaction:roundResult", ({ winnerId, winnerName, scores }) => {
            this.winner = winnerId;
            this.winnerName = winnerName;
            this.showRoundResult = true;
            this.roundActive = false;

            this.playerScores = new Map(Object.entries(scores));

        });
    },

    computed: {
        players() {
            return context.state.players.map((player) => ({
                id: player.id,
                name: player.name,
                score: this.playerScores.get(player.id) || 0,
                amount: player.amount || 0,


            }));
        },
        sortedPlayers() {
            return this.players.slice().sort((a, b) => b.score - a.score);
        },
        countdownText() {
            return this.countdown > 0 ? `${this.countdown}...` : "GO!";
        },
    },

    beforeUnmount() {
        socket.off("reaction:startRound");
        socket.off("reaction:roundResult");
        socket.off("reaction:playerAmount");
        if (this.countdownInterval) clearInterval(this.countdownInterval);
    },

    mounted() {

    },

    methods: {

        startCountdown() {
            const tickSound = new Audio("/sounds/tick.mp3");
            tickSound.play();

    
            if (this.countdownInterval) clearInterval(this.countdownInterval);

            this.countdown = 6;
            this.countdownActive = true;

            this.countdownInterval = setInterval(() => {
                this.countdown--;

                if (this.countdown === 0) {
                    clearInterval(this.countdownInterval);
                    this.countdownInterval = null;
                    this.countdownActive = false;
                    this.roundActive = true;    


                    this.playGoSound();

                }

            }, 1000);
        },

        playSound() {
            const audio = new Audio('/sounds/submitbutton.mp3');
            audio.play();
        },
        playGoSound() {
            const goSound = new Audio("/sounds/go.mp3");
            goSound.play();
            this.gameStarted = true;
        },
        getRandomPositions() {
            const x = Math.random() * 90;
            const y = Math.random() * 90;
            return {
                position: "absolute",
                top: y + "%",
                left: x + "%",
            };
        },

        noWinnerSound() {
            if (this.winner === null && showRoundResult) {
                const audio = new Audio('/sounds/nowinner.mp3');
                audio.play();
            }
        },

        winnerSound() {
            if (this.winner === this.myId && showRoundResult) {
                const audio = new Audio('/sounds/winner.mp3');
                audio.play();
            }
        },
    }
};
</script>

<style>
.reaction-game-container {
    display: grid;
    position: relative;
    width: 100vw;
    height: 100vh;
    justify-items: center;
    align-content: center;
    background-image: radial-gradient(circle farthest-corner at 10% 20%,
            rgb(102, 0, 32) 0%,
            rgb(116, 18, 92) 49.5%,
            rgb(164, 34, 144) 90%);
    color: white;
    overflow: hidden;

}

.players-grid {
    position: absolute;
    left: 1rem;
    top: 1rem;
    display: grid;
    flex-direction: column;
    gap: 0.4rem;
}

.round-result {
    display: grid;
    justify-items: top;
    align-items: top;

    background: rgba(0, 0, 0, 0.6);
    color: rgb(175, 87, 226);
    font-size: 1rem;
    font-weight: bold;
}

.picture-container {
    width: 100vh;
    height: 55vh;
    position: relative;
    overflow: hidden;
    background: whitesmoke;
}

.figure {
    position: absolute;
    width: 7vh;
    height: auto;
    transform: translate(-50%, -50%);
}

.start-button {
    width: 300px;
    padding-top: 10px;
    padding-bottom: 10px;
    margin: 10px;
    font-weight: bold;
    font-size: 16;
    background-color: pink;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
}
</style>