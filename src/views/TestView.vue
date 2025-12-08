<template>
  <div class="slot-container">
    <RetroContainer>
      <SlotMachine :symbols="availableGames.map((x) => x.symbol)" text="test" />
    </RetroContainer>
  </div>
</template>

<script>
import RetroContainer from "../components/RetroContainer.vue";
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
  components: { RetroContainer, SlotMachine, RetroText },
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
  padding: 3rem;
  gap: 1rem;
}
</style>
