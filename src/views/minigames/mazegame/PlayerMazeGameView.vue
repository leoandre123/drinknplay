<template>
  <div class="canvasWrapper" :class="{ 'column-layout': !isLandscape }">
    <div v-if="isLandscape" class="sidebar landscape">
      <button @click="toggleMode">{{ $t("common.switchMode") }}</button>
      <p class="modeText">{{ $t("common.modeDescription") }}<br />{{ mode }}</p>
    </div>

    <div v-else class="sidebar portrait">
      <button @click="toggleMode">{{ $t("common.switchMode") }}</button>
    </div>

    <canvas id="mazeCanvas"></canvas>

    <div v-if="showResultModal" class="win-modal">
      <div class="modal-content">
        <h2 v-if="winnerId === myId">🏆 {{ $t("mazegame.winText") }} 🏆</h2>
        <h2 v-else>{{ winnerName }} {{ $t("mazegame.won") }}</h2>
        <p v-if="winnerId === myId">{{ $t("mazegame.greatJob") }}</p>
        <p v-else>{{ $t("mazegame.encourage") }}</p>
      </div>
    </div>

    <div v-else-if="slopeFinished" class="win-modal">
      <div class="modal-content">
        <h2>{{ $t("mazegame.finish") }}</h2>
        <p>{{ $t("mazegame.waiting") }}</p>
      </div>
    </div>

    <p v-if="!isLandscape" class="modeText">{{ $t("common.modeDescription") }}<br />{{ mode }}</p>
  </div>
</template>

<script>
import { socket } from "../../../socket";
import { context } from "../../../context";
import { useDevice } from "@/UseDevice";

export const COLUMNS_OF_MAZE = 8;
export const MAZE_FINISH_INDEX = 4;

export default {
  name: "PlayerMazeGameView",

  data() {
    return {
      mode: this.isMobile ? "mobileMode" : "computerMode",
      isLandscape: window.innerWidth > window.innerHeight,
      tileSize: 0,
      maze: [],
      columns: 0,
      rows: 0,
      c: null,
      ctx: null,
      finishIndex: 0,
      ball: {
        x: 0,
        y: 0,
        r: 0,
        vx: 0,
        vy: 0,
        acx: 0,
        acy: 0,
        friction: 0.99,
      },
      lastTime: 0,
      rafId: null,
      slopeFinished: false,
      gameActive: true,
      winnerId: null,
      winnerName: null,
      showResultModal: false,
    };
  },

  setup() {
    const { isMobile } = useDevice();

    return { isMobile };
  },

  computed: {
    myId() {
      return context.playerId;
    },
  },

  created() {
    socket.on("maze:roundResult", ({ winnerId, winnerName, scores }) => {
      this.gameActive = false;

      this.winnerId = winnerId;
      this.winnerName = winnerName;
      this.showResultModal = true;

      console.log("Result received:", { winnerId, myId: this.myId });

      if (this.winnerId === this.myId) {
        new Audio("/sounds/winner.mp3").play();
      } else {
        new Audio("/sounds/nowinner.mp3").play();
      }
    });
  },

  mounted() {
    this.c = document.getElementById("mazeCanvas");

    if (this.isLandscape) {
      this.c.width = window.innerHeight;
      this.c.height = window.innerHeight;
    } else {
      this.c.width = window.innerWidth;
      this.c.height = window.innerWidth;
    }

    this.columns = COLUMNS_OF_MAZE;
    this.tileSize = this.c.width / this.columns;

    this.maze = [
      true,
      false,
      true,
      true,
      false,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      true,
      true,
      false,
      true,
      true,
      true,
      true,
      false,
      true,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      true,
      true,
      true,
      false,
      true,
      false,
      true,
      false,
      true,
      false,
      true,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      true,
      false,
      true,
      false,
      true,
      true,
      true,
      true,
      true,
      false,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ];
    this.finishIndex = MAZE_FINISH_INDEX;

    this.ctx = this.c.getContext("2d");

    this.drawMaze();
    this.ball.r = this.tileSize / 3;
    this.ball.x = this.tileSize * 1.5;
    this.ball.y = this.tileSize / 2;
    this.drawBall(this.ball.x, this.ball.y, this.ball.r);

    this.loop = this.loop.bind(this);
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.loop);

    window.addEventListener("deviceorientation", this.handleRotation);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("resize", () => {
      this.isLandscape = window.innerWidth > window.innerHeight;
    });
  },
  beforeUnmount() {
    window.removeEventListener("deviceorientation", this.handleRotation);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    socket.off("maze:roundResult");
  },

  methods: {
    toggleMode() {
      this.mode = this.mode === "computerMode" ? "mobileMode" : "computerMode";
      this.requestSensorPermission();
    },
    loop(now) {
      if (!this.gameActive) return;
      const dt = (now - this.lastTime) / 1000;
      this.lastTime = now;

      this.update(dt);
      this.render();

      this.rafId = requestAnimationFrame(this.loop);
    },

    update(dt) {
      this.ball.vx += this.ball.acx * dt;
      this.ball.vy += this.ball.acy * dt;

      this.ball.x += this.ball.vx * dt;
      this.checkCollisionWithMazeX();
      this.ball.y += this.ball.vy * dt;
      this.checkCollisionWithMazeY();

      this.checkSlopeFinished();

      this.ball.vx *= this.ball.friction;
      this.ball.vy *= this.ball.friction;

      if (this.ball.x - this.ball.r < 0) {
        this.ball.x = this.ball.r;
        this.ball.vx *= -1;
      }
      if (this.ball.x + this.ball.r > this.c.width) {
        this.ball.x = this.c.width - this.ball.r;
        this.ball.vx *= -1;
      }
      if (this.ball.y - this.ball.r < 0) {
        this.ball.y = this.ball.r;
        this.ball.vy *= -1;
      }
      if (this.ball.y + this.ball.r > this.c.height) {
        this.ball.y = this.c.height - this.ball.r;
        this.ball.vy *= -1;
      }
    },
    async requestSensorPermission() {
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        try {
          const response = await DeviceOrientationEvent.requestPermission();
          if (response === "granted") {
            window.addEventListener("deviceorientation", this.handleRotation, true);
            console.log("iOS motion enabled");
          } else {
            alert("Motion permission denied");
          }
        } catch (err) {
          console.error("Error requesting permission", err);
        }
      }
    },
    checkCollisionWithMazeX() {
      const b = this.ball;
      const topRow = this.row(b.y - b.r + 2);
      const bottomRow = this.row(b.y + b.r - 2);
      const col = this.col(b.x);

      const leftCol = this.col(b.x - b.r);
      const rightCol = this.col(b.x + b.r);

      if (
        leftCol >= 0 &&
        (this.maze[topRow * this.columns + leftCol] ||
          this.maze[bottomRow * this.columns + leftCol])
      ) {
        b.vx *= -0.5;
        b.x = (leftCol + 1) * this.tileSize + b.r;
        this.playBounceSound();
      } else if (
        rightCol < this.columns &&
        (this.maze[topRow * this.columns + rightCol] ||
          this.maze[bottomRow * this.columns + rightCol])
      ) {
        b.vx *= -0.5;
        b.x = rightCol * this.tileSize - b.r;
        this.playBounceSound();
      }
    },

    checkCollisionWithMazeY() {
      const b = this.ball;
      const leftCol = this.col(b.x - b.r + 2);
      const rightCol = this.col(b.x + b.r - 2);

      const topRow = this.row(b.y - b.r);
      const bottomRow = this.row(b.y + b.r);
      const maxRows = this.maze.length / this.columns;

      if (
        topRow >= 0 &&
        (this.maze[topRow * this.columns + leftCol] || this.maze[topRow * this.columns + rightCol])
      ) {
        b.vy *= -0.5;
        b.y = (topRow + 1) * this.tileSize + b.r;
        this.playBounceSound();
      } else if (
        bottomRow < maxRows &&
        (this.maze[bottomRow * this.columns + leftCol] ||
          this.maze[bottomRow * this.columns + rightCol])
      ) {
        b.vy *= -0.5;
        b.y = bottomRow * this.tileSize - b.r;
        this.playBounceSound();
      }
    },
    checkSlopeFinished() {
      const b = this.ball;
      if (
        this.gameActive &&
        !this.slopeFinished &&
        this.tileSize * 4 < b.x + b.r &&
        b.x + b.r < this.tileSize * 5 &&
        b.y - b.r < this.tileSize
      ) {
        this.slopeFinished = true;
        console.log("Slope finished!");
        socket.emit("maze:finished", { time: Date.now() });
        window.removeEventListener("deviceorientation", this.handleRotation);
        window.removeEventListener("keydown", this.onKeyDown);
        window.removeEventListener("keyup", this.onKeyUp);
      }
    },
    col(x) {
      return Math.floor(x / this.tileSize);
    },
    row(y) {
      return Math.floor(y / this.tileSize);
    },

    onKeyDown(e) {
      if (this.mode !== "computerMode") return;
      e.preventDefault();
      const speed = this.tileSize * 10;

      switch (e.key) {
        case "ArrowUp":
        case "w":
          this.ball.acy = -speed;
          break;

        case "ArrowDown":
        case "s":
          this.ball.acy = speed;
          break;

        case "ArrowLeft":
        case "a":
          this.ball.acx = -speed;
          break;

        case "ArrowRight":
        case "d":
          this.ball.acx = speed;
          break;
      }
    },

    onKeyUp(e) {
      switch (e.key) {
        case "ArrowUp":
        case "ArrowDown":
        case "w":
        case "s":
          this.ball.acy = 0;
          break;

        case "ArrowLeft":
        case "ArrowRight":
        case "a":
        case "d":
          this.ball.acx = 0;
          break;
      }
    },
    handleRotation(e) {
      if (this.mode !== "mobileMode") return;

      const sensitivity = 5;
      this.ball.acx = e.gamma * sensitivity;
      this.ball.acy = e.beta * sensitivity;
    },

    render() {
      this.drawMaze();
      this.drawBall(this.ball.x, this.ball.y, this.ball.r);
    },
    drawMaze() {
      const ctx = this.ctx;

      ctx.clearRect(0, 0, this.c.width, this.c.height);

      for (let i = 0; i < this.maze.length; i++) {
        const x = (i % this.columns) * this.tileSize;
        const y = Math.floor(i / this.columns) * this.tileSize;
        if (this.maze[i]) {
          this.drawSquare(ctx, x, y, this.tileSize, "black");
        }
        if (i === this.finishIndex) {
          this.drawSquare(ctx, x, y, this.tileSize, "yellow");
          ctx.fillStyle = "black";
          ctx.textAlign = "center";
          ctx.font = `${this.tileSize / 4}px Arial`;
          ctx.textBaseline = "middle";
          ctx.fillText(this.$t("common.finish"), x + this.tileSize / 2, y + this.tileSize / 2);
        }
      }
      const rows = this.maze.length / this.columns;
      ctx.strokeStyle = "black";
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, this.columns * this.tileSize, rows * this.tileSize);
    },
    drawSquare(ctx, x, y, tileSize, color) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, tileSize, tileSize);
    },
    drawBall(x, y, r) {
      const ctx = this.ctx;
      const radius = r;
      ctx.fillStyle = "rgb(250, 78, 147)";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    },
    playBounceSound() {
      const audio = new Audio("/sounds/rubberballbouncing.mp3");
      audio.play();
    },
  },
};
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.canvasWrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  gap: 20px;
  background-image: radial-gradient(
    circle farthest-corner at 10% 20%,
    rgb(102, 0, 32) 0%,
    rgb(116, 18, 92) 49.5%,
    rgb(164, 34, 144) 90%
  );
  gap: 20px;
}

.column-layout {
  flex-direction: column;
}

.modeText {
  color: white;
  text-align: center;
}

button {
  width: 120px;
  padding-top: 10px;
  padding-bottom: 10px;
  margin: 10px;
  font-weight: bold;
  font-size: 16;
  background-color: pink;
  border: none;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
}

button:active {
  transform: translateY(2px);
}

#mazeCanvas {
  background-color: rgb(89, 3, 30);
}

.win-modal {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  background: white;
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  animation: popIn 0.3s ease-out;
}
</style>
