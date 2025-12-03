<template>
  <div v-if="lobbyAvailable === undefined">Loading...</div>
  <div v-if="lobbyAvailable === true" class="join-container">
    <div class="menu">
      <h1>Join game</h1>
      <p>Name</p>
      <input v-model="name" @change="name" @input="name = $event.target.value" />
      <br />
      <br />
      <button :disabled="name.length == 0" @click="joinGame">Join game</button>
    </div>
  </div>
  <div v-if="lobbyAvailable === false">hej</div>
</template>

<script>
import { socket } from "../socket";

export default {
  name: "JoinView",
  data: function () {
    return {
      lobbyAvailable: undefined,
      lobbyId: undefined,
      name: "",
    };
  },
  mounted() {
    socket.on("checkLobbyCodeResponse", (response) => {
      console.log(response);
      this.lobbyAvailable = response.available;
    });

    this.lobbyId = this.$route.params.id;
    if (this.lobbyId) {
      socket.emit("checkLobbyCode", this.lobbyId);
    }
  },
  beforeUnmount() {
    socket.off("checkLobbyCodeResponse");
  },
  methods: {
    joinGame() {
      console.log(`Join game ${this.lobbyId} with name ${this.name}`);
      this.$router.push({
        path: "/game",
        query: {
          id: this.lobbyId,
          name: this.name,
        },
      });
    },
  },
};
</script>

<style scoped>
.join-container {
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
  color: white;
}

.menu {
  display: flex;
  flex-direction: column;
  font-size: 1.2rem;
  font-weight: bold;
}

.menu p {
  text-align: start;
  min-width: 15rem;
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
</style>
