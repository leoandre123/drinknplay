<template>
  <NewRetroContainer>
    <div v-if="context.isHost" class="slot-container">
      <SlotMachine
        ref="slotRef"
        :symbols="availableGames.map((x) => x.symbol)"
        :text="text"
        @spin-finished="onSpinFinished"
      />
    </div>
    <div v-if="!context.isHost">Look at the screen</div>
  </NewRetroContainer>
</template>

<script>
import SlotMachine from "../components/SlotMachine.vue";
import { socket } from "../socket";
import { context } from "../context";
import NewRetroContainer from "../components/NewRetroContainer.vue";
import { audioManager } from "@/AudioManager";

const availableGames = [
  { name: "Drink n' Drive", symbol: "🚗" },
  { name: "Drink n' Answer", symbol: "❓" },
  { name: "Drink n' Draw", symbol: "✍️" },
  { name: "Drink n' React", symbol: "⏰" },
  { name: "Drink n' Find", symbol: "📍" },
  { name: "Drink n' Maze", symbol: "🗺️" },
];

export default {
  name: "SlotView",

  data() {
    return {
      context,
      availableGames,
      text: "Spin",
    };
  },
  components: { SlotMachine, NewRetroContainer },
  mounted() {
    socket.on("startSpin", this.onStartSpin);
  },
  beforeUnmount() {
    socket.off("startSpin", this.onStartSpin);
  },
  methods: {
    spinWheel() {
      socket.emit("startSpin");
    },
    advance() {
      socket.emit("advancePhase");
    },
    onStartSpin(symbolIndex) {
      console.log(`Spinning to ${symbolIndex}`);
      this.text = "Spinning...";
      this.$refs.slotRef.spin(symbolIndex % this.availableGames.length);
      audioManager.play("/sounds/slot.mp3");
    },
    onSpinFinished(symbolIndex) {
      console.log(`Spinning finished on ${symbolIndex}`);
      this.text = `${availableGames[symbolIndex].name}!!!!`;
    },
  },
};
</script>

<style scoped>
.slot-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
}
</style>
