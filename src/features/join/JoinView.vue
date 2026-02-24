<template>
  <div v-if="lobbyAvailable === undefined">{{ $t("common.loading") }}...</div>
  <div v-if="lobbyAvailable === true" class="join-container">
    <div class="menu">
      <h1>{{ $t("common.joinGame") }}</h1>
      <p>{{ $t("common.personName") }}</p>
      <input v-model="name" />
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

<script setup lang="ts">
import { mod } from "@shared/utils/MathHelper";
import { DefaultAvatar, GetRandomAvatar } from "@shared/models/AvatarSettings";
import Avatar from "@/shared/components/avatar/Avatar.vue";
import RetroButton from "@/shared/components/UI/RetroButton.vue";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { socket } from "@/socket";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();

const lobbyAvailable = ref<boolean | undefined>(undefined);
const unavailableReason = ref("unknown");
const lobbyId = ref("");
const name = ref("");
const avatarSettings = ref(DefaultAvatar);

(onMounted(() => {
  socket.on("lobby:checkCodeResponse", (response) => {
    console.log(response);
    lobbyAvailable.value = response.available;
  });

  lobbyId.value = route.params.id?.toString() ?? "";
  if (lobbyId.value) {
    socket.emit("lobby:checkCode", lobbyId.value);
  }
}),
  onBeforeUnmount(() => {
    socket.off("lobby:checkCodeResponse");
  }));

function joinGame() {
  sessionStorage.setItem("avatar", JSON.stringify(avatarSettings.value));
  router.push({
    path: "/game",
    query: {
      id: lobbyId.value,
      name: name.value,
    },
  });
}
function randomizeAvatar() {
  avatarSettings.value = GetRandomAvatar();
}
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

.randomize-avatar {
  margin-top: 1rem;
}
</style>
