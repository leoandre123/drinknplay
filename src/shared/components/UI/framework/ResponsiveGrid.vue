<template>
  <div class="grid" :style="{ '--min': minWidth }">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ minWidth: string; gap?: string }>(), {
  gap: "12px",
});
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--min), 1fr));
  gap: v-bind(gap);
  align-items: start;
}
</style>
