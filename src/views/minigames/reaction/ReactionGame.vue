<template> 
  <div class="reaction-game-container">
    <h1>REACTION GAME</h1>
    <p>Count the figues in the picture as fast as you can!</p>
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
import mascot from "@/assets/mascot.png";
export default {
  data() {
    return {
        gameStarted: false,
        figureCount: 0,
        mascot: mascot,
    };
  },
    methods: {
    generatepicture() {
      this.gameStarted = true;
      // slumpa hur många figurer (t.ex. 3–10)
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
  },
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