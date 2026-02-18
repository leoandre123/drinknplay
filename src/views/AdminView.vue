<template>
  <div v-if="!isAuthenticated" class="admin-background not-authenticated">
    <p>Code:</p>
    <br />
    <input v-model="code" />
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
          <p>{{ uptime }}s</p>
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
      </div>
    </div>
    <div class="panel">
      <div class="button-group">
        <RetroButton size="small" color="red" @click="killServer">Kill server</RetroButton>
        <RetroButton size="small" @click="createLobby">Create Lobby</RetroButton>
        <div class="expander"></div>
        <RetroButton size="small" @click="logout">Logout</RetroButton>
        <RetroButton size="small" @click="update"><div class="refresh"></div></RetroButton>
      </div>
    </div>
    <div class="panel">
      <h2>All lobbies</h2>

      <div class="lobby-container">
        <div v-for="lobby in lobbies" class="lobby-card">
          <h2>{{ lobby.id }}</h2>
          <p>Players: {{ lobby.players.length }}</p>
          <p>Phase: {{ lobby.phase }}</p>

          <div class="button-group">
            <RetroButton size="small" color="red" @click="killLobby(lobby.id)">Kill</RetroButton>
            <RetroButton size="small">Manage</RetroButton>
          </div>
        </div>
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
  </div>
</template>
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { DefaultSettings } from "../../shared/models/GameSettings";
//import { socket } from "../socket";
import { useDialog } from "@/dialog";
import type { LobbyDto } from "@shared/models/LobbyDto.js";
import { io, Socket } from "socket.io-client";
import RetroButton from "@/components/RetroButton.vue";
import type { ServerInfo } from "@shared/models/ServerInfo.js";

let intervalId: number | undefined;

const dialog = useDialog();

let adminSocket: Socket | undefined = undefined;

const code = ref<string>(localStorage.getItem("adminToken") ?? "");
const isAuthenticated = ref<boolean>(false);
const lobbies = ref<LobbyDto[]>([]);
const serverInfo = ref<ServerInfo>();
const uptime = ref<number>(0);
const logs = ref<any[]>([]);

onMounted(() => {
  authenticate();
  intervalId = setInterval(() => {
    if (isAuthenticated.value && serverInfo.value?.startTime) {
      uptime.value = Math.round((Date.now() - serverInfo.value.startTime) / 1000);
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
      adminSocket?.emit("lobby:create", DefaultSettings);
      update();
    }
  });
}
function killLobby(id: string) {
  dialog.confirm("Kill lobby", `Are you sure want to remove lobby with ID: ${id}`).then((x) => {
    if (x) {
      adminSocket?.emit("admin:killLobby", id);
      update();
    }
  });
}
function killServer() {
  dialog.confirm("Kill server", `Are you sure want to kill the server`).then((x) => {
    if (x) {
      adminSocket?.emit("admin:killServer");
      update();
    }
  });
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
  place-content: space-evenly;
  flex-wrap: wrap;
}
.lobby-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
}
.lobby-card {
  background: linear-gradient(#8906e1 0%, #8c5dab 100%);
  color: white;
  padding: 1rem;
  border-radius: 1rem;
}
.lobby-actions {
  display: flex;
  gap: 0.5rem;
}
.button-group {
  display: flex;
  gap: 0.5rem;
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
  background-image: url("img/refresh.png");
  background-size: contain;
  width: 1rem;
  height: 1rem;
}

.logs {
  text-align: start;
  background-color: black;
  overflow: auto;
  height: 25rem;
  padding: 0rem;
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
