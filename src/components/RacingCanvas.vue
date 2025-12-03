<template>
  <div>
    <input
      type="number"
      @change="onCanvasResized"
      v-model="resmul"
      step="0.05"
      min="0.05"
      max="10"
    />
    <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
  </div>
</template>

<script>
import carURL from "@/assets/racing/car_2.png";
import carLeftURL from "@/assets/racing/car_2_left.png";
import carRightURL from "@/assets/racing/car_2_right.png";

import trackStraight0URL from "@/assets/racing/track_straight_0.png";
import trackStraight1URL from "@/assets/racing/track_straight_1.png";

import trackStraightFinish0URL from "@/assets/racing/track_straight_0_finish.png";

import trackCurve0URL from "@/assets/racing/track_curve_0.png";
import trackCurve1URL from "@/assets/racing/track_curve_1.png";
import trackCurve2URL from "@/assets/racing/track_curve_2.png";
import trackCurve3URL from "@/assets/racing/track_curve_3.png";

import trackEmptyURL from "@/assets/racing/track_empty.png";

import wallURL from "@/assets/racing/wall.png";

import { ROAD_WIDTH, TILE_SIZE } from "../views/minigames/racing/RacingView.vue";
import { isWall, isOnTrack, angleBetween, distance } from "../../shared/RacingGameHelper.js";

const IS_DEBUG_MODE = true;

const VERTICAL_FOV = 1.2;

export default {
  name: "RacingCanvas",

  data() {
    return {
      canvasWidth: 768,
      canvasHeight: 768,
      scaleConst: 1,
      baseFontSize: 1,
      resmul: 1,
      aspectRatio: 1,
      canvas: null,
      ctx: null,
    };
  },
  props: {
    car: Object,
    otherCars: Array,
    playerCount: Number,
    time: Number,
    track: Object,
  },
  async mounted() {
    await this.loadAllTextures();
    this.canvas = this.$refs.canvas;
    this.ctx = this.canvas.getContext("2d");

    this.generateTrackTexture(this.track, this.track.width, this.track.height);
    this.generateWallTextureAndMask();

    const observer = new ResizeObserver(() => this.onCanvasResized());
    observer.observe(this.canvas);
    this._resizeObserver = observer;
    this.onCanvasResized();
  },

  methods: {
    onCanvasResized() {
      const w = this.canvas.clientWidth;
      const h = this.canvas.clientHeight;

      this.canvasWidth = Math.floor(w * this.resmul);
      this.canvasHeight = Math.floor(h * this.resmul);
      this.scaleConst = this.canvasHeight * 6.5;
      this.baseFontSize = this.canvasHeight / 20;
      this.aspectRatio = w / h;
    },
    async loadAllTextures() {
      this.carImg = await this.loadImage(carURL);
      this.carLeftImg = await this.loadImage(carLeftURL);
      this.carRightImg = await this.loadImage(carRightURL);

      this.trackStraight0Img = await this.loadImage(trackStraight0URL);
      this.trackStraight1Img = await this.loadImage(trackStraight1URL);

      this.trackStraightFinish0Img = await this.loadImage(trackStraightFinish0URL);

      this.trackCurve0Img = await this.loadImage(trackCurve0URL);
      this.trackCurve1Img = await this.loadImage(trackCurve1URL);
      this.trackCurve2Img = await this.loadImage(trackCurve2URL);
      this.trackCurve3Img = await this.loadImage(trackCurve3URL);

      this.trackEmptyImg = await this.loadImage(trackEmptyURL);

      this.wallImg = await this.loadImage(wallURL);
    },
    loadImage(src) {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
      });
    },
    getGameraPos() {
      const cameraX = this.car.x - Math.cos(this.car.angle) * 25;
      const cameraY = this.car.y - Math.sin(this.car.angle) * 25;

      return { cameraX, cameraY };
    },
    generateTrackTexture(track, width, height) {
      const imgW = width * TILE_SIZE;
      const imgH = height * TILE_SIZE;
      const texCanvas = document.createElement("canvas");
      texCanvas.width = imgW;
      texCanvas.height = imgH;
      const texCtx = texCanvas.getContext("2d", { willReadFrequently: true });

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          switch (track.data[y][x]) {
            case "#":
              texCtx.drawImage(this.trackEmptyImg, TILE_SIZE * x, TILE_SIZE * y);
              break;
            case "─":
              if (x == track.startX && y == track.startY)
                texCtx.drawImage(this.trackStraightFinish0Img, TILE_SIZE * x, TILE_SIZE * y);
              else texCtx.drawImage(this.trackStraight0Img, TILE_SIZE * x, TILE_SIZE * y);
              break;
            case "│":
              texCtx.drawImage(this.trackStraight1Img, TILE_SIZE * x, TILE_SIZE * y);
              break;
            case "┌":
              texCtx.drawImage(this.trackCurve0Img, TILE_SIZE * x, TILE_SIZE * y);
              break;
            case "┐":
              texCtx.drawImage(this.trackCurve1Img, TILE_SIZE * x, TILE_SIZE * y);
              break;
            case "┘":
              texCtx.drawImage(this.trackCurve2Img, TILE_SIZE * x, TILE_SIZE * y);
              break;
            case "└":
              texCtx.drawImage(this.trackCurve3Img, TILE_SIZE * x, TILE_SIZE * y);
              break;
          }
        }
      }

      this.trackImg = new Image();
      this.trackImg.src = texCanvas.toDataURL("image/png");

      const texData8 = texCtx.getImageData(0, 0, imgW, imgH).data;
      const tex32 = new Uint32Array(imgW * imgH);

      for (let i = 0, p = 0; i < tex32.length; i++, p += 4) {
        tex32[i] =
          (255 << 24) | // A
          (texData8[p + 2] << 16) | // B
          (texData8[p + 1] << 8) | // G
          texData8[p + 0]; // R
      }

      this._tex32 = tex32;
      this._texW = imgW;
      this._texH = imgH;
    },
    generateWallTextureAndMask() {
      this._wallMask = new Uint8Array(this._texW * this._texH);
      for (let y = 0; y < this._texH; y++) {
        for (let x = 0; x < this._texW; x++) {
          this._wallMask[y * this._texW + x] = isWall(x, y, this.track.data, TILE_SIZE, 2).isWall
            ? 1
            : 0;
        }
      }

      const wallW = TILE_SIZE;
      const wallH = TILE_SIZE;
      const texCanvas = document.createElement("canvas");
      texCanvas.width = wallW;
      texCanvas.height = wallH;
      const texCtx = texCanvas.getContext("2d", { willReadFrequently: true });
      texCtx.drawImage(this.wallImg, 0, 0);
      const texData8 = texCtx.getImageData(0, 0, wallW, wallH).data;
      const tex32 = new Uint32Array(wallW * wallH);

      for (let i = 0, p = 0; i < tex32.length; i++, p += 4) {
        tex32[i] =
          (255 << 24) | // A
          (texData8[p + 2] << 16) | // B
          (texData8[p + 1] << 8) | // G
          texData8[p + 0]; // R
      }

      this._wall32 = tex32;
      this._wallW = wallW;
      this._wallH = wallH;
    },
    prepareTexture(trackImg) {
      const imgW = trackImg.width;
      const imgH = trackImg.height;

      const texCanvas = document.createElement("canvas");
      texCanvas.width = imgW;
      texCanvas.height = imgH;
      const texCtx = texCanvas.getContext("2d", { willReadFrequently: true });
      texCtx.drawImage(trackImg, 0, 0);

      const texData8 = texCtx.getImageData(0, 0, imgW, imgH).data;
      const tex32 = new Uint32Array(imgW * imgH);

      for (let i = 0, p = 0; i < tex32.length; i++, p += 4) {
        tex32[i] =
          (255 << 24) | // A
          (texData8[p + 2] << 16) | // B
          (texData8[p + 1] << 8) | // G
          texData8[p + 0]; // R
      }

      this._tex32 = tex32;
      this._texW = imgW;
      this._texH = imgH;
    },
    worldToScreen(objX, objY, cameraX, cameraY, cameraAngle, w, h) {
      const dx = objX - cameraX;
      const dy = objY - cameraY;

      const sinA = Math.sin(cameraAngle);
      const cosA = Math.cos(cameraAngle);

      // camera space aligned with your Mode7
      const ry = dx * cosA + dy * sinA; // forward
      const rx = -dx * sinA + dy * cosA; // right

      const horizon = h * 0.45;
      const fov = VERTICAL_FOV * this.aspectRatio;

      const NEAR = 20;
      if (ry < NEAR) return null;

      // vertical matches floor: dy_screen = scaleConst/ry
      const p = this.scaleConst / ry;
      const screenY = horizon + p;

      const screenX = w * 0.5 + (rx / (ry * fov)) * (w * 0.5);

      // size ~ perspective
      const size = p * 0.5;

      return { screenX, screenY, size };
    },
    renderMode7Fast() {
      const ctx = this.ctx;
      const w = this.canvasWidth;
      const h = this.canvasHeight;
      const tex32 = this._tex32;
      const texW = this._texW;
      const texH = this._texH;
      const wallMask = this._wallMask;
      if (!tex32) return;

      const { cameraX, cameraY } = this.getGameraPos();
      const cameraAngle = this.car.angle;

      const horizon = (h * 0.45) | 0;
      const fov = VERTICAL_FOV * this.aspectRatio;

      const FP = 14;
      const ONE = 1 << FP;

      const sinA = Math.sin(cameraAngle);
      const cosA = Math.cos(cameraAngle);

      if (!this._frameBuffer || this._frameW !== w || this._frameH !== h) {
        this._frameW = w;
        this._frameH = h;
        this._frameAB = new ArrayBuffer(w * h * 4);
        this._frame32 = new Uint32Array(this._frameAB);
        this._frame8 = new Uint8ClampedArray(this._frameAB);
        this._imageData = new ImageData(this._frame8, w, h);
      }

      if (!this._firstWallX) {
        this._firstWallX = new Uint32Array(this.w);
      }
      this._firstWallX.fill(0);

      const out32 = this._frame32;

      let outIndex = 0;

      // Precompute sky color once (packed)
      const SKY = 0xffebd336; // light blue

      for (let y = 0; y < h; y++) {
        // SKY above horizon
        if (y < horizon) {
          const rowEnd = outIndex + w;
          while (outIndex < rowEnd) out32[outIndex++] = SKY;
          continue;
        }

        const dy = y - horizon;
        const distance = this.scaleConst / dy;

        // Row direction
        const rowDx = cosA * distance;
        const rowDy = sinA * distance;

        // Horizontal (right) direction
        const rightDx = -sinA * distance * fov;
        const rightDy = cosA * distance * fov;

        // Start of scanline (left edge in world)
        let worldX = cameraX + rowDx - rightDx;
        let worldY = cameraY + rowDy - rightDy;

        // Step per pixel across the scanline
        const stepX = (rightDx * 2) / w;
        const stepY = (rightDy * 2) / w;

        // Fixed-point versions for fast inner loop
        let wx = (worldX * ONE) | 0;
        let wy = (worldY * ONE) | 0;
        const sx = (stepX * ONE) | 0;
        const sy = (stepY * ONE) | 0;

        // Inner loop: NO floats, NO %, NO function calls
        for (let x = 0; x < w; x++) {
          let tx = wx >> FP;
          let ty = wy >> FP;

          // Fast wrap (handles negatives, avoids %)
          // equivalent to ((tx % texW)+texW)%texW but cheaper
          if (tx >= texW) {
            out32[outIndex++] = 0;
            continue;
          } //tx -= texW * ((tx / texW) | 0);
          else if (tx < 0) {
            out32[outIndex++] = 0;
            continue;
          } //tx += texW * ((-tx / texW + 1) | 0);

          if (ty >= texH) {
            out32[outIndex++] = 0;
            continue;
          } //ty -= texH * ((ty / texH) | 0);
          else if (ty < 0) {
            out32[outIndex++] = 0xffffffff;
            continue;
          } //ty += texH * ((-ty / texH + 1) | 0);

          if (this._wallMask[ty * texW + tx]) {
            out32[outIndex++] = 0xff0000ff;
          } else {
            out32[outIndex++] = tex32[ty * texW + tx];
          }

          wx += sx;
          wy += sy;
        }
      }

      ctx.putImageData(this._imageData, 0, 0);
    },
    raycast(cx, cy, angle) {
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);

      const wallMask = this._wallMask;
      const w = this._texW;

      for (let d = 0; d < 20000; d += 0.1) {
        const x = Math.floor(cx + dx * d);
        const y = Math.floor(cy + dy * d);

        if (wallMask[y * w + x]) {
          return {
            x: x,
            y: y,
            d: d,
          };
        }
      }
      return null;
    },
    renderWalls() {
      const w = this.canvasWidth;
      const h = this.canvasHeight;
      const horizon = (h * 0.45) | 0;
      const fov = VERTICAL_FOV * this.aspectRatio;
      const { cameraX, cameraY } = this.getGameraPos();
      const cameraAngle = this.car.angle;

      for (let x = 0; x < w; x += 1) {
        const t = (x / w) * 2 - 1;
        const angleOffset = Math.atan(t * fov);
        const angle = cameraAngle + angleOffset;
        const ray = this.raycast(cameraX, cameraY, angle);
        if (!ray) continue;
        const forwardDist = ray.d * Math.cos(angleOffset);
        if (!forwardDist || forwardDist <= 0) continue;

        const floorY = horizon + this.scaleConst / forwardDist;
        const wallHeight = this.scaleConst / forwardDist;
        const wallTop = floorY - wallHeight;
        this.ctx.fillStyle = "#444";

        const tx = ((ray.x + ray.y) * 8) % this.wallImg.width;

        this.ctx.drawImage(this.wallImg, tx, 0, 1, this.wallImg.height, x, wallTop, 1, wallHeight);
      }
    },
    renderPlayer(x, y, steer) {
      const { cameraX, cameraY } = this.getGameraPos();

      const scr = this.worldToScreen(
        x,
        y,
        cameraX,
        cameraY,
        this.car.angle,
        this.canvasWidth,
        this.canvasHeight
      );

      if (scr) {
        const { screenX, screenY, size } = scr;
        this.ctx.drawImage(
          steer > 0.5 ? this.carRightImg : steer < -0.5 ? this.carLeftImg : this.carImg,
          screenX - size / 2,
          screenY - size / 2,
          size,
          size
        );
      }
    },
    renderMiniMap() {
      const minimapTileSize = this.canvasWidth / (10 * this.track.width);
      const minimapW = this.track.width * minimapTileSize;
      const minimapH = this.track.height * minimapTileSize;

      this.ctx.drawImage(this.trackImg, 0, 0, minimapW, minimapH);
      this.ctx.fillStyle = "yellow";
      this.ctx.beginPath();
      this.ctx.arc(
        (this.car.x / this.trackImg.width) * minimapW,
        (this.car.y / this.trackImg.height) * minimapH,
        3,
        0,
        2 * Math.PI
      );
      this.ctx.fill();

      if (IS_DEBUG_MODE) {
        for (let i = 0; i < this.track.route.length; i++) {
          //this.ctx.fillStyle = "#ff0000a0";
          const routeTile = this.track.route[i];
          //this.ctx.fillRect(routeTile.x * minimapTileSize, routeTile.y * minimapTileSize, minimapTileSize, minimapTileSize);
          this.ctx.fillStyle = "white";
          this.ctx.textAlign = "center";
          this.ctx.textBaseline = "middle";
          this.ctx.font = `${minimapTileSize / 2}px 'VT323'`;
          this.ctx.fillText(
            `${i + 1}`,
            (routeTile.x + 0.5) * minimapTileSize,
            (routeTile.y + 0.4) * minimapTileSize
          );
          this.ctx.fillText(
            routeTile.direction == "north"
              ? "↑"
              : routeTile.direction == "south"
              ? "↓"
              : routeTile.direction == "west"
              ? "←"
              : "→",
            (routeTile.x + 0.5) * minimapTileSize,
            (routeTile.y + 0.7) * minimapTileSize
          );
        }

        for (let i = 0; i < this.car.tilesStack.length; i++) {
          this.ctx.fillStyle = "#0000ffa0";
          const routeTile = this.car.tilesStack[i];
          this.ctx.fillRect(
            routeTile.x * minimapTileSize,
            routeTile.y * minimapTileSize,
            minimapTileSize,
            minimapTileSize
          );
          this.ctx.fillStyle = "white";
          this.ctx.textAlign = "center";
          this.ctx.textBaseline = "middle";
          this.ctx.font = `${minimapTileSize}px 'VT323'`;
          this.ctx.fillText(
            `${i + 1}`,
            (routeTile.x + 0.5) * minimapTileSize,
            (routeTile.y + 0.5) * minimapTileSize
          );
        }

        //this.ctx.fillStyle = "blue";
        //for (let y = 0; y < minimapH; y++) {
        //  for (let x = 0; x < minimapW; x++) {
        //    const mapX = (x / minimapW) * this.track.width * TILE_SIZE;
        //    const mapY = (y / minimapH) * this.track.height * TILE_SIZE;
        //    if (isOnTrack(mapX, mapY, this.track.data, TILE_SIZE, ROAD_WIDTH)) {
        //      this.ctx.fillStyle = "#ff000050";
        //    } else {
        //      this.ctx.fillStyle = "#00000050";
        //    }
        //    this.ctx.fillRect(x, y, 1, 1);
        //  }
        //}
      }
    },
    render() {
      if (!this.ctx) return;

      this.renderMode7Fast();
      this.renderWalls();
      for (let other of this.otherCars) {
        this.renderPlayer(other.x, other.y, other.input.steer);
      }

      this.renderMiniMap();

      this.ctx.fillStyle = "white";
      this.ctx.textAlign = "end";
      this.ctx.textBaseline = "top";
      this.ctx.font = `${this.baseFontSize}px 'VT323'`;
      this.ctx.fillText(
        `Lap ${this.car.lap + 1}/${this.track.laps}`,
        this.canvasWidth - 10,
        this.baseFontSize
      );
      this.ctx.fillText(
        `Place ${this.car.place + 1}/${this.playerCount}`,
        this.canvasWidth - 10,
        this.baseFontSize * 2
      );
      this.ctx.fillText(`${formatTime(this.time)}`, this.canvasWidth - 10, this.baseFontSize * 3);

      if (this.car.isFinshed) {
        this.ctx.fillStyle = "#00000050";
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.font = `${3 * this.baseFontSize}px 'VT323'`;
        this.ctx.fillText(
          `You finished ${this.car.place + 1}`,
          this.canvasWidth / 2,
          this.canvasHeight / 2
        );
      }
    },
  },
};

function formatTime(time) {
  let minutes = Math.floor(time / 60000);
  let seconds = Math.floor((time % 60000) / 1000);
  let tenths = Math.floor((time % 1000) / 100);
  return `${minutes}'${seconds}''${tenths}`;
}
</script>

<style scoped>
div {
  width: 100%;
  height: 100%;
  min-height: 0;
}
canvas {
  box-sizing: border-box;
  border: 2px solid black;
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
}
</style>
