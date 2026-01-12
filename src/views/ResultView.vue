<template>
  <div class="results">
    <template v-if="context.isHost">
      <h1 class="glow large">{{$t('draw.scorebard')}}</h1>
      <div class="player-cards" :style="playerGridStyle">
        <TransitionGroup name="list">
          <PlayerCard
            v-for="(player, i) in sortedPlayers"
            :key="player.id"
            :player="player"
            :place="i"
            :score="scores.get(player.id)"
            :glassLevel="glassLevels.get(player.id)"
            :drunkness="drunknesses.get(player.id)"
          />
        </TransitionGroup>
      </div>
      <button @click="simulate">Simulate</button>
      <div v-if="isMessageShowing" class="message-overlay">
        <p>{{ message }}</p>
      </div>
    </template>
    <template v-if="!context.isHost">
      <div class="flex-expander"></div>
      <button class="continue-button">Continue</button>
    </template>
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
      filledGlassIndex: -1,
      scores: new Map(),
      glassLevels: new Map(),
      drunknesses: new Map(),
      message: "",
      isMessageShowing: false,
    };
  },
  created: function () {
    this.context.state.players.forEach((p) => {
      this.scores.set(p.id, p.score);
      this.glassLevels.set(p.id, p.glassLevel ?? 0);
      this.drunknesses.set(p.id, p.drunkness);
    });

    socket.on("scoreboard:update", () => {
      this.updatePlayerInfos();
    });
    socket.on("scoreboard:creditsReceived", (filleeId, newValue) => {
      this.onCreditsReceived(filleeId, newValue);
    });
  },
  methods: {
    async simulate() {
      this.setScores(
        this.context.state.players.map((p) => {
          return { id: p.id, score: Math.floor(Math.random() * 10000) };
        })
      );
      this.updateScores(
        this.context.state.players.map((p) => {
          return { id: p.id, score: Math.floor(Math.random() * 10000) };
        })
      );

      await new Promise((r) => setTimeout(r, 6000));

      this.onCreditsReceived(this.context.state.players[0].id, Math.random());
      await new Promise((r) => setTimeout(r, 10000));
      this.animateDrunkness(this.context.state.players[0].id, 2);
    },
    setScores(values) {
      values.forEach((s) => {
        this.scores.set(s.id, s.score);
      });
    },

    updatePlayerInfos() {
      console.log("UPDATE INFO");
      console.log(this.context.state.players);
      this.context.state.players.forEach((p) => {
        this.animateScore(p.id, p.score);
        this.animateGlass(p.id, p.glassLevel);
        this.animateDrunkness(p.id, p.drunkness);
      });
    },
    updateScores(values) {
      values.forEach((s) => {
        this.animateScore(s.id, s.score);
      });
    },
    onCreditsReceived(receiverId, credits) {
      const fillee = this.context.state.players.find((x) => x.id == receiverId);
      this.showMessage(`${fillee.name} har mottagit ${credits} dryckeskrediter!`);
    },
    showMessage(msg) {
      this.message = msg;
      this.isMessageShowing = true;
      setTimeout(() => {
        this.isMessageShowing = false;
      }, 6000);
    },
    fillGlass(index, id) {
      this.filledGlassIndex = index;
      socket.emit("fillGlassIndex", id);
    },
    animateGlass(id, target) {
      console.log(`Fill glass of ${id} to ${target} from ${this.glassLevels.get(id)}`);
      this.animate(this.glassLevels, id, target, 2000, false);
    },
    animateDrunkness(id, target) {
      this.animate(this.drunknesses, id, target, 2000, false);
    },
    animateScore(id, target) {
      this.animate(this.scores, id, target, 3000, true);
    },
    animate(map, id, target, duration, round) {
      const start = map.get(id) ?? target;
      const startTime = performance.now();

      const tick = (now) => {
        const t = Math.min((now - startTime) / duration, 1);
        const value = round
          ? Math.round(start + (target - start) * t)
          : start + (target - start) * t;
        map.set(id, value);

        if (t < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    },
  },
  computed: {
    sortedPlayers() {
      return [...this.context.state.players].sort(
        (a, b) => this.scores.get(b.id) - this.scores.get(a.id)
      );
    },
    playerScores() {
      return this.context.state.players.map((p) => p.score);
    },
    playerGridStyle() {
      return {
        gridTemplateColumns: `repeat(${Math.min(this.sortedPlayers.length, 5)}, 1fr)`,
      };
    },
  },
};
</script>

<style scoped>
.results {
  width: 100dvw;
  height: 100dvh;
  overflow: hidden;
  position: relative;
  background: linear-gradient(90deg, #44195f 0%, #0a0d36 100%);
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
  width: 80%;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 3rem;
  justify-content: center;
  margin-top: 2rem;
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

.message-overlay {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  place-content: center;
  color: #fff;
  font-size: 4rem;
  text-shadow: 1px 1px #bc13fe, 0 0 1rem white;
  animation: infinite 6s message;
}

@keyframes message {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  25% {
    transform: scale(1);
    opacity: 1;
  }
  80% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(40);
    opacity: 0;
  }
}

.continue-button {
  border: none;
  font-family: inherit;
  padding: 1rem;
  font-size: 2rem;
  color: beige;
  background-color: rgb(124, 184, 64);
  cursor: pointer;
}
.continue-button:hover {
  background-color: rgb(139, 188, 90);
  transform: scale(1.05);
}
</style>
