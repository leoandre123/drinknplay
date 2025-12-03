<template>
  <div class="reel-container">
    <div
      class="reel"
      :style="{
        transform: `rotateX(${rotationAngle}deg)`,
      }"
    >
      <div class="symbol">{{ getSymbol(currentPos - 2) }}</div>
      <div class="symbol">{{ getSymbol(currentPos - 1) }}</div>
      <div class="symbol">{{ getSymbol(currentPos) }}</div>
      <div class="symbol">{{ getSymbol(currentPos + 1) }}</div>
      <div class="symbol">{{ getSymbol(currentPos + 2) }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SlotReel",
  props: {
    symbols: Array,
  },
  data() {
    return {
      //availableSymbols: ["✍️", "🍺", "🃏", "🎲", "🎱", "❓"],
      rotationAngle: 0,
      currentPos: 1,
      spinning: true,
      startTime: 0,
      startPos: 0,
      symbolsToRotate: 0,
      msPerSymbol: 0,
      duration: 0,
    };
  },
  methods: {
    mod(n, m) {
      return ((n % m) + m) % m;
    },
    getSymbol(pos) {
      return this.symbols[this.mod(pos, this.symbols.length)];
    },
    spin(startTime, symbolsToRotate, msPerSymbol) {
      this.startTime = startTime;
      this.startPos = this.currentPos;
      this.symbolsToRotate = symbolsToRotate;
      this.msPerSymbol = msPerSymbol;
      this.spinning = true;
      this.duration = symbolsToRotate * msPerSymbol;
      this.animate();
    },
    stop() {
      this.spinning = false;
    },
    animate() {
      if (!this.spinning) return;
      const now = Date.now();
      const anglesPerSymbol = 45;

      const anglesPerMs = anglesPerSymbol / this.msPerSymbol;
      let totalAngle = -anglesPerMs * (now - this.startTime);

      if (now >= this.startTime + this.duration) {
        totalAngle = -anglesPerMs * this.duration;
        this.spinning = false;
      }

      this.rotationAngle = this.mod(totalAngle, anglesPerSymbol);
      this.currentPos = this.mod(
        this.startPos + Math.floor(totalAngle / anglesPerSymbol),
        this.symbols.length
      );

      requestAnimationFrame(this.animate);
    },
  },
};
</script>

<style scoped>
.reel-container {
  width: 100px;
  height: 150px;
  perspective: 600px;
  background: white;
  border: 3px solid #222;
  border-radius: 10px;
  overflow: hidden;
}

.reel {
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transform: rotateX(0deg);
  place-content: center;
}

.symbol {
  position: absolute;
  width: 100%;
  height: 100px;
  font-size: 3rem;
  text-align: center;
  line-height: 100px;
  backface-visibility: hidden;
}

.symbol:nth-child(1) {
  transform: translateY(-50%) rotateX(90deg) translateZ(75px);
}
.symbol:nth-child(2) {
  transform: translateY(-50%) rotateX(45deg) translateZ(75px);
}
.symbol:nth-child(3) {
  transform: translateY(-50%) rotateX(0deg) translateZ(75px);
}
.symbol:nth-child(4) {
  transform: translateY(-50%) rotateX(-45deg) translateZ(75px);
}
.symbol:nth-child(5) {
  transform: translateY(-50%) rotateX(-90deg) translateZ(75px);
}

/* Top shadow */
.reel-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 40px; /* adjust as needed */
  background: linear-gradient(to bottom, rgb(0 0 0), rgb(6 0 0 / 0%) 80%);
  pointer-events: none; /* clicks pass through */
  z-index: 10;
}

/* Bottom shadow */
.reel-container::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40px;
  background: linear-gradient(to top, rgb(0 0 0), rgb(6 0 0 / 0%) 80%);
  pointer-events: none;
  z-index: 10;
}
</style>
