<template>
  <Popup :title="lobby?.id ?? 'No lobby selected'">
    <div class="manage-lobby-popup">
      <template v-if="lobby">
        <h3>Status</h3>
        <p>Players: {{ lobby.players.length }}</p>
        <p>Phase: {{ lobby.phase }}</p>
        <br />
        <h3>Actions</h3>
        <RetroButton>Advance phase</RetroButton>
        <RetroButton>Add bot</RetroButton>
        <RetroButton color="red" @click="actions.killLobby?.(lobby.id)">Kill lobby</RetroButton>
      </template>
    </div>
  </Popup>
</template>
<script setup lang="ts">
import Popup from "@/shared/components/Popup.vue";
import RetroButton from "@/shared/components/UI/RetroButton.vue";
import type { LobbyDto } from "@shared/models/LobbyDto";

defineProps<{ lobby?: LobbyDto; actions: { killLobby: (id: string) => void } }>();
</script>

<style scoped>
.manage-lobby-popup {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: start;
  width: 15rem;
  max-width: 90%;
}
.manage-lobby-popup h3 {
  text-align: center;
}
</style>
