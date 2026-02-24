<template>
  <template v-for="item in stack">
    <Modal
      v-if="item.kind == 'modal'"
      :frame="item.frame"
      @close="(val: any) => resolve(item.id, val)"
    >
      <component
        :is="item.component"
        v-bind="item.props"
        @close="(val: any) => resolve(item.id, val)"
        v-on="item.emits ?? {}"
      />
    </Modal>
    <component
      v-else
      :is="item.component"
      v-bind="item.props"
      @close="(val: any) => resolve(item.id, val)"
      v-on="item.emits ?? {}"
    />
  </template>
  <slot></slot>
</template>
<script setup lang="ts">
import { provide, type Component, reactive, markRaw } from "vue";
import type { DialogApi } from "@/dialog";
import { DialogKey } from "@/dialog";
import ConfirmDialog from "../UI/dialogs/ConfirmDialog.vue";
import InfoDialog from "../UI/dialogs/InfoDialog.vue";
import Modal from "../UI/dialogs/Modal.vue";

type OverlayKind = "modal" | "none" | "";

type OverlayItem = {
  id: number;
  component: Component;
  props?: Record<string, any>;
  emits?: Record<string, any>;
  kind: OverlayKind;
  frame?: { title: string; showClose: boolean };
  resolve: (value: any) => void;
};

const stack = reactive<OverlayItem[]>([]);
let nextId = 1;

async function confirm(title: string = "Confirm?", body: string = "") {
  return modal<boolean>(ConfirmDialog, { title, showClose: true }, { body });
}
async function info(title?: string, body?: string, buttonText?: string) {
  return open<void>(InfoDialog, { title, body, buttonText });
}
function open<T>(
  component: Component,
  props?: Record<string, any>,
  emits?: Record<string, any>,
): Promise<T> {
  return new Promise<T>((resolve) => {
    stack.push({
      id: nextId++,
      component: markRaw(component),
      props,
      kind: "none",
      resolve,
      emits,
    });
  });
}

function modal<T>(
  component: Component,
  frame?: { title: string; showClose: boolean },
  props?: Record<string, any>,
  emits?: Record<string, any>,
): Promise<T> {
  return new Promise<T>((resolve) => {
    stack.push({
      id: nextId++,
      component: markRaw(component),
      kind: "modal",
      frame,
      props,
      resolve,
      emits,
    });
  });
}

function resolve(id: number, value: any) {
  console.log("RESOLVE");
  const idx = stack.findIndex((x) => x.id === id);
  if (idx === -1) return;
  const [item] = stack.splice(idx, 1);
  item?.resolve(value);
}

const api: DialogApi = {
  confirm,
  info,
  open,
  modal,
};

provide(DialogKey, api);
</script>
<style scoped></style>
