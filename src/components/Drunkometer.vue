<template>
  <svg viewBox="0 0 100 50" fill="none" class="view-box-drunkometer">
    <path :d="`M 15 50 A25 25 0 1 1 85 50`" stroke="orange" stroke-width="30" />
    <path :d="`M 15 50 A25 25 0 1 1 85 50`" stroke="green" stroke-width="30" stroke-dasharray="22 1000" />
    <path :d="`M 15 50 A25 25 0 1 1 85 50`" stroke="red" stroke-width="30" stroke-dasharray="22 88"
      stroke-dashoffset="22" />
    <path v-for="(l, i) in levels" :d="`M ${50 + Math.cos(l.start) * 35} ${50 + Math.sin(l.start) * 35}
      A 35 35 0 0 1 ${50 + Math.cos(l.end) * 35} ${50 + Math.sin(l.end) * 35}`" :stroke="l.color" stroke-width="30" />

    <path :d="`M 45 50 A5 5 0 1 1 55 50`" stroke="white" stroke-width="10" />

    <path v-for="lineAngle in majorLines" :d="`M ${50 + Math.cos(lineAngle) * 40} ${50 + Math.sin(lineAngle) * 40}, L ${50 + Math.cos(lineAngle) * 50
      } ${50 + Math.sin(lineAngle) * 50}`" stroke="black" stroke-width="2" />
    <path v-for="lineAngle in minorLines" :d="`M ${50 + Math.cos(lineAngle) * 45} ${50 + Math.sin(lineAngle) * 45}, L ${50 + Math.cos(lineAngle) * 50
      } ${50 + Math.sin(lineAngle) * 50}`" stroke="black" stroke-width="1" />
    <path :d="`M ${50 + Math.cos(angle) * 10} ${50 + Math.sin(angle) * 10}, L ${50 + Math.cos(angle) * 45
      } ${50 + Math.sin(angle) * 45}`" stroke="#222" stroke-width="5" />
  </svg>
</template>

<script>
export default {
  name: "Drunkometer",
  props: {
    level: Number,
  },

  computed: {
    levels() {
      return Array.from({ length: 4 }, (_, i) => {
        return {
          start: Math.PI + (i / 4) * Math.PI,
          end: Math.PI + ((i + 1) / 4) * Math.PI,
          color: ["green", "yellow", "orange", "red"][i],
        };
      });
      return Array.from({ length: 4 }, (_, i) => {
        return {
          start: (Math.PI * 25 * i) / 4,
          end: (Math.PI * 25 * (i + 1)) / 4,
        };
      });
    },
    path() { },
    angle() {
      return Math.PI + (this.level / 5) * Math.PI;
    },
    majorLines() {
      return Array.from({ length: 6 }, (_, i) => Math.PI + (i / 5) * Math.PI);
    },
    minorLines() {
      return Array.from({ length: 26 }, (_, i) => Math.PI + (i / 25) * Math.PI);
    },
  },
};
</script>

<style scoped>
.view-box-drunkometer{
  overflow: hidden;
}

svg{
  display: block;
}

</style>
