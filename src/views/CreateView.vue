<template>
  <RetroContainer>
    <div class="info-button">
      <RetroButton color="blue" size="small" @click="$refs.infoPopup?.show()"> ? </RetroButton>
    </div>
    <Popup title="Info" ref="infoPopup">
      <div class="info-content">
        <h3 class="howToWin">{{ $t("createlobbyinfo.h1") }}</h3>
        <ul class="howToWinList">
          <li>{{ $t("createlobbyinfo.p1") }}</li>
          <li>{{ $t("createlobbyinfo.p2") }}</li>
          <li>{{ $t("createlobbyinfo.p3") }}</li>
        </ul>
        <h3 class="drinkingInfo">{{ $t("createlobbyinfo.h2") }}</h3>
        <ul class="drinkingInfoList">
          <li>{{ $t("createlobbyinfo.p4") }}</li>
          <li>{{ $t("createlobbyinfo.p5") }}</li>
          <li>{{ $t("createlobbyinfo.p6") }}</li>
        </ul>
      </div>
    </Popup>
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
  </RetroContainer>
</template>

<script>
import { DefaultSettings } from "../../shared/GameSettings";
import { socket } from "../socket";
import RetroContainer from "@/components/RetroContainer.vue";
import RetroButton from "@/components/RetroButton.vue";
import SettingsPanel from "@/components/SettingsPanel.vue";
import Popup from "@/components/Popup.vue";

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
    SettingsPanel,
    Popup,
  },
  mounted() {
    socket.on("lobby:created", this.onGameCreated);
  },
  beforeUnmount() {
    socket.off("lobby:created");
  },
  methods: {
    goBack() {
      this.$router.push({
        path: "/",
      });
    },
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

.info-content {
  text-align: start;
  font-size: 1.5rem;
}
.howToWin {
  text-align: center;
  color: var(--Points_Info);
  text-shadow: 2px 2px black;
}

.howToWinList {
  color: var(--Points_Info);
  text-shadow: 2px 2px black;
}
.drinkingInfo {
  text-align: center;
  color: var(--Drunkness_Info);
  text-shadow: 2px 2px black;
}

.drinkingInfoList {
  color: var(--Drunkness_Info);
  text-shadow: 2px 2px black;
}
</style>
