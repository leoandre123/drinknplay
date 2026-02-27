<template>
  <div class="modal-container" @click.self="!noClose && close()">
    <div class="modal">
      <template v-if="frame">
        <h2 class="title">{{ frame.title }}</h2>
        <div class="close-button">
          <retro-button v-if="!noClose" size="small" color="red" @click="close">x</retro-button>
        </div>
      </template>
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import RetroButton from "../RetroButton.vue";

defineProps<{ frame?: { title: string; showClose: boolean }; noClose?: boolean }>();
const emit = defineEmits(["close"]);

function close() {
  emit("close");
}
</script>

<style scoped>
.modal-container {
  width: 100dvw;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  background: #00000020;
  z-index: 10000;
}
.modal {
  position: relative;
  min-width: 15%;
  max-width: 80%;
  border: 0.25rem solid rgba(250, 250, 250, 0.5);
  background: rgb(59, 70, 164, 0.95);
  padding: 1.5rem;
  justify-items: center;
}
.title {
  text-align: center;
  font-size: 2.5rem;
  padding-inline: 3rem;
  border-bottom: 0.2rem solid white;
}
.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
}
</style>
