<template>
  <NewRetroContainer>
    <div class="info-button">
      <RetroButton color="blue" size="small" @click="showInfo"> ? </RetroButton>
    </div>
    <div v-if="context.isHost" class="lobby-container">
      <div class="side-list player-list">
        <h1>
          {{ $t("common.player.players") }} ({{ context.state!.players.length }}/{{
            context.state!.settings.maxPlayers
          }})
        </h1>

        <div v-for="player in context.state!.players" class="player">
          <Avatar :settings="player.avatarSettings" />
          <p>
            {{ player.name }}
          </p>
        </div>
      </div>
      <div class="main">
        <h1>{{ $t("lobby.lobbyCode") }}: {{ context.state!.lobbyId }}</h1>
        <QrCode :data="lobbyUri" background="FF89B4" color="000000" />
        <RetroButton size="medium" color="green" @click="startGame">{{
          $t("game.startGame")
        }}</RetroButton>
      </div>
      <div class="side-list settings-list">
        <h1>
          {{ $t("settings.settings") }}
          <span class="gear-icon" @click="openSettings()"></span>
        </h1>
        <p>
          # {{ $t("settings.rounds") }}:
          <span class="right">{{ context.state!.settings.numberOfRounds }}</span>
        </p>
        <p>
          {{ $t("settings.drunknessLevel") }}:
          <span class="right">
            {{ $t(`game.drunknessLevel[${context.state!.settings.drunknessLevel}]`) }}
          </span>
        </p>
        <p>
          {{ $t("settings.maxPlayers") }}:
          <span class="right">
            {{ context.state!.settings.maxPlayers }}
          </span>
        </p>
      </div>
    </div>
    <div v-if="!context.isHost" class="waiting">
      <div class="player-avatar">
        <Avatar :settings="context.getCurrentPlayer()?.avatarSettings" />
      </div>
      <p>{{ context.getCurrentPlayer()?.name }}</p>
      <p>{{ $t("lobby.waitingForHost") }}...</p>
    </div>
  </NewRetroContainer>
</template>

<script setup lang="ts">
import { useDialog } from "@/dialog";
import { context } from "../../context";
import { socket } from "../../socket";
import { audioManager } from "@/AudioManager";
import Avatar from "@/shared/components/avatar/Avatar.vue";
import SettingsPanel from "@/shared/components/settings/SettingsPanel.vue";
import NewRetroContainer from "@/shared/components/UI/NewRetroContainer.vue";
import RetroButton from "@/shared/components/UI/RetroButton.vue";
import { onMounted, ref } from "vue";
import QrCode from "@/shared/components/QrCode.vue";
import LobbyInfo from "./LobbyInfo.vue";

const lobbyUri = ref("");
const dialog = useDialog();

onMounted(() => {
  const hostname = window.location.hostname;
  const origin = window.location.origin;
  lobbyUri.value = `${origin}/join/${context.state!.lobbyId}`;

  audioManager.play("/sounds/theme.mp3");
});

function startGame() {
  socket.emit("lobby:start");
  audioManager.stopAll();
}

function onSettingsChanged() {
  console.log("HE");
  socket.emit("lobby:updateSettings", context.state!.settings);
}

function openSettings() {
  dialog.modal(
    SettingsPanel,
    { title: "Settings", showClose: true },
    { settings: context.state!.settings },
    { settingsChanged: onSettingsChanged },
  );
}

function showInfo() {
  dialog.modal(LobbyInfo, { title: "Info", showClose: true });
}
</script>

<style scoped>
.info-button {
  position: absolute;
  top: 1rem;
  left: 1rem;
}
.lobby-container {
  width: 100%;
  color: white;
  display: grid;
  gap: 1rem;
  padding: 1rem;
  box-sizing: border-box;
  font-family: "Jersey 25", sans-serif;
  font-weight: 400;
  font-size: 2rem;
  font-style: normal;
  grid-template-columns: 1fr 2fr 1fr;
  position: relative;
}

.waiting {
  color: white;
  font-size: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

p {
  text-shadow: 0px 0px 10px black;
}

.qr {
  background: #ff89b4;
  padding: 1rem;
  border-radius: 0.25rem;
  box-shadow: 0px 0px 25px black;
}

.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}

.side-list {
  font-size: 1.5rem;
  margin: 0;
  text-align: start;
  background-color: rgba(50, 50, 50, 0.5);
  border-radius: 0.25rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.side-list h1 {
  margin-top: 0;
  padding-bottom: 0.5rem;
  border-bottom: 4px solid white;
}

.side-list .right {
  color: red;
  float: right;
}

.side-list .gear-icon {
  color: black;
  height: 2rem;
  aspect-ratio: 1;
  background-image: url("/gear.png");
  background-size: contain;
  cursor: pointer;
  float: right;
}

.player-list {
  gap: 1rem;
}
.settings-list {
  gap: 1rem;
}

.player {
  display: flex;
  align-items: center;
  height: 2rem;
}

.player-avatar {
  width: 4rem;
}
</style>
