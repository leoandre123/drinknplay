<template>
  <NewRetroContainer>
    <div v-if="!isConnected" class="connection-warning">Not connected to server...</div>
    <div v-if="isConnected" class="home-container">
      <RetroText>{{ $t("common.name") }}</RetroText>
      <div class="menu">
        <h2>{{ $t("lobby.lobbyCode") }}</h2>
        <input v-model="lobbyCode" maxlength="3" />
        <p v-if="errorMsg" class="error-msg">{{ $t(`lobby.lobbyUnavailable.${errorMsg}`) }}</p>
        <RetroButton
          size="medium"
          color="green"
          @click="tryJoinGame"
          :disabled="lobbyCode.length != 3"
        >
          {{ $t("game.joinGame") }}
        </RetroButton>
        <div>
          <h3>
            {{ $t("game.hostQuestion") }}
            <span class="create" @click="createGame">{{ $t("game.here") }}</span>
          </h3>
        </div>
      </div>
    </div>
  </NewRetroContainer>
</template>

<script setup lang="ts">
import router from "@/router";
import NewRetroContainer from "@/shared/components/UI/NewRetroContainer.vue";
import RetroButton from "@/shared/components/UI/RetroButton.vue";
import RetroText from "@/shared/components/UI/RetroText.vue";
import { socket } from "@/socket";
import { onBeforeUnmount, onMounted, ref } from "vue";

const isConnected = ref(false);
const lobbyCode = ref("");
const errorMsg = ref("");

onMounted(() => {
  isConnected.value = socket.connected;
  socket.on("connect", () => (isConnected.value = true));
  socket.on("disconnect", () => (isConnected.value = false));
  socket.on("lobby:checkCodeResponse", (resp) => onLobbyResponse(resp));
});

onBeforeUnmount(() => {
  socket.off("connect");
  socket.off("disconnect");
  socket.off("lobby:checkCodeResponse");
});

function tryJoinGame() {
  socket.emit("lobby:checkCode", lobbyCode.value.toUpperCase());
}
function onLobbyResponse(resp: any) {
  console.log(resp);
  if (resp.available) {
    router.push({
      path: `/join/${lobbyCode.value.toUpperCase()}`,
    });
  } else {
    errorMsg.value = resp.reason;
  }
}
function createGame() {
  router.push({
    path: `/create`,
  });
}
</script>

<style scoped>
.home-container {
  display: grid;
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
  gap: 1.5rem;
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
  text-transform: uppercase;
}
.menu input:focus {
  border-color: #596a95;
}

.create {
  color: rgb(203, 130, 130);
  cursor: pointer;
}
.create:hover {
  color: rgb(126, 35, 35);
}

.connection-warning {
  height: 100dvh;
  align-content: center;
  font-size: 3rem;
}
</style>
