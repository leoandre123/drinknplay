<template>
  <svg viewBox="0 0 100 100" fill="none" stroke="black" stroke-width="4">
    <path v-if="level % 1" :d="topFillPath" fill="#b0762a" stroke="none" />
    <path v-if="level % 1" :d="fillPath" fill="#eda240" stroke="none" />

    <path :d="glassPath" />
    <path :d="glassPath2" />
    <ellipse cx="50" :cy="50 - glassHeight / 2" :rx="glassWidthTop / 2" ry="5" />

    <text
      x="50"
      y="50"
      text-anchor="middle"
      dominant-baseline="middle"
      stroke="none"
      font-weight="bold"
      fill="black"
    >
      {{ Math.round((level % 1) * 100) }}%
    </text>
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ level: number }>();

const glassHeight = 60;
const glassWidthBottom = 45;
const glassWidthTop = 60;

const topLeft = {
  x: 50 - glassWidthTop / 2,
  y: 50 - glassHeight / 2,
};

const topRight = {
  x: 50 + glassWidthTop / 2,
  y: 50 - glassHeight / 2,
};

const bottomLeft = {
  x: 50 - glassWidthBottom / 2,
  y: 50 + glassHeight / 2,
};

const bottomRight = {
  x: 50 + glassWidthBottom / 2,
  y: 50 + glassHeight / 2,
};

const glassPath = `M${topLeft.x} ${topLeft.y} L${bottomLeft.x} ${bottomLeft.y} A15 5 0 0 0 ${bottomRight.x} ${bottomRight.y} L${topRight.x} ${topRight.y}`;

const glassPath2 = computed(() => {
  const p0 = lerp(bottomLeft, topLeft, -0.15);
  const p1 = lerp(bottomRight, topRight, -0.15);
  return `
      M${bottomLeft.x} ${bottomLeft.y}
      L${p0.x} ${p0.y}
      A15 5 0 0 0 ${p1.x} ${p1.y}
      L${bottomRight.x} ${bottomRight.y}`;
});
const fillPath = computed(() => {
  const fillTopLeft = lerp(bottomLeft, topLeft, Math.min(props.level % 1, 1) * 0.8);
  const fillTopRight = lerp(bottomRight, topRight, Math.min(props.level % 1, 1) * 0.8);
  const width = Math.abs(fillTopRight.x - fillTopLeft.x) / 2;

  return `M${fillTopLeft.x} ${fillTopLeft.y} L${bottomLeft.x} ${bottomLeft.y}
      A15 5 0 0 0 ${bottomRight.x} ${bottomRight.y} L${fillTopRight.x} ${fillTopRight.y}
      A${width} 5 0 0 1 ${fillTopLeft.x} ${fillTopLeft.y}`;
});
const topFillPath = computed(() => {
  const fillTopLeft = lerp(bottomLeft, topLeft, Math.min(props.level % 1, 1) * 0.8);
  const fillTopRight = lerp(bottomRight, topRight, Math.min(props.level % 1, 1) * 0.8);
  const width = Math.abs(fillTopRight.x - fillTopLeft.x) / 2;

  return `M${fillTopLeft.x} ${fillTopLeft.y} A${width} 5 0 0 1 ${fillTopRight.x} ${fillTopRight.y} A${width} 5 0 0 1 ${fillTopLeft.x} ${fillTopLeft.y}`;
});

function lerp(p0: { x: number; y: number }, p1: { x: number; y: number }, t: number) {
  return {
    x: p0.x + (p1.x - p0.x) * t,
    y: p0.y + (p1.y - p0.y) * t,
  };
}
</script>

<style scoped>
svg {
  display: block;
}
</style>
