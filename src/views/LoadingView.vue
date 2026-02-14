<template>
  <div class="background-container" :style="backgroundStyle">
    <div class="game-label">
      <p>{{ title }}</p>
    </div>
    <div class="info-box">
      <h1>TIPS!</h1>
      <p>{{ tip }}</p>

      <div class="ready-container">
        <p v-if="context.isHost">
          {{ context.state.players.filter((x: any) => x.isReady).length }} of
          {{ Math.ceil(context.state.players.length / 2) }} required players ready
        </p>
        <RetroButton
          v-if="!context.isHost"
          size="large"
          :color="context.getCurrentPlayer().isReady ? 'red' : 'green'"
          @click="toggleReady"
        >
          {{ context.getCurrentPlayer().isReady ? "Cancel" : "Ready" }}
        </RetroButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import RetroButton from "../components/RetroButton.vue";
import { context } from "../context.js";
import { socket } from "../socket.js";
import { computed } from "vue";
import gameinfo from "../assets/gameinfo.json";

const { tm } = useI18n();

const title = computed(() => {
  return tm(`games[${context.state.gameIndex}].title`);
});
const tip = computed(() => {
  const tips = tm(`games[${context.state.gameIndex}].tips`);

  return tips[Math.floor(Math.random() * tips.length)];
});
const backgroundStyle = computed(() => {
  const uri = gameinfo[context.state?.gameIndex ?? 0]?.imageUri || "game_backgrounds/question.jpg";
  return {
    backgroundImage: `url(/${uri})`,
  };
});

function toggleReady() {
  socket.emit("ready", !context.getCurrentPlayer().isReady);
}
</script>

<style scoped>
.background-container {
  box-sizing: border-box;
  position: relative;
  width: 100%;
  height: 100%;

  background-image: url("https://mario.wiki.gallery/images/thumb/3/32/MK8_Mario_Circuit.png/1200px-MK8_Mario_Circuit.png");
  background-size: cover;
}
.game-label {
  position: absolute;
  right: 0;
  top: 15%;

  background-color: rgba(42, 45, 48, 0.596);
  padding-inline: 2rem;

  height: 5rem;
  font-size: 3rem;
  align-content: center;

  color: white;

  text-transform: uppercase;
}
.info-box {
  position: absolute;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 35%;
  bottom: 0;

  background-color: rgba(42, 45, 48, 0.596);
  color: white;
  font-size: 1.3rem;
}

.ready-container {
  flex-grow: 1;
  align-content: center;
}

.ready-container button:hover {
  transform: scale(1.05);
  background: rgb(47, 192, 47);
}
</style>
