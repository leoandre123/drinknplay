<template>
    <div class="canvas-wrapper">
  <canvas
    ref="canvas"
    :width="width"
    :height="height"
  ></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  width: { type: Number, default: 1000 },
  height: { type: Number, default: 600 },
  mode: {type: Object},
});
defineExpose({ clear });

const canvas = ref(null);
let ctx = null;

let drawing = false;
let lastX = 0;
let lastY = 0;

function getPos(evt) {
  const rect = canvas.value.getBoundingClientRect();

  if (evt.touches && evt.touches.length > 0) {
    // Touch event
    return {
      x: evt.touches[0].clientX - rect.left,
      y: evt.touches[0].clientY - rect.top
    };
  } else {
    // Mouse event
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }
}

function clear(){
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
}

function startDrawing(evt) {
    const pos = getPos(evt);
      console.log("DRAW: " + pos.x + " - " + pos.y);
    if(props.mode.mode == "bucket"){
        return;
    }
    drawing = true;
    lastX = pos.x;
    lastY = pos.y;
}

function stopDrawing() {
  drawing = false;
}

function draw(evt) {
  if (!drawing) return;

  const pos = getPos(evt);

  ctx.strokeStyle = props.mode.color;
  ctx.lineWidth = props.mode.size;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();

  lastX = pos.x;
  lastY = pos.y;
}

onMounted(() => {
  ctx = canvas.value.getContext("2d");

  canvas.value.addEventListener("mousedown", startDrawing);
  canvas.value.addEventListener("mouseup", stopDrawing);
  canvas.value.addEventListener("mouseleave", stopDrawing);
  canvas.value.addEventListener("mousemove", draw);

  canvas.value.addEventListener("touchstart", startDrawing);
  canvas.value.addEventListener("touchend", stopDrawing);
  canvas.value.addEventListener("touchmove", draw);
});

onBeforeUnmount(() => {
  canvas.value.removeEventListener("mousedown", startDrawing);
  canvas.value.removeEventListener("mouseup", stopDrawing);
  canvas.value.removeEventListener("mouseleave", stopDrawing);
  canvas.value.removeEventListener("mousemove", draw);
});
</script>

<style scoped>

.canvas-wrapper{

  aspect-ratio: 16 / 9;    
}

canvas {
  background: white;
  border: 1px solid #ccc;
  display: block;
  cursor: crosshair;
  width: 100%;
  height: 100%;
}
</style>
