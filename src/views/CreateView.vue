<template>
  <RetroContainer>
    <div class="info-button">
      <RetroButton color="blue" size="small" @click="showRules = true"> ? </RetroButton>
    </div>
    <CreateLobbyInfo v-if="showRules" @close="showRules = false" />
    <div class="create-container">
      <h1>{{ $t("settings.settings") }}</h1>
      <SettingsPanel :settings="settings" class="settings" />
      <div style="display: flex; gap: 1rem">
        <RetroButton color="red">{{ $t("settings.back") }}</RetroButton>
        <div>
          <RetroButton class="submitButton" @click="createGame" color="green">{{
            $t("settings.create")
          }}</RetroButton>
        </div>
      </div>
    </div>
  </RetroContainer>
</template>

<script>
import { DefaultSettings } from "../../shared/GameSettings";
import { socket } from "../socket";
import RetroContainer from "@/components/RetroContainer.vue";
import RetroButton from "@/components/RetroButton.vue";
import CreateLobbyInfo from "@/components/CreateLobbyInfo.vue";
import SettingsPanel from "@/components/SettingsPanel.vue";

export default {
  name: "CreateView",
  data: function () {
    return {
      settings: DefaultSettings,
      showRules: false,
    };
  },
  components: {
    RetroContainer,
    RetroButton,
    CreateLobbyInfo,
    SettingsPanel,
  },
  mounted() {
    socket.on("lobby:created", this.onGameCreated);
  },
  beforeUnmount() {
    socket.off("lobby:created");
  },
  methods: {
    createGame() {
      socket.emit("lobby:create", this.settings);
    },
    onGameCreated(lobbyId) {
      this.$router.push({
        path: "/game",
        query: {
          id: lobbyId,
          mode: "host",
        },
      });
    },
  },
};
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
