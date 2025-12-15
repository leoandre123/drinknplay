<template>
  <div v-if="context.isHost" class="container">
    <div class="title-bar">
      <h1 v-if="context.state.gameIndex == 0">2.5D Racer</h1>
      <h1 v-if="context.state.gameIndex == 1">Questions game</h1>
    </div>
    <div class="body-container">
      <div class="scoreboard-container">
        <p v-for="player in context.state.players">{{ player.name }}</p>
      </div>
      <div class="minigame-container">
        <RacingView v-if="context.state.gameIndex == 0" class="minigame" />
        <KahootView v-if="context.state.gameIndex == 1" class="minigame" />
        <HostDrawingView v-if="context.state.gameIndex == 2" class="minigame" />
      </div>
    </div>
  </div>
  <div v-if="!context.isHost" class="client-container">
    <RacingControllerView v-if="context.state.gameIndex == 0" class="minigame" />
    <KahootPlayerView v-if="context.state.gameIndex == 1" class="minigame" />
    <PlayerDrawingView v-if="context.state.gameIndex == 2" class="minigame" />
  </div>
</template>

<script>
import RacingView from "./minigames/racing/RacingView.vue";
import RacingControllerView from "./minigames/racing/RacingControllerView.vue";
import { context } from "../context";
import KahootView from "./minigames/kahoot/KahootView.vue";
import KahootPlayerView from "./minigames/kahoot/KahootPlayerView.vue";
import HostDrawingView from "./minigames/drawing/HostDrawingView.vue";
import PlayerDrawingView from "./minigames/drawing/PlayerDrawingView.vue";

export default {
  name: "MinigameView",

  data() {
    return { context };
  },
  components: {
    RacingView,
    RacingControllerView,
    KahootView,
    KahootPlayerView,
    HostDrawingView,
    PlayerDrawingView,
  },
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
  background: linear-gradient(to right top, #782c64, #633260, #513558, #42364c, #37343e);
  display: flex;
  flex-direction: column;
  padding: 5rem;
  gap: 1rem;
}

.client-container {
  box-sizing: border-box;
  width: 100dvw;
  height: 100dvh;
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
