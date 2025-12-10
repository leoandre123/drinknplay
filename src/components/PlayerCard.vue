<template>
  <div class="player-card">
    <p class="player-name">{{ player.name }}</p>
    <p class="player-score">Score: {{ player.score }}</p>
    <div class="drinking-glass">
      <DrinkingGlass :level="player.glasslevel" />
    </div>
    <div class="drunkometer">
      <div class="drunkometer-title">Drunkometer</div>
      <Drunkometer :level="player.drunkness" />
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
  props: { player: Object, place: Number },
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
  border: 3px, groove, var(--Caribbean_Green);
  background-color: var(--French_Rose);
  border-radius: 10px;
  height: auto;
  width: 20rem;
  place-items: center;
  margin: 0;
  gap: 1rem;
  box-shadow: 0 0 0.2rem #fff, 0 0 0.2rem #fff, 0 0 2rem var(--Caribbean_Green),
    0 0 0.8rem var(--Caribbean_Green), 0 0 2.8rem var(--Caribbean_Green),
    inset 0 0 1.3rem var(--Caribbean_Green);
}

.player-name {
  font-size: 3rem;
  font-family: "Science Gothic", sans-serif;
  color: var(--Metallic_Yellow);
  text-shadow: 3px 3px black;
  border-bottom: 1px solid var(--Metallic_Yellow);
  width: 70%;
}

.player-score {
  font-size: 3rem;
  font-family: "Honk";
  letter-spacing: 5px;
}

.drinking-glass {
  place-items: center;
  width: 10rem;
  display: block;
}

.drunkometer {
  width: 15rem;
  margin: 0px;
  padding: 0px;
  display: block;
  place-items: center;
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
