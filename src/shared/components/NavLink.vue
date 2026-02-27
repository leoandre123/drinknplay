<template>
  <RouterLink :to="path" class="navlink" :class="{ expanded: expanded }" active-class="selected">
    <Icon v-if="icon" :icon="icon" size="1.5rem" />
    <span v-else></span>
    <span v-if="expanded">{{ text }}</span>
  </RouterLink>
</template>
<script setup lang="ts">
import Icon from "@/shared/components/Icon.vue";
import { inject, type Ref } from "vue";
defineProps<{ path: string; text: string; icon?: string }>();
const expanded = inject<Ref<boolean>>("admin-navbar-expanded");
</script>
<style scoped>
.navlink {
  display: flex;
  gap: 1rem;
  text-align: start;
  padding: 1rem;
  align-items: center;
  border-bottom: 1px solid;
  cursor: pointer;
  color: white;
  text-decoration: none;
}
.navlink:hover {
  background-color: rgb(96, 31, 175);
}
.selected {
  background-color: rgb(54, 24, 91);
  font-weight: 600;
}
</style>
