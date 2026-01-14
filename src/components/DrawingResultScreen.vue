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
    color: whitesmoke;
    overflow:hidden;
    height: 100%;
    min-height: 0;
    background-color: var(--Violet_Blue);
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    grid-template-areas: 
    "leaderboard drawing" ;
    font-family: "Science Gothic", sans-serif;
    gap: 2vw;
    box-sizing: border-box;
    
}
.results-title {
    color: var();
    margin: 2vw;
    font-size: 3vw;
    background-color: var(--Violet_Blue);    
    border: 0.1vw solid white;
    box-shadow: var(--Neon_Glow);
}
    

.best-drawing img {
    display: block;
    min-height: 0;
    object-fit: contain;

    

}

.best-drawing {
    margin: 1vw;
    font-size: 3vw;
    background: linear-gradient(90deg, #44195f 0%, #0a0d36 100%);
    border: 4px solid black;
    color: whitesmoke;
    text-shadow: 0.2vw 0.2vw var(--Violet_Blue);
    display: flex;
    flex-direction: column;
    gap: 1vw;
    grid-area: drawing;
}

.scoreboard {
    margin: 1vw;
    background: linear-gradient(90deg, #44195f 100%, #0a0d36 0%);
    display: flex;
    flex-direction: column;
    border: 4px solid black;
    grid-area: leaderboard;
    overflow: auto;
}

.player-in-leaderboard{
    margin: 5px;
    text-shadow: 0.2rem 0.2rem var(--Violet_Blue);
    font-size: 2vw;
    border-bottom: 3px solid white;
    width: auto;
}

.best-drawing-title{
    margin: 2vw;
    border: 0.1vw solid white;
    font-size: 3vw;
    background-color: var(--Violet_Blue);
    box-shadow: var(--Neon_Glow);
    
   
    
}



</style>