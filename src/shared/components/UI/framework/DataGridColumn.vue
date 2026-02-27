<script setup lang="ts">
export type DataGridColumnProps<T = any> = {
  field?: keyof T | string;
  title?: string;
  width?: number | string;
};

defineProps<DataGridColumnProps>();
</script>

<template></template>
