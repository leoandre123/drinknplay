<template>
  <div class="logs-container">
    <h2>LOGS</h2>
    <Tabs class="tabs">
      <TabsItem title="Logs">
        <div class="logs-tab">
          <div class="filters">
            <p>Min Level</p>
            <select v-model="minLevel">
              <option v-for="value in ['debug', 'info', 'warning', 'error']">{{ value }}</option>
            </select>
            <p>Context</p>
            <select v-model="contextQuery">
              <option v-for="value in ['', ...new Set(admin.logs.map((x) => x.context))]">
                {{ value }}
              </option>
            </select>
          </div>
          <div class="logs">
            <p v-for="log in filteredLogs">
              <span>[{{ new Date(log.timestamp).toLocaleTimeString() }}]</span>
              <span
                >[<span class="log context">{{ log.context }}</span
                >]</span
              >
              <span>: </span>
              <span :class="['log', log.level]">{{ log.message }}</span>
            </p>
          </div>
        </div>
      </TabsItem>
      <TabsItem title="Search">D</TabsItem>
      <TabsItem title="Errors">3</TabsItem>
    </Tabs>
  </div>
</template>
<script setup lang="ts">
import Tabs from "@/shared/components/Tabs.vue";
import { useAdminClient } from "../useAdminClient";
import TabsItem from "@/shared/components/TabsItem.vue";
import { computed, ref } from "vue";

const admin = useAdminClient();

const minLevel = ref<"debug" | "info" | "warning" | "error">("info");
const contextQuery = ref("");

const filteredLogs = computed(() => {
  const LEVELS = {
    debug: 0,
    info: 1,
    warning: 2,
    error: 3,
  };
  const shouldInclude = (level: string) => {};

  const logs = admin.logs.filter(
    (x) =>
      LEVELS[x.level] >= LEVELS[minLevel.value] &&
      (!contextQuery.value.length ||
        x.context.toLowerCase().includes(contextQuery.value.toLowerCase())),
  );

  return logs;
});
</script>
<style scoped>
.logs-container {
  padding: 1rem;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}
.tabs {
  flex: 1;
}
.logs-tab {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.logs {
  border-radius: 0.25rem;
  text-align: start;
  background-color: black;
  overflow: auto;
  flex: 1;
  box-sizing: border-box;
  padding: 1rem;
  user-select: text;
  font-family: "Courier New", Courier, monospace;
}
.log.context {
  color: green;
}
.log.debug {
  color: gray;
}
.log.info {
  color: white;
}
.log.warning {
  color: orange;
}
.log.error {
  color: red;
}
</style>
