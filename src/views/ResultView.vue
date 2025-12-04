<template>
  <div>Results</div>
  <Drunkometer :level="drunkess" />
  <DrinkingGlass :level="drunkess" />
  <input type="range" min="0" step="0.01" max="5" v-model="drunkess" />
</template>

<script>
import DrinkingGlass from "../components/DrinkingGlass.vue";
import Drunkometer from "../components/Drunkometer.vue";
export default {
  name: "ResultView",
  components: { Drunkometer, DrinkingGlass },
  data: function () {
    return {
      drunkess: 0,
    };
  },
  created: function () {},
};
</script>
