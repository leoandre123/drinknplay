<template>
  <div class="slot-background">
    <div class="slot-machine">
      <div class="panel top">
        <span class="label">MINIGAMES</span>
      </div>
      <div class="panel in"></div>
      <div class="panel body">
        <div class="reels">
          <svg class="reel-arrow reel-arrow-left" viewBox="0 0 100 100" width="100%" height="100%">
            <polygon points="0,50 25,0 100,50 25,100" fill="red" />
          </svg>
          <SlotReel ref="reel1" :symbols="symbols" />
          <SlotReel ref="reel2" :symbols="symbols" />
          <SlotReel ref="reel3" :symbols="symbols" />
          <svg class="reel-arrow reel-arrow-right" viewBox="0 0 100 100" width="100%" height="100%">
            <polygon points="0,50 25,0 100,50 25,100" fill="red" />
          </svg>
        </div>
        <div class="display">
          <span class="label">{{ text }}</span>
        </div>
      </div>
      <div class="panel controls">
        <span class="label">MINIGAMES</span>
      </div>
      <div class="panel base"></div>
    </div>
  </div>
</template>

<script>
import SlotReel from "./SlotReel.vue";

export default {
  name: "SlotMachine",

  components: {
    SlotReel,
  },
  props: { text: String, symbols: Array },
  data() {
    return {};
  },
  emits: ["spinFinished"],
  methods: {
    mod(n, m) {
      return ((n % m) + m) % m;
    },
    spin(symbolIndex = 0) {
      const MIN_SYMBOLS_1 = 50;
      const MIN_SYMBOLS_2 = 75;
      const MIN_SYMBOLS_3 = 100;
      const MS_PER_SYMBOL = 25;

      const symbolsToRotate1 =
        MIN_SYMBOLS_1 +
        this.mod(this.$refs.reel1.currentPos - MIN_SYMBOLS_1, this.symbols.length) -
        symbolIndex;
      const symbolsToRotate2 =
        MIN_SYMBOLS_2 +
        this.mod(this.$refs.reel2.currentPos - MIN_SYMBOLS_2, this.symbols.length) -
        symbolIndex;
      const symbolsToRotate3 =
        MIN_SYMBOLS_3 +
        this.mod(this.$refs.reel3.currentPos - MIN_SYMBOLS_3, this.symbols.length) -
        symbolIndex;

      this.$refs.reel1.spin(Date.now(), symbolsToRotate1, MS_PER_SYMBOL);
      this.$refs.reel2.spin(Date.now(), symbolsToRotate2, MS_PER_SYMBOL);
      this.$refs.reel3.spin(Date.now(), symbolsToRotate3, MS_PER_SYMBOL);

      const time = Math.max(symbolsToRotate1, symbolsToRotate2, symbolsToRotate3) * MS_PER_SYMBOL;

      setTimeout(() => {
        this.$emit("spinFinished", symbolIndex);
      }, time);
    },
  },
};
</script>

<style scoped>
div {
  box-shadow: #2e0f00 1 1;
}

.slot-machine {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: 25rem;

  perspective: 30rem;
}

.slot-background {
  justify-items: center;
  align-content: center;
}

.panel {
  position: absolute;
  width: 100%;
  background: #5c196f;
  border: 1rem solid #f348ba;
  padding: 1rem;
  transform-origin: top;
  box-shadow: 0 0 3rem 0.5rem #f348ba;
}

.top {
  border-radius: 0.25rem 0.25rem 0 0;
  height: 4rem;
}

.in {
  height: 4rem;
  transform: translateY(8rem) rotateX(-30deg);
}

.body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  transform: translateY(13.1rem) scale(0.882);
}

.controls {
  height: 6rem;
  transform: translateY(31rem) rotateX(110deg) scale(0.882);
}

.base {
  height: 6rem;
  transform: translateY(38.65rem) scale(1.218);
}

.top-body div {
  background: #5c196f;
  border: 1rem solid #f348ba;
  border-bottom: none;
  border-radius: 0.25rem 0.25rem 0 0;
  padding: 1rem;
  overflow: hidden;
}
.panel span {
  height: 100%;
  display: block;
}

.reels {
  position: relative;
  display: flex;
  gap: 1rem;
  border: 1rem solid goldenrod;
  border-style: outset;
  border-radius: 1rem;
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

.spin-button {
  background-color: gold;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  font-size: 1.2rem;
}

.spin-button:hover {
  background: orange;
}
</style>
