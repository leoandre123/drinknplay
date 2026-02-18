<template>
  <ConfirmDialog ref="dialog" />
  <slot></slot>
</template>
<script setup lang="ts">
import { ref, provide, useTemplateRef } from "vue";
import type { DialogApi } from "@/dialog";
import { DialogKey } from "@/dialog";
import ConfirmDialog from "../UI/dialogs/ConfirmDialog.vue";

const dialogRef = useTemplateRef("dialog");

async function confirm(title: string = "Confirm?", body: string = "") {
  return dialogRef.value?.openDialog(title, body) ?? false;
}

const api: DialogApi = {
  confirm,
};

provide(DialogKey, api);
</script>
<style scoped></style>
