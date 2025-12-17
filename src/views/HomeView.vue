<template>
  <RetroContainer>
    <div v-if="!isConnected">Not connected to server</div>
    <div v-if="isConnected" class="home-container">
      <RetroText>DRINK N' DRAW</RetroText>
      <div class="menu">
        <h2>{{ $t("lobby.lobbyCode") }}</h2>
        <input v-model="lobbyCode" @input="lobbyCode = $event.target.value" />
        <p v-if="errorMsg" class="error-msg">{{ $t(`lobby.lobbyUnavailable.${errorMsg}`) }}</p>
        <br />
        <br />
        <button @click="tryJoinGame" :disabled="lobbyCode.length == 0">Join game</button>
        <div>
          <h3>
            If you want to host a game press <span class="create" @click="createGame">here</span>
          </h3>
        </div>
      </div>
    </div>
  </RetroContainer>
</template>

<script>
import RetroContainer from "../components/RetroContainer.vue";
import RetroText from "../components/RetroText.vue";
import { socket } from "../socket";
export default {
  name: "HomeView",
  components: { RetroContainer, RetroText },
  data: function () {
    return {
      isConnected: false,
      lobbyCode: "",
      errorMsg: "",
    };
  },
  mounted() {
    this.isConnected = socket.connected;
    socket.on("connect", () => (this.isConnected = true));
    socket.on("disconnect", () => (this.isConnected = false));
    socket.on("lobby:checkCodeResponse", (resp) => this.onLobbyResponse(resp));
  },
  beforeUnmount() {
    socket.off("connect");
    socket.off("disconnect");
    socket.off("lobby:checkCodeResponse");
  },
  methods: {
    tryJoinGame() {
      socket.emit("lobby:checkCode", this.lobbyCode);
    },
    onLobbyResponse(resp) {
      console.log(resp);
      if (resp.available) {
        this.$router.push({
          path: `/join/${this.lobbyCode}`,
        });
      } else {
        this.errorMsg = resp.reason;
      }
    },
    createGame() {
      this.$router.push({
        path: `/create`,
      });
    },
  },
};
</script>

<style scoped>
.home-container {
  width: 100vw;
  height: 100vh;
  justify-items: center;
  align-content: center;

  color: white;
}

.menu {
  display: flex;
  flex-direction: column;
  font-size: 1.2rem;
  font-weight: bold;
  min-width: 15rem;
  max-width: 25rem;
}

.error-msg {
  color: rgb(255, 0, 0);
  text-shadow: 0 0 2px black;
}

.menu p {
  text-align: start;
}

.menu input {
  background: #fff;
  color: black;
  box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.1);
  outline: none;
  padding: 1rem;
  font: inherit;
  border: 0.15rem solid #2c3b5f;
}
.menu input:focus {
  border-color: #596a95;
}
.menu button {
  background: #1ca2c6;
  color: rgb(255, 255, 255);
  box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.1);
  border: none;
  font: inherit;
  padding: 1rem;
}
.menu button:hover {
  background: #153f93;
}

.menu button:disabled {
  background: #2c3b5f;
  color: rgb(169, 169, 169);
}

.create {
  color: rgb(203, 130, 130);
  cursor: pointer;
}
.create:hover {
  color: rgb(126, 35, 35);
}
</style>
