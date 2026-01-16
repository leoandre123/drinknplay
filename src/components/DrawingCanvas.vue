<template>
  <div class="cancon">
    <canvas
      ref="myCanvas"
      @mousedown="startPosition"
      @mousemove="moving"
      @mouseup="finishedPosition"
      @touchstart="startPosition"
      @touchmove="moving"
      @touchend="finishedPosition"
    >
    </canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted, useTemplateRef } from "vue";
import type { Color, Point } from "../../shared/types";

const canvas = useTemplateRef<HTMLCanvasElement>("myCanvas");

let pos: Point = { x: 0, y: 0 };
let ctx: CanvasRenderingContext2D;
let isPainting = false;
let savedCanvasPNG: string | undefined = undefined;

const props = defineProps({ options: { type: Object, required: true } });

defineExpose({
  getCanvas,
  clearCanvas,
});

onMounted(() => {
  canvas.value!.width = 640;
  canvas.value!.height = 360;
  ctx = canvas.value!.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  clearCanvas();
});

function clearCanvas() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.value!.width, canvas.value!.height);
}

function startPosition(evt: MouseEvent | TouchEvent) {
  console.log("PAINT");
  pos = getPos(evt);
  if (props.options!.mode == "bucket") {
    floodFill(pos);
  } else {
    isPainting = true;
    newDraw(evt);
  }
}

function moving(evt: MouseEvent | TouchEvent) {
  if (isPainting) {
    newDraw(evt);
  }
}
function finishedPosition() {
  isPainting = false;
}

function draw(evt: MouseEvent | TouchEvent) {
  ctx.strokeStyle =
    props.options!.mode == "pen"
      ? `rgba(${props.options.brushColor.r},${props.options.brushColor.g},${props.options.brushColor.b},${props.options.brushColor.a})`
      : "white";
  ctx.lineWidth = props.options.brushSize;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
  pos = getPos(evt);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
}
function newDraw(evt: MouseEvent | TouchEvent) {
  ctx.fillStyle =
    props.options.mode == "pen"
      ? `rgba(${props.options.brushColor.r},${props.options.brushColor.g},${props.options.brushColor.b},${props.options.brushColor.a})`
      : "white";
  const newPos = getPos(evt);

  drawLine(pos, newPos, props.options.brushSize);
  pos = newPos;

  // this.ctx.fillRect(Math.floor(this.pos.x), Math.floor(this.pos.y), 5, 5);
}
function drawLine(p0: Point, p1: Point, w: number) {
  const r = Math.floor(w / 2); // brush radius

  const dx = Math.abs(p1.x - p0.x);
  const dy = Math.abs(p1.y - p0.y);
  const sx = p0.x < p1.x ? 1 : -1;
  const sy = p0.y < p1.y ? 1 : -1;

  let x = p0.x;
  let y = p0.y;
  let err = dx - dy;

  // draw a circle stamp at each pixel along the line
  const stamp = (cx: number, cy: number) => {
    for (let yy = -r; yy <= r; yy++) {
      for (let xx = -r; xx <= r; xx++) {
        if (xx * xx + yy * yy <= r * r) {
          ctx.fillRect(cx + xx, cy + yy, 1, 1);
          //this.drawPixel(cx + xx, cy + yy);
        }
      }
    }
  };

  stamp(x, y);

  while (!(x === p1.x && y === p1.y)) {
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
    stamp(x, y);
  }
}
function compareColor(c0: Color, c1: Color) {
  return c0.r == c1.r && c0.g == c1.g && c0.b == c1.b && c0.a == c1.a;
}
function floodFill(pos: Point) {
  const w = canvas.value!.width;
  const h = canvas.value!.height;
  const imgData = ctx.getImageData(0, 0, w, h);

  pos.x = Math.floor(pos.x);
  pos.y = Math.floor(pos.y);
  const getPixel = (pos: Point): Color => {
    return {
      r: imgData.data[(pos.y * w + pos.x) * 4 + 0]!,
      g: imgData.data[(pos.y * w + pos.x) * 4 + 1]!,
      b: imgData.data[(pos.y * w + pos.x) * 4 + 2]!,
      a: imgData.data[(pos.y * w + pos.x) * 4 + 3]!,
    };
  };
  const setPixel = (pos: Point, color: Color) => {
    imgData.data[(pos.y * w + pos.x) * 4 + 0] = color.r;
    imgData.data[(pos.y * w + pos.x) * 4 + 1] = color.g;
    imgData.data[(pos.y * w + pos.x) * 4 + 2] = color.b;
    imgData.data[(pos.y * w + pos.x) * 4 + 3] = color.a;
  };

  const refColor = getPixel(pos);
  const fillColor = props.options.brushColor;

  const key = (p: Point) => `${p.x},${p.y}`;
  const visited = new Set<string>();
  const queue = [pos];
  while (queue.length != 0) {
    const n = queue.shift()!;
    if (visited.has(key(n))) continue;
    visited.add(key(n));
    const cl = getPixel(n);
    if (compareColor(refColor, cl)) {
      if (n.x < w - 1) queue.push({ x: n.x + 1, y: n.y });
      if (n.x > 0) queue.push({ x: n.x - 1, y: n.y });
      if (n.y < h - 1) queue.push({ x: n.x, y: n.y + 1 });
      if (n.y > 0) queue.push({ x: n.x, y: n.y - 1 });
      setPixel(n, fillColor);
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function getCanvas() {
  const canvasDataURL = canvas.value!.toDataURL("image/png");
  savedCanvasPNG = canvasDataURL;
  return canvasDataURL;
}
function getPos(evt: MouseEvent | TouchEvent): { x: number; y: number } {
  const rect = (evt.currentTarget as HTMLElement).getBoundingClientRect();

  if ("touches" in evt && evt.touches.length > 0) {
    // Touch event
    return {
      x: Math.floor(((evt.touches[0]!.clientX - rect.left) * canvas.value!.width) / rect.width),
      y: Math.floor(((evt.touches[0]!.clientY - rect.top) * canvas.value!.height) / rect.height),
    };
  } else {
    // Mouse event
    return {
      x: Math.floor((((evt as MouseEvent).clientX - rect.left) * canvas.value!.width) / rect.width),
      y: Math.floor(
        (((evt as MouseEvent).clientY - rect.top) * canvas.value!.height) / rect.height
      ),
    };
  }
}
</script>

<style scoped>
.cancon {
  max-width: 100%;
  max-height: 100%;
  aspect-ratio: 16 / 9;
}
canvas {
  background-color: white;
  display: block;
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
}
</style>
