<template>
    <div class="host-view-container">

        <div v-if="phase === 'drawing'" class="drawing-board">
            <h1>Draw a {{ currentSubject }}</h1>
            <div class="displayPictures">
                <div v-for="drawing in submittedPaintings" class="drawings">
                    <img :src="drawing.png"></img>
                    <p class="username">{{ drawing.playerName }}</p>
                </div>
            </div>
        </div>

        <div v-if="phase === 'voting'" class="voting-container">
            <h1>Please rate the picture below</h1>
            <img :src="currentDrawingToVote.png" class="drawing-to-vote"></img>
        </div>
        
        <div v-if="phase === 'results'">
            <h1>Results</h1>
        </div>
        <div class="time">Time left: {{ timer }}</div>
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
            phase: "drawing",
            currentDrawingToVote: null
        }
    },
    methods: {

    },
    mounted() {
        socket.on("currentSubject", (subjectFromServer) => { this.currentSubject = subjectFromServer });

        socket.on("gamePhase", (phaseFromServer) => { this.phase = phaseFromServer });

        socket.on("timerTick", (timerFromServer) => { this.timer = timerFromServer });

        socket.on("updateCanvas", (drawingFromServer) => {
            let drawing = this.submittedPaintings.find(p => p.socketId === drawingFromServer.socketId);
            if (drawing) {
                drawing.png = drawingFromServer.png;
            }
            else {
                this.submittedPaintings.push(drawingFromServer)
            }});
            socket.on("drawingToVote", (drawingFromServer) => {
            this.currentDrawingToVote = drawingFromServer
        });

        socket.on("clearPaintings", () => { this.submittedPaintings = [] });

    },
    beforeUnmount() {

    }

}

</script>

<style scoped>
.drawing-board {
    background-color: whitesmoke;
    color: black;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: auto;
}

.drawing-board h1 {
    background-color: var(--Caribbean_Green);
    color: var(--Metallic_Yellow);
    font-size: 3rem;
    margin: 0;
}

.displayPictures {
    flex-grow: 1;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(20vw, 1fr));
    grid-auto-rows: min-content;
    gap: 1rem;
    padding: 20px;
    min-height: 0;
}

.displayPictures img {
    width: 100%;
    object-fit: contain;
    display: block;
}

.time {
    flex-shrink: 0;
    background-color: black;
    color: white;
    font-size: 3rem;
    text-align: center;
}

.host-view-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.username {
    margin: 0;
    font-size: 2rem;

}

.drawings {
    border: 5px outset gray;
    object-fit: contain;
    background-color: gray;
    overflow: auto;
}

.voting-container{
    background-color: gray;
    height: 100%;
    
}

.drawing-to-vote{
    height: auto;
}
</style>