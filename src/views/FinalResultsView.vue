<template>
  <div class="results">
    <template v-if="context.isHost">
      <h1 class="title">{{ $t("results.final_results") }}</h1>
      <div class="player-cards" :style="playerGridStyle">
        <PlayerCard
          v-for="(player, i) in sortedPlayers"
          :key="player.id"
          :player="player"
          :place="i"
          :score="player.score"
          :glassLevel="player.glassLevel"
          :drunkness="player.drunkness"
        />
      </div>
    </template>
    <RetroButton @click="finishGame">{{ $t("results.finish_game") }}</RetroButton>
  </div>
</template>

<script>
import { context } from "@/context";
import PlayerCard from "@/shared/components/PlayerCard.vue";
import RetroButton from "@/shared/components/UI/RetroButton.vue";

export default {
  name: "FinalResultsView",
  components: { PlayerCard, RetroButton },

  data: function () {
    return {
      context,
    };
  },
  created: function () {},
  methods: {
    finishGame() {
      this.$router.push({
        path: "/",
      });
    },
  },
  computed: {
    sortedPlayers() {
      return [...this.context.state.players].sort((a, b) => b.score - a.score);
    },
    playerScores() {
      return this.context.state.players.map((p) => p.score);
    },
    playerGridStyle() {
      return {
        gridTemplateColumns: `repeat(${Math.min(this.sortedPlayers.length, 5)}, 1fr)`,
      };
    },
  },
};
</script>

<style scoped>
.results {
  width: 100dvw;
  min-height: 100dvh;
  position: relative;
  background: linear-gradient(90deg, #44195f 0%, #0a0d36 100%);
  display: flex;
  flex-direction: column;
  gap: 3rem;
  padding: 3rem;
  align-items: center;
  background-repeat: repeat;
  box-sizing: border-box;
}

.title {
  font-size: 5rem;
}

.player-cards {
  width: 80%;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 3rem;
  justify-content: center;
  margin-top: 2rem;
}
</style>
