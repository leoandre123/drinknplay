<template>
  <div class="debug-container" v-if="!env.startsWith('prod')">
    <button @click="debug.showDebug = !debug.showDebug">
      {{ debug.showDebug ? "Hide debug" : "Show debug" }}
    </button>
    <div v-if="debug.showDebug">
      <div class="debug-box">
        <p>Connected: {{ context.isConnected }}</p>
        <p>LobbyID: {{ context.lobbyId }}</p>
        <p>Phase: {{ context.state?.phase ?? "undefined" }}</p>
        <p>Host: {{ context.isHost }}</p>
        <p>PlayerID: {{ context.playerId }}</p>
        <p>Players: {{ context.state?.players.map((x) => x.name) }}</p>
        <p>Environment: {{ env }}</p>
        <p>Mobile: {{ isMobile }}</p>
        <p>SocketID: {{ socket.id }}</p>
        <p>You: {{ context.getCurrentPlayer() }}</p>
      </div>
      <div class="debug-box">
        <p v-for="msg in debug.incomingMessages">{{ msg }}</p>
      </div>

      <div class="debug-box">
        <button @click="advance" :disabled="!context.isHost">Advance</button>
        <input type="number" v-model="debug.gameIndex" />
        <button @click="startMinigame" :disabled="!context.isHost">Start Game</button>
        <button @click="addBot" :disabled="!context.isHost">Add Bot</button>
      </div>
    </div>
  </div>

  <div v-if="!context.isConnected" class="not-connected">
    <h1>Connecting...</h1>
    <NewRetroContainer>
      <div v-if="false" class="connection-warning">
        <div>
          <h1>Not connected</h1>
          <h3>Available Lobbies</h3>
          <button @click="socket.emit('debug:getAllLobbies')">Refresh</button>
          <div class="debug-lobbies">
            <div v-for="lobby in debug.availableLobbies" class="debug-lobby">
              <h4>{{ lobby.id }}</h4>
              <p>Players: {{ lobby.playerCount }}</p>
              <button @click="joinLobbyAsHost(lobby.id)">Host</button>
              <button
                @click="joinLobby(lobby.id, null, 'player_' + Math.floor(Math.random() * 1000))"
              >
                player
              </button>
            </div>
          </div>
        </div>
      </div>
    </NewRetroContainer>
  </div>

  <div v-if="context.isConnected" class="game-container">
    <LobbyView v-if="context.state?.phase == 'lobby'" />
    <SlotView v-if="context.state?.phase == 'slot'" />
    <LoadingView v-if="context.state?.phase == 'loading'" />
    <MinigameView v-if="context.state?.phase == 'game'" />
    <template v-if="context.state?.phase == 'result'">
      <GameResultsView v-if="context.isHost" />
      <GameResultPlayerView v-else />
    </template>
    <template v-if="context.state?.phase == 'scoreboard'">
      <ScoreboardView v-if="context.isHost" />
      <ScoreboardPlayerView v-else />
    </template>
    <FinalResultsView v-if="context.state?.phase == 'end'" />
  </div>
</template>

<script setup lang="ts">
import {
  LOBBY_JOIN_AS_HOST,
  LOBBY_JOIN_AS_HOST_RESPONSE,
  LOBBY_JOIN_AS_PLAYER,
  LOBBY_JOIN_AS_PLAYER_RESPONSE,
} from "@shared/contracts/socket-events.js";
import MinigameView from "../minigames/MinigameView.vue";
import LoadingView from "../loading/LoadingView.vue";
import SlotView from "../slot/SlotView.vue";
import ScoreboardView from "../scoreboard/ScoreboardView.vue";
import GameResultPlayerView from "../gameresults/GameResultPlayerView.vue";
import LobbyView from "../lobby/LobbyView.vue";
import GameResultsView from "../gameresults/GameResultsView.vue";
import ScoreboardPlayerView from "../scoreboard/ScoreboardPlayerView.vue";
import FinalResultsView from "@/views/FinalResultsView.vue";
import NewRetroContainer from "@/shared/components/UI/NewRetroContainer.vue";
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from "vue";
import { useDevice } from "@/useDevice";
import { socket } from "@/socket";
import { context } from "@/context";
import { DefaultAvatar, GetRandomAvatar } from "@shared/models/AvatarSettings";
import { useRoute, useRouter } from "vue-router";
import { useDialog } from "@/dialog";

const debug = ref<{
  showDebug: boolean;
  incomingMessages: any[];
  availableLobbies: any[];
  gameIndex: number;
}>({
  showDebug: false,
  incomingMessages: [],
  availableLobbies: [],
  gameIndex: 0,
});

const router = useRouter();
const route = useRoute();

const env = import.meta.env.MODE;

const { isMobile } = useDevice();

const dialog = useDialog();

onMounted(() => {
  socket.on(LOBBY_JOIN_AS_PLAYER_RESPONSE, (response) => {
    console.log(response);
    if (response.success) {
      context.isHost = false;
      context.isConnected = true;
      context.lobbyId = response.lobbyId;
      context.playerId = response.playerId;

      console.log(response);
      localStorage.setItem("playerId", response.playerId);
    } else {
      dialog.info("Lobby unavailable", response.reason, "Home").then(goHome);
    }
  });
  socket.on(LOBBY_JOIN_AS_HOST_RESPONSE, (response) => {
    console.log(response);
    if (response.success) {
      context.isHost = true;
      context.isConnected = true;
      context.lobbyId = response.lobbyId;
    } else {
      dialog.info("Lobby unavailable", response.reason, "Home").then(goHome);
    }
  });
  socket.on("lobby:updateState", (state) => {
    context.state = state;
  });

  console.log(route);
  const queryLobbyId = route.query.id?.toString();
  const queryPlayerName = route.query.name?.toString() ?? "Unknown player";
  const queryMode = route.query.mode?.toString() ?? "client";

  console.log(queryLobbyId);
  if (queryLobbyId) {
    if (queryMode == "host") {
      joinLobbyAsHost(queryLobbyId);
    } else {
      const avatar = sessionStorage.getItem("avatar");
      console.log(avatar);
      const avatarSettings = avatar != null ? JSON.parse(avatar) : GetRandomAvatar();
      console.log(avatarSettings);

      const playerId = localStorage.getItem("playerId");
      joinLobby(queryLobbyId, playerId, queryPlayerName, avatarSettings);
    }
  }

  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onUnhandledRejection);

  setupDebug();
});

onBeforeUnmount(() => {
  socket.off(LOBBY_JOIN_AS_PLAYER_RESPONSE);
  socket.off(LOBBY_JOIN_AS_HOST_RESPONSE);
  socket.off("lobby:updateState");
  window.removeEventListener("error", onError);
  window.removeEventListener("unhandledrejection", onUnhandledRejection);
});

function onError(e: any) {
  console.error("Unhandled error FUFAUF", e.reason);
  alert(`Error: ${e.message}\n${e.filename}:${e.lineno}:${e.colno}`);
}
function goHome() {
  router.push({
    path: "/",
  });
}

function onUnhandledRejection(e: any) {
  console.error("Unhandled promise:", e.reason);
}

function setupDebug() {
  socket.on("debug:allLobbies", (lobbies) => {
    console.log(lobbies);
    debug.value.availableLobbies = lobbies;
  });

  socket.onAny((event) => {
    if (
      debug.value.incomingMessages.length != 0 &&
      debug.value.incomingMessages[debug.value.incomingMessages.length - 1]?.name == event
    ) {
      debug.value.incomingMessages[debug.value.incomingMessages.length - 1].count++;
    } else {
      debug.value.incomingMessages.push({ name: event, count: 1 });
    }
    if (debug.value.incomingMessages.length > 10) debug.value.incomingMessages.shift();
  });

  socket.emit("debug:getAllLobbies");
}
function joinLobby(
  lobbyId: string,
  playerId: string | null,
  name: string,
  avatarSettings = DefaultAvatar,
) {
  socket.emit(LOBBY_JOIN_AS_PLAYER, lobbyId, playerId, name, avatarSettings);
}
function joinLobbyAsHost(lobbyId: string) {
  socket.emit(LOBBY_JOIN_AS_HOST, lobbyId);
}
function advance() {
  socket.emit("lobby:advancePhase");
}
function startMinigame() {
  socket.emit("debug:startMinigame", debug.value.gameIndex);
}
function addBot() {
  socket.emit("debug:addBot", "Jonas_" + Math.floor(Math.random() * 1000));
}
</script>

<style scoped>
.game-container {
  width: 100dvw;
  height: 100dvh;
  justify-items: center;
  align-content: center;
}

.connection-warning {
  width: 100vw;
  height: 100vh;
  justify-items: center;
  align-content: center;
}
.connection-warning > div {
  width: 50vw;
  align-items: center;
  align-content: center;
  background-color: red;
  color: white;
}

.not-connected {
  width: 100dvw;
  height: 100dvh;
  justify-items: center;
  align-content: center;
}

.gear-icon {
  color: black;
  height: 2rem;
  aspect-ratio: 1;
  background-image: url("/gear.png");
  background-size: contain;
  cursor: pointer;
  float: right;
}

.debug-container {
  position: absolute;
  display: flex;
  flex-direction: column;
  left: 1rem;
  top: 1rem;
  padding: 0.5rem;
  gap: 0.5rem;
  background-color: #8a303056;
  color: white;
  pointer-events: none;
  touch-action: none;
  z-index: 100;
}
.debug-box {
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  gap: 0.5rem;
  background-color: #8a303056;
  color: white;
  pointer-events: none;
  touch-action: none;
}

.debug-lobbies {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.debug-lobby {
  padding: 0.5rem;
  background-color: brown;
  position: relative;
  margin: 0;
}
.debug-lobby button {
  padding: 5px;
  width: 50%;
}
.debug-container input,
button {
  pointer-events: all;
}
.debug-container p {
  margin: 0;
}

.mascot-container {
  position: absolute;
  bottom: 0;
  right: 0;
}

.popup {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: #000000a0;
  z-index: 100;
  overflow: hidden;
  place-content: center;
  justify-items: center;
}

.enable-audio {
  width: 10rem;
  height: 10rem;
  background-color: white;
  padding: 1rem;
  border-radius: 1rem;
}
</style>
