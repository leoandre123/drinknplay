<template>
  <div class="lobbies-container">
    <h2>All lobbies</h2>
    <div>
      <RetroButton size="small" @click="createLobby">Create Lobby</RetroButton>
      <RetroInput v-model="lobbyQuery" size="small" placeholder="Search lobby id..."></RetroInput>
    </div>
    <div class="lobby-container">
      <ResponsiveGrid min-width="15rem">
        <div
          v-for="lobby in admin.lobbies.filter((x) =>
            x.id.toLowerCase().includes(lobbyQuery.toLocaleLowerCase()),
          )"
          class="lobby-card"
        >
          <h2>{{ lobby.id }} <span v-if="lobby.disposalScheduled" style="color: red">(D)</span></h2>
          <p>Players: {{ lobby.players.length }}</p>
          <p>Phase: {{ lobby.phase }}</p>
          <p>Created: {{ formatDuration(Date.now() - lobby.createdDate) }} ago</p>
          <div class="button-group">
            <RetroButton size="small" color="red" @click="killLobby(lobby.id)">Kill</RetroButton>
            <RetroButton size="small" @click="manageLobby(lobby.id)">Manage</RetroButton>
          </div>
        </div>
      </ResponsiveGrid>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { useDialog } from "@/dialog";
import RetroInput from "@/shared/components/UI/RetroInput.vue";
import RetroButton from "@/shared/components/UI/RetroButton.vue";
import ResponsiveGrid from "@/shared/components/UI/framework/ResponsiveGrid.vue";
import ManageLobbyPopup from "../components/ManageLobbyPopup.vue";
import { useAdminClient } from "../useAdminClient";

const dialog = useDialog();
const lobbyQuery = ref("");
const admin = useAdminClient();

function createLobby() {
  dialog.confirm("Create lobby", "Do you want to create a new lobby?").then((x) => {
    if (x) {
      admin.createLobby();
      admin.requestUpdate();
    }
  });
}
function killLobby(id: string) {
  dialog.confirm("Kill lobby", `Are you sure want to remove lobby with ID: ${id}?`).then((x) => {
    if (x) {
      admin.killLobby(id);
      admin.requestUpdate();
    }
  });
}
function manageLobby(id: string) {
  const lobby = admin.lobbies.find((x) => x.id == id);
  dialog.open(ManageLobbyPopup, { lobby, actions: { killLobby } });
}

function formatDuration(duration: number): string {
  if (duration < 1000) {
    return `${Math.floor(duration)}ms`;
  } else if (duration < 60_000) {
    return `${Math.floor(duration / 1000)}s`;
  } else if (duration < 3_600_000) {
    return `${Math.floor(duration / 60_000)}m`;
  } else if (duration < 86_400_000) {
    return `${Math.floor(duration / 3_600_000)}h ${Math.floor((duration % 3_600_000) / 60_000)}m`;
  } else {
    return `${Math.floor(duration / 3_600_000)}h`;
  }
}
</script>
<style scoped>
.lobbies-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}
.panel {
  background-color: #191836;
  padding: 1rem;
  margin: 1rem;
  border-radius: 0.25rem;
}
.lobby-container {
  max-height: 40rem;
  overflow: auto;
}
.lobby-card {
  background: linear-gradient(#8906e1 0%, #8c5dab 100%);
  color: white;
  padding: 1rem;
  border-radius: 1rem;
  justify-items: center;
}

.lobby-actions {
  display: flex;
  gap: 0.5rem;
}
.button-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.expander {
  flex-grow: 1;
}
</style>
