<template>
  <span class="material-symbols-outlined" :class="{ filled: filled }" :style="style">
    {{ icon }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  icon: string;
  size?: number | string;
  filled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  filled: false,
});

const style = computed(() => ({
  fontSize: typeof props.size === "number" ? `${props.size}px` : props.size,
}));
</script>

<style scoped>
.material-symbols-outlined {
  font-variation-settings:
    "FILL" 0,
    "wght" 400,
    "GRAD" 0,
    "opsz" 24;
  line-height: 1;
}

.material-symbols-outlined.filled {
  font-variation-settings:
    "FILL" 1,
    "wght" 400,
    "GRAD" 0,
    "opsz" 24;
}
</style>
