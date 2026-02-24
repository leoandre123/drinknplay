<template>
  <div>
    <div class="retro-container">
      <svg viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="background" x1="0" x2="0" y1="0" y2="1">
            <stop stop-color="#010310" offset="0% " />
            <stop stop-color="#0c1142" offset="37%" />
            <stop stop-color="#45125e" offset="69%" />
            <stop stop-color="#d53567" offset="92%" />
            <stop stop-color="#f0c3d9" offset="100%" />
            <stop stop-color="#0c1142" offset="100%" />
          </linearGradient>
          <linearGradient id="sunGradient" x1="0" x2="0" y1="0" y2="1">
            <stop stop-color="red" offset="0%" />
            <stop stop-color="yellow" offset="100%" />
          </linearGradient>
          <clipPath id="sunClip">
            <rect x="0" y="0%" width="100%" height="50%" />
            <rect x="0" y="51.5%" width="100%" height="1.8%" />
            <rect x="0" y="54.4%" width="100%" height="1.1%" />
            <rect x="0" y="56%" width="100%" height="0.7%" />
            <rect x="0" y="57.1%" width="100%" height="0.7%" />
            <rect x="0" y="58.2%" width="100%" height="0.7%" />
            <rect x="0" y="59.1%" width="100%" height="40%" />
          </clipPath>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="rgba(255, 128, 0, 0.7)" />
          </filter>
        </defs>

        <rect x="0" y="65" width="100%" height="35" fill="#0c1142" />
        <path v-for="(x, i) in 100" :d="horizontalLine(i)" stroke="#3f186c" stroke-width="0.2" />
        <path
          v-for="(x, i) in 100"
          :d="`M${100 + 2 * (i - 50)} 65 L${100 + 8 * (i - 50)} 100`"
          stroke="#3f186c"
          stroke-width="0.2"
        />
        <rect x="0" y="0" width="100%" height="65" fill="url(#background)" />

        <circle
          v-for="star in stars"
          :cx="star.x"
          :cy="star.y"
          r="0.2"
          fill="white"
          opacity="0.5"
        />

        <circle
          clip-path="url(#sunClip)"
          cx="50%"
          cy="50%"
          r="6.5%"
          fill="url(#sunGradient)"
          filter="url(#shadow)"
        />

        <path v-for="mountain in mountains" :d="mountain.path" :fill="mountain.color" />
        <path
          v-for="x in 300"
          :d="`M0 ${x / 3} L200 ${x / 3}`"
          stroke="black"
          opacity="0.5"
          stroke-width="0.1"
        />
      </svg>
    </div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

const gridOffset = ref(0);

onMounted(() => {
  const anim = () => {
    gridOffset.value = (gridOffset.value - 0.05) % 1;
    requestAnimationFrame(anim);
  };

  requestAnimationFrame(anim);
});

function horizontalLine(i: number) {
  const horizon = 60;
  const gridHeight = 100 - horizon;
  const spacing = 20;

  const verticalFov = Math.PI / 3;

  const z = 0 + (i + gridOffset.value) * spacing;
  const h = 100;

  const theta = Math.PI / 2 - Math.atan(z / h);

  const percentage = theta / verticalFov;

  return `M0 ${horizon + (100 - gridHeight) * percentage} L200 ${
    horizon + (100 - gridHeight) * percentage
  }`;
}

const mountains = computed(() => {
  const purples = ["#150030", "#2a025d", "#681e6b", "#b533b3"];

  const mountains = [
    {
      top: "80 45",
      bases: ["60", "75", "90", "95"],
      colors: [purples[1], purples[2], purples[3]],
    },
    { top: "35 55", bases: ["25", "35", "45"], colors: [purples[2], purples[3]] },
    {
      top: "65 45",
      bases: ["45", "55", "75", "80"],
      colors: [purples[0], purples[1], purples[2]],
    },
    { top: "135 55", bases: ["120", "140", "160"], colors: [purples[2], purples[3]] },
    { top: "150 58", bases: ["140", "150", "160"], colors: [purples[2], purples[3]] },
    {
      top: "115 55",
      bases: ["90", "105", "125", "140"],
      colors: [purples[2], purples[1], purples[0]],
    },
  ];

  const result = [];

  for (const m of mountains) {
    for (let i = 0; i < m.bases.length - 1; i++) {
      result.push({
        path: `M${m.bases[i]} 65 L${m.top} L${m.bases[i + 1]} 65 Z`,
        color: m.colors[i],
      });
    }
  }

  return result;
});

const stars = computed(() => {
  return Array.from({ length: 50 }, (_, i) => {
    return {
      x: Math.random() * 200,
      y: Math.random() * 60,
    };
  });
});
</script>

<style scoped>
.retro-container {
  overflow: hidden;
  position: fixed;
  left: 0;
  top: 0;
  width: 100dvw;
  height: 100dvh;
  z-index: -2;
}
svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100dvw;
  height: 100dvh;
  z-index: -100;
}
</style>
