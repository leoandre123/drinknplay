<template>
  <div class="settingsbox">
    <h2>{{ $t("settings.minigameQ") }}</h2>
    <div class="button-group">
      <RetroButton
        v-for="x in [5, 10, 15, 20, 25, 30]"
        :color="x == settings.numberOfRounds ? 'purple' : 'pink'"
        size="small"
        class="minigameButton"
        @click="
          settings.numberOfRounds = x;
          $emit('settingsChanged');
        "
      >
        {{ x }}
      </RetroButton>
    </div>
    <h2>{{ $t("settings.maxPlayers") }}</h2>
    <div class="button-group">
      <RetroButton
        v-for="x in [2, 3, 4, 5, 6, 7, 8]"
        :color="x == settings.maxPlayers ? 'purple' : 'pink'"
        size="small"
        class="minigameButton"
        @click="
          settings.maxPlayers = x;
          $emit('settingsChanged');
        "
      >
        {{ x }}
      </RetroButton>
    </div>
    <h2>{{ $t("settings.drunknessQ") }}</h2>
    <div class="button-group">
      <RetroButton
        v-for="(_, i) in 4"
        size="small"
        :color="i == settings.drunknessLevel ? 'purple' : 'pink'"
        class="drunknessButton"
        @click="
          settings.drunknessLevel = i;
          $emit('settingsChanged');
        "
      >
        {{ $t(`game.drunknessLevel[${i}]`) }}
      </RetroButton>
    </div>
  </div>
</template>

<script>
import RetroButton from "./RetroButton.vue";

export default {
  name: "SettingsPanel",
  components: { RetroButton },
  props: { settings: Object },
  emits: ["settingsChanged"],
};
</script>

<style scoped>
.settingsbox {
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
.info-button {
  position: absolute;
  top: 1rem;
  left: 1rem;
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
