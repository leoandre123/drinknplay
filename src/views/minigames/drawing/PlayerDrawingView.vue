<template>
  <div class="player-view-container">
    <div  v-if="gamePhase === 'start'" class="submit-subject">
    <h1>Please type a subject to draw</h1>
    <input v-model="subject" placeholder="Draw a..."/>
    <hr></hr>
    <RetroButton
    color="yellow"
    class="subject-button" 
    :disabled="!isSubjectValid || subjectSubmitted"
    @click="submitSubject">Submit subject</RetroButton>
    </div>

    <div v-if="gamePhase === 'drawing'" class="drawing-canvas" :style="{ flexDirection: isMobile ? 'row' : 'column' }">
      <div v-if="!isMobile" class="drawing-title">Drink n' Draw</div>
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

    <div class="rating" v-if="gamePhase == 'voting'">
      <RatingTool
        v-if="canVote"
        :key="currentDrawingToVote.playerId"
        @rating-submitted="playerRated"
      >
      </RatingTool>
    </div>
  </div>
</template>

<script>
import DrawingColors from "@/components/DrawingColors.vue";
import RatingTool from "../../../components/RatingTool.vue";
import DrawingCanvas from "@/components/drawingCanvas.vue";
import DrawingTools from "@/components/drawingTools.vue";
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
        brushColor: "black",
        brushSize: 10,
        isBucketSelected: false,
      },
      gamePhase: "",
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
    });
    socket.on("drawingToVote", (drawingFromServer) => {
      this.currentDrawingToVote = drawingFromServer;
    });
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
.drawing-canvas {
  position: relative;
  background: linear-gradient(
    90deg,
    rgba(131, 58, 180, 1) 0%,
    rgba(253, 29, 29, 1) 50%,
    rgba(252, 176, 69, 1) 87%
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  background-repeat: repeat;
  height: 100%;
  width: 100%;
}

.canvas-container {
  flex-grow: 1;
  aspect-ratio: 16/9;
  min-height: 0;
  min-width: 0;
  max-width: 90%;
  max-height: 90%;
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

.tools-container {
  display: flex;
  background-color: gray;
  height: 4rem;
  border: 5px outset black;
}


.submit-subject{
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--Metallic_Yellow);
  height: 100%;
  justify-content: center;
}
</style>
