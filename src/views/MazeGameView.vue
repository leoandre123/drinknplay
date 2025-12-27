<template>
  <div class="canvasWrapper">
    <canvas id="mazeCanvas"></canvas>
  </div>
</template>

<script>
export default {
  name: "MazeGameView",

  data() {
    return {
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
        friction: 0.99
      },
      lastTime: 0,
      rafId: null
    };
  },

  mounted() {
    this.c = document.getElementById("mazeCanvas");

    if (window.innerWidth > window.innerHeight) {
      this.c.width = window.innerHeight;
      this.c.height = window.innerHeight;
    } else {
      this.c.width = window.innerWidth;
      this.c.height = window.innerWidth;
    }

    this.columns = 5;
    this.tileSize = this.c.width / this.columns;

    this.maze = [
      true, false, true, true, false,
      false, false, true, true, false,
      false, true, false, false, false,
      false, true, false, true, true,
      false, false, false, true, true
    ];
    this.finishIndex = 4;

    this.ctx = this.c.getContext("2d");

    this.drawMaze();
    this.ball.r = this.tileSize / 3;
    this.ball.x = this.tileSize * 1.5;
    this.ball.y = this.tileSize / 2;
    const speed = this.tileSize * 1; //här är hastigheten
    this.drawBall(this.ball.x, this.ball.y, this.ball.r);

    this.loop = this.loop.bind(this);
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.loop);

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  },

  methods: {
    loop(now) {
      const dt = (now - this.lastTime) / 1000; // sekunder
      this.lastTime = now;

      this.update(dt);
      this.render();

      this.rafId = requestAnimationFrame(this.loop);

      console.log(this.ball);
    },

    update(dt) {
      this.ball.vx += this.ball.acx * dt;
      this.ball.vy += this.ball.acy * dt;

      this.ball.x += this.ball.vx * dt;
      this.checkCollisionWithMazeX();
      this.ball.y += this.ball.vy * dt;
      this.checkCollisionWithMazeY();

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
    checkCollisionWithMazeX() {
      const b = this.ball;

      const leftSide = b.x - b.r;
      const rightSide = b.x + b.r;

      const col = this.col(b.x);
      const leftCol = this.col(leftSide);
      const rightCol = this.col(rightSide);
      const row = this.row(b.y);

      const maxRows = this.maze.length / this.columns;

      if (
        row < 0 || row >= maxRows ||
        col < 0 || col >= this.columns
      ) return;

      if (
        leftCol >= 0 &&
        this.maze[row * this.columns + leftCol]
      ) {
        b.vx *= -1;
        b.x = (leftCol + 1) * this.tileSize + b.r;
      }
      else if (
        rightCol < this.columns &&
        this.maze[row * this.columns + rightCol]
      ) {
        b.vx *= -1;
        b.x = rightCol * this.tileSize - b.r;
      }
    },
    checkCollisionWithMazeY() {
      const b = this.ball;

      const topSide = b.y - b.r;
      const bottomSide = b.y + b.r;

      const col = this.col(b.x);
      const row = this.row(b.y);
      const topRow = this.row(topSide);
      const bottomRow = this.row(bottomSide);

      const maxRows = this.maze.length / this.columns;

      if (
        row < 0 || row >= maxRows ||
        col < 0 || col >= this.columns
      ) return;

      if (
        topRow >= 0 &&
        this.maze[topRow * this.columns + col]
      ) {
        b.vy *= -1;
        b.y = (topRow + 1) * this.tileSize + b.r;
      }
      else if (
        bottomRow < maxRows &&
        this.maze[bottomRow * this.columns + col]
      ) {
        b.vy *= -1;
        b.y = bottomRow * this.tileSize - b.r;
      }
    },
    col(x) {
      return Math.floor(x / this.tileSize);
    },
    row(y) {
      return Math.floor(y / this.tileSize);
    },

    onKeyDown(e) {
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
          ctx.fillText(
            "FINISH",
            x + this.tileSize / 2,
            y + this.tileSize / 2
          );
        }
      }
      const rows = this.maze.length / this.columns;
      ctx.strokeStyle = "black";
      ctx.lineWidth = 4;
      ctx.strokeRect(
        0,
        0,
        this.columns * this.tileSize,
        rows * this.tileSize
      );
    },
    drawSquare(ctx, x, y, tileSize, color) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, tileSize, tileSize);
    },
    drawBall(x, y, r) {
      const ctx = this.ctx;
      const radius = r;
      ctx.fillStyle = "grey";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
};
</script>

<style scoped>
.canvasWrapper {
  width: 100vw;
  height: 100vh;
  background-image: radial-gradient(circle farthest-corner at 10% 20%,
      rgb(102, 0, 32) 0%,
      rgb(116, 18, 92) 49.5%,
      rgb(164, 34, 144) 90%);
}

#mazeCanvas {
  background-color: rgb(89, 3, 30);
}
</style>
