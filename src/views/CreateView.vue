<template>
  <RetroContainer>
    <div class="create-container">
      <h1>{{$t('settings.settings')}</h1>
      <br />
      <div class="settingsbox">
        <h2>{{$t('settings.minigameQ')}}</h2>
        <div class="button-group">
          <RetroButton
            v-for="x in numberOfRoundsInSettings"
            :color="x == settings.numberOfRounds ? 'purple' : 'pink'"
            size="small"
            class="minigameButton"
            @click="selectAmountOfMinigames(x)"
          >
            {{ x }}
          </RetroButton>
        </div>
        <h2>{{$t('settings.maxPlayers')}</h2>
        <div class="button-group">
          <RetroButton
            v-for="x in [2, 3, 4, 5, 6, 7, 8]"
            :color="x == settings.maxPlayers ? 'purple' : 'pink'"
            size="small"
            class="minigameButton"
            @click="this.settings.maxPlayers = x"
          >
            {{ x }}
          </RetroButton>
        </div>
        <h2>{{$t('settings.drunknessQ')}</h2>
        <div class="button-group">
          <RetroButton
            v-for="(_, i) in 4"
            size="small"
            :color="i == settings.drunknessLevel ? 'purple' : 'pink'"
            class="drunknessButton"
            @click="selectDrunknessLevel(i)"
          >
            {{ $t(`game.drunknessLevel[${i}]`) }}
          </RetroButton>
        </div>
      </div>
      <RetroButton class="submitButton" @click="createGame" color="green">$t("settings.create"</RetroButton>
    </div>
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
      numberOfRoundsInSettings: [5, 10, 15, 20, 25, 30],
    };
  },
  components: {
    RetroContainer,
    RetroButton,
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
      console.log(this.settings);
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
  height: 100vh;
  overflow: hidden;
}
.settingsbox {
  background: linear-gradient(90deg, #4b6bb744 30%, #1828485f 100%);
  border-radius: 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.minigameButton {
  width: 3rem;
}

.drunknessButton {
  width: 8rem;
}
.selected {
  background-color: #701050;
  color: white;
  font-weight: bolder;
}
</style>
