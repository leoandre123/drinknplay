<template>
  <div class="MazeHostContainer">
    <div class="players-grid">
      <MiniPlayerCard 
        v-for="(player, index) in sortedPlayers" 
        :key="player.id" 
        :player="player"
        :place="index" 
        :is-winner="player.id === winnerId" 
      />
    </div>

    <div class="center-content">
      <h1>MAZE GAME</h1>
      
      <div v-if="!winnerId" class="game-info">
        <p class="status-text">First to the finish line wins!</p>
        <div class="spinner"></div> </div>

      <div v-else class="winner-display">
        <h2>WINNER:</h2>
        <h1 class="winner-name">{{ winnerName }}</h1>
      </div>
    </div>
  </div>
</template>

<script>
    import { socket } from '../../../socket';
    import { context } from '../../../context';
    import MiniPlayerCard from "@/components/MiniPlayerCard.vue";

    export default {
        name: "HostMazeGameView",
        components:{
            MiniPlayerCard
        },
        data() {
            return {
                winnerId: null,
                winnerName: null,
                tickSound: null,
                playerScores: new Map(),
            };
        },
        computed:{
            players(){
                if (!context || !context.state || !context.state.players) {
                    return [];
                }
                return context.state.players.map((player) => ({
                    id: player.id,
                    name: player.name,
                    score: this.playerScores.get(player.id) || 0,

                }));
            },
            sortedPlayers() {
                return this.players;
            }
        },

        created() {
            socket.on("maze:roundResult", ({winnerId, winnerName}) => {
                this.winnerId = winnerId;
                this.winnerName = winnerName;
                this.stopTickSound();
                this.playWinSound();
            });
        },

        mounted() {
            this.StartTickSound();
        },

        beforeUnmount() {
            this.stopTickSound();
            socket.off("maze:roundResult");
        },

        methods: {
            StartTickSound() {
                if (!this.tickSound){
                    this.tickSound = new Audio("/sounds/tick.mp3");
                    this.tickSound.loop = true;
                }
                this.tickSound.play().catch(e => console.log("Audio play blocked:", e));
            },

            stopTickSound() {
                if (this.tickSound) {
                    this.tickSound.pause();
                    this.tickSound.currentTime = 0;
                }
            },

            playWinSound() {
                const winSound = new Audio("/sounds/winner.mp3");
                winSound.play();
            }
        }
    };
</script>

<style scoped>
.MazeHostContainer {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
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
  gap: 0.5rem;
}

.center-content {
  text-align: center;
  z-index: 10;
}

h1 {
  font-size: 3rem;
  margin-bottom: 20px;
  text-shadow: 0 4px 10px rgba(0,0,0,0.5);
}

.status-text {
  font-size: 1.5rem;
  opacity: 0.8;
}

.winner-display {
  animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  background: rgba(0, 0, 0, 0.3);
  padding: 40px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.winner-name {
  font-size: 5rem;
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  margin: 0;
}

.spinner {
  margin: 20px auto;
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes popIn {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>