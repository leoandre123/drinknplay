<template>
  <div class="editor-container">
    <div class="settings">
      <button @click="exportMap">Export</button>
      <button @click="importMap">Import</button>
      <br />
      <label>Render mode:</label>
      <select v-model="renderMode">
        <option value="edit">Edit</option>
        <option value="final">Final</option>
        <option value="road">Road</option>
        <option value="walls">Walls</option>
      </select>
      <label>Close path</label>
      <input type="checkbox" v-model="closePath" />
      <br /><br /><br />
      <h3>Map Settings</h3>
      <SettingsGrid v-model="map.settings" />
    </div>
    <div style="padding: 0 4rem">
      <svg
        ref="svg"
        :viewBox="`0 0 ${map.settings.mapWidth} ${map.settings.mapHeight}`"
        fill="none"
        tabindex="0"
        @mousedown="mouseDown"
        @mousemove="mouseMove"
        @mouseup="mouseUp"
        @dblclick="doubleClick"
        @keydown="keyDown"
      >
        <defs>
          <pattern id="grass" patternUnits="userSpaceOnUse" width="100" height="100">
            <image
              :href="grassTexture"
              x="0"
              y="0"
              width="100"
              height="100"
              image-rendering="pixelated"
            />
          </pattern>
          <pattern
            id="background"
            patternUnits="userSpaceOnUse"
            :width="map.settings.background.size"
            :height="map.settings.background.size"
          >
            <image
              :href="map.settings.background.uri"
              x="0"
              y="0"
              :width="map.settings.background.size"
              :height="map.settings.background.size"
              image-rendering="pixelated"
            />
          </pattern>
        </defs>

        <rect width="100%" height="100%" :fill="map.settings.backgroundColor" />
        <rect
          width="100%"
          height="100%"
          :fill="map.settings.background.uri ? 'url(#background)' : map.settings.background.color"
        />

        <path v-if="drawRoad" :d="pathString" :fill="map.settings.roadColor" />
        <path
          v-if="drawDetails"
          :d="centerLine"
          :stroke="map.settings.lineColor"
          :stroke-width="map.settings.lineWidth"
          stroke-dasharray="10 5"
        />
        <path
          v-if="drawDetails"
          :d="centerLine2"
          :stroke="map.settings.lineColor"
          :stroke-width="map.settings.lineWidth"
          stroke-dasharray="10 5"
        />
        <path
          v-if="drawDetails"
          :d="centerLineOff"
          :stroke="map.settings.lineColor"
          stroke-width="1"
        />
        <path v-if="drawDetails" :d="marginLine" stroke="#EDC98F" stroke-width="16" />
        <path
          v-if="drawDetails"
          :d="borderLine"
          stroke="#fff"
          stroke-width="5"
          stroke-dasharray="10"
        />
        <path
          v-if="drawDetails"
          :d="borderLine"
          stroke="#aa3838"
          stroke-width="5"
          stroke-dasharray="10"
          stroke-dashoffset="10"
        />

        <path
          v-if="drawDetails"
          :d="finishLine2"
          stroke-width="5"
          stroke="black"
          stroke-dasharray="5"
          stroke-dashoffset="5"
        />
        <path
          v-if="drawDetails"
          :d="finishLine2"
          stroke-width="5"
          stroke="white"
          stroke-dasharray="5"
        />
        <path
          v-if="drawDetails"
          :d="finishLine"
          stroke-width="5"
          stroke="black"
          stroke-dasharray="5"
        />
        <path
          v-if="drawDetails"
          :d="finishLine"
          stroke-width="5"
          stroke="white"
          stroke-dasharray="5"
          stroke-dashoffset="5"
        />

        <circle
          v-if="renderMode == 'edit'"
          v-for="(point, i) in map.path"
          :cx="point.x"
          :cy="point.y"
          r="5"
          :fill="i == selectedPointIndex ? 'red' : 'blue'"
        />
      </svg>
    </div>
    <div class="properties">
      <p>{{ selectedPointIndex }}</p>
      <div v-if="selectedPointIndex != -1">
        <button @click="deletePoint">Delete</button>
        <br />
        <label>Width: </label>
        <input type="number" v-model="map.path[selectedPointIndex].w" />
        <br />
        <label>Curve: </label>
        <input type="checkbox" v-model="map.path[selectedPointIndex].curve" />
      </div>
    </div>
  </div>
</template>

<script>
import grassTexture from "@/assets/racing/dirt.png";
import ColorPicker from "../components/ColorPicker.vue";
import SettingsGrid from "../components/SettingsGrid.vue";

export default {
  name: "MapEditor",
  components: { ColorPicker, SettingsGrid },
  data: function () {
    return {
      grassTexture,
      selectedPointIndex: -1,
      isDragging: false,

      renderMode: "edit",
      closePath: false,

      map: {
        settings: {
          mapWidth: 1024,
          mapHeight: 1024,

          roadWidth: 50,
          lineWidth: 2,
          lineOffsetDistante: 5,
          background: {
            color: "#558a55",
            uri: "",
            size: 64,
          },
          roadColor: "#444444",
          lineColor: "#ffffff",
        },
        path: [
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
        ],
      },
    };
  },
  methods: {
    getMousePos(event) {
      const rect = this.$refs.svg.getBoundingClientRect();

      return {
        x: (this.map.settings.mapWidth * (event.clientX - rect.left)) / rect.width,
        y: (this.map.settings.mapHeight * (event.clientY - rect.top)) / rect.height,
      };
    },
    mouseDown(event) {
      const mousePos = this.getMousePos(event);
      console.log(mousePos);

      for (let i = 0; i < this.map.path.length; i++) {
        if (dist(this.map.path[i], mousePos) < 5) {
          this.selectedPointIndex = i;
          this.isDragging = true;
          return;
        }
      }

      this.selectedPointIndex = -1;
      this.isDragging = false;
    },
    mouseUp(event) {
      this.isDragging = false;
    },
    mouseMove(event) {
      if (!this.isDragging) return;
      const mousePos = this.getMousePos(event);

      if (this.selectedPointIndex != -1) {
        this.map.path[this.selectedPointIndex].x = mousePos.x;
        this.map.path[this.selectedPointIndex].y = mousePos.y;
      }
    },
    doubleClick(event) {
      const mousePos = this.getMousePos(event);

      for (let i = 0; i < this.map.path.length - 1; i++) {
        const dist = distanceToSegment(mousePos, this.map.path[i], this.map.path[i + 1]);

        if (dist < 5) {
          this.map.path.splice(i + 1, 0, {
            x: mousePos.x,
            y: mousePos.y,
            w: 30,
          });

          return;
        }
      }
    },
    keyDown(event) {
      console.log(event);
      switch (event.key) {
        case "Delete":
          this.deletePoint();
          break;
      }
    },

    deletePoint() {
      console.log("DELET");
      this.map.path.splice(this.selectedPointIndex, 1);
    },

    exportMap() {
      const json = JSON.stringify(this.map);
      console.log(json);
      alert(json);
    },
    importMap() {
      const data = prompt("HEJ");
      this.map = JSON.parse(data);
    },

    exportAll() {},
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
    drawRoad() {
      return this.renderMode != "walls";
    },
    drawDetails() {
      return this.renderMode == "edit" || this.renderMode == "final";
    },
    drawWalls() {
      return this.renderMode != "road";
    },
    centerLine() {
      return generatePathString(this.map.path, this.closePath);
    },
    centerLine2() {
      return bsplineToPath(this.map.path, this.closePath);
    },
    centerLineOff() {
      return (
        generatePathString(offsetPathWithWidth(this.map.path, false, -5), true) +
        generatePathString(offsetPathWithWidth(this.map.path, true, 5), true)
      );
    },
    borderLine() {
      return (
        generatePathString(offsetPathWithWidth(this.map.path, false, 0), true) +
        generatePathString(offsetPathWithWidth(this.map.path, true, 0), true)
      );
    },
    marginLine() {
      return (
        generatePathString(offsetPathWithWidth(this.map.path, false, 10), true) +
        generatePathString(offsetPathWithWidth(this.map.path, true, -10), true)
      );
    },
    finishLine() {
      const forward = angle(this.map.path[0], this.map.path[1]);
      const left = forward + Math.PI / 2;
      const right = forward - Math.PI / 2;
      const startPoint = offsetPoint(this.map.path[0], left, this.map.path[0].w);
      const endPoint = offsetPoint(this.map.path[0], right, this.map.path[0].w);
      return generatePathString([startPoint, endPoint]);
    },
    finishLine2() {
      const forward = angle(this.map.path[0], this.map.path[1]);
      const left = forward + Math.PI / 2;
      const right = forward - Math.PI / 2;
      const startPoint = offsetPoint(
        offsetPoint(this.map.path[0], forward, 5),
        left,
        this.map.path[0].w
      );
      const endPoint = offsetPoint(
        offsetPoint(this.map.path[0], forward, 5),
        right,
        this.map.path[0].w
      );

      return generatePathString([startPoint, endPoint]);
    },
    pathString() {
      const close = true;
      let left = angle(this.map.path[0], this.map.path[1]) + Math.PI / 2;
      let nextLeft = 0;

      const startPoint = offsetPoint(this.map.path[0], left, this.map.path[0].w);

      const path = [startPoint];

      for (let i = 1; i < this.map.path.length - 1; i++) {
        const currentAngle = angle(this.map.path[i - 1], this.map.path[i]);
        const nextAngle = angle(this.map.path[i], this.map.path[i + 1]);
        left = currentAngle + Math.PI / 2;
        nextLeft = nextAngle + Math.PI / 2;
        path.push(offsetPoint(this.map.path[i], middleAngle(left, nextLeft), this.map.path[i].w));
      }

      path.push(
        offsetPoint(
          this.map.path[this.map.path.length - 1],
          nextLeft,
          this.map.path[this.map.path.length - 1].w
        )
      );

      if (close) {
        path.push(
          offsetPoint(
            this.map.path[0],
            angle(this.map.path[0], this.map.path[1]) + Math.PI / 2,
            this.map.path[0].w
          )
        );
        path.push(
          offsetPoint(
            this.map.path[0],
            angle(this.map.path[0], this.map.path[1]) - Math.PI / 2,
            this.map.path[0].w
          )
        );
      }

      left =
        angle(this.map.path[this.map.path.length - 1], this.map.path[this.map.path.length - 2]) +
        Math.PI / 2;

      path.push(
        offsetPoint(
          this.map.path[this.map.path.length - 1],
          left,
          this.map.path[this.map.path.length - 1].w
        )
      );
      for (let i = this.map.path.length - 2; i > 0; i--) {
        const currentAngle = angle(this.map.path[i + 1], this.map.path[i]);
        const nextAngle = angle(this.map.path[i], this.map.path[i - 1]);
        left = currentAngle + Math.PI / 2;
        nextLeft = nextAngle + Math.PI / 2;
        const newPoint = offsetPoint(
          this.map.path[i],
          middleAngle(left, nextLeft),
          this.map.path[i].w
        );
        newPoint.curve = this.map.path[i + 1].curve;
        path.push(newPoint);
      }

      path.push(offsetPoint(this.map.path[0], nextLeft, this.map.path[0].w));

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

function generatePathString(path, close = false) {
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
  return close ? str + " Z" : str;
}

function generatePathString2(path, close = false) {
  let currentAngle = 0;
  let str = `M ${path[0].x} ${path[0].y}`;
  let prevCurve = false;

  for (let i = 1; i < path.length; i++) {
    const point = path[i];
    const prevPoint = path[i - 1];
    if (point.curve && i < path.length - 2) {
      const nextPoint = path[i + 2];
      const nextAngle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x);
      str += doubleBezier(prevPoint, currentAngle, point, nextAngle, path[i + 1]);
      prevCurve = true;
    } else if (prevCurve) {
      //str += bezier(prevPoint, currentAngle, point, nextAngle);
      prevCurve = false;
    } else {
      str += `L ${point.x} ${point.y}`;
    }

    currentAngle = Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x);
  }
  return close ? str + " Z" : str;
}

function bsplineToPath(points, close = false) {
  if (points.length < 4) return ""; // need at least 4

  const p = points;

  if (close) {
    p.push(points[0]);
  }

  const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
  const mul = (a, k) => ({ x: a.x * k, y: a.y * k });

  const path = [];

  // we generate segments for i = 1..(n-3), each using p[i-1..i+2]
  for (let i = 1; i < p.length - 2; i++) {
    const P0 = p[i - 1];
    const P1 = p[i];
    const P2 = p[i + 1];
    const P3 = p[i + 2];

    const B0 = mul(add(add(P0, mul(P1, 4)), P2), 1 / 6);
    const B1 = mul(add(mul(P1, 4), mul(P2, 2)), 1 / 6);
    const B2 = mul(add(mul(P1, 2), mul(P2, 4)), 1 / 6);
    const B3 = mul(add(add(P1, mul(P2, 4)), P3), 1 / 6);

    if (i === 1) {
      // move to first point once
      path.push(`M ${B0.x} ${B0.y}`);
    }

    path.push(`C ${B1.x} ${B1.y} ${B2.x} ${B2.y} ${B3.x} ${B3.y}`);
  }

  return path.join(" ");
}

function middleAngle(a, b) {
  const x = Math.cos(a) + Math.cos(b);
  const y = Math.sin(a) + Math.sin(b);
  return Math.atan2(y, x);
}
function angle(p0, p1) {
  return Math.atan2(p1.y - p0.y, p1.x - p0.x);
}
function dist(p0, p1) {
  return Math.hypot(p1.x - p0.x, p1.y - p0.y);
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
function doubleBezier(p0, a0, p1, a1, center) {
  const midAngle = middleAngle(a0, a1) + Math.PI / 2;

  const cp0 = intersectPoint(p0, a0, p1, midAngle);
  const cp1 = intersectPoint(p0, midAngle, p1, a1);

  const c1 = { x: (p0.x + cp0.x) / 2, y: (p0.y + cp0.y) / 2 };
  const c2 = { x: (p1.x + cp1.x) / 2, y: (p1.y + cp1.y) / 2 };

  console.log(c1);
  console.log(c2);
  return `C ${c1.x} ${c1.y} ${c1.x} ${c1.y} ${center.x} ${center.y} S ${c2.x} ${c2.x} ${p1.x} ${p1.y}`;
}
function distanceToSegment(p0, p1, p2) {
  const A = p0.x - p1.x;
  const B = p0.y - p1.y;
  const C = p2.x - p1.x;
  const D = p2.y - p1.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let t = dot / lenSq;

  t = Math.max(0, Math.min(1, t));

  const closestX = p1.x + t * C;
  const closestY = p1.y + t * D;

  const dx = p0.x - closestX;
  const dy = p0.y - closestY;
  return Math.sqrt(dx * dx + dy * dy);
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
.editor-container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 1rem;
  padding: 1rem;
}

.settings {
  background-color: rgb(48, 48, 48);
  color: beige;
  padding: 1rem;
  gap: 1rem;
}
/*
.settings-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 3fr 2fr;
  text-align: start;
}
.settings-grid * {
  margin: 0;
  min-width: 0;
}

.settings-grid .title {
  font-weight: bold;
  grid-column: 1 / -1;
}
.settings-grid hr {
  grid-column: 1 / -1;
}*/

.properties {
  background-color: rgb(48, 48, 48);
}
</style>
