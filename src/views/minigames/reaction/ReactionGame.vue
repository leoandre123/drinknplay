<template> 
  <div class="reaction-game-container">
    <h1>REACTION GAME</h1>
    <p>Count the figures in the picture as fast as you can!</p>
    <div v-if="!gameStarted" class="button-container">
      <button class = "start-button" @click="generatepicture"> START GAME </button>
    </div>
    <div v-else class="picture-container">
     <img
        v-for="n in figureCount"
        :key="n"
        :src="mascot"
        :style="getRandomPositions()"
      />
        </div>
  </div>
</template>

<script>
import { socket } from "../../../socket";
import mascot from "@/assets/mascot.png";

export default {
  name: "ReactionGameHostView",

  data() {
    return {
      gameStarted: false,
      figureCount: 0,
      mascot,
      amount: 0,
    };
  },

  created() {
    // /reactiongame?id=LOBBYID
    const lobbyId = this.$route.query.id;
    console.log("Joining lobby with ID:", lobbyId);

    if (!lobbyId) {
      console.log("Ingen lobbyId i URL. Ex: /reactiongame?id=lobby");
      return;
    }
    socket.emit("joinLobbyHost", lobbyId);

    // ta emot amount från servern (din sockets.js skickar hit)
    socket.on("reaction:hostUpdate", (data) => {
      this.amount = data.amount;
      this.name = data.name;
      console.log("Host received amount:", this.amount, "from", this.name);
    });
  },

  beforeUnmount() {
    socket.off("reaction:hostUpdate");
  },

    methods: {
        playSound() {
    const audio = new Audio('/sounds/submitbutton.mp3');
    audio.play();
  },
    generatepicture() {
        this.playSound();
      this.gameStarted = true;
      this.figureCount = Math.floor(Math.random() * 8) + 3;
    },
    getRandomPositions() {
      const x = Math.random() * 90;
      const y = Math.random() * 90;
      return {
        position: "absolute",
        top: y + "%",
        left: x + "%",
      };
    },
    }
};



</script>

<style>
.reaction-game-container {  
    display: grid;
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
.picture-container {
    position: relative; 
    margin-top: 20px;
    width: 900px;
    height: 600px;
    border: 2px solid white;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: whitesmoke;
}
.start-button {
    width: 300px;
    padding-top:10px;
    padding-bottom:10px;
    margin: 10px;
    font-weight: bold;
    font-size: 16;
    background-color: pink;
    box-shadow: 0 5px 15px rgba(0,0,0,0.4);
    }
</style>