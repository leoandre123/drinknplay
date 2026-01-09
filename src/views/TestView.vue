<template>
  <div class="slot-container">
    <NewRetroContainer>
      <SlotMachine
        :symbols="availableGames.map((x) => x.symbol)"
        text="Waiting for minigame selection"
        ref="slot"
      />
      <button @click="$refs.slot.spin()">SPIN</button>
    </NewRetroContainer>
  </div>
</template>

<script>
import NewRetroContainer from "../components/NewRetroContainer.vue";
import RetroText from "../components/RetroText.vue";
import SlotMachine from "../components/SlotMachine.vue";

const availableGames = [
  { name: "Racing game", symbol: "🚗" },
  { name: "Questions game", symbol: "❓" },
  { name: "Drink", symbol: "🍻" },
  { name: "Draw and rate", symbol: "✍️" },
];

export default {
  name: "TestView",
  components: { NewRetroContainer, SlotMachine, RetroText },
  data: function () {
    return { availableGames };
  },
};
</script>

<style scoped>
.slot-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  gap: 1rem;
}
</style>
