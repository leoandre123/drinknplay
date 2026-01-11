<template>
  <div class="create-container">
    <h1>{{$t("settings.chooseSettings")}}</h1>
    <div class="settingsbox">
      <h2>{{$t('settings.settings')}}</h2>
      <hr />
      <h3>{{$t('settings.minigameQ')}}</h3>
      <button
        v-for="x in 20"
        class="minigameButton"
        :class="{ selected: settings.numberOfRounds === x }"
        @click="selectAmountOfMinigames(x)"
      >
        {{ x }}
      </button>
      <h3>{{$t('settings.drunknessQ')}}</h3>
      <button
        v-for="(_, i) in 4"
        class="drunknessButton"
        :class="{ selected: settings.drunknessLevel === i }"
        @click="selectDrunknessLevel(i)"
      >
        {{ $t(`game.drunknessLevel[${i}]`) }}
      </button>
    </div>
    <button class="submitButton" @click="createGame">{{ $t("settings.create") }}</button>
  </div>
</template>

<script>
import { DefaultSettings } from "../../shared/GameSettings";
import { socket } from "../socket";

export default {
  name: "CreateView",
  data: function () {
    return {
      settings: DefaultSettings,
    };
  },
  mounted() {
    socket.on("lobby:created", this.onGameCreated);
  },
  beforeUnmount() {
    socket.off("lobby:created");
  },
  methods: {
    selectAmountOfMinigames(amount) {
      this.settings.numberOfRounds = amount;
    },
    selectDrunknessLevel(level) {
      this.settings.drunknessLevel = level;
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
  width: 100vw;
  height: 100vh;
  justify-items: center;
  align-content: center;
  background-image: radial-gradient(
    circle farthest-corner at 10% 20%,
    rgb(102, 0, 32) 0%,
    rgb(116, 18, 92) 49.5%,
    rgb(164, 34, 144) 90%
  );
  color: white;
}
.settingsbox {
  background: linear-gradient(90deg, #4b6bb744 0%, #1828485f 100%);
}
.minigameButton {
  width: 50px;
}
button {
  width: 120px;
  padding-top: 10px;
  padding-bottom: 10px;
  margin: 10px;
  font-weight: bold;
  font-size: 16;
  background-color: pink;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
}
.drunknessButton {
  width: 120px;
  padding-top: 10px;
  padding-bottom: 10px;
  margin: 10px;
  font-weight: bold;
  font-size: 16;
  background-color: pink;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
}
.selected {
  background-color: #701050;
  color: white;
}
</style>
