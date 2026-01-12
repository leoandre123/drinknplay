<template>
  <div class="slot-machine-container">
    <h1 class="glow">{{ title }}</h1>
    <div class="reels-container">
      <div class="reels">
        <svg class="reel-arrow reel-arrow-left" viewBox="0 0 100 100" width="100%" height="100%">
          <polygon points="0,50 25,0 100,50 25,100" fill="red" />
        </svg>
        <SlotReel v-for="value in reelCount" ref="reel" :symbols="symbols" />
        <svg class="reel-arrow reel-arrow-right" viewBox="0 0 100 100" width="100%" height="100%">
          <polygon points="0,50 25,0 100,50 25,100" fill="red" />
        </svg>
      </div>
    </div>
    <h1 class="glow" style="font-size: 2rem">{{ text }}</h1>
  </div>
</template>

<script>
import SlotReel from "./SlotReel.vue";

export default {
  name: "SlotMachine",

  components: {
    SlotReel,
  },
  props: { text: String, title: String, symbols: Array, reelCount: { type: Number, default: 3 } },
  data() {
    return {};
  },
  emits: ["spinFinished"],
  methods: {
    mod(n, m) {
      return ((n % m) + m) % m;
    },
    spin(symbolIndex = 0) {
      const MIN_SYMBOLS = 50;
      const MS_PER_SYMBOL = 25;
      let time = 0;
      for (let i = 0; i < this.reelCount; i++) {
        const minSyms = MIN_SYMBOLS + i * 25;
        const symsToRot =
          minSyms +
          this.mod(this.$refs.reel[i].currentPos - minSyms, this.symbols.length) -
          symbolIndex;

        this.$refs.reel[i].spin(Date.now(), symsToRot, MS_PER_SYMBOL);
        time = Math.max(time, symsToRot * MS_PER_SYMBOL);
      }

      setTimeout(() => {
        this.$emit("spinFinished", symbolIndex);
      }, time);
    },
  },
};
</script>

<style scoped>
.glow {
  font-size: 5rem;
  letter-spacing: 10px;
  color: #fff;
  -webkit-animation: glow 1s ease-in-out infinite alternate;
  -moz-animation: glow 1s ease-in-out infinite alternate;
  animation: glow 1s ease-in-out infinite alternate;
  width: auto;
  background-color: darkmagenta;
  margin: 1rem;
  width: 50rem;
  border: 0.2rem solid #fff;
  border-radius: 2rem;
  padding: 20px;
  box-shadow: 0 0 0.2rem #fff, 0 0 0.2rem #fff, 0 0 2rem #bc13fe, 0 0 0.8rem #bc13fe,
    0 0 2.8rem #bc13fe, inset 0 0 1.3rem #bc13fe;
}
@keyframes glow {
  from {
    text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #e60073, 0 0 40px #e60073, 0 0 50px #e60073,
      0 0 60px #e60073, 0 0 70px #e60073;
  }

  to {
    text-shadow: 0 0 20px #fff, 0 0 30px #ff4da6, 0 0 40px #ff4da6, 0 0 50px #ff4da6,
      0 0 60px #ff4da6, 0 0 70px #ff4da6, 0 0 80px #ff4da6;
  }
}
div {
  box-shadow: #2e0f00 1 1;
}

.slot-machine-container {
  width: 100%;
  height: 100%;
  /*background: radial-gradient(circle, rgb(72, 32, 98) 0%, rgb(122, 37, 125) 100%);*/
  justify-items: center;
  align-content: center;
}

.reels-container {
  border: 0.2rem solid #fff;
  border-radius: 2rem;
  padding: 2rem;
  box-shadow: 0 0 0.2rem #fff, 0 0 0.2rem #fff, 0 0 2rem #bc13fe, 0 0 0.8rem #bc13fe,
    0 0 2.8rem #bc13fe, inset 0 0 1.3rem #bc13fe;
}

.reels {
  position: relative;
  display: flex;
  gap: 1rem;
  background: #5c196f;
  border: 1rem solid #f348ba;
  border-style: outset;
  border-radius: 1rem;
  place-self: center;
  box-shadow: 0 0 3rem 0.5rem #f348ba;
}
.reel-arrow {
  position: absolute;
  top: 50%;
  width: 2rem;
  height: 2rem;
  z-index: 100;
  transform: translateY(-50%);
  filter: drop-shadow(0 0 8px red);
}
.reel-arrow-left {
  left: -20px;
}
.reel-arrow-right {
  right: -20px;
  transform: translateY(-50%) rotateZ(180deg);
}

.display {
  background-color: #242527;
  border: 1rem solid #54544c;
  border-style: outset;
  border-radius: 1rem;
}

.label {
  color: #f7d67e;
  font-size: 2rem;
  line-height: 2rem;
  font-weight: 900;
  -webkit-text-stroke: 1px #5d3b00;
  text-shadow: 0 0 10px white;
}

.spin-button:hover {
  background: orange;
}
</style>
