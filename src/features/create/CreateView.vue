<template>
  <NewRetroContainer>
    <div class="info-button">
      <RetroButton color="blue" size="small" @click="showInfo()"> ? </RetroButton>
    </div>
    <div class="create-container">
      <h1>{{ $t("settings.settings") }}</h1>
      <SettingsPanel :settings="settings" class="settings" />
      <div style="display: flex; gap: 1rem">
        <RetroButton color="red" @click="goBack">{{ $t("settings.back") }}</RetroButton>
        <div>
          <RetroButton class="submitButton" @click="createGame" color="green">{{
            $t("settings.create")
          }}</RetroButton>
        </div>
      </div>
    </div>
  </NewRetroContainer>
</template>

<script setup lang="ts">
import { DefaultSettings } from "../../../shared/models/GameSettings";
import { socket } from "../../socket";
import { onBeforeUnmount, onMounted, ref } from "vue";
import router from "@/router";
import NewRetroContainer from "@/shared/components/UI/NewRetroContainer.vue";
import RetroButton from "@/shared/components/UI/RetroButton.vue";
import SettingsPanel from "@/shared/components/settings/SettingsPanel.vue";
import { useDialog } from "@/dialog";
import HowToPlayPopup from "./HowToPlayPopup.vue";

const settings = ref(DefaultSettings);

const dialog = useDialog();

onMounted(() => {
  socket.on("lobby:created", onGameCreated);
});
onBeforeUnmount(() => {
  socket.off("lobby:created");
});

function goBack() {
  router.push({
    path: "/",
  });
}
function showInfo() {
  dialog.modal(HowToPlayPopup, { title: "Info", showClose: true });
}
function createGame() {
  if (settings.value.drunknessLevel == 0) {
    dialog.info("Error", "Invalid mode: 'Sober'. Try again!", "Ok");
  } else {
    socket.emit("lobby:create", settings.value);
  }
}
function onGameCreated(lobbyId: string) {
  router.push({
    path: "/game",
    query: {
      id: lobbyId,
      mode: "host",
    },
  });
}
</script>

<style scoped>
.create-container {
  align-items: center;
  justify-content: center;
  color: white;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.settings {
  background: linear-gradient(90deg, #4b6bb744 30%, #1828485f 100%);
  border-radius: 0.25rem;
}

.info-button {
  position: absolute;
  top: 1rem;
  left: 1rem;
}
</style>
