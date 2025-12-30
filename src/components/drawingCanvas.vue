<template>
  <div>
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

<script>
export default {
  props: {
    options: Object,
  },

  data() {
    return {
      pos: {},
      c: null,
      ctx: null,
      painting: false,
      savedCanvasPNG: null,
    };
  },
  mounted() {
    this.c = this.$refs.myCanvas;
    this.c.width = 320;
    this.c.height = 180;
    this.ctx = this.$refs.myCanvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.clearCanvas();
  },
  methods: {
    clearCanvas() {
      this.ctx.fillStyle = "white";
      this.ctx.fillRect(0, 0, this.c.width, this.c.height);

      this.ctx.font = "10px Arial";
      for (let x = 0; x < 1600; x += 50) {
        for (let y = 0; y < 900; y += 50) {
          this.ctx.fillStyle = "red";
          this.ctx.beginPath();
          this.ctx.arc(x, y, 2, 0, 2 * Math.PI);
          this.ctx.fill();
          this.ctx.fillStyle = "black";
          this.ctx.fillText(`${x},${y}`, x, y);
        }
      }
    },
    startPosition(evt) {
      console.log("PAINT");
      this.pos = this.getPos(evt);
      if (this.options.mode == "bucket") {
        this.floodFill(this.pos);
      } else {
        this.painting = true;
        this.newDraw(evt);
      }
    },

    moving(evt) {
      if (this.painting) {
        this.newDraw(evt);
      }
    },
    finishedPosition() {
      this.painting = false;
    },

    draw(evt) {
      this.ctx.strokeStyle =
        this.options.mode == "pen"
          ? `rgba(${this.options.brushColor.r},${this.options.brushColor.g},${this.options.brushColor.b},${this.options.brushColor.a})`
          : "white";
      this.ctx.lineWidth = this.options.brushSize;
      this.ctx.lineCap = "round";
      this.ctx.beginPath();
      this.ctx.moveTo(this.pos.x, this.pos.y);
      this.pos = this.getPos(evt);
      this.ctx.lineTo(this.pos.x, this.pos.y);
      this.ctx.stroke();
    },
    newDraw(evt) {
      this.ctx.fillStyle =
        this.options.mode == "pen"
          ? `rgba(${this.options.brushColor.r},${this.options.brushColor.g},${this.options.brushColor.b},${this.options.brushColor.a})`
          : "white";
      const newPos = this.getPos(evt);

      this.drawLine(this.pos, newPos, this.options.brushSize);
      this.pos = newPos;

      // this.ctx.fillRect(Math.floor(this.pos.x), Math.floor(this.pos.y), 5, 5);
    },
    drawLine(p0, p1, w) {
      const r = Math.floor(w / 2); // brush radius

      const dx = Math.abs(p1.x - p0.x);
      const dy = Math.abs(p1.y - p0.y);
      const sx = p0.x < p1.x ? 1 : -1;
      const sy = p0.y < p1.y ? 1 : -1;

      let x = p0.x;
      let y = p0.y;
      let err = dx - dy;

      // draw a circle stamp at each pixel along the line
      const stamp = (cx, cy) => {
        for (let yy = -r; yy <= r; yy++) {
          for (let xx = -r; xx <= r; xx++) {
            if (xx * xx + yy * yy <= r * r) {
              this.ctx.fillRect(cx + xx, cy + yy, 1, 1);
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
    },
    compareColor(c0, c1) {
      return c0.r == c1.r && c0.g == c1.g && c0.b == c1.b && c0.a == c1.a;
    },
    floodFill(pos) {
      const w = this.c.width;
      const h = this.c.height;
      const imgData = this.ctx.getImageData(0, 0, w, h);

      pos.x = Math.floor(pos.x);
      pos.y = Math.floor(pos.y);
      const getPixel = (pos) => {
        return {
          r: imgData.data[(pos.y * w + pos.x) * 4 + 0],
          g: imgData.data[(pos.y * w + pos.x) * 4 + 1],
          b: imgData.data[(pos.y * w + pos.x) * 4 + 2],
          a: imgData.data[(pos.y * w + pos.x) * 4 + 3],
        };
      };
      const setPixel = (pos, color) => {
        imgData.data[(pos.y * w + pos.x) * 4 + 0] = color.r;
        imgData.data[(pos.y * w + pos.x) * 4 + 1] = color.g;
        imgData.data[(pos.y * w + pos.x) * 4 + 2] = color.b;
        imgData.data[(pos.y * w + pos.x) * 4 + 3] = color.a;
      };

      const refColor = getPixel(pos);
      const fillColor = this.options.brushColor;

      const key = (p) => `${p.x},${p.y}`;
      const visited = new Set();
      const queue = [pos];
      while (queue.length != 0) {
        const n = queue.shift();
        if (visited.has(key(n))) continue;
        visited.add(key(n));
        const cl = getPixel(n);
        if (this.compareColor(refColor, cl)) {
          if (n.x < w - 1) queue.push({ x: n.x + 1, y: n.y });
          if (n.x > 0) queue.push({ x: n.x - 1, y: n.y });
          if (n.y < h - 1) queue.push({ x: n.x, y: n.y + 1 });
          if (n.y > 0) queue.push({ x: n.x, y: n.y - 1 });
          setPixel(n, fillColor);
        }
      }
      this.ctx.putImageData(imgData, 0, 0);
    },

    getCanvas() {
      const canvasDataURL = this.$refs.myCanvas.toDataURL("image/png");
      this.savedCanvasPNG = canvasDataURL;
      return canvasDataURL;
    },
    getPos(evt) {
      const rect = evt.currentTarget.getBoundingClientRect();

      if (evt.touches && evt.touches.length > 0) {
        // Touch event
        return {
          x: Math.floor(((evt.touches[0].clientX - rect.left) * this.c.width) / rect.width),
          y: Math.floor(((evt.touches[0].clientY - rect.top) * this.c.height) / rect.height),
        };
      } else {
        // Mouse event
        return {
          x: Math.floor(((evt.clientX - rect.left) * this.c.width) / rect.width),
          y: Math.floor(((evt.clientY - rect.top) * this.c.height) / rect.height),
        };
      }
    },
  },
};
</script>

<style scoped>
canvas {
  background-color: white;
  display: block;
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
}
</style>
