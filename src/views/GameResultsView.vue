<template>
  <div class="game-results-container">
    <h1>RESULTS</h1>
    <div class="player-list">
      <div v-for="(player, i) in context?.state.players" class="player">
        <p>{{ i + 1 }}</p>
        <div class="avatar">
          <Avatar :settings="player.avatarSettings" />
        </div>
        <p>{{ player.name }}</p>
        <p class="score">{{ player.score }}</p>
      </div>
    </div>
    <button class="continue-button">Continue</button>
  </div>
</template>
<script>
import Avatar from "../components/Avatar.vue";
import { context } from "../context";
import { socket } from "../socket";

export default {
  name: "GameResultsView",
  components: { Avatar },
  data() {
    return {
      context,
    };
  },
};
</script>
<style scoped>
.game-results-container {
  background: linear-gradient(90deg, #44195f 0%, #0a0d36 100%);
  width: 100dvw;
  height: 100dvh;
  padding: 5rem;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  justify-items: center;
  color: beige;
}
.player-list {
  background-color: rgba(255, 255, 255, 0.189);
  padding: 1rem;
  border-radius: 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 60%;
}

.player {
  height: 2rem;
  background-color: rgba(255, 0, 0, 0.202);
  padding: 1rem;
  border-radius: 0.25rem;
  display: flex;
  gap: 1rem;
  place-items: center;
}
.avatar {
  aspect-ratio: 1;
  height: 100%;
}
.score {
  margin-left: auto;
}
.continue-button {
  border: none;
  font-family: inherit;
  padding: 1rem;
  font-size: 2rem;
  color: beige;
  background-color: rgb(124, 184, 64);
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  cursor: pointer;
}
.continue-button:hover {
  background-color: rgb(139, 188, 90);
  transform: scale(1.05);
}
</style>
