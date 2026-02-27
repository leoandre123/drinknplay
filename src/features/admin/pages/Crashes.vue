<template>
  <div class="crashes-container">
    <h2>Crashes</h2>
    <DataGrid :data="crashes">
      <DataGridColumn title="Time" width="10rem">
        <template #ctx="{ row }: { row: CrashRecord }">
          {{ new Date(row.ts).toLocaleString() }}
        </template>
      </DataGridColumn>
      <DataGridColumn field="message" title="Message" />
      <DataGridColumn field="appVersion" title="Version" />
      <DataGridColumn field="nodeVersion" title="Node" />
      <DataGridColumn title="Time" width="10rem">
        <template #ctx="{ row }: { row: CrashRecord }">
          <button @click="dialog.info('Stack trace', row.stack)"><Icon icon="route" /></button>
        </template>
      </DataGridColumn>
    </DataGrid>
  </div>
</template>
<script setup lang="ts">
import type { CrashRecord } from "@shared/models/CrashLog.js";
import DataGrid from "@/shared/components/UI/framework/DataGrid.vue";
import DataGridColumn from "@/shared/components/UI/framework/DataGridColumn.vue";
import { useAdminClient } from "../useAdminClient";
import RetroButton from "@/shared/components/UI/RetroButton.vue";
import Icon from "@/shared/components/Icon.vue";
import { useDialog } from "@/dialog";
import { computed } from "vue";
const dialog = useDialog();
const admin = useAdminClient();

const crashes = computed(() => {
  const cra = [...admin.crashes];
  cra.sort((a, b) => {
    return new Date(a.ts).getUTCMilliseconds() - new Date(b.ts).getUTCMilliseconds();
  });

  return cra;
});
</script>
<style scoped>
.crashes-container {
  width: 100%;
}
</style>
