<template>
  <div class="player-view-container">
    <div  v-if="gamePhase === 'start'" class="submit-subject">
    <h1 v-if="!subjectSubmitted">{{ $t("draw.typeSubject") }}</h1>
    <h1 v-if="subjectSubmitted">{{ subject }} {{ $t("draw.submitted") }}</h1>
    <input v-model="subject" :disabled="subjectSubmitted" @input="subject = subject.toUpperCase()" :placeholder='$t("draw.drawA")'/>
    <RetroButton
    color="yellow"
    class="subject-button" 
    :disabled="!isSubjectValid || subjectSubmitted"
    @click="submitSubject">{{ $t("draw.submitSubject") }}</RetroButton>
    </div>

    <div v-if="gamePhase === 'drawing'" class="drawing-canvas" :style="{ flexDirection: isMobile ? 'row' : 'column' }">
      <div v-if="!isMobile" class="drawing-title">{{ $t("draw.title") }}</div>
      <DrawingColors v-if="isMobile" :options="drawingOptions" direction="column" />
      <div class="canvas-container">
        <DrawingCanvas :options="drawingOptions" ref="canvas" />
      </div>
      <div v-if="!isMobile" class="tools-container">
        <DrawingColors :options="drawingOptions" direction="row" />
        <DrawingTools :options="drawingOptions" @save-requested="saveCanvas" direction="row" />
      </div>
      <DrawingTools
        v-if="isMobile"
        :options="drawingOptions"
        @save-requested="saveCanvas"
        direction="column"
      />
    </div>

      <RatingTool
        class="rating"
        v-if="canVote && gamePhase == 'voting'"
        :key="currentDrawingToVote.playerId"
        @rating-submitted="playerRated"
      >
      </RatingTool>
      <div class="waiting"
      v-if="gamePhase == 'voting' && !canVote"> You can not vote on your own picture...</div>
      
      <div class="waiting" v-if="gamePhase == 'results'">
         Waiting for next round...</div>
  
  </div>
</template>

<script>
import DrawingColors from "@/components/DrawingColors.vue";
import RatingTool from "../../../components/RatingTool.vue";
import DrawingCanvas from "@/components/DrawingCanvas.vue";
import DrawingTools from "@/components/DrawingTools.vue";
import RetroButton from "@/components/RetroButton.vue";

import { context } from "../../../context";
import { socket } from "../../../socket";
import { useDevice } from "@/UseDevice";

export default {
  components: { DrawingCanvas, DrawingTools, RatingTool, DrawingColors, RetroButton },
  data() {
    return {
      subject: "",
      subjectSubmitted: false,
      drawingOptions: {
        brushColor: { name: "black", r: 0, g: 0, b: 0, a: 255 },
        brushSize: 10,
        mode: "pen",
        isBucketSelected: false,
      },
      gamePhase: "",
      canvasSent: false,
      canvasPNG: null,
      currentDrawingToVote: null,
    };
  },
  setup() {
    const { isMobile } = useDevice();
    return { isMobile };
  },
  computed: {
    canVote() {
      if (!this.currentDrawingToVote) return false;
      return this.currentDrawingToVote.playerId !== context.getCurrentPlayer().id;
    },
    isSubjectValid(){
      return this.subject.trim().length > 2;
    }
  },
  mounted() {
    socket.on("gamePhase", (phaseFromServer) => {
      this.gamePhase = phaseFromServer;
      console.log("player phase change: "+ phaseFromServer);
      if (this.gamePhase !== "drawing") {
      this.canvasSent = false;
      this.canvasPNG = null;
      }

    });
    socket.on("drawingToVote", (drawingFromServer) => {
      this.currentDrawingToVote = drawingFromServer;
    });
    socket.on("timerTick", (timer) => {
      if (timer <= 2 && !this.canvasSent && this.gamePhase=="drawing"){
        this.saveCanvas(); 
      }
    })
  },
  methods: {
    submitSubject() {
      socket.emit("submitSubject", this.subject);
      this.subjectSubmitted = true;
      console.log("Start request sent!");
    },
    saveCanvas() {
      this.canvasPNG = this.$refs.canvas.getCanvas();
      socket.emit("updateCanvas", this.canvasPNG);
      this.canvasSent = true;

    },
    playerRated(score) {
      console.log("SCORES ADDED: " + score);
      socket.emit(
        "playerVote",
        (score = {
          score: score,
          playerId: this.currentDrawingToVote.playerId,
        })
      );
    },
  },
beforeUnmount() {
    socket.off("gamePhase");
    socket.off("drawingToVote");
    socket.off("timerTick");
    
    console.log("Player socket listeners unregistered");
  }
};

</script>

<style scoped>
input {
  background: #fff;
  color: black;
  box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.1);
  outline: none;
  padding: 1rem;
  font: inherit;
  border: 0.15rem solid #2c3b5f;
  text-transform: uppercase;
}
.rating{
  height: 100%;
  width: 100%;
}
.drawing-canvas {
  position: relative;
  background-image: radial-gradient(circle farthest-corner at 10% 20%,
            rgb(102, 0, 32) 0%,
            rgb(116, 18, 92) 49.5%,
            rgb(164, 34, 144) 90%);
  display: flex;
  flex-direction: column;
  align-items: center;
  background-repeat: repeat;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.canvas-container {
  flex-grow: 1;
  aspect-ratio: 16/9;
  min-height: 0;
  min-width: 0;
  max-width: 90%;
  max-height: 90%;
  justify-items: center;
}

.drawing-title {
  font-size: 3rem;
  font-family: "Science Gothic", sans-serif;
  color: white;
  text-shadow: 3px 3px black;
  border-bottom: 1px solid white;
  width: 70%;
  margin-bottom: 1rem;
}

.tools-container {
  display: flex;
  background-color: rgb(192, 187, 187);
  height: 4rem;
  border: 5px outset black;
}


.submit-subject{
  gap: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--Metallic_Yellow);
  height: 100%;
  justify-content: center;
}

.waiting{
height: 100%;
width: 100;
font-size: 3rem;
font-family: "Science Gothic", sans-serif;
color: white;
background-color: var(--Metallic_Yellow);
display: flex;
justify-content: center;
align-items: center; 

}
</style>
