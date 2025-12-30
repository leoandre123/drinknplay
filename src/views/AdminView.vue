<template>
  <div class="admin-background">
    <h1>Admin View</h1>
    <div class="panel">
      <h2>Status</h2>
      <p>Uptime: {{ uptime }}s</p>
    </div>
    <div class="panel">
      <h2>All lobbies</h2>
      <button @click="createLobby">Create Lobby</button>
      <div class="lobby-container">
        <div v-for="lobby in lobbies" class="lobby-card">
          <h2>{{ lobby.id }}</h2>
          <p>Players: {{ lobby.players.length }}</p>
          <p>Phase: {{ lobby.phase }}</p>

          <div class="lobby-actions">
            <button>Kill</button>
            <button>Manage</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { DefaultSettings } from "../../shared/GameSettings";
import { socket } from "../socket";

export default {
  name: "AdminView",
  data() {
    return {
      lobbies: [],
      serverInfo: {},
      uptime: 0,
    };
  },
  created() {
    socket.on("admin:allLobbies", (lobbies) => {
      console.log(lobbies);
      this.lobbies = lobbies;
    });
    socket.on("admin:serverInfo", (info) => {
      this.serverInfo = info;
      console.log(info);
    });

    setInterval(() => {
      this.uptime = Math.round((Date.now() - this.serverInfo.startTime) / 1000);
    }, 1000);

    this.update();
  },
  methods: {
    update() {
      socket.emit("admin:requestUpdate");
    },
    createLobby() {
      socket.emit("lobby:create", DefaultSettings);
      this.update();
    },
  },
};
</script>
<style scoped>
.admin-background {
  background-color: #0e0f31;
  color: beige;
  position: absolute;
  width: 100vw;
  min-height: 100dvh;
  box-sizing: border-box;
}
.panel {
  background-color: #191836;
  padding: 1rem;
  margin: 1rem;
  border-radius: 0.25rem;
}
.lobby-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
}
.lobby-card {
  background: linear-gradient(#8906e1 0%, #8c5dab 100%);
  color: white;
  padding: 1rem;
  border-radius: 1rem;
}
.lobby-actions {
  display: flex;
  gap: 0.5rem;
}
button {
  padding: 0.75rem;
  border: none;
  background-color: rgb(188, 156, 193);
  cursor: pointer;
  border-radius: 0.25rem;
}
button:hover {
  background-color: rgb(76, 54, 99);
  color: white;
}
</style>
