<template>

    <div class="results-container">
        
        <div class="best-drawing">
            <div class="best-drawing-title">{{ $t("draw.bestDrawing") }}</div>
            <img :src="score.drawings[0].png"></img>
            <div>{{ score.drawings[0].playerName }}: {{ score.drawings[0].score }} {{ $t("draw.points") }}</div>
        </div>
        <div class="scoreboard">
            <div class="results-title">{{ $t("draw.scoreboard") }}</div>
            <div v-for="player in score.players" :key="player.id" class="player-in-leaderboard">{{ player.name }}: {{ player.score}} {{ $t("draw.points") }}</div>
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
    score: 0,
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
    overflow:hidden;
    height: 100%;
    min-height: 0;
    background-color: var(--Caribbean_Green);
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    grid-template-areas: 
    "leaderboard drawing" ;
    font-family: "Science Gothic", sans-serif;
    gap: 20px;
    font-size: 2rem;
    box-sizing: border-box;
    
}
.results-title {
    color: #fff;
    margin: 2vw;
    font-size: 3vw;
    font-family: "Science Gothic", sans-serif;
    background-color: gray;    
    border: 1px outset gray;
}
    

.best-drawing img {
    border: 3px outset black;
    height: 15vw;
    display: block;
    margin:2%;
    min-height: 0;
    object-fit: contain;
    background-color: gray;
    padding: 2%

}

.best-drawing {
    flex: 1;
    font-family: "Science Gothic", sans-serif;
    color: var(--Metallic_Yellow);
    text-shadow: 1px 1px black;
    display: flex;
    flex-direction: column;
    gap: 1vw;
    grid-area: drawing;
}

.scoreboard {
    font-family: "Science Gothic", sans-serif;
    color: var(--Metallic_Yellow);
    text-shadow: 1px 1px black;
    display: flex;
    flex-direction: column;
    border-right: 5px solid yellow;
    grid-area: leaderboard;
    overflow: scroll;
}

.player-in-leaderboard{
    border-bottom: 2px solid gray;
    border-top: 2px solid gray;
    margin: 5px;
}

.best-drawing-title{
    margin: 2vw;
    color: #fff;
    font-size: 3vw;
    background-color: gray;
    animation: glow 1s ease-in-out infinite alternate;
    border: 1px outset gray;
}



</style>