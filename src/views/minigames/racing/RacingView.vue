<template>
  <div>
    <div class="container">
      <!--
      <div class="info">
        <div class="debug">
          <p style="position: absolute; top: 0; left: 0">debug</p>
          <p>FPS: {{ Math.round(fps) }}</p>
          <button @click="joinAsHost">Join as Host</button>
          <button @click="loop">Restart rendering</button>
          <button @click="startTime = Date.now()">Start timer</button>
          <button @click="cars = []">Remove all players</button>
          <button @click="spawnPlayer('ghost')">Add ghost player</button>
        </div>
      </div>
-->
      <div class="canvas-container" :style="gridStyle">
        <RacingCanvas
          v-for="car in cars"
          :track="track"
          :car="car"
          :other-cars="cars"
          :place="0"
          :player-count="cars.length"
          :time="Date.now() - startTime"
          ref="gameCanvases"
        />
      </div>
    </div>
  </div>
</template>

<script>
import RacingCanvas from "../../../components/RacingCanvas.vue";
import { context } from "../../../context";
import { socket } from "../../../socket";

export const TILE_SIZE = 128;
export const ROAD_WIDTH = 64;

export default {
  name: "RacingView",

  data() {
    return {
      // canvas
      canvasWidth: 700,
      canvasHeight: 700,
      ctx: null,

      // images
      trackImg: null,
      carImg: null,

      //temps,
      fps: 0,
      startTime: 0,

      //world & cars

      track: {
        width: 8,
        height: 8,
        data: ["########", "#┌───┐##", "#│#┌─┘##", "#└┐│┌─┐#", "#┌┘└┘┌┘#", "#│###└┐#", "#└────┘#", "########"],
        startX: 4,
        startY: 6,
        route: [
          { x: 4, y: 6, direction: "east" },
          { x: 5, y: 6, direction: "east" },
        ],
      },

      cars: [],
    };
  },
  components: { RacingCanvas },
  mounted() {
    socket.on("updateCars", (cars) => {
      this.cars = cars;
    });
    socket.on("setTrack", (track) => {
      this.track = track;
    });
    socket.on("setStartTime", (time) => {
      this.startTime = time;
    });

    // Start game loop
    this.lastFrame = Date.now();
    this.startTime = Date.now();
    requestAnimationFrame(this.loop);
  },

  methods: {
    loop() {
      const now = Date.now();
      const delta = (now - this.lastFrame) / 1000;

      this.fps = 1 / delta;
      if (this.$refs.gameCanvases) {
        for (let gameCanvas of this.$refs.gameCanvases) gameCanvas.render();
      }

      requestAnimationFrame(this.loop);
      this.lastFrame = now;
    },
  },
  computed: {
    gridStyle() {
      const n = this.cars.length;
      const rows = n > 2 ? 2 : 1;
      const cols = Math.ceil(n / rows);

      return {
        display: "grid",
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        minHeight: 0,
      };
    },
  },
};
</script>

<style scoped>
h1 {
  color: #cfc6c6;
  font-family: "Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif;
  font-size: 3rem;
}
.container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.info {
}
.debug {
  position: relative;
  background: red;
  color: white;
  float: right;
}
.debug p {
  margin: 0;
}

.canvas-container {
  height: 100%;
}
</style>
