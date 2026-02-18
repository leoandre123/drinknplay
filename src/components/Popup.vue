<template>
  <div v-if="isShowing" class="popup-container" @click.self="!noClose && close()">
    <div class="popup">
      <h2 class="title">{{ title }}</h2>
      <div class="close-button">
        <RetroButton v-if="!noClose" size="small" color="red" @click="close">x</RetroButton>
      </div>

      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import RetroButton from "./RetroButton.vue";

defineProps<{ title: string; noClose?: boolean }>();
const emit = defineEmits(["close"]);

const isShowing = ref<boolean>(false);

function show() {
  isShowing.value = true;
}
function close() {
  emit("close");
  hide();
}
function hide() {
  isShowing.value = false;
}

defineExpose({ show, hide });
</script>

<style scoped>
.title {
  text-align: center;
  font-size: 2.5rem;
  padding-inline: 3rem;
  border-bottom: 0.2rem solid white;
}
.popup {
  position: relative;
  min-width: 15%;
  max-width: 80%;
  border: 0.25rem solid rgba(250, 250, 250, 0.5);
  background: rgb(59, 70, 164, 0.95);
  padding: 1.5rem;
  justify-items: center;
}
.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
}
</style>
