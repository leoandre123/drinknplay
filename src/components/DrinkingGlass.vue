<template>
  <svg viewBox="0 0 100 100" fill="none" stroke="black" stroke-width="4">
    <path v-if="level" :d="topFillPath" fill="#b0762a" stroke="none" />
    <path v-if="level" :d="fillPath" fill="#eda240" stroke="none" />

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
      {{ Math.round(level * 100) }}%
    </text>
  </svg>
</template>

<script>
export default {
  name: "DrinkingGlass",
  props: {
    level: Number,
  },
  data() {
    return {
      glassHeight: 60,
      glassWidthBottom: 45,
      glassWidthTop: 60,
    };
  },
  computed: {
    glassPath() {
      return `M${this.topLeft.x} ${this.topLeft.y} L${this.bottomLeft.x} ${this.bottomLeft.y} A15 5 0 0 0 ${this.bottomRight.x} ${this.bottomRight.y} L${this.topRight.x} ${this.topRight.y}`;
    },
    glassPath2() {
      const p0 = lerp(this.bottomLeft, this.topLeft, -0.15);
      const p1 = lerp(this.bottomRight, this.topRight, -0.15);
      return `
      M${this.bottomLeft.x} ${this.bottomLeft.y}
      L${p0.x} ${p0.y}
      A15 5 0 0 0 ${p1.x} ${p1.y}
      L${this.bottomRight.x} ${this.bottomRight.y}`;
    },
    fillPath() {
      const fillTopLeft = lerp(this.bottomLeft, this.topLeft, Math.min(this.level, 1) * 0.8);
      const fillTopRight = lerp(this.bottomRight, this.topRight, Math.min(this.level, 1) * 0.8);
      const width = Math.abs(fillTopRight.x - fillTopLeft.x) / 2;

      return `M${fillTopLeft.x} ${fillTopLeft.y} L${this.bottomLeft.x} ${this.bottomLeft.y}
      A15 5 0 0 0 ${this.bottomRight.x} ${this.bottomRight.y} L${fillTopRight.x} ${fillTopRight.y}
      A${width} 5 0 0 1 ${fillTopLeft.x} ${fillTopLeft.y}`;
    },
    topFillPath() {
      const fillTopLeft = lerp(this.bottomLeft, this.topLeft, Math.min(this.level, 1) * 0.8);
      const fillTopRight = lerp(this.bottomRight, this.topRight, Math.min(this.level, 1) * 0.8);
      const width = Math.abs(fillTopRight.x - fillTopLeft.x) / 2;

      return `M${fillTopLeft.x} ${fillTopLeft.y} A${width} 5 0 0 1 ${fillTopRight.x} ${fillTopRight.y} A${width} 5 0 0 1 ${fillTopLeft.x} ${fillTopLeft.y}`;
    },
    topLeft() {
      return {
        x: 50 - this.glassWidthTop / 2,
        y: 50 - this.glassHeight / 2,
      };
    },
    topRight() {
      return {
        x: 50 + this.glassWidthTop / 2,
        y: 50 - this.glassHeight / 2,
      };
    },
    bottomLeft() {
      return {
        x: 50 - this.glassWidthBottom / 2,
        y: 50 + this.glassHeight / 2,
      };
    },
    bottomRight() {
      return {
        x: 50 + this.glassWidthBottom / 2,
        y: 50 + this.glassHeight / 2,
      };
    },
  },
};

function lerp(p0, p1, t) {
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
