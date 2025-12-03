<template>
  <div class="background-container" :style="backgroundStyle">
    <div class="game-label">
      <p>{{ gameinfo[context.state.gameIndex].title }}</p>
    </div>
    <div class="info-box">
      <h1>TIPS!</h1>
      <p>{{ gameinfo[context.state.gameIndex].tips }}</p>
    </div>
  </div>
</template>

<script>
import { context } from "../context";
import gameinfo from "@/assets/gameinfo.json";

export default {
  name: "LoadingView",

  data() {
    return {
      gameinfo,
      context,
    };
  },
  components: {},
  async created() {},
  methods: {},
  computed: {
    backgroundStyle() {
      return {
        backgroundImage: `url(/${this.gameinfo[this.context.state.gameIndex].imageUri})`,
      };
    },
  },
};
</script>

<style scoped>
.background-container {
  box-sizing: border-box;
  position: relative;
  width: 100%;
  height: 100%;

  background-image: url("https://mario.wiki.gallery/images/thumb/3/32/MK8_Mario_Circuit.png/1200px-MK8_Mario_Circuit.png");
  background-size: cover;
}
.game-label {
  position: absolute;
  right: 0;
  top: 15%;

  background-color: rgba(42, 45, 48, 0.596);
  padding-inline: 2rem;

  color: white;
  font-family: "Audiowide", sans-serif;
  font-weight: 400;
  font-style: normal;
  font-size: xx-large;
  text-transform: uppercase;
}
.info-box {
  position: absolute;
  width: 100%;
  height: 35%;
  bottom: 0;

  background-color: rgba(42, 45, 48, 0.596);
  color: white;
  font-family: "Audiowide", sans-serif;
  font-weight: 400;
  font-style: normal;
}
</style>
