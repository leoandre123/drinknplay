<template>
  <div class="debug-container">
    <button @click="showDebug = !showDebug">{{ showDebug ? "Hide debug" : "Show debug" }}</button>
    <div v-if="showDebug">
      <div class="debug-box">
        <p>Connected: {{ context.isConnected }}</p>
        <p>Phase: {{ context.state?.phase ?? "undefined" }}</p>
        <p>Host: {{ context.isHost }}</p>
        <p>Players: {{ context.state?.players.map((x) => x.name) }}</p>
      </div>
      <div class="debug-box">
        <p v-for="msg in incomingMessages">{{ msg }}</p>
      </div>

      <div class="debug-box">
        <button @click="advance" :disabled="!context.isHost">Advance</button>
      </div>
    </div>
  </div>
  <div v-if="!context.isConnected">
    <div class="connection-warning">
      <div>
        <p>Not connected</p>
        <button @click="joinLobby('kahoot', 'player_' + Math.floor(Math.random() * 1000))">
          Join kahoot game as player
        </button>
        <br />
        <button @click="joinLobbyAsHost('kahoot')">Join kahoot game as host</button>
        <br />
        <br />
        <button @click="joinLobby('race', 'player_' + Math.floor(Math.random() * 1000))">
          Join race game as player
        </button>
        <br />
        <button @click="joinLobbyAsHost('race')">Join race game as host</button>
        <br />
        <br />
        <button @click="joinLobbyAsHost('lobby')">Join lobby as host</button>
        <br />
        <button @click="joinLobby('lobby', 'player_' + Math.floor(Math.random() * 1000))">
          Join lobby as player
        </button>
      </div>
    </div>
  </div>
  <div v-if="context.isConnected" class="game-container">
    <LobbyView v-if="context.state?.phase == 'lobby'" />
    <SlotView v-if="context.state?.phase == 'slot'" />
    <LoadingView v-if="context.state?.phase == 'loading'" />
    <MinigameView v-if="context.state?.phase == 'game'" />
    <ResultView v-if="context.state?.phase == 'result'" />
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

export default {
  name: "GameView",

  data() {
    return {
      context,
      showDebug: false,
      incomingMessages: [],
    };
  },
  components: { MinigameView, LoadingView, SlotView, ResultView, LobbyView },
  mounted() {
    socket.on("joinLobbyResponse", (response) => {
      console.log("resp");
      context.isHost = false;
      context.isConnected = true;
    });
    socket.on("joinLobbyHostResponse", (response) => {
      console.log("resp");
      context.isHost = true;
      context.isConnected = true;
    });
    socket.on("updateLobbyState", (state) => {
      console.log("state update");
      console.log(state);
      context.state = state;
    });

    socket.onAny((event, ...args) => {
      if (
        this.incomingMessages.length != 0 &&
        this.incomingMessages[this.incomingMessages.length - 1].name == event
      ) {
        this.incomingMessages[this.incomingMessages.length - 1].count++;
      } else {
        this.incomingMessages.push({ name: event, count: 1 });
      }
      if (this.incomingMessages.length > 10) this.incomingMessages.shift();
    });

    const queryLobbyId = this.$route.query.id;
    const queryPlayerName = this.$route.query.name;
    console.log(queryLobbyId);
    if (queryLobbyId && queryPlayerName) {
      this.joinLobby(queryLobbyId, queryPlayerName);
    }
  },
  beforeUnmount() {
    socket.off("joinLobbyResponse");
    socket.off("updateLobbyState");
  },
  methods: {
    joinLobby(lobbyId, name) {
      socket.emit("joinLobby", lobbyId, name);
    },
    joinLobbyAsHost(lobbyId) {
      socket.emit("joinLobbyHost", lobbyId);
    },
    advance() {
      socket.emit("advancePhase");
    },
  },
};
</script>

<style scoped>
.game-container {
  width: 100vw;
  height: 100vh;
  justify-items: center;
  align-content: center;
  background-image: radial-gradient(
    circle farthest-corner at 10% 20%,
    rgba(0, 51, 102, 1) 0%,
    rgba(0, 102, 204, 1) 49.5%,
    rgba(0, 191, 255, 1) 90%
  );
}

.connection-warning {
  width: 100vw;
  height: 100vh;
  justify-items: center;
  align-content: center;
}
.connection-warning > div {
  width: 30vw;
  height: 30vh;
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
.debug-container button {
  pointer-events: all;
}
.debug-container p {
  margin: 0;
}
</style>
