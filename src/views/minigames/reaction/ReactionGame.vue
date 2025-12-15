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
            <div v-else class="picture-overlay">
                <div class="picture-container">
                    <img v-for="n in figureCount" :key="n" :src="mascot" :style="getRandomPositions()" />
                </div>
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
            countdownActive: false,
            countdownInterval: null,
            tickSound: null,
            goSound: null,
            winner: null,
        };
    },

    created() {
        socket.on("reaction:startRound", (figureCount) => {
            this.figureCount = figureCount;
            this.winner = null;
            this.startCountdown();
        });
        console.log("figureCount:", this.figureCount);

        socket.on("reaction:roundResult", ({ winner, scores, show }) => {
            this.winner = winner;
            console.log("Winner of the round:", this.winner);
            console.log(
                "player ids in host:",
                context.state.players.map(p => p.id)
            );
            this.playerScores = new Map(Object.entries(scores));
            console.log("Round result received:", winner, scores);

        });
    },

    computed: {
        players() {
            return context.state.players.map((player) => ({
                id: player.id,
                name: player.name,
                score: this.playerScores.get(player.id) || 0,

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
        if (this.countdownInterval) clearInterval(this.countdownInterval);
    },

    mounted() {

    },

    methods: {

        startCountdown() {
            const tickSound = new Audio("/sounds/tick.mp3");
            tickSound.play();

            // Säkerhet: stoppa om något redan kör
            if (this.countdownInterval) clearInterval(this.countdownInterval);

            this.countdown = 6;
            this.countdownActive = true;

            this.countdownInterval = setInterval(() => {
                this.countdown--;

                if (this.countdown === 0) {
                    clearInterval(this.countdownInterval);
                    this.countdownInterval = null;
                    this.countdownActive = false;

                    this.generatepicture();
                }

            }, 1000);
        },

        playSound() {
            const audio = new Audio('/sounds/submitbutton.mp3');
            audio.play();
        },
        generatepicture() {
            this.winner = null;
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
            if (this.winner === null && showRoundResult)
             {
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


.picture-container {
    width: 100%;
    height: 100%;
    background: whitesmoke;
    position: relative;
    overflow: hidden;
    border: none;
}

.picture-overlay {
    position: absolute;
    inset: 0;
    /* top:0 right:0 bottom:0 left:0 */
    z-index: 5;
    display: grid;
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