<template>
  <div class="grid" :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)` }">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ cols: number }>(), {});
</script>

<style scoped>
.grid {
  display: grid;
}
</style>
