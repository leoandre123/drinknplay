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
      c: null,
      ctx: null,
      finishIndex: 0
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
    this.drawBall(this.tileSize * 1.5, this.tileSize / 2);
  },

  methods: {
    drawMaze() {
  const ctx = this.ctx;

  ctx.clearRect(0, 0, this.c.width, this.c.height);

  for (let i = 0; i < this.maze.length; i++) {
    if (this.maze[i]) {
      const x = (i % this.columns) * this.tileSize;
      const y = Math.floor(i / this.columns) * this.tileSize;
      this.drawSquare(ctx, x, y, this.tileSize);
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
  for (let i = 0; i < this.maze.length; i++){
    if (i == this.finishIndex){
    }
  }
},
    drawSquare(ctx, x, y, tileSize) {
      ctx.fillStyle = "black";
      ctx.fillRect(x, y, tileSize, tileSize);
    },
    drawBall(x, y){
        const ctx = this.ctx;
        const radius = this.tileSize / 3;
        ctx.fillStyle = "grey";
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
  }
  };
</script>

<style scoped>
.canvasWrapper{
    width: 100vw;
  height: 100vh;
  background-image: radial-gradient(
    circle farthest-corner at 10% 20%,
    rgb(102, 0, 32) 0%,
    rgb(116, 18, 92) 49.5%,
    rgb(164, 34, 144) 90%);
}
#mazeCanvas {
  background-color: rgb(89, 3, 30);
}
</style>
