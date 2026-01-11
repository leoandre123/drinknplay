<template>
    <div class="host-view-container">
        <div v-if="phase === 'drawing'" class="drawing-board">
            <div class="subject">{{ $t("draw.draw") }}  {{ currentSubject }}</div>
            <div class="displayPictures">
                <div v-for="drawing in submittedPaintings">
                    <img :src="drawing.png"></img>
                </div>
            </div>
        </div>


        <div v-if="phase === 'voting'" class="voting-container">
            <div class="vote-title">{{ $t("draw.rate") }}</div>
            <img :src="currentDrawingToVote.png" class="drawing-to-vote"></img>
        </div>

        <DrawingResultScreen v-if="phase === 'results'" :score="scores"/>

        <div v-if="phase === 'start'" class = "start">
            {{ $t("draw.submitHost") }}
        </div>
        <div v-if="phase !== 'results'" class="time">{{ $t("draw.time") }} {{ timer }}</div>
    </div>
</template>

<script>

//access via https://localhost:5173/game?id=draw&mode=host
//{{context.state.players.find(x => x.id == painting.playerId).name}}

import { context } from "../../../context";
import { socket } from "../../../socket";
import DrawingResultScreen from "../../../components/DrawingResultScreen.vue";


export default {
    data() {
        return {
            context,
            submittedPaintings: [],
            currentSubject: "",
            timer: null,
            phase: "start",
            currentDrawingToVote: null,
            scores: {}
        }
    },
    components: {
        DrawingResultScreen,
    },
    methods: {
    
    },
    mounted() {
        socket.on("currentSubject", (subjectFromServer) => {
            this.currentSubject = subjectFromServer
            console.log(subjectFromServer)
            console.log(this.currentSubject)
        });

        socket.on("gamePhase", (phaseFromServer) => {
            this.phase = phaseFromServer
            console.log("game phase:" + this.phase)
        });

        socket.on("timerTick", (timerFromServer) => { this.timer = timerFromServer });

        socket.on("updateCanvas", (drawingFromServer) => {
            let drawing = this.submittedPaintings.find(p => p.playerId === drawingFromServer.playerId);
            if (drawing) {
                drawing.png = drawingFromServer.png;
            }
            else {
                this.submittedPaintings.push(drawingFromServer)
            }
        });
        socket.on("drawingToVote", (drawingFromServer) => {
            this.currentDrawingToVote = drawingFromServer
        });

        socket.on("clearPaintings", () => { this.submittedPaintings = [] });

        socket.on("results", (score) => { this.scores = score });

    },
    beforeUnmount() {
        socket.off("currentSubject");
        socket.off("gamePhase");
        socket.off("timerTick");
        socket.off("updateCanvas");
        socket.off("drawingToVote");
        socket.off("clearPaintings");
        socket.off("results");
        
        console.log("Socket listeners unregistered");
    }

}

</script>

<style scoped>
.host-view-container {
    font-family: "Science Gothic", sans-serif;
    display: flex;
    flex-direction: column;
    height: 100vh;
    border: 5px ridge yellow;
    box-sizing: border-box;
    overflow: hidden;
}

.drawing-board {
    background-color: whitesmoke;
    color: black;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: auto;
}

.subject {
    background-color: var(--Caribbean_Green);
    color: var(--Metallic_Yellow);
    font-size: 5vw;
    margin: 0;
    text-shadow: 1px 1px black;
}

.displayPictures {
    flex-grow: 1;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1rem;
    padding: 20px;
    border: 1px solid black;
    overflow: auto;
    justify-content: center;
    

}

.displayPictures img {
    width: 100%;
    max-width: 600px;
    height: auto;
    display: block;
    box-sizing: border-box;
    border: 3px outset gray;
}


.time {
    flex-shrink: 0;
    background-color: var(--Caribbean_Green);
    color: var(--Metallic_Yellow);
    font-size: 3rem;
    text-align: center;
    margin-top: auto;
}


.voting-container {
    background-color: var(--Caribbean_Green);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.vote-title {
    background-color: var(--Caribbean_Green);
    color: var(--Metallic_Yellow);
    font-size: 3rem;
}

.drawing-to-vote {
    flex: 1;
    object-fit: contain;
    display: block;
    min-height: 0;
    padding: 10px;
    border: 5px double black;
    background-color: gray;
    margin: 10px;
}

.start {
    display: flex;
    flex:1;
    flex-wrap: wrap;
    background-color: white;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
}

</style>