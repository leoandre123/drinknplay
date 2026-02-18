<template>
  <Popup ref="popup" :title="_title" @close="close(false)">
    <br />
    <slot></slot>
    {{ _body }}
    <br />
    <br />
    <div class="button-group">
      <RetroButton size="small" color="green" @click="close(true)">Confirm</RetroButton>
      <RetroButton size="small" color="red" @click="close(false)">Cancel</RetroButton>
    </div>
  </Popup>
</template>

<script setup lang="ts">
import RetroButton from "@/components/RetroButton.vue";
import Popup from "@/components/Popup.vue";
import { ref, useTemplateRef } from "vue";

const popupRef = useTemplateRef("popup");

let _resolve: ((value: boolean) => void) | undefined;
let _reject: ((reason?: any) => void) | undefined;
let _promise: Promise<boolean> | undefined;
let _isOpen = false;

//withDefaults(defineProps<{ title: string }>(), { title: "Confirm?" });

const _title = ref("Confirm?");
const _body = ref("");

function openDialog(title = "Confirm?", body = ""): Promise<boolean> {
  _title.value = title;
  _body.value = body;

  if (_isOpen && _promise) {
    return _promise;
  }

  popupRef.value?.show();
  _isOpen = true;

  _promise = new Promise<boolean>((resolve, reject) => {
    _resolve = resolve;
    _reject = reject;
  });

  return _promise;
}

function close(result: boolean) {
  popupRef.value?.hide();

  _isOpen = false;

  const res = _resolve;
  _resolve = undefined;
  _reject = undefined;
  _promise = undefined;

  if (res) res(result);
}

defineExpose({ openDialog });
</script>

<style scoped>
.button-group {
  display: flex;
  gap: 1rem;
}
</style>
