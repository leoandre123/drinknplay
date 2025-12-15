<template>
    <div class="reaction-game-container">
        <h1>REACTION GAME</h1>
        <p>Count the figures in the picture as fast as you can!</p>
        <div v-if="!gameStarted" class="button-container">
            <button class="start-button" @click="startCountdown"> START GAME </button>
        </div>
        <div v-else class="picture-container">
            <img v-for="n in figureCount" :key="n" :src="mascot" :style="getRandomPositions()" />
        </div>
        <div class="players-grid">
            <MiniPlayerCard v-for="(player, index) in sortedPlayers" :key="player.id || player.name" :player="player"
                :place="index" />
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
            amount: 0,
            playerScores: new Map(),
            playerAmounts: new Map(),
            countdown: 6,          // antal sekunder
            countdownActive: false,
            countdownInterval: null,
            tickSound: null,
            goSound: null,
        };
    },



    created() {
        socket.on("reaction:setSubmissions", (submissions) => this.onSubbmissionsUpdate(submissions));

    },

    computed: {
        players() {
            return context.state.players.map((player) => ({

                id: player.id,
                name: player.name,
                score: this.playerScores.get(player.id) || 0,
                amount: this.playerAmounts.get(player.id) || 0,

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

    },

    mounted() {
        this.tickSound = new Audio("/sounds/tick.mp3");
        this.goSound = new Audio("/sounds/go.mp3");
    },

    methods: {
        startCountdown() {
            this.playSound();
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

                    this.generatepicture(); // starta spelet direkt
                }

            }, 1000);
        },

        playSound() {
            const audio = new Audio('/sounds/submitbutton.mp3');
            audio.play();
        },
        generatepicture() {
            const goSound = new Audio("/sounds/go.mp3");
            goSound.play();
            this.gameStarted = true;
            this.figureCount = Math.floor(Math.random() * 8) + 3;
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

        onSubbmissionsUpdate(submissions) {
            console.log("Received submissions update:", submissions);
            for (const submission of submissions) {
                this.playerAmounts.set(submission.id, submission.amount);
            }

            console.log("Player amounts updated:", this.playerAmounts);
            console.log("Current players:", this.players);
        },
    }
};
</script>

<style>
.reaction-game-container {
    display: grid;
    width: 100vw;
    height: 100vh;
    justify-items: center;
    align-content: center;
    background-image: radial-gradient(circle farthest-corner at 10% 20%,
            rgb(102, 0, 32) 0%,
            rgb(116, 18, 92) 49.5%,
            rgb(164, 34, 144) 90%);
    color: white;

}

.players-grid {
    position: absolute;
    left: 1rem;
    top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}


.picture-container {
    position: relative;
    margin-top: 20px;
    width: 900px;
    height: 600px;
    border: 2px solid white;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: whitesmoke;
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