import { computed, proxyRefs, ref } from "vue";
import { io, type Socket } from "socket.io-client";
import type { LobbyDto } from "@shared/models/LobbyDto.js";
import type { ServerInfo } from "@shared/models/ServerInfo.js";
import type { CrashRecord } from "@shared/models/CrashLog.js";

type AdminLog = {
  timestamp: number;
  context: string;
  level: "debug" | "info" | "warning" | "error";
  message: string;
};

const TOKEN_KEY = "adminToken";

const token = ref<string>(localStorage.getItem(TOKEN_KEY) ?? "");
const isAuthenticated = ref(false);
const socket = ref<Socket | null>(null);

const lobbies = ref<LobbyDto[]>([]);
const serverInfo = ref<ServerInfo | undefined>(undefined);
const logs = ref<AdminLog[]>([]);
const crashes = ref<CrashRecord[]>([]);

function disconnect() {
  socket.value?.disconnect();
  socket.value = null;
  isAuthenticated.value = false;
}

function connect(adminToken: string) {
  token.value = adminToken;
  localStorage.setItem(TOKEN_KEY, adminToken);

  // reset old socket
  disconnect();

  const s = io("/admin", {
    path: "/socket.io",
    autoConnect: false,
    transports: ["websocket", "polling"],
    auth: { adminToken },
  });

  // listeners
  s.on("connect", () => {
    isAuthenticated.value = true;
    requestUpdate();
  });

  s.on("connect_error", (err) => {
    console.log("Admin auth failed:", err.message);
    isAuthenticated.value = false;
  });

  s.on("admin:allLobbies", (data: LobbyDto[]) => (lobbies.value = data));
  s.on("admin:serverInfo", (info: ServerInfo) => (serverInfo.value = info));
  s.on("admin:recent_logs", (data: AdminLog[]) => (logs.value = data));
  s.on("admin:crashes", (data: CrashRecord[]) => (crashes.value = data));

  socket.value = s;
  s.connect();
}

function logout() {
  disconnect();
  token.value = "";
  localStorage.removeItem(TOKEN_KEY);
}

function requestUpdate() {
  socket.value?.emit("admin:requestUpdate");
}

function killServer() {
  socket.value?.emit("admin:killServer");
}

function createLobby() {
  socket.value?.emit("admin:create_lobby");
}

function killLobby(id: string) {
  socket.value?.emit("admin:killLobby", id);
}

const connected = computed(() => !!socket.value?.connected);

export function useAdminClient() {
  return proxyRefs({
    token,
    isAuthenticated,
    connected,

    lobbies,
    serverInfo,
    logs,
    crashes,

    connect,
    logout,
    requestUpdate,
    killServer,
    createLobby,
    killLobby,
  });
}
