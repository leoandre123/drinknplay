<template>
  <div style="padding: 0 4rem">
    <svg ref="svg" viewBox="0 0 300 300" fill="none">
      <defs>
        <pattern id="grass" patternUnits="userSpaceOnUse" width="100" height="100">
          <image :href="grassTexture" x="0" y="0" width="100" height="100" />
        </pattern>
      </defs>

      <rect x="0" y="0" width="100%" height="100%" fill="#5a6" />

      <path :d="pathString" stroke="#EDC98F" :stroke-width="90" />
      <path :d="pathString" stroke="#aa3838" :stroke-width="64" stroke-dasharray="10" />
      <path
        :d="pathString"
        stroke="#fff"
        :stroke-width="64"
        stroke-dasharray="10"
        stroke-dashoffset="10"
      />
      <path :d="pathString" stroke="#444" :stroke-width="roadWidth" />
      <path
        :d="pathString"
        stroke="#fff"
        :stroke-width="roadWidth - lineOffsetDistante"
        stroke-dasharray="10 20"
      />
      <path
        :d="pathString"
        stroke="#444"
        :stroke-width="roadWidth - lineOffsetDistante - lineWidth * 2"
      />
      <path :d="pathString" stroke="#fff" :stroke-width="lineWidth" stroke-dasharray="10 5" />
      <path
        :d="`M 145 ${200 + roadWidth / 2} L 145 ${300 - roadWidth / 2}`"
        stroke-width="5"
        stroke="black"
        stroke-dasharray="5"
      />
      <path
        :d="`M 145 ${200 + roadWidth / 2} L 145 ${300 - roadWidth / 2}`"
        stroke-width="5"
        stroke="white"
        stroke-dasharray="5"
        stroke-dashoffset="5"
      />
      <path
        :d="`M 150 ${200 + roadWidth / 2} L 150 ${300 - roadWidth / 2}`"
        stroke-width="5"
        stroke="black"
        stroke-dasharray="5"
        stroke-dashoffset="5"
      />
      <path
        :d="`M 150 ${200 + roadWidth / 2} L 150 ${300 - roadWidth / 2}`"
        stroke-width="5"
        stroke="white"
        stroke-dasharray="5"
      />
    </svg>

    <ColorPicker v-model="backgroundColor" />
    <svg ref="svg" viewBox="0 0 1024 1024" fill="none">
      <!-- Grass -->
      <rect width="100%" height="100%" :fill="backgroundColor" />

      <path :d="pathString2" fill="#444" />
      <path :d="centerLine" stroke="#fff" :stroke-width="lineWidth" stroke-dasharray="10 5" />
      <path :d="centerLineOff" stroke="#fff" stroke-width="1" />
      <path :d="marginLine" stroke="#EDC98F" stroke-width="16" />
      <path :d="borderLine" stroke="#fff" stroke-width="5" stroke-dasharray="10" />
      <path
        :d="borderLine"
        stroke="#aa3838"
        stroke-width="5"
        stroke-dasharray="10"
        stroke-dashoffset="10"
      />

      <path
        :d="finishLine2"
        stroke-width="5"
        stroke="black"
        stroke-dasharray="5"
        stroke-dashoffset="5"
      />
      <path :d="finishLine2" stroke-width="5" stroke="white" stroke-dasharray="5" />
      <path :d="finishLine" stroke-width="5" stroke="black" stroke-dasharray="5" />
      <path
        :d="finishLine"
        stroke-width="5"
        stroke="white"
        stroke-dasharray="5"
        stroke-dashoffset="5"
      />
    </svg>
  </div>
  <button @click="exportAll">DOWNLOAD</button>
  <button @click="(_) => move(-1)">^</button>
  <button @click="(_) => move(1)">\/</button>
  <button @click="exportAll">DOWNLOAD</button>
</template>

<script>
import grassTexture from "@/assets/racing/track_empty.png";
import { ChromePicker } from "vue-color";
import ColorPicker from "../components/ColorPicker.vue";

const TILE_SIZE = 128;
const TILES_X = 3;
const TILES_Y = 3;

export default {
  name: "TestView",
  components: { ChromePicker, ColorPicker },
  data: function () {
    return {
      grassTexture,
      path: [
        { x: 50, y: 200 },
        { x: 50, y: 100 },
        { x: 100, y: 50, r: 50 },
        { x: 200, y: 50 },
        { x: 250, y: 100, r: 50 },
        { x: 250, y: 200 },
        { x: 200, y: 250, r: 50 },
        { x: 100, y: 250 },
        { x: 50, y: 200, r: 50 },
      ],
      path2: [
        { x: 150, y: 350, w: 30 },
        { x: 120, y: 270, w: 30 },
        { x: 75, y: 270, w: 20 },
        { x: 50, y: 245, w: 20, curve: true },
        { x: 50, y: 220, w: 20 },
        { x: 75, y: 120, w: 30 },
        { x: 100, y: 100, w: 30, curve: true },
        { x: 500, y: 100, w: 30 },
        { x: 525, y: 100, w: 30 },
        { x: 550, y: 125, w: 30, curve: true },
        { x: 550, y: 150, w: 30 },
        { x: 600, y: 200, w: 30, curve: true },
        { x: 800, y: 100, w: 30 },
        { x: 890, y: 140, w: 30, curve: true },
        { x: 890, y: 200, w: 30 },
        { x: 890, y: 230, w: 60 },
        { x: 890, y: 300, w: 100 },
        { x: 890, y: 450, w: 60 },
        { x: 890, y: 500, w: 30 },
        { x: 850, y: 550, w: 30, curve: true },
        { x: 500, y: 550, w: 30 },
        { x: 400, y: 450, w: 30 },
        { x: 350, y: 400, w: 30, curve: true },
        { x: 250, y: 450, w: 30 },
        { x: 161, y: 380, w: 30, curve: true },
        { x: 150, y: 350, w: 30 },
      ],
      roadWidth: 50,
      lineWidth: 2,
      lineOffsetDistante: 5,

      backgroundColor: "#558a55",
    };
  },
  methods: {
    move(d) {
      this.path2[0].y += d;
    },
    exportAll() {
      this.exportImage(TILE_SIZE, 0, 0, TILES_X, TILES_Y, "curve_0");
      this.exportImage(TILE_SIZE, 2, 0, TILES_X, TILES_Y, "curve_1");
      this.exportImage(TILE_SIZE, 2, 2, TILES_X, TILES_Y, "curve_2");
      this.exportImage(TILE_SIZE, 0, 2, TILES_X, TILES_Y, "curve_3");

      this.exportImage(TILE_SIZE, 1, 0, TILES_X, TILES_Y, "straight_0");
      this.exportImage(TILE_SIZE, 0, 1, TILES_X, TILES_Y, "straight_1");

      this.exportImage(TILE_SIZE, 1, 2, TILES_X, TILES_Y, "straight_0_finish");
    },
    exportImage(tilesize, tileX, tileY, tileCountX, tileCountY, name) {
      console.log("EXPORTING...");
      const svg = this.$refs.svg;

      const vb = svg.viewBox.baseVal;
      svg.setAttribute("width", vb.width);
      svg.setAttribute("height", vb.height);

      const serializer = new XMLSerializer();
      const svgData = serializer.serializeToString(svg);

      svg.removeAttribute("width");
      svg.removeAttribute("height");

      const img = new Image();
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = tilesize;
        canvas.height = tilesize;

        const sourceTileWidth = img.width / tileCountX;
        const sourceTileHeight = img.height / tileCountY;
        const sx = tileX * sourceTileWidth;
        const sy = tileY * sourceTileHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, sx, sy, sourceTileWidth, sourceTileHeight, 0, 0, tilesize, tilesize);
        console.log("IMAGES CREATED: " + img.width + " - " + img.height);
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `track_${name}.png`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        }, "image/png");
      };
    },
  },
  computed: {
    pathString() {
      let str = `M ${this.path[0].x} ${this.path[0].y}`;
      for (let i = 1; i < this.path.length; i++) {
        const point = this.path[i];
        if (point.r) {
          str += `A ${point.r} ${point.r} 0 0 1 ${point.x} ${point.y}`;
        } else {
          str += `L ${point.x} ${point.y}`;
        }
      }
      return str;
    },
    centerLine() {
      return generatePathString(this.path2);
    },
    centerLineOff() {
      return (
        generatePathString(offsetPathWithWidth(this.path2, false, -5)) +
        generatePathString(offsetPathWithWidth(this.path2, true, 5))
      );
    },
    borderLine() {
      return (
        generatePathString(offsetPathWithWidth(this.path2, false, 0)) +
        generatePathString(offsetPathWithWidth(this.path2, true, 0))
      );
    },
    marginLine() {
      return (
        generatePathString(offsetPathWithWidth(this.path2, false, 10)) +
        generatePathString(offsetPathWithWidth(this.path2, true, -10))
      );
    },
    finishLine() {
      const forward = angle(this.path2[0], this.path2[1]);
      const left = forward + Math.PI / 2;
      const right = forward - Math.PI / 2;
      const startPoint = offsetPoint(this.path2[0], left, this.path2[0].w);
      const endPoint = offsetPoint(this.path2[0], right, this.path2[0].w);
      return generatePathString([startPoint, endPoint]);
    },
    finishLine2() {
      const forward = angle(this.path2[0], this.path2[1]);
      const left = forward + Math.PI / 2;
      const right = forward - Math.PI / 2;
      const startPoint = offsetPoint(offsetPoint(this.path2[0], forward, 5), left, this.path2[0].w);
      const endPoint = offsetPoint(offsetPoint(this.path2[0], forward, 5), right, this.path2[0].w);

      return generatePathString([startPoint, endPoint]);
    },
    pathString2() {
      let left = angle(this.path2[0], this.path2[1]) + Math.PI / 2;
      let nextLeft = 0;

      const startPoint = offsetPoint(this.path2[0], left, this.path2[0].w);

      const path = [startPoint];

      for (let i = 1; i < this.path2.length - 1; i++) {
        const currentAngle = angle(this.path2[i - 1], this.path2[i]);
        const nextAngle = angle(this.path2[i], this.path2[i + 1]);
        left = currentAngle + Math.PI / 2;
        nextLeft = nextAngle + Math.PI / 2;
        path.push(offsetPoint(this.path2[i], middleAngle(left, nextLeft), this.path2[i].w));
      }

      path.push(
        offsetPoint(
          this.path2[this.path2.length - 1],
          nextLeft,
          this.path2[this.path2.length - 1].w
        )
      );

      left =
        angle(this.path2[this.path2.length - 1], this.path2[this.path2.length - 2]) + Math.PI / 2;

      path.push(
        offsetPoint(this.path2[this.path2.length - 1], left, this.path2[this.path2.length - 1].w)
      );
      for (let i = this.path2.length - 2; i > 0; i--) {
        const currentAngle = angle(this.path2[i + 1], this.path2[i]);
        const nextAngle = angle(this.path2[i], this.path2[i - 1]);
        left = currentAngle + Math.PI / 2;
        nextLeft = nextAngle + Math.PI / 2;
        const newPoint = offsetPoint(this.path2[i], middleAngle(left, nextLeft), this.path2[i].w);
        newPoint.curve = this.path2[i + 1].curve;
        path.push(newPoint);
      }

      path.push(offsetPoint(this.path2[0], nextLeft, this.path2[0].w));

      return generatePathString(path) + " Z";
    },
  },
};

function offsetPathWithWidth(inputPath, side, d) {
  let left = angle(inputPath[0], inputPath[1]) + Math.PI / 2;
  let nextLeft = 0;

  const startPoint = offsetPoint(inputPath[0], left, inputPath[0].w * (side ? -1 : 1) + d);

  const path = [startPoint];

  for (let i = 1; i < inputPath.length - 1; i++) {
    const currentAngle = angle(inputPath[i - 1], inputPath[i]);
    const nextAngle = angle(inputPath[i], inputPath[i + 1]);
    left = currentAngle + Math.PI / 2;
    nextLeft = nextAngle + Math.PI / 2;
    path.push(
      offsetPoint(inputPath[i], middleAngle(left, nextLeft), inputPath[i].w * (side ? -1 : 1) + d)
    );
  }

  path.push(
    offsetPoint(
      inputPath[inputPath.length - 1],
      nextLeft,
      inputPath[inputPath.length - 1].w * (side ? -1 : 1) + d
    )
  );
  return path;
}

function offsetPath(inputPath, d) {
  let left = angle(inputPath[0], inputPath[1]) + Math.PI / 2;
  let nextLeft = 0;

  const startPoint = offsetPoint(inputPath[0], left, d);

  const path = [startPoint];

  for (let i = 1; i < inputPath.length - 1; i++) {
    const currentAngle = angle(inputPath[i - 1], inputPath[i]);
    const nextAngle = angle(inputPath[i], inputPath[i + 1]);
    left = currentAngle + Math.PI / 2;
    nextLeft = nextAngle + Math.PI / 2;

    const prevPoint = offsetPoint(inputPath[i - 1], left, d);
    const nextPoint = offsetPoint(inputPath[i + 1], nextLeft, d);
    const newPoint =
      intersectPoint(prevPoint, currentAngle, nextPoint, nextAngle) ??
      averagePoint(prevPoint, nextPoint);
    newPoint.curve = inputPath[i].curve;

    path.push(newPoint);
  }

  path.push(offsetPoint(inputPath[inputPath.length - 1], nextLeft, d));
  return path;
}

function generatePathString(path) {
  let currentAngle = 0;
  let str = `M ${path[0].x} ${path[0].y}`;
  for (let i = 1; i < path.length; i++) {
    const point = path[i];
    const prevPoint = path[i - 1];
    if (point.curve && i < path.length - 1) {
      const nextPoint = path[i + 1];
      const nextAngle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x);
      str += bezier(prevPoint, currentAngle, point, nextAngle);
    } else {
      str += `L ${point.x} ${point.y}`;
    }

    currentAngle = Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x);
  }
  return str;
}

function middleAngle(a, b) {
  const x = Math.cos(a) + Math.cos(b);
  const y = Math.sin(a) + Math.sin(b);
  return Math.atan2(y, x);
}
function angle(p0, p1) {
  return Math.atan2(p1.y - p0.y, p1.x - p0.x);
}

function averagePoint(p0, p1) {
  return {
    x: (p0.x + p1.x) / 2,
    y: (p0.y + p1.y) / 2,
  };
}
function offsetPoint(p, a, d) {
  const dx = Math.cos(a);
  const dy = Math.sin(a);

  return {
    x: p.x - dx * d,
    y: p.y - dy * d,
    curve: p.curve,
  };
}
function bezier(p0, a0, p1, a1) {
  const c = intersectPoint(p0, a0, p1, a1);

  const c1 = { x: (p0.x + c.x) / 2, y: (p0.y + c.y) / 2 };
  const c2 = { x: (p1.x + c.x) / 2, y: (p1.y + c.y) / 2 };

  return `C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${p1.x} ${p1.y}`;
}
function intersectPoint(p0, a0, p1, a1) {
  // Direction vectors
  const d0 = { x: Math.cos(a0), y: Math.sin(a0) };
  const d1 = { x: Math.cos(a1), y: Math.sin(a1) };

  // Solve p0 + t * d0 = p1 + u * d1
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;

  const det = d0.x * d1.y - d0.y * d1.x;
  if (Math.abs(det) < 1e-9) return null; // Parallel or no intersection

  const t = (dx * d1.y - dy * d1.x) / det;

  return {
    x: p0.x + t * d0.x,
    y: p0.y + t * d0.y,
  };
}
</script>

<style scoped>
svg {
  background: red;
  width: 80vw;
}
</style>
