<template>
  <div v-if="context.isHost" class="results">
    <h1 class="glow large">Results</h1>
    <div class="player-cards">
      <TransitionGroup name="list">
        <PlayerCard
          v-for="(player, i) in sortedPlayers"
          :key="player"
          :player="player"
          :place="i"
          :score="scores.get(player.id)"
        />
      </TransitionGroup>
    </div>
    <button @click="shufflePlayers">Shuffle</button>
  </div>
</template>

<script>
import PlayerCard from "@/components/PlayerCard.vue";
import { context } from "../context";
import { socket } from "../socket";

export default {
  name: "ResultView",
  components: { PlayerCard },

  data: function () {
    return {
      context,
      players: [
        {
          id: "1",
          name: "Leo",
          glassFillLevel: 0,
          drunkness: 2,
          score: 300,
        },
        {
          id: "2",
          name: "Jarry",
          glassFillLevel: 0.5,
          drunkness: 5,
          score: 200,
        },
        {
          id: "3",
          name: "Gorge",
          glassFillLevel: 1,
          drunkness: 2,
          score: 500,
        },
        {
          id: "4",
          name: "Gorge",
          glassFillLevel: 0.2,
          drunkness: 2,
          score: 1200,
        },
      ],
      filledGlassIndex: -1,
      scores: new Map(),
    };
  },
  created: function () {
    this.players.forEach((p) => this.scores.set(p.id, p.score));
  },
  methods: {
    fillGlass(index, id) {
      this.filledGlassIndex = index;
      socket.emit("fillGlassIndex", id);
    },
    animateScore(id, target) {
      const start = this.scores.get(id) ?? target;
      const duration = 5000;
      const startTime = performance.now();

      const tick = (now) => {
        const t = Math.min((now - startTime) / duration, 1);
        const value = Math.round(start + (target - start) * t);
        this.scores.set(id, value);

        if (t < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    },
    shufflePlayers() {
      console.log(this.players);
      this.players[2].score = Math.floor(Math.random() * 2000);
    },
  },
  computed: {
    sortedPlayers() {
      return [...this.players].sort((a, b) => this.scores.get(b.id) - this.scores.get(a.id));
    },
    playerScores() {
      return this.players.map((p) => p.score);
    },
  },
  watch: {
    playerScores: {
      handler(newScores, oldScores) {
        newScores.forEach((score, i) => {
          const player = this.players[i];
          this.animateScore(player.id, score);
        });
      },
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Limelight&display=swap");

.results {
  width: 100dvw;
  height: 100dvh;
  position: relative;
  background: linear-gradient(
    90deg,
    rgba(131, 58, 180, 1) 0%,
    rgba(253, 29, 29, 1) 50%,
    rgba(252, 176, 69, 1) 87%
  );
  display: flex;
  flex-direction: column;
  gap: 3rem;
  align-items: center;
  background-repeat: repeat;
}

.large {
  font-size: 6rem;
  width: 40rem;
}

.glow {
  letter-spacing: 10px;
  color: #fff;
  font-family: "LimeLight Display";
  -webkit-animation: glow 1s ease-in-out infinite alternate;
  -moz-animation: glow 1s ease-in-out infinite alternate;
  animation: glow 1s ease-in-out infinite alternate;
  background-color: darkmagenta;
  margin: 1rem;
  border: 0.2rem solid #fff;
  border-radius: 2rem;
  padding: 20px;
  box-shadow: 0 0 0.2rem #fff, 0 0 0.2rem #fff, 0 0 2rem #bc13fe, 0 0 0.8rem #bc13fe,
    0 0 2.8rem #bc13fe, inset 0 0 1.3rem #bc13fe;
}

.player-cards {
  display: flex;
  gap: 5rem;
  justify-content: center;
  flex-wrap: wrap;
  margin: 2rem;
}

@keyframes glow {
  from {
    text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #e60073, 0 0 40px #e60073, 0 0 50px #e60073,
      0 0 60px #e60073, 0 0 70px #e60073;
  }

  to {
    text-shadow: 0 0 20px #fff, 0 0 30px #ff4da6, 0 0 40px #ff4da6, 0 0 50px #ff4da6,
      0 0 60px #ff4da6, 0 0 70px #ff4da6, 0 0 80px #ff4da6;
  }
}

.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}
</style>
