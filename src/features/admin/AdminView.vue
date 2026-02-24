<template>
  <div v-if="!isAuthenticated" class="admin-background not-authenticated">
    <p>Code:</p>
    <br />
    <RetroInput v-model="code" type="password" />
    <br />
    <br />
    <RetroButton @click="authenticate">Authenticate</RetroButton>
  </div>
  <div v-else class="admin-background">
    <h1>Admin View</h1>
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
          <p>{{ Math.round((serverInfo?.memoryUsage ?? 0) / 1_000_000) }} MB</p>
        </div>
        <div>
          <h4>Environment</h4>
          <p>{{ serverInfo?.environment }}</p>
        </div>
        <div>
          <h4>Server version</h4>
          <p>{{ serverInfo?.version }}</p>
        </div>
        <div>
          <h4>Node version</h4>
          <p>{{ serverInfo?.nodeVersion }}</p>
        </div>
      </div>
    </div>
    <div class="panel">
      <div class="button-group">
        <RetroButton size="small" color="red" @click="killServer">Kill server</RetroButton>
        <RetroButton size="small" @click="createLobby">Create Lobby</RetroButton>
        <RetroInput size="small"></RetroInput>
        <div class="expander"></div>
        <RetroButton size="small" @click="logout">Logout</RetroButton>
        <RetroButton size="small" @click="update"><div class="refresh"></div></RetroButton>
      </div>
    </div>
    <div class="panel">
      <h2>All lobbies</h2>
      <RetroInput v-model="lobbyQuery" size="small" placeholder="Search lobby id..."></RetroInput>
      <br /><br />
      <div class="lobby-container">
        <ResponsiveGrid min-width="15rem">
          <div
            v-for="lobby in lobbies.filter((x) =>
              x.id.toLowerCase().includes(lobbyQuery.toLocaleLowerCase()),
            )"
            class="lobby-card"
          >
            <h2>
              {{ lobby.id }} <span v-if="lobby.disposalScheduled" style="color: red">(D)</span>
            </h2>
            <p>Players: {{ lobby.players.length }}</p>
            <p>Phase: {{ lobby.phase }}</p>
            <p>Created: {{ formatDuration(Date.now() - lobby.createdDate) }} ago</p>
            <div class="button-group">
              <RetroButton size="small" color="red" @click="killLobby(lobby.id)">Kill</RetroButton>
              <RetroButton size="small" @click="manageLobby(lobby.id)">Manage</RetroButton>
            </div>
          </div>
        </ResponsiveGrid>
      </div>
    </div>
    <div class="panel">
      <h2>LOGS</h2>
      <div class="logs">
        <p v-for="log in logs">
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
    <div class="panel">
      <h2>Crashes</h2>
      <DataGrid :data="crashes">
        <DataGridColumn field="message" title="Message" width="10rem" />
        <DataGridColumn title="Time">
          <template #ctx="{ row }: { row: CrashRecord }">
            {{ new Date(row.ts).toLocaleString() }}
          </template>
        </DataGridColumn>
      </DataGrid>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useDialog } from "@/dialog";
import type { LobbyDto } from "@shared/models/LobbyDto.js";
import { io, Socket } from "socket.io-client";
import type { ServerInfo } from "@shared/models/ServerInfo.js";
import ManageLobbyPopup from "./ManageLobbyPopup.vue";
import RetroInput from "@/shared/components/UI/RetroInput.vue";
import RetroButton from "@/shared/components/UI/RetroButton.vue";
import ResponsiveGrid from "@/shared/components/UI/framework/ResponsiveGrid.vue";
import type { CrashRecord } from "@shared/models/CrashLog.js";
import DataGrid from "@/shared/components/UI/framework/DataGrid.vue";
import DataGridColumn from "@/shared/components/UI/framework/DataGridColumn.vue";

let intervalId: number | undefined;

const dialog = useDialog();

let adminSocket: Socket | undefined = undefined;

const code = ref<string>(localStorage.getItem("adminToken") ?? "");
const isAuthenticated = ref<boolean>(false);
const lobbies = ref<LobbyDto[]>([]);
const serverInfo = ref<ServerInfo>();
const uptime = ref<number>(0);
const logs = ref<any[]>([]);
const lobbyQuery = ref("");
const crashes = ref<CrashRecord[]>([]);

onMounted(() => {
  authenticate();
  intervalId = setInterval(() => {
    if (isAuthenticated.value && serverInfo.value?.startTime) {
      uptime.value = Date.now() - serverInfo.value.startTime;
    }
  }, 1000);
});

onBeforeUnmount(() => {
  clearInterval(intervalId);
  adminSocket?.disconnect();
});

function registerListeners() {
  adminSocket?.on("connect", () => {
    isAuthenticated.value = true;
    update();
  });
  adminSocket?.on("connect_error", (err) => {
    console.log("Admin auth failed:", err.message);
    isAuthenticated.value = false;
  });

  adminSocket?.on("admin:allLobbies", (data) => {
    console.log(lobbies);
    lobbies.value = data;
  });
  adminSocket?.on("admin:serverInfo", (info) => {
    serverInfo.value = info;
    console.log(info);
  });
  adminSocket?.on("admin:recent_logs", (data: any[]) => {
    logs.value = data;
  });
  adminSocket?.on("admin:crashes", (data: CrashRecord[]) => {
    crashes.value = data;
  });
}

function authenticate() {
  if (code.value.length == 0) return;

  localStorage.setItem("adminToken", code.value);

  console.log(code.value);

  if (adminSocket?.connected) {
    adminSocket.disconnect();
  }

  adminSocket = io("/admin", {
    path: "/socket.io",
    autoConnect: false,
    transports: ["websocket", "polling"],
    auth: {
      adminToken: code.value,
    },
  });

  registerListeners();

  adminSocket.connect();
}
function logout() {
  adminSocket?.disconnect();

  isAuthenticated.value = false;
  code.value = "";
  localStorage.removeItem("adminToken");
}
function update() {
  adminSocket?.emit("admin:requestUpdate");
}
function createLobby() {
  dialog.confirm("Create lobby", "Do you want to create a new lobby?").then((x) => {
    if (x) {
      adminSocket?.emit("admin:create_lobby");
      update();
    }
  });
}
function killLobby(id: string) {
  dialog.confirm("Kill lobby", `Are you sure want to remove lobby with ID: ${id}?`).then((x) => {
    if (x) {
      adminSocket?.emit("admin:killLobby", id);
      update();
    }
  });
}
function manageLobby(id: string) {
  const lobby = lobbies.value.find((x) => x.id == id);
  dialog.open(ManageLobbyPopup, { lobby, actions: { killLobby } });
}
function killServer() {
  dialog.confirm("Kill server", `Are you sure want to kill the server?`).then((x) => {
    if (x) {
      adminSocket?.emit("admin:killServer");
      update();
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
.admin-background {
  background-color: #0e0f31;
  color: beige;
  position: absolute;
  width: 100%;
  min-height: 100dvh;
  box-sizing: border-box;
  scrollbar-color: purple transparent;
  scrollbar-width: thin;
}
.not-authenticated {
  align-content: center;
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

input {
  background: #fff;
  color: black;
  box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.1);
  outline: none;
  padding: 1rem;
  font: inherit;
  border: 0.15rem solid #2c3b5f;
  text-transform: uppercase;
}
.refresh {
  background-image: url("/img/refresh.png");
  background-size: contain;
  width: 1rem;
  height: 1rem;
}

.logs {
  text-align: start;
  background-color: black;
  overflow: auto;
  height: 25rem;
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
