<template>
  <div class="metrics-container">
    <h2>Metrics</h2>
  </div>
</template>
<script setup lang="ts">
import { useAdminClient } from "../useAdminClient";
import { useDialog } from "@/dialog";
const dialog = useDialog();
const admin = useAdminClient();
</script>
<style scoped>
.metrics-container {
  width: 100%;
  padding: 1rem;
  box-sizing: border-box;
}
</style>
