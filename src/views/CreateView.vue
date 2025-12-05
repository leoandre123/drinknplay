<template>
  <div class="create-container">
    <h1>Choose your settings</h1>
    <div class="settingsbox">
        <h2>Settings</h2>
        <hr>
        <h3>How many minigames should your game contain?</h3>
        <button v-for="x in 5"class="minigameButton" :class="{selected: selectedNumberOfMinigames === x }" @click="selectAmountOfMinigames(x)">{{ x }}</button>
        <h3>What is your desired drunkness level?</h3>
        <button class="drunknessButton" :class="{selected: selectedDrunknessLevel === 1}" @click="selectDrunknessLevel(1)">Sober</button>
        <button class="drunknessButton" :class="{selected: selectedDrunknessLevel === 2}" @click="selectDrunknessLevel(2)">Tipsy</button>
        <button class="drunknessButton" :class="{selected: selectedDrunknessLevel === 3}" @click="selectDrunknessLevel(3)">Hammered</button>
        <button class="drunknessButton" :class="{selected: selectedDrunknessLevel === 4}" @click="selectDrunknessLevel(4)">Black out drunk</button>
    </div>
    <button class="submitButton" @click="createGame">
      SUBMIT AND CREATE LOBBY
    </button>
  </div>
</template>

<script>
export default {
  name: "CreateView",
  data: function () {
    return {
      selectedNumberOfMinigames: null,
      selectedDrunknessLevel: null
    };
  },
  mounted() {},
  beforeUnmount() {},
  methods: {
    selectAmountOfMinigames(amount){
      this.selectedNumberOfMinigames = amount;
    },
    selectDrunknessLevel(level){
      this.selectedDrunknessLevel = level;
    },
    createGame(){
      this.$router.push({
        path:'/game'
      })
    }
  },
};
</script>

<style scoped>
.create-container {
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
.settingsbox{
  background: linear-gradient(90deg, #4b6bb744 0%, #1828485f 100%);
}
.minigameButton{
  width: 50px;
}
button{
  width: 120px;
  padding-top:10px;
  padding-bottom:10px;
  margin: 10px;
  font-weight: bold;
  font-size: 16;
  background-color: pink;
  box-shadow: 0 5px 15px rgba(0,0,0,0.4);
}
.drunknessButton{
  width: 120px;
  padding-top:10px;
  padding-bottom:10px;
  margin: 10px;
  font-weight: bold;
  font-size: 16;
  background-color: pink;
  box-shadow: 0 5px 15px rgba(0,0,0,0.4);
}
.selected{
  background-color: #701050;
  color: white;
}

</style>
