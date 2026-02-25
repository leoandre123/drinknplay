<template>
  <div class="results">
    <template v-if="context.isHost">
      <h1 class="glow large">{{ $t("draw.scoreboard") }}</h1>
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
      <button @click="simulate" v-if="environment.isDev">Simulate</button>
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

<script setup lang="ts">
import PlayerCard from "@/shared/components/PlayerCard.vue";
import { context } from "../../context";
import { socket } from "../../socket";
import { environment } from "@/core/environment";
import { computed, onMounted, ref } from "vue";

const filledGlassIndex = ref(-1);
const scores = ref(new Map());
const glassLevels = ref(new Map());
const drunknesses = ref(new Map());
const message = ref("");
const isMessageShowing = ref(false);

onMounted(() => {
  context.state?.players.forEach((p) => {
    scores.value.set(p.id, p.score);
    glassLevels.value.set(p.id, p.glassLevel ?? 0);
    drunknesses.value.set(p.id, p.drunkness);
  });

  socket.on("scoreboard:update", () => {
    updatePlayerInfos();
  });
  socket.on("scoreboard:creditsReceived", (filleeId, newValue) => {
    onCreditsReceived(filleeId, newValue);
  });
});

const sortedPlayers = computed(() => {
  return [...(context.state?.players ?? [])].sort(
    (a, b) => scores.value.get(b.id) - scores.value.get(a.id),
  );
});
const playerScores = computed(() => {
  return context.state?.players.map((p) => p.score);
});
const playerGridStyle = computed(() => {
  return {
    gridTemplateColumns: `repeat(${Math.min(sortedPlayers.value.length, 5)}, 1fr)`,
  };
});

async function simulate() {
  if (!context.state) return;
  setScores(
    context.state.players.map((p) => {
      return { id: p.id, score: Math.floor(Math.random() * 10000) };
    }),
  );
  updateScores(
    context.state.players.map((p) => {
      return { id: p.id, score: Math.floor(Math.random() * 10000) };
    }),
  );

  await new Promise((r) => setTimeout(r, 6000));

  onCreditsReceived(context.state.players[0]!.id, Math.random());
  await new Promise((r) => setTimeout(r, 10000));
  animateDrunkness(context.state.players[0]!.id, 2);
}
function setScores(values: { id: string; score: number }[]) {
  values.forEach((s) => {
    scores.value.set(s.id, s.score);
  });
}

function updatePlayerInfos() {
  console.log("UPDATE INFO");
  console.log(context.state?.players);
  context.state?.players.forEach((p) => {
    animateScore(p.id, p.score);
    animateGlass(p.id, p.glassLevel);
    animateDrunkness(p.id, p.drunkness);
  });
}
function updateScores(values: { id: string; score: number }[]) {
  values.forEach((s) => {
    animateScore(s.id, s.score);
  });
}
function onCreditsReceived(receiverId: string, credits: number) {
  const fillee = context.state?.players.find((x) => x.id == receiverId);
  if (fillee) showMessage(`${fillee.name} har mottagit ${credits} dryckeskrediter!`);
}
function showMessage(msg: string) {
  message.value = msg;
  isMessageShowing.value = true;
  setTimeout(() => {
    isMessageShowing.value = false;
  }, 6000);
}
function fillGlass(index: number, id: string) {
  filledGlassIndex.value = index;
  socket.emit("fillGlassIndex", id);
}
function animateGlass(id: string, target: number) {
  console.log(`Fill glass of ${id} to ${target} from ${glassLevels.value.get(id)}`);
  animate(glassLevels.value, id, target, 2000, false);
}
function animateDrunkness(id: string, target: number) {
  animate(drunknesses.value, id, target, 2000, false);
}
function animateScore(id: string, target: number) {
  animate(scores.value, id, target, 3000, true);
}
function animate(
  map: Map<string, any>,
  id: string,
  target: number,
  duration: number,
  round: boolean,
) {
  const start = map.get(id) ?? target;
  const startTime = performance.now();

  const tick = (now: number) => {
    const t = Math.min((now - startTime) / duration, 1);
    const value = round ? Math.round(start + (target - start) * t) : start + (target - start) * t;
    map.set(id, value);

    if (t < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}
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
  box-shadow:
    0 0 0.2rem #fff,
    0 0 0.2rem #fff,
    0 0 2rem #bc13fe,
    0 0 0.8rem #bc13fe,
    0 0 2.8rem #bc13fe,
    inset 0 0 1.3rem #bc13fe;
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
    text-shadow:
      0 0 10px #fff,
      0 0 20px #fff,
      0 0 30px #e60073,
      0 0 40px #e60073,
      0 0 50px #e60073,
      0 0 60px #e60073,
      0 0 70px #e60073;
  }

  to {
    text-shadow:
      0 0 20px #fff,
      0 0 30px #ff4da6,
      0 0 40px #ff4da6,
      0 0 50px #ff4da6,
      0 0 60px #ff4da6,
      0 0 70px #ff4da6,
      0 0 80px #ff4da6;
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
  text-shadow:
    1px 1px #bc13fe,
    0 0 1rem white;
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
