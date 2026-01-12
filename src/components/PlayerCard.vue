<template>
  <div class="player-card">
    <p class="player-name">{{ player.name }}</p>
    <p class="player-score">Score: {{ score }}</p>
    <div class="drinking-glass">
      <DrinkingGlass :level="glassLevel" />
    </div>
    <div class="drunkometer">
      <Drunkometer :level="drunkness" />
    </div>
    <div class="place" :class="`place-${place}`">
      <p>{{ place + 1 }}</p>
    </div>
  </div>
</template>

<script>
import DrinkingGlass from "./DrinkingGlass.vue";
import Drunkometer from "./Drunkometer.vue";
export default {
  components: { DrinkingGlass, Drunkometer },
  props: {
    player: Object,
    score: Number,
    place: Number,
    drunkness: Number,
    glassLevel: Number,
  },
  data: function () {
    return {};
  },
};
</script>

<style scoped>
p {
  margin: 0;
}

.player-card {
  position: relative;
  display: flex;
  flex-direction: column;
  max-height: 60vh;
  border: 3px, groove, var(--Caribbean_Green);
  background-color: var(--French_Rose);
  border-radius: 10px;
  aspect-ratio: 3/4;
  place-items: center;
  margin: 0;
  gap: 1rem;
  box-shadow: var(--Neon_Glow);
}

.player-name {
  font-size: 3rem;
  color: var(--Metallic_Yellow);
  text-shadow: 0.2rem 0.2rem black;
  border-bottom: 0.15rem solid var(--Metallic_Yellow);
  width: 70%;
}

.player-score {
  font-size: 2.5rem;
  color: var(--Metallic_Yellow);
  text-shadow: 0.2rem 0.2rem black;
}

.drinking-glass {
  aspect-ratio: 1;
  flex-grow: 1;
}

.drunkometer {
  aspect-ratio: 2/1;
  flex-grow: 1;
  max-width: 80%;
  align-content: end;
}

.drunkometer-title {
  font-size: 2rem;
  font-family: "Science Gothic", sans-serif;
  color: var(--Metallic_Yellow);
  border: in;
}

.place {
  position: absolute;
  right: -2rem;
  top: -2rem;
  background: #222;
  color: white;
  font-weight: bold;
  font-size: 2rem;
  border-radius: 50%;
  width: 4rem;
  height: 4rem;
  place-content: center;
  place-items: center;
  justify-items: center;
  border: 0.5px, groove, var(--Caribbean_Green);
  box-shadow: 0 0 0.2rem #fff, 0 0 0.2rem #fff, 0 0 1rem var(--Caribbean_Green),
    0 0 0.8rem var(--Caribbean_Green), 0 0 1.8rem var(--Caribbean_Green),
    inset 0 0 1.3rem var(--Caribbean_Green);
}

.place-0 {
  background-color: gold;
}
.place-1 {
  background-color: silver;
}
.place-2 {
  background-color: brown;
}
</style>
