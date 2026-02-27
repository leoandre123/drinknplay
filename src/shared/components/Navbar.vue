<template>
  <div class="navbar" :class="{ expanded }">
    <div class="title">
      <div v-if="expanded">{{ title }}</div>
      <div class="flex-expander"></div>
      <div class="hamburger" @click="expanded = !expanded"><Icon icon="menu" /></div>
    </div>
    <slot></slot>
  </div>
</template>
<script setup lang="ts">
import { provide, ref } from "vue";
import Icon from "@/shared/components/Icon.vue";

defineProps<{ title?: string }>();

const expanded = ref(false);
provide("admin-navbar-expanded", expanded);
</script>
<style scoped>
.navbar {
  display: flex;
  flex-direction: column;
  background-color: #191836;
  border-radius: 0.25rem;
  height: 100%;
  width: 3.5rem;
  transition: width 100ms;
}

.navbar.expanded {
  width: 15rem;
}

.title {
  display: flex;
  padding: 1rem;
  align-items: center;
}
.hamburger {
  cursor: pointer;
}
</style>
