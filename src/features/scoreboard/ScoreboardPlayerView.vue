<template>
  <div class="results">
    <div class="flex-expander"></div>
    <div v-if="context.getCurrentPlayer().glassesToDrink">
      <h1>
        {{ $t("common.drinkText") }}
        <span class="highlight">{{ context.getCurrentPlayer().glassesToDrink }}</span>
        {{ $t("common.glass") }}
      </h1>
      <h3>{{ $t("common.drinkConfirmation") }}</h3>
    </div>
    <div v-else>
      <h3>{{ $t("common.waitingForHost") }}</h3>
    </div>
    <div class="flex-expander"></div>
    <RetroButton
      v-if="context.getCurrentPlayer().glassesToDrink"
      color="green"
      @click="confirm"
      :disabled="drinkConfirmed"
      >{{ drinkConfirmed ? "Väntar.." : "Bekräfta" }}</RetroButton
    >
  </div>
</template>

<script>
import { context } from "../../context";
import { socket } from "../../socket";
import RetroButton from "@/shared/components/UI/RetroButton.vue";

export default {
  name: "ScoreboardPlayerView",
  components: { RetroButton },

  data: function () {
    return {
      context,
      drinkConfirmed: false,
    };
  },
  mounted() {
    socket.on("scoreboard:glassesToDrink", (glasses) => (this.glassesToDrink = glasses));
  },
  beforeUnmount() {
    socket.off("scoreboard:glassesToDrink");
  },
  methods: {
    confirm() {
      socket.emit("scoredboard:confirmDrink");
      this.drinkConfirmed = true;
    },
  },
};
</script>

<style scoped>
.results {
  width: 100dvw;
  height: 100dvh;
  overflow: hidden;
  position: relative;
  padding: 2rem;
  box-sizing: border-box;
  background: linear-gradient(90deg, #44195f 0%, #0a0d36 100%);
  display: flex;
  flex-direction: column;
  gap: 3rem;
  align-items: center;
  background-repeat: repeat;
  color: white;
}

h1 {
  text-shadow: 0 0 1rem black;
}

.highlight {
  color: magenta;
  text-shadow:
    0.1rem 0.1rem red,
    0.2rem 0.2rem blue;
}
</style>
