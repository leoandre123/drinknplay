<template>
  <div class="player-results">
    <template v-if="!isWinner">
      <h1>Waiting for host...</h1>
    </template>
    <template v-if="isWinner">
      <h1 class="glow">{{ $t("results.winner") }}</h1>
      <h1>You got the most points</h1>
      <h3>Whos glass do you want to fill?</h3>
      <div class="player-selection-list">
        <button
          class="player-selection"
          :disabled="selectedPlayerIndex != -1"
          :class="{ notselected: i != selectedPlayerIndex && selectedPlayerIndex != -1 }"
          v-for="(player, i) in 10"
          @click="() => selectPlayer(i, player.id)"
        >
          <p>{{ player.name }}</p>
        </button>
      </div>
    </template>
  </div>
</template>

<script>
import { context } from "../context";

export default {
  name: "PlayerResultView",
  data() {
    return {
      context,
      selectedPlayerIndex: -1,
      isWinner: true,
      orientation: screen.orientation.type,
    };
  },
  mounted() {},
  beforeUnmount() {},
  methods: {
    selectPlayer(index, playerId) {
      this.selectedPlayerIndex = index;
    },
  },
};
</script>

<style scoped>
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

.player-results {
  background: linear-gradient(90deg, rgb(76, 23, 112) 0%, rgb(11, 8, 19) 87%);
  width: 100dvw;
  height: 100dvh;
  color: beige;
  padding: 1rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.player-selection-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  padding: 1rem;
  background-color: #bb13fe41;
  overflow: scroll;
}

.player-selection {
  background: #ff0d86;
  color: white;
  aspect-ratio: 1;
  font-size: 2rem;
  border: 0.5rem outset #b20b5f;
  align-content: center;
  overflow-wrap: anywhere;
}
.player-selection:active {
  border-style: inset;
}
.notselected {
  background: #3b0621;
  border: 0.5rem inset #640d39;
}
</style>
