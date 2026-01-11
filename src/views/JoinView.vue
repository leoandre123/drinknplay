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
          <RetroButton
            size="small"
            color="yellow"
            @click="avatarSettings.eyes = mod(avatarSettings.eyes - 1, 4)"
            >&lt;</RetroButton
          >
          <RetroButton
            size="small"
            color="yellow"
            @click="avatarSettings.mouth = mod(avatarSettings.mouth - 1, 2)"
            >&lt;</RetroButton
          >
          <RetroButton
            size="small"
            color="yellow"
            @click="avatarSettings.body = mod(avatarSettings.body - 1, 3)"
            >&lt;</RetroButton
          >
        </div>
        <div class="avatar-image">
          <Avatar :settings="avatarSettings" />
        </div>

        <div class="buttons">
          <RetroButton
            size="small"
            color="yellow"
            @click="avatarSettings.eyes = mod(avatarSettings.eyes + 1, 4)"
            >&gt;</RetroButton
          >
          <RetroButton
            size="small"
            color="yellow"
            @click="avatarSettings.mouth = mod(avatarSettings.mouth + 1, 2)"
            >&gt;</RetroButton
          >
          <RetroButton
            size="small"
            color="yellow"
            @click="avatarSettings.body = mod(avatarSettings.body + 1, 3)"
            >&gt;</RetroButton
          >
        </div>
      </div>
      <div class="randomize-avatar">
        <RetroButton size="small" @click="randomizeAvatar">Randomize</RetroButton>
      </div>
      <br />
      <RetroButton color="green" :disabled="name.length == 0" @click="joinGame"
        >Join game</RetroButton
      >
    </div>
  </div>
  <div v-if="lobbyAvailable === false">{{ unavailableReason }}</div>
</template>

<script>
import { GetRandomAvatar } from "@shared/AvatarHelper";
import { mod } from "@shared/MathHelper";
import Avatar from "../components/Avatar.vue";
import { socket } from "../socket";
import RetroButton from "@/components/RetroButton.vue";

export default {
  name: "JoinView",
  components: { Avatar, RetroButton },
  data: function () {
    return {
      lobbyAvailable: undefined,
      unavailableReason: "unknown",
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
      sessionStorage.setItem("avatar", JSON.stringify(this.avatarSettings));
      this.$router.push({
        path: "/game",
        query: {
          id: this.lobbyId,
          name: this.name,
        },
      });
    },
    randomizeAvatar() {
      this.avatarSettings = GetRandomAvatar();
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
}

.randomize-avatar {
  margin-top: 1rem;
}
</style>
