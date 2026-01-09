<template>
  <RetroContainer>
    <div class = create-container>
    <h1>Choose your settings</h1>
    <div class="settingsbox">
      <h2>Settings</h2>
      <hr/>
      <h3>How many minigames should your game contain?</h3>
      <button
        v-for="x in numberOfRoundsInSettings"
        class="minigameButton"
        :class="{ selected: settings.numberOfRounds === x }"
        @click="selectAmountOfMinigames(x)"
      >
        {{ x }}
      </button>
      <h3>What is your desired drunkness level?</h3>
      <button
        v-for="(_, i) in 4"
        class="drunknessButton"
        :class="{ selected: settings.drunknessLevel === i }"
        @click="selectDrunknessLevel(i)"
      >
        {{ $t(`game.drunknessLevel[${i}]`) }}
      </button>
    </div>
    <hr/>
    <RetroButton class="submitButton" @click="createGame" color='pink'>CREATE LOBBY</RetroButton>
    </div>
</RetroContainer>
</template>

<script>
import { DefaultSettings } from "../../shared/GameSettings";
import { socket } from "../socket";
import RetroContainer from "@/components/RetroContainer.vue";
import RetroButton from "@/components/RetroButton.vue";

export default {
  name: "CreateView",
  data: function () {
    return {
      settings: DefaultSettings,
      numberOfRoundsInSettings: [5,10,15,20,25,30]
    };
  },
   components: {
        RetroContainer,
        RetroButton
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
  justify-items: center;
  align-content: center;
  color: white;
}
.settingsbox {
  background: linear-gradient(90deg, #4b6bb744 30%, #1828485f 100%);
  border: 2px outset black;
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
  font-size: 15px;
  background-color: pink;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
}
.drunknessButton {
  width: 140px;
  padding-top: 10px;
  padding-bottom: 10px;
  margin: 10px;
  font-weight: bold;
  font-size: 15px;
  
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
}
.selected {
  background-color: #701050;
  color: white;
  font-weight: bolder;
}
</style>
