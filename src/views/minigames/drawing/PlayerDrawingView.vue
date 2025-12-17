<template>
  <div class="drawing-view-container" :style="{ flexDirection: isMobile ? 'row' : 'column' }">
    <div v-if="!isMobile" class="drawing-title">Drink n' Draw</div>
    <DrawingColors v-if="isMobile" :options="drawingOptions" direction="column" />
    <div class="canvas-container">
      <drawingCanvas :options="drawingOptions" ref="canvas" />
    </div>
    <drawingTools
      v-if="isMobile"
      direction="column"
      :options="drawingOptions"
      @save-requested="saveCanvas"
      @clear-requested="clearCanvas"
    />
    <div v-if="!isMobile" class="tools-container">
      <DrawingColors :options="drawingOptions" direction="row" />
      <drawingTools
        :options="drawingOptions"
        direction="row"
        @save-requested="saveCanvas"
        @clear-requested="clearCanvas"
      />
    </div>
  </div>
</template>
<script>
import drawingCanvas from "../../../components/drawingCanvas.vue";
import DrawingColors from "../../../components/DrawingColors.vue";
import drawingTools from "../../../components/drawingTools.vue";

import { context } from "../../../context";
import { socket } from "../../../socket";

export default {
  components: { drawingCanvas, drawingTools, DrawingColors },
  data() {
    return {
      window,
      drawingOptions: {
        brushColor: "black",
        brushSize: 10,
        mode: "pen",
      },
      canvasPNG: null,
    };
  },
  computed: {
    isMobile() {
      return window.matchMedia("(pointer: coarse)").matches;
    },
  },
  methods: {
    saveCanvas() {
      this.canvasPNG = this.$refs.canvas.getCanvas();
      socket.emit("updateCanvas", this.canvasPNG);
    },
    clearCanvas() {
      this.$refs.canvas.clearCanvas();
    },
  },
};
</script>

<style scoped>
.drawing-view-container {
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
  width: 50vw;
  height: 50vh;
  overflow: hidden;
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

.canvas-container {
  flex-grow: 1;
  aspect-ratio: 16/9;
  min-height: 0;
  min-width: 0;
}

.tools-container {
  display: flex;
  background-color: gray;
  height: 4rem;
  border: 5px outset black;
}
</style>
