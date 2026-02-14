<template>
  <button class="pixel-btn" :class="[color, size]" :disabled="disabled" @click="$emit('click')">
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ color?: string; size?: string; disabled?: boolean }>(), {
  color: "blue",
  size: "medium",
  disabled: false,
});
defineEmits(["click"]);

//export default {
//  props: {
//    color: { type: String, default: "blue" },
//    size: { type: String, default: "medium" },
//    disabled: { type: Boolean, default: false },
//  },
//  emits: ["click"],
//};
</script>

<style scoped>
.pixel-btn {
  font-family: "Jersey 25", Helvetica, Arial, sans-serif;
  font-size: 2rem;
  padding: 1rem 2rem;
  cursor: pointer;
  text-transform: uppercase;

  /* removes smoothing */
  image-rendering: pixelated;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;

  /* pixel box */
  border: 0;
  position: relative;
  color: white;
  box-shadow:
    /* pixel black outline */
    -4px 0 0 0 #000,
    4px 0 0 0 #000,
    0 -4px 0 0 #000,
    0 4px 0 0 #000,
    /* extra corner pixels */ -4px -4px 0 0 #000,
    4px -4px 0 0 #000,
    -4px 4px 0 0 #000,
    4px 4px 0 0 #000,
    /* drop shadow */ 4px 6px 0 0 #000;
}

/* COLORS — pure flat pixel palette */
.blue {
  background: #61b4ff;
}
.pink {
  background: #ff7bbf;
}
.yellow {
  background: #ffcf67;
}
.purple {
  background: #b48cff;
}
.green {
  background: #8cff8c;
}
.red {
  background: #ff8c8c;
}

.small {
  font-size: 1rem;
  padding: 0.5rem 1rem;
}
.medium {
  font-size: 2rem;
  padding: 1rem 2rem;
}

.large {
  font-size: 4rem;
  padding: 1rem 2rem;
}

/* pixel highlight bars */
.pixel-btn::before {
  content: "";
  position: absolute;
  top: 0.3rem;
  left: 0.3rem;
  width: 60%;
  height: 0.3rem;
  background: rgba(255, 255, 255, 0.8);
  image-rendering: pixelated;
}

.pixel-btn.small::before {
  position: absolute;
  top: 0.2rem;
  left: 0.2rem;
  width: 60%;
  height: 0.1rem;
  background: rgba(255, 255, 255, 0.8);
  image-rendering: pixelated;
}

/* press effect */
.pixel-btn:active:not([disabled]) {
  top: 2px;
  box-shadow:
    -4px 0 0 0 #000,
    4px 0 0 0 #000,
    0 -4px 0 0 #000,
    0 4px 0 0 #000,
    -4px -4px 0 0 #000,
    4px -4px 0 0 #000,
    -4px 4px 0 0 #000,
    4px 4px 0 0 #000,
    4px 4px 0 0 #000;
}

.pixel-btn:disabled {
  cursor: auto;
  opacity: 0.6;
  filter: grayscale(60%);
}
</style>
