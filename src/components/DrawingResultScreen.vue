<template>
    
    <div class="results-container">
        
        <div class="best-drawing">
            <div class="best-drawing-title">BEST DRAWING</div>
            <img :src="score.drawings[0].png"></img>
            <div>{{ score.drawings[0].score }} points</div>
            <div>{{ score.drawings[0].playerName }}</div>
            
        </div>

        <div class="scoreboard">
            <div class="results-title">SCOREBOARD</div>
            <div v-for="player in score.players" :key="player.id" class="player-in-leaderboard">{{ player.name }}: {{ player.score}} points</div>
        </div>
    </div>
</template>

<script>
/*Player object: {id: player.id,
                    score: 0,
                    name: player.name}

Drawing = {
    playerName: socket.data.username,
    socketId: socket.id,
    score: 0
    png: canvasData,
        };*/

export default {
    data() {
    },
    methods: {
    },
    props: {
        score: {
            type: Object,
            required: true
        }
    },
}
</script>

<style scoped>
.results-container {
    width: 100%;
    background-color: var(--French_Rose);
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-areas: 
    "leaderboard drawing" ;
    font-family: "Science Gothic", sans-serif;
    gap: 20px;
    font-size: 2vw;
}
.results-title {
    color: #fff;
    margin: 2vw;
    font-size: 3vw;
    -webkit-animation: glow 1s ease-in-out infinite alternate;
    -moz-animation: glow 1s ease-in-out infinite alternate;
    animation: glow 1s ease-in-out infinite alternate;
    font-family: "Science Gothic", sans-serif;
    background-color: var(--French_Rose);    
    border: 1px outset gray;
}
    

.best-drawing img {
    border: 3px groove var(--Caribbean_Green);
    box-shadow: 0 0 0.2vw #fff, 0 0 0.2vw #fff, 0 0 2vw var(--Caribbean_Green),
    0 0 0.5vw var(--Caribbean_Green), 0 0 1.8vw var(--Caribbean_Green),
    inset 0 0 1.3rem var(--Caribbean_Green);
    color: aqua;
    height: 15vw;
    display: block;
    margin:1vw;
}

.best-drawing {
    font-family: "Science Gothic", sans-serif;
    color: var(--Metallic_Yellow);
     text-shadow: 1px 1px black;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1vw;
    grid-area: drawing;
}

.scoreboard {
    font-family: "Science Gothic", sans-serif;
    color: var(--Metallic_Yellow);
    text-shadow: 1px 1px black;
    display: flex;
    flex-direction: column;
    border-right: 5px solid black;
    grid-area: leaderboard;
}

.player-in-leaderboard{
    border-bottom: 1px solid black;
    width: 40vw;
}

.best-drawing-title{
    margin: 2vw;
    color: #fff;
    font-size: 3vw;
    -webkit-animation: glow 1s ease-in-out infinite alternate;
    -moz-animation: glow 1s ease-in-out infinite alternate;
    animation: glow 1s ease-in-out infinite alternate;
    border: 1px outset gray;
}

@keyframes glow{
  from {
    text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #e60073, 0 0 40px #e60073, 0 0 50px #e60073,
      0 0 60px #e60073, 0 0 70px #e60073;
  }

  to {
    text-shadow: 0 0 20px #fff, 0 0 30px #ff4da6, 0 0 40px #ff4da6, 0 0 50px #ff4da6,
      0 0 60px #ff4da6, 0 0 70px #ff4da6, 0 0 80px #ff4da6;
  }
}



</style>