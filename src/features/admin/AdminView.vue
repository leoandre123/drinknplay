<template>
  <div v-if="!admin.isAuthenticated" class="admin-background not-authenticated">
    <p>Code:</p>
    <br />
    <RetroInput v-model="code" type="password" />
    <br />
    <br />
    <RetroButton @click="authenticate">Authenticate</RetroButton>
  </div>
  <div v-else class="admin-background">
    <div class="admin-container">
      <div class="nav">
        <AdminNavbar />
      </div>
      <div class="main-content"><RouterView /></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import RetroButton from "@/shared/components/UI/RetroButton.vue";
import RetroInput from "@/shared/components/UI/RetroInput.vue";
import { onMounted, ref } from "vue";
import AdminNavbar from "./components/AdminNavbar.vue";
import { useAdminClient } from "./useAdminClient";

const admin = useAdminClient();

const code = ref(admin.token);

onMounted(() => {
  authenticate();
});

function authenticate() {
  if (!code.value.length) return;
  admin.connect(code.value);
}
</script>
<style scoped>
.admin-background {
  background-color: #0e0f31;
  color: beige;
  position: absolute;
  width: 100%;
  height: 100dvh;
  box-sizing: border-box;
  scrollbar-color: purple transparent;
  scrollbar-width: thin;
}
.admin-container {
  display: flex;
  width: 100%;
  height: 100%;
}

.main-content {
  flex-grow: 1;
  flex-basis: 0;
  overflow: auto;
}
.not-authenticated {
  align-content: center;
}
</style>
