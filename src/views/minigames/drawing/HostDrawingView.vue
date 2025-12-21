<template>

    <div v-if="phase === 'drawing'" class="drawings">
        <h1>Draw a {{ currentSubject }}</h1>
        <div class="displayPictures">
            <div v-for="painting in submittedPaintings">
                <img :src="painting.data"></img>               
            </div>
        </div>
        <div class="time">Time left: {{ timer }}</div>
    </div>

    <div v-if="phase === 'voting'" class="voting">
        <h1>VOTING</h1>
        <div class="time">Time left: {{ timer }}</div>
    </div>
    
    <div v-if="phase === 'results'">
        
    </div>

</template>

<script>
//access via https://localhost:5173/game?id=draw&mode=host

//{{context.state.players.find(x => x.id == painting.playerId).name}}

import DrawingResultScreen from "../../../components/DrawingResultScreen.vue";
import { context } from "../../../context";
import { socket } from "../../../socket";


export default {
    data() {
        return {
            context,
            submittedPaintings: [],
            currentSubject: "",
            timer: null,
            phase: "drawing"
        }
    },
    methods:{
   
    },
    mounted() {
        socket.on("currentSubject", (subjectFromServer) => {this.currentSubject=subjectFromServer});

        socket.on("gamePhase", (phaseFromServer) => {this.phase=phaseFromServer});

        socket.on("timerTick", (timerFromServer) => {this.timer=timerFromServer});

        socket.on("updateCanvas", (canvasData, playerID) => {
            if (!this.submittedPaintings.some(painting => painting.playerId === playerID)){
            this.submittedPaintings.push({
            playerId: playerID,
            data: canvasData
            
        })}});

        socket.on("clearPaintings", ()=> {this.submittedPaintings=[]});

    },
    beforeUnmount() {
        socket.off("updateCanvas");
    }

}

</script>

<style scoped>
.drawings {
    background-color: whitesmoke;
    color: black;
    display: flex;
    flex-direction: column;
    height: 100%; /* Lock to screen height */
    overflow: auto;

}

.drawings h1 {
    background-color: var(--Caribbean_Green);
    color: var(--Metallic_Yellow);
    font-size: 3rem;
    margin: 0;
}

.displayPictures {
    flex-grow: 1; /* Take up all space between title and tools */
    display: grid;
    /* CHANGE: replace 250px with a smaller value like 50px or 10% */
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); 
    grid-auto-rows: min-content; /* Row height fits the content */
    gap: 10px;
    padding: 20px;
    min-height: 0
}

.displayPictures img {
    width: 100%;
    object-fit: contain;
    border: 5px solid white;
    
}

.time{
    flex-shrink: 0; 
    background-color: black;
    color: white;
    font-size: 3rem;
    text-align: center;
}
</style>