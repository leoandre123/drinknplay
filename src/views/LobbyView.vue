<template>
  <div v-if="context.isHost" class="lobby-container">
    <div>
      <h1>{{ $t("common.player.players") }} ({{ context.state.players.length }}/{{ 10 }})</h1>
      <div class="player-list">
        <div v-for="player in context.state.players">
          <p>{{ player.name }}</p>
        </div>
      </div>
    </div>
    <div>
      <h1>{{ $t("lobby.lobbyCode") }}: {{ context.state.lobbyId }}</h1>
      <h3>{{ lobbyUri }}</h3>
      <QrCode :data="lobbyUri" />
      <br /><br />
      <button @click="startGame">{{ $t("game.startGame") }}</button>
    </div>
    <div></div>
  </div>
  <div v-if="!context.isHost" class="waiting">{{ $t("lobby.waitingForHost") }}...</div>
</template>

<script>
import QrCode from "../components/QrCode.vue";
import { context } from "../context";
import { socket } from "../socket";

export default {
  name: "LobbyView",
  data: function () {
    return { context, lobbyUri: "" };
  },
  components: { QrCode },
  created: function () {
    const hostname = window.location.hostname;
    const origin = window.location.origin;
    this.lobbyUri = `${origin}/join/${context.state.lobbyId}`;
  },
  methods: {
    startGame() {
      socket.emit("startGame");
    },
  },
};
</script>

<style scoped>
.lobby-container {
  width: 100%;
  color: white;
  display: grid;
  gap: 1rem;
  padding: 1rem;
  box-sizing: border-box;
  grid-template-columns: 1fr 3fr 1fr;
}
.lobby-container button {
  border: none;
  background-color: rgb(47, 183, 183);
  font-size: 2rem;
  color: white;
  padding: 1rem;
  cursor: pointer;
  border-radius: 0.25rem;
}
.lobby-container button:hover {
  background-color: rgb(25, 101, 101);
}
.waiting {
  color: white;
  font-size: 3rem;
}

p {
  text-shadow: 0px 0px 10px black;
}

.qr {
  background: white;
  padding: 1rem;
  border-radius: 0.25rem;
  box-shadow: 0px 0px 25px black;
}

.player-list {
  text-align: start;
}
</style>
