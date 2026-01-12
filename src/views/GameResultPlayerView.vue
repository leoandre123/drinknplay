<template>
  <div class="player-results">
    <h1>RESULTS</h1>
    <h3>Drinking credits left: {{ creditsLeft }}</h3>
    <div class="player-selection-list">
      <div class="player-selection" v-for="(player, i) in context.state.players">
        <p>{{ player.name }}</p>
        <div class="flex-expander"></div>
        <div class="spinner">
          <p class="spinner-button" @click="() => changeCredits(player.id, -1)">-</p>
          <p class="spinner-display">{{ creditsGiven.get(player.id) ?? 0 }}</p>
          <p class="spinner-button" @click="() => changeCredits(player.id, 1)">+</p>
        </div>
      </div>
    </div>
    <div class="flex-expander"></div>
    <RetroButton color="green" :disabled="isConfirmed || creditsLeft != 0" @click="confirmPoints">
      {{ isConfirmed ? "Waiting..." : creditsLeft == 0 ? "Confirm" : "Use all credits" }}
    </RetroButton>
  </div>
</template>

<script>
import RetroButton from "@/components/RetroButton.vue";
import { context } from "../context";
import { socket } from "../socket";

export default {
  name: "PlayerResultView",
  components: { RetroButton },
  data() {
    return {
      context,
      drinkingCredits: 0,
      isConfirmed: false,
      creditsLeft: 0,
      creditsGiven: new Map(),
    };
  },
  mounted() {
    this.drinkingCredits = context.getCurrentPlayer()?.credits ?? 8;
    this.creditsLeft = this.drinkingCredits;

    socket.on("results:creditsConfirmed", () => (this.isConfirmed = true));
  },
  beforeUnmount() {},
  methods: {
    confirmPoints() {
      if (this.isConfirmed) {
        return;
      }

      const credits = [...this.creditsGiven].map(([key, value]) => ({
        playerId: key,
        credits: value,
      }));
      socket.emit("results:confirmCredits", credits);
    },
    changeCredits(playerId, delta) {
      if (this.isConfirmed) {
        return;
      }
      const current = this.creditsGiven.get(playerId) ?? 0;

      if (this.creditsLeft - delta < 0) return;
      if (current + delta < 0) return;

      this.creditsGiven.set(playerId, current + delta);
      this.creditsLeft =
        this.drinkingCredits - [...this.creditsGiven.values()].reduce((a, b) => a + b, 0);
    },
  },
};
</script>

<style scoped>
.player-results {
  background: linear-gradient(90deg, rgb(76, 23, 112) 0%, rgb(11, 8, 19) 87%);
  width: 100dvw;
  height: 100dvh;
  color: beige;
  padding: 1rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 5rem;
}

.player-selection-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background-color: #bb13fe41;
  overflow: auto;
  border-radius: 0.5rem;
  scrollbar-color: #bb13fe41 transparent;
}

.player-selection {
  background: #ff0d86;
  color: white;
  font-size: 2rem;
  padding: 1rem;
  border-radius: 0.25rem;
  display: flex;
}

.player-selection p {
  margin: 0;
}

.flex-expander {
  flex-grow: 1;
}

.spinner {
  display: flex;
  gap: 0.25rem;
}
.spinner-button {
  background-color: rgba(160, 47, 47, 0.422);
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  cursor: pointer;
}
.spinner-display {
  width: 2rem;
}
.spinner-button:active {
  transform: scale(1.15);
}

.done-button {
  border-radius: 0.25rem;
  border: none;
  font-family: inherit;
  padding: 1rem;
  font-size: 2rem;
  color: beige;
  background-color: rgb(124, 184, 64);
  cursor: pointer;
}

.done-button:disabled {
  background-color: rgb(41, 45, 37);
}
</style>
