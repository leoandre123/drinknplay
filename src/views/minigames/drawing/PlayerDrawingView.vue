<template>
    <div class="player-view-container">
        <button v-if="gamePhase==='start'"
        class="start-button"
        @click = "startGame">START GAME</button>

        <div class="drawing-canvas" v-if="gamePhase === 'drawing'">
            <div class="drawing-title">Drink n' Draw</div>
            <DrawingCanvas :options="drawingOptions" ref="canvas">
            </DrawingCanvas>
            <DrawingTools :options="drawingOptions" @save-requested="saveCanvas">
            </DrawingTools>
        </div>

        <div class="rating" v-if="gamePhase == 'voting'">
            <RatingTool 
            v-if="canVote"
            :key="currentDrawingToVote.socketId"
            @raiting-submitted="playerRated">
            </RatingTool>
        </div>
    </div>
</template>

<script>
import DrawingCanvas from '../../../components/DrawingCanvas.vue';
import DrawingTools from '../../../components/DrawingTools.vue';
import RatingTool from '../../../components/RatingTool.vue';


import { context } from "../../../context";
import { socket } from "../../../socket";


export default {
    components: { DrawingCanvas, DrawingTools, RatingTool },
    data() {
        return {
            drawingOptions: {
                brushColor: "black",
                brushSize: 10,
                isBucketSelected: false,
            },
            gamePhase: "",
            canvasPNG: null,
            currentDrawingToVote: null,
            
        };
    },
    computed: {
        canVote(){
            if (!this.currentDrawingToVote) return false;
            return this.currentDrawingToVote.socketId !== socket.id;
        }

    },
    mounted() {
        socket.on("gamePhase", (phaseFromServer) => { this.gamePhase = phaseFromServer });
        socket.on("drawingToVote", (drawingFromServer) => {this.currentDrawingToVote = drawingFromServer
        });
    },
    methods: {
        startGame(){
        socket.emit("startDrawingGame")
        console.log("Start request sent!")
    },
        saveCanvas() {
            this.canvasPNG = this.$refs.canvas.getCanvas();
            socket.emit("updateCanvas", this.canvasPNG);
        },
        playerRated(score) {
            console.log("SCORES ADDED: " +score)
            socket.emit("playerVote", score = {
                score: score,
                socketId: this.currentDrawingToVote.socketId
            })
        }

    }
};
</script>

<style scoped>
.drawing-canvas {
    position: relative;
    background: linear-gradient(90deg, rgba(131, 58, 180, 1) 0%, rgba(253, 29, 29, 1) 50%, rgba(252, 176, 69, 1) 87%);
    display: flex;
    flex-direction: column;
    align-items: center;
    background-repeat: repeat;
}

.drawing-title {
    font-size: 3rem;
    font-family: "Science Gothic", sans-serif;
    color: var(--Metallic_Yellow);
    text-shadow: 3px 3px black;
    border-bottom: 1px solid var(--Metallic_Yellow);
    width: 70%;
    margin-bottom: 1rem;
}

.start-button{
font-size: 3vw;
height: 20vw;
width: 30vw;;
}
</style>