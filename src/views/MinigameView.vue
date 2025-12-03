<template>
  <div v-if="context.isHost" class="container">
    <div class="title-bar">
      <h1 v-if="context.state.gameIndex == 0">2.5D Racer</h1>
      <h1 v-if="context.state.gameIndex == 1">Questions game</h1>
      <svg view-box="0 0 100 100">
        <rect x="10" y="10" width="50" height="50" fill="green" />
        <circle cx="5" cy="5" :r="tmp" fill="red" />
      </svg>
      <p>{{ tmp }}</p>
      <input type="range" v-model="tmp" min="1" max="10" />
    </div>
    <div class="body-container">
      <div class="scoreboard-container">
        <p v-for="player in context.state.players">{{ player.name }}</p>
      </div>
      <div class="minigame-container">
        <RacingView v-if="context.state.gameIndex == 0" class="minigame" />
        <KahootView v-if="context.state.gameIndex == 1" class="minigame" />
      </div>
    </div>
  </div>
  <div v-if="!context.isHost" class="client-container">
    <RacingControllerView v-if="context.state.gameIndex == 0" class="minigame" />
    <KahootPlayerView v-if="context.state.gameIndex == 1" class="minigame" />
  </div>
</template>

<script>
import RacingView from "./minigames/racing/RacingView.vue";
import RacingControllerView from "./minigames/racing/RacingControllerView.vue";
import { context } from "../context";
import KahootView from "./minigames/kahoot/KahootView.vue";
import KahootPlayerView from "./minigames/kahoot/KahootPlayerView.vue";

export default {
  name: "MinigameView",

  data() {
    return { context, tmp: 0 };
  },
  components: { RacingView, RacingControllerView, KahootView, KahootPlayerView },
  async created() {},

  methods: {},
};
</script>

<style scoped>
h1 {
  color: #cfc6c6;
  font-family: "Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif;
  font-size: 3rem;
}

.container {
  box-sizing: border-box;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(90deg, #fdbb2d 0%, #3a1c71 100%);
  display: flex;
  flex-direction: column;
  padding: 5rem;
  gap: 1rem;
}

.client-container {
  box-sizing: border-box;
  width: 100vw;
  height: 100vh;
  display: flex;
}

.title-bar {
  padding: 2rem;
  margin: 0;
  text-align: start;
  background: linear-gradient(90deg, #4b6bb744 0%, #1828485f 100%);
}
.title-bar h1 {
  margin: 0;
}

.body-container {
  flex-grow: 1;
  min-height: 0;
  display: flex;
  gap: 2rem;
  justify-content: center;
}

.scoreboard-container {
  background: linear-gradient(90deg, #4b6bb744 0%, #1828485f 100%);
  min-width: 10rem;
}
.minigame-container {
  background: linear-gradient(90deg, #4b6bb744 0%, #1828485f 100%);
  flex-grow: 1;
}
.minigame {
  width: 100%;
  height: 100%;
}
</style>
