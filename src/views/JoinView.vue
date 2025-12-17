<template>
  <div v-if="lobbyAvailable === undefined">Loading...</div>
  <div v-if="lobbyAvailable === true" class="join-container">
    <div class="menu">
      <h1>Join game</h1>
      <p>Name</p>
      <input v-model="name" @input="name = $event.target.value" />
      <br />
      <br />
      <div class="avatar-editor">
        <div class="buttons">
          <button @click="avatarSettings.eyes = mod(avatarSettings.eyes - 1, 4)">&lt;</button>
          <button @click="avatarSettings.mouth = mod(avatarSettings.mouth - 1, 2)">&lt;</button>
          <button @click="avatarSettings.body = mod(avatarSettings.body - 1, 3)">&lt;</button>
        </div>
        <div class="avatar-image">
          <Avatar :settings="avatarSettings" />
        </div>

        <div class="buttons">
          <button @click="avatarSettings.eyes = mod(avatarSettings.eyes + 1, 4)">&gt;</button>
          <button @click="avatarSettings.mouth = mod(avatarSettings.mouth + 1, 2)">&gt;</button>
          <button @click="avatarSettings.body = mod(avatarSettings.body + 1, 3)">&gt;</button>
        </div>
      </div>

      <br />
      <button :disabled="name.length == 0" @click="joinGame">Join game</button>
    </div>
  </div>
  <div v-if="lobbyAvailable === false">LOBBY STARTED</div>
</template>

<script>
import { mod } from "../../shared/MathHelper";
import Avatar from "../components/Avatar.vue";
import { socket } from "../socket";

export default {
  name: "JoinView",
  components: { Avatar },
  data: function () {
    return {
      lobbyAvailable: undefined,
      lobbyId: undefined,
      name: "",
      mod,
      avatarSettings: {
        body: 0,
        eyes: 0,
        mouth: 0,
      },
    };
  },
  mounted() {
    socket.on("lobby:checkCodeResponse", (response) => {
      console.log(response);
      this.lobbyAvailable = response.available;
    });

    this.lobbyId = this.$route.params.id;
    if (this.lobbyId) {
      socket.emit("lobby:checkCode", this.lobbyId);
    }
  },
  beforeUnmount() {
    socket.off("lobby:checkCodeResponse");
  },
  methods: {
    joinGame() {
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
  min-width: 20rem;
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

.avatar-editor {
  display: flex;
  justify-content: center;
}
.avatar-image {
  flex-grow: 1;
}
.avatar-editor .buttons {
  justify-content: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.avatar-editor .buttons button {
  background-color: rgba(255, 0, 0, 0.13);
  cursor: pointer;
  border-radius: 50%;
  height: 3rem;
  width: 3rem;
  color: black;
}
</style>
