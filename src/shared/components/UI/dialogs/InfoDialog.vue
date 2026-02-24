<template>
  <Popup ref="popup" :title="title" @close="emit('close', false)">
    <br />
    <slot></slot>
    {{ body }}
    <br />
    <br />
    <RetroButton size="small" color="green" @click="emit('close', true)">{{
      buttonText
    }}</RetroButton>
  </Popup>
</template>

<script setup lang="ts">
import Popup from "../../Popup.vue";
import RetroButton from "../RetroButton.vue";

withDefaults(defineProps<{ title?: string; body?: string; buttonText?: string }>(), {
  title: "Confirm",
  body: "",
  buttonText: "Ok",
});
const emit = defineEmits(["close"]);
</script>

<style scoped>
.button-group {
  display: flex;
  gap: 1rem;
}
</style>
