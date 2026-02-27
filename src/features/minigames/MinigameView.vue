<template>
  <div class="fullscreen">
    <div v-if="context.isHost" class="minigame-container">
      <RacingView v-if="context.state.gameIndex == 0" class="minigame" />
      <KahootView v-if="context.state.gameIndex == 1" class="minigame" />
      <HostDrawingView v-if="context.state.gameIndex == 2" class="minigame" />
      <ReactionGame v-if="context.state.gameIndex == 3" class="minigame" />
      <ClosestView v-if="context.state.gameIndex == 4" class="minigame" />
      <HostMazeGameView v-if="context.state.gameIndex == 5" class="minigame" />
      <RouletteView v-if="context.state.gameIndex == 6" class="minigame" />
    </div>
    <div v-if="!context.isHost" class="client-container">
      <RacingControllerView v-if="context.state.gameIndex == 0" class="minigame" />
      <KahootPlayerView v-if="context.state.gameIndex == 1" class="minigame" />
      <PlayerDrawingView v-if="context.state.gameIndex == 2" class="minigame" />
      <ReactionGamePlayerView v-if="context.state.gameIndex == 3" class="minigame" />
      <ClosestPlayerView v-if="context.state.gameIndex == 4" class="minigame" />
      <PlayerMazeGameView v-if="context.state.gameIndex == 5" class="minigame" />
      <RoulettePlayerView v-if="context.state.gameIndex == 6" class="minigame" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { context } from "@/context";
import RacingView from "./racing/RacingView.vue";
import KahootView from "./kahoot/KahootView.vue";
import HostDrawingView from "./drawing/HostDrawingView.vue";
import ReactionGame from "./reaction/ReactionGame.vue";
import ClosestView from "./closest/ClosestView.vue";
import HostMazeGameView from "./mazegame/HostMazeGameView.vue";
import RouletteView from "./roulette/RouletteView.vue";
import RacingControllerView from "./racing/RacingControllerView.vue";
import KahootPlayerView from "./kahoot/KahootPlayerView.vue";
import PlayerDrawingView from "./drawing/PlayerDrawingView.vue";
import ReactionGamePlayerView from "./reaction/ReactionGamePlayerView.vue";
import ClosestPlayerView from "./closest/ClosestPlayerView.vue";
import PlayerMazeGameView from "./mazegame/PlayerMazeGameView.vue";
import RoulettePlayerView from "./roulette/RoulettePlayerView.vue";
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

.fullscreen {
  width: 100dvw;
  height: 100dvh;
  display: flex;
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
