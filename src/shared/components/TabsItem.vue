<template>
  <div class="tab-content">
    <slot></slot>
  </div>
</template>
<script setup lang="ts">
defineProps<{ title: string }>();
</script>
<style scoped>
.tab-content {
  width: 100%;
  height: 100%;
}
</style>
