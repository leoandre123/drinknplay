<template>
  <div class=results>

    <h1 class="glow">Results</h1>
    <div class="player-cards">
      <PlayerCard v-for="player in players" :player="player" />
    </div>
  </div>
</template>

<script>

import PlayerCard from "@/components/PlayerCard.vue";
export default {
  name: "ResultView",
  components: { PlayerCard },

  data: function () {
    return {
      players: [
        {
          name: "Leo",
          glasslevel: 8,
          drunkness: 2,
          score: 300,
        },
        {
          name: "Jarry",
          glasslevel: 3,
          drunkness: 5,
          score: 200,
        },
        {
          name: "Gorge",
          glasslevel: 2,
          drunkness: 2,
          score: 3990,
        }
        ,
        {
          name: "Gorge",
          glasslevel: 2,
          drunkness: 2,
          score: 3990,
        },
        {
          name: "Gorge",
          glasslevel: 2,
          drunkness: 2,
          score: 3990,
        },
        {
          name: "Gorge",
          glasslevel: 2,
          drunkness: 2,
          score: 3990,
        }
      ]
    };
  },
  created: function () {

  },

};
</script>




<style>
@import url('https://fonts.googleapis.com/css2?family=Limelight&display=swap');

.results {
  position: relative;
  background: linear-gradient(90deg,rgba(131, 58, 180, 1) 0%, rgba(253, 29, 29, 1) 50%, rgba(252, 176, 69, 1) 87%);
  display: flex;
  flex-direction: column;
  gap: 3rem;
  align-items: center;
  background-repeat: repeat;

}

.glow {

  font-size: 10rem;

  letter-spacing: 10px;
  color: #fff;
  font-family: "LimeLight Display";
  -webkit-animation: glow 1s ease-in-out infinite alternate;
  -moz-animation: glow 1s ease-in-out infinite alternate;
  animation: glow 1s ease-in-out infinite alternate;
  height: 10rem;
  width: auto;
  background-color: darkmagenta;
  margin: 1rem;
  width: 50rem;
  border: 0.2rem solid #fff;
  border-radius: 2rem;
  padding: 20px;
  box-shadow: 0 0 .2rem #fff,
            0 0 .2rem #fff,
            0 0 2rem #bc13fe,
            0 0 0.8rem #bc13fe,
            0 0 2.8rem #bc13fe,
            inset 0 0 1.3rem #bc13fe; 


}

.player-cards {
  display: flex;
  gap: 5rem;
  justify-content: center;
  flex-wrap: wrap;
  margin: 2rem;
}

@keyframes glow {
  from {
    text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #e60073, 0 0 40px #e60073, 0 0 50px #e60073, 0 0 60px #e60073, 0 0 70px #e60073;
  }

  to {
    text-shadow: 0 0 20px #fff, 0 0 30px #ff4da6, 0 0 40px #ff4da6, 0 0 50px #ff4da6, 0 0 60px #ff4da6, 0 0 70px #ff4da6, 0 0 80px #ff4da6;
  }
}
</style>