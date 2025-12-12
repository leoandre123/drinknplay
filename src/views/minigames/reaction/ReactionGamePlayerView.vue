<template>
  <div class="reaction-game-player-container">
    <h1>REACTION GAME - PLAYER VIEW</h1>

    <div class="amount-display">
        <h2>{{ amount }}</h2>

    <div class = "button-container"> 
        <button class="remove-button" @click="remove" > - </button> 
        <button class="add-button" @click="add" > + </button>
        
    <div class ="done-button-container">
    <button class="submit-button" @click="submit" > DONE </button>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import { socket } from "../../../socket";

export default {
  name: "ReactionGamePlayerView",
  data: function () {
    return {
      amount: 0
    };
  },

  created() {
    // Hämta lobbyId från URL: /reactionplayer?id=LOBBYID
    console.log("ReactionGamePlayerView created");
    const lobbyId = this.$route.query.id;
    const name = this.$route.query.name ?? "player";
    console.log("Joining lobby with ID:", lobbyId, "as", name);

    if (!lobbyId) {
      console.log("Ingen lobbyId i URL");
      return;
    }

    // VIKTIGT: spelaren måste joina lobbyn
    socket.emit("joinLobby", lobbyId, name);
  },


  methods: {
         playSound() {
    const audio = new Audio('/sounds/buttonclick.mp3');
    audio.play();
  },
  playSubmitSound() {
    const audio = new Audio('/sounds/submitbutton.mp3');
    audio.play();
  },
    remove(){
        if (this.amount > 0) {
        this.amount--;
        this.playSound(); }
      console.log("remove")
    },
    add(){
        this.playSound();
        this.amount++;
      console.log("add")
    },
    submit() {
    this.playSubmitSound();
    console.log("submit:", this.amount);
    const lobbyId = this.$route.query.id;
    if (!lobbyId) {
        console.log("submit: saknar lobbyId i URL");
        return;
        }
    socket.emit("reaction:submit", lobbyId, this.amount, this.$route.query.name);
    console.log("submit:", this.amount, "from", this.$route.query.name);
    }
    }
    
};

</script>

<style>
    .reaction-game-player-container {  
        display: grid;
        min-height: 100vh; 
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
    .amount-display {
        margin-top: 50px;
        font-size: 100px;
    }
    .button-container {
        margin-top: 50px;   
    }
    .remove-button, .add-button {
        justify-items: center;
        grid-template-rows: 100px;
       
        width: 300px;
        height: 300px;  
        font-size: 50px;
        font-weight: bold;
        margin: 20px;
    }
    .add-button {
        background-color: #40bf44;
        color: black;
        border: none;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.4);
    }
    .remove-button {
        background-color: #d54339; /* Red */
        color: black;
        border: none;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.4);
        
    }
    .done-button-container { 
        position: fixed;      
        right: 20px;
        top: 20px;
    }
    .submit-button {
        display: grid;
        justify-content: center;
        width: 300px;
        padding-top:300px;
        padding-bottom:10px;
        margin: 10px;
        font-weight: bold;
        font-size: 30;
        background-color: rgb(239, 215, 244);
        box-shadow: 0 5px 15px rgba(0,0,0,0.4);
    }
</style>    