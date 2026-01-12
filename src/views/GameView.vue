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

  <!--   <div class="mascot-container">
    <Mascot />
  </div> -->
  <div v-if="!context.isConnected">
    <div class="connection-warning">
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
  </div>

  <div v-if="false" class="popup">
    <div class="enable-audio">
      <p>Sound is not enabled</p>
      <button @click="audioManager.unlock()">Grant access to play sounds</button>
    </div>
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
      <ResultView v-if="context.isHost" />
      <ResultPlayerView v-else />
    </template>
  </div>
</template>

<script>
import LoadingView from "./LoadingView.vue";
import MinigameView from "./MinigameView.vue";
import SlotView from "./SlotView.vue";
import ResultView from "./ResultView.vue";
import LobbyView from "./LobbyView.vue";
import { socket } from "../socket";
import { context } from "../context";
import { Flag } from "vue-flag-icon/components";
import Mascot from "../components/Mascot.vue";
import { useDevice } from "../UseDevice.js";
import GameResultPlayerView from "./GameResultPlayerView.vue";
import { DefaultAvatar, GetRandomAvatar } from "../../shared/AvatarHelper.js";
import GameResultsView from "./GameResultsView.vue";
import { audioManager } from "@/AudioManager";
import ResultPlayerView from "./ResultPlayerView.vue";

export default {
  name: "GameView",

  data() {
    return {
      socket,
      context,
      audioManager,
      isAngry: false,
      debug: {
        showDebug: false,
        incomingMessages: [],
        availableLobbies: [],
        gameIndex: 0,
      },
    };
  },
  computed: {
    env() {
      return import.meta.env.MODE;
    },
  },
  setup() {
    const { isMobile } = useDevice();
    return { isMobile };
  },
  components: {
    MinigameView,
    LoadingView,
    SlotView,
    ResultView,
    GameResultPlayerView,
    LobbyView,
    Flag,
    Mascot,
    GameResultsView,
    ResultPlayerView,
  },
  mounted() {
    socket.on("lobby:joinResponse", (response) => {
      context.isHost = false;
      context.isConnected = true;
      context.lobbyId = response.lobbyId;
      context.playerId = response.playerId;

      console.log(response);
      localStorage.setItem("playerId", response.playerId);
    });
    socket.on("lobby:joinHostResponse", (response) => {
      context.isHost = true;
      context.isConnected = true;
      context.lobbyId = response.lobbyId;
    });
    socket.on("lobby:updateState", (state) => {
      context.state = state;
    });

    console.log(this.$route);
    const queryLobbyId = this.$route.query.id;
    const queryPlayerName = this.$route.query.name ?? "Unknown player";
    const queryMode = this.$route.query.mode ?? "client";

    console.log(queryLobbyId);
    if (queryLobbyId) {
      if (queryMode == "host") {
        this.joinLobbyAsHost(queryLobbyId);
      } else {
        const avatar = sessionStorage.getItem("avatar");
        console.log(avatar);
        const avatarSettings = avatar != null ? JSON.parse(avatar) : GetRandomAvatar();
        console.log(avatarSettings);

        const playerId = localStorage.getItem("playerId");
        this.joinLobby(queryLobbyId, playerId, queryPlayerName, avatarSettings);
      }
    }

    window.addEventListener("error", this.onError);
    window.addEventListener("unhandledrejection", this.onUnhandledRejection);

    this.setupDebug();
  },
  beforeUnmount() {
    socket.off("lobby:joinResponse");
    socket.off("lobby:joinHostResponse");
    socket.off("lobby:updateState");
    window.removeEventListener("error", this.onError);
    window.removeEventListener("unhandledrejection", this.onUnhandledRejection);
  },
  methods: {
    onError(e) {
      console.error("Unhandled error FUFAUF", e.reason);
      alert(`Error: ${e.message}\n${e.filename}:${e.lineno}:${e.colno}`);
    },

    onUnhandledRejection(e) {
      console.error("Unhandled promise:", e.reason);
    },

    setupDebug() {
      socket.on("debug:allLobbies", (lobbies) => {
        console.log(lobbies);
        this.debug.availableLobbies = lobbies;
      });

      socket.onAny((event, ...args) => {
        if (
          this.debug.incomingMessages.length != 0 &&
          this.debug.incomingMessages[this.debug.incomingMessages.length - 1].name == event
        ) {
          this.debug.incomingMessages[this.debug.incomingMessages.length - 1].count++;
        } else {
          this.debug.incomingMessages.push({ name: event, count: 1 });
        }
        if (this.debug.incomingMessages.length > 10) this.debug.incomingMessages.shift();
      });

      socket.emit("debug:getAllLobbies");
    },
    joinLobby(lobbyId, playerId, name, avatarSettings = DefaultAvatar) {
      socket.emit("lobby:joinAsPlayer", lobbyId, playerId, name, avatarSettings);
    },
    joinLobbyAsHost(lobbyId) {
      socket.emit("lobby:joinAsHost", lobbyId);
    },
    advance() {
      socket.emit("lobby:advancePhase");
    },
    startMinigame() {
      socket.emit("debug:startMinigame", this.debug.gameIndex);
    },
    addBot() {
      socket.emit("debug:addBot", "Jonas_" + Math.floor(Math.random() * 1000));
    },
  },
};
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
