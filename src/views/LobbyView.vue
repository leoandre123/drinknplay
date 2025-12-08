<template>
  <RetroContainer>
    <div v-if="context.isHost" class="lobby-container">
      <div class="player-list">
        <h1>{{ $t("common.player.players") }} ({{ context.state.players.length }}/{{ 10 }})</h1>
        <div>
          <div v-for="player in context.state.players">
            <p>{{ player.name }}</p>
          </div>
        </div>
      </div>
      <div>
        <h1>{{ $t("lobby.lobbyCode") }}: {{ context.state.lobbyId }}</h1>
        <h3>{{ lobbyUri }}</h3>
        <QrCode :data="lobbyUri" background="FF89B4" color="000000" />
        <br /><br />
        <RetroButton color="pink" @click="startGame">{{ $t("game.startGame") }}</RetroButton>
      </div>
      <div></div>
    </div>
    <div v-if="!context.isHost" class="waiting">{{ $t("lobby.waitingForHost") }}...</div>
  </RetroContainer>
</template>

<script>
import QrCode from "../components/QrCode.vue";
import RetroButton from "../components/RetroButton.vue";
import RetroContainer from "../components/RetroContainer.vue";
import { context } from "../context";
import { socket } from "../socket";

export default {
  name: "LobbyView",
  data: function () {
    return { context, lobbyUri: "" };
  },
  components: { QrCode, RetroContainer, RetroButton },
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
@import url("https://fonts.googleapis.com/css2?family=Jersey+25&display=swap");

.lobby-container {
  width: 100%;
  color: white;
  display: grid;
  gap: 1rem;
  padding: 1rem;
  box-sizing: border-box;
  font-family: "Jersey 25", sans-serif;
  font-weight: 400;
  font-size: 2rem;
  font-style: normal;
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
  background: #ff89b4;
  padding: 1rem;
  border-radius: 0.25rem;
  box-shadow: 0px 0px 25px black;
}

.player-list {
  font-size: 1.5rem;
  margin: 0;
  text-align: start;
  background-color: rgba(50, 50, 50, 0.5);
  border-radius: 0.25rem;
  padding: 1rem;
}

.player-list h1 {
  margin-top: 0;
  padding-bottom: 0.5rem;
  border-bottom: 4px solid white;
}
</style>
