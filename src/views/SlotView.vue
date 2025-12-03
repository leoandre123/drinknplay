<template>
  <div v-if="context.isHost" class="slot-container">
    <SlotMachine
      ref="slotRef"
      :symbols="availableGames.map((x) => x.symbol)"
      :text="text"
      @spin-finished="onSpinFinished"
    />
    <button @click="spinWheel" :disabled="!context.isHost">Spin</button>
    <button @click="advance" :disabled="!context.isHost">Advance</button>
  </div>
  <div v-if="!context.isHost">Look at the screen</div>
</template>

<script>
import SlotMachine from "../components/SlotMachine.vue";
import { socket } from "../socket";
import { context } from "../context";

const availableGames = [
  { name: "Racing game", symbol: "🚗" },
  { name: "Questions game", symbol: "❓" },
  { name: "Drink", symbol: "🍻" },
  { name: "Draw and rate", symbol: "✍️" },
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
  components: { SlotMachine },
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
}
</style>
