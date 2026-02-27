<template>
  <div class="pixel-wrapper">
    <input class="pixel-btn" v-model="model" :class="[color, size]" :disabled="disabled" :type="type" :placeholder="placeholder" @click="$emit('click')">
    </input>
  </div>
</template>

<script setup lang="ts">
import type { InputTypeHTMLAttribute } from 'vue';

const model = defineModel()

withDefaults(defineProps<{ color?: string; size?: string; disabled?: boolean, type?: InputTypeHTMLAttribute, placeholder?: string}>(), {
  color: "blue",
  size: "medium",
  disabled: false,
  type: "text"
});
defineEmits(["click"]);
</script>

<style scoped>
.pixel-wrapper {
  display: inline-block;
  padding: 4px; /* matches your pixel border */
}
input:focus{
    outline: none;
}
.pixel-btn {
  font-family: "Jersey 25", Helvetica, Arial, sans-serif;
  font-size: 2rem;
  padding: 1rem 2rem;
  

      box-sizing: border-box;
  width: 100%;
  height: 100%;

  /* removes smoothing */
  image-rendering: pixelated;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;

  background: #fcffe6;
  color: black;

  /* pixel box */
  border: 0;
  position: relative;
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

.pixel-btn:disabled {
  cursor: auto;
  opacity: 0.6;
  filter: grayscale(60%);
}
</style>
