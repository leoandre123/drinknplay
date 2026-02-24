<template>
  <br />
  <slot></slot>
  {{ body }}
  <br />
  <br />
  <div class="button-group">
    <RetroButton size="small" color="green" @click="emit('close', true)">Confirm</RetroButton>
    <RetroButton size="small" color="red" @click="emit('close', false)">Cancel</RetroButton>
  </div>
</template>

<script setup lang="ts">
import RetroButton from "../RetroButton.vue";

defineProps<{ body?: string }>();
const emit = defineEmits(["close"]);
</script>

<style scoped>
.button-group {
  display: flex;
  gap: 1rem;
}
</style>
