<template>
  <div class="reaction-game-player-container">
    <h1>REACTION GAME - PLAYER VIEW</h1>

    <div class="amount-display">
        <h2>{{ amount }}</h2>

    <div class = "button-container"> 
        <button class="remove-button" @click="remove" > - </button> 
        <button class="add-button" @click="add" > + </button>
        
    <div class ="done-button-container">
    <button class="submit-button" @click="" > DONE </button>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ReactionGamePlayerView",
  data: function () {
    return {
      amount: 0
    };
  },
  methods: {
    remove(){
        if (this.amount > 0)
        this.amount--;
      console.log("remove")
    },
    add(){
        this.amount++;
      console.log("add")
    }
  },
};

</script>

<style>
    .reaction-game-player-container {  
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
        background-color: #4CAF50;
        color: black;
        border: none;
        border-radius: 10px;
    }
    .remove-button {
        background-color: #f44336; /* Red */
        color: black;
        border: none;
        border-radius: 10px;
    }
</style>    