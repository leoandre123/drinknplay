<template>
  <div class="overview">
    <h1>Admin View</h1>
    <div class="panel">
      <div class="button-group">
        <RetroButton size="small" color="red" @click="killServer">Kill server</RetroButton>
        <div class="expander"></div>
        <RetroButton size="small" @click="admin.logout">Logout</RetroButton>
        <RetroButton size="small" @click="admin.requestUpdate"
          ><div class="refresh"></div
        ></RetroButton>
      </div>
    </div>
    <div class="panel">
      <h2>Status</h2>
      <hr />
      <div class="status">
        <div>
          <h4>Uptime</h4>
          <p>{{ formatDuration(uptime) }}</p>
        </div>
        <div>
          <h4>Memory</h4>
          <p>{{ Math.round((admin.serverInfo?.memoryUsage ?? 0) / 1_000_000) }} MB</p>
        </div>
        <div>
          <h4>Environment</h4>
          <p>{{ admin.serverInfo?.environment }}</p>
        </div>
        <div>
          <h4>Server version</h4>
          <p>{{ admin.serverInfo?.version }}</p>
        </div>
        <div>
          <h4>Node version</h4>
          <p>{{ admin.serverInfo?.nodeVersion }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useDialog } from "@/dialog";
import RetroButton from "@/shared/components/UI/RetroButton.vue";
import { useAdminClient } from "../useAdminClient";

let intervalId: number | undefined;

const dialog = useDialog();
const uptime = ref<number>(0);

const admin = useAdminClient();

onMounted(() => {
  intervalId = setInterval(() => {
    if (admin.isAuthenticated && admin.serverInfo?.startTime) {
      uptime.value = Date.now() - admin.serverInfo.startTime;
    }
  }, 1000);
});

onBeforeUnmount(() => {
  clearInterval(intervalId);
});

function killServer() {
  dialog.confirm("Kill server", `Are you sure want to kill the server?`).then((x) => {
    if (x) {
      admin.killServer();
      admin.requestUpdate();
    }
  });
}

function formatDuration(duration: number): string {
  if (duration < 1000) {
    return `${Math.floor(duration)}ms`;
  } else if (duration < 60_000) {
    return `${Math.floor(duration / 1000)}s`;
  } else if (duration < 3_600_000) {
    return `${Math.floor(duration / 60_000)}m`;
  } else if (duration < 86_400_000) {
    return `${Math.floor(duration / 3_600_000)}h ${Math.floor((duration % 3_600_000) / 60_000)}m`;
  } else {
    return `${Math.floor(duration / 3_600_000)}h`;
  }
}
</script>
<style scoped>
.overview {
  width: 100%;
}
.panel {
  background-color: #191836;
  padding: 1rem;
  margin: 1rem;
  border-radius: 0.25rem;
}
.status {
  display: flex;
  flex-wrap: wrap;
}
.status > div {
  flex-grow: 1;
  flex-basis: 0;
}
.lobby-container {
  max-height: 40rem;
  overflow: auto;
}
.lobby-card {
  background: linear-gradient(#8906e1 0%, #8c5dab 100%);
  color: white;
  padding: 1rem;
  border-radius: 1rem;
  justify-items: center;
}

.lobby-actions {
  display: flex;
  gap: 0.5rem;
}
.button-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.expander {
  flex-grow: 1;
}
.refresh {
  background-image: url("/img/refresh.png");
  background-size: contain;
  width: 1rem;
  height: 1rem;
}
</style>
