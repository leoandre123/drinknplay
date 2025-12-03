<template>
  <div class="slot-background">
    <div class="slot-machine">
      <div class="top-body">
        <div>
          <span class="label">MINIGAMES</span>
        </div>
      </div>
      <div class="main-body">
        <div class="reels">
          <svg
            class="reel-arrow reel-arrow-left"
            viewBox="0 0 100 100"
            width="100%"
            height="100%"
          >
            <polygon points="0,50 25,0 100,50 25,100" fill="red" />
          </svg>
          <SlotReel ref="reel1" :symbols="symbols" />
          <SlotReel ref="reel2" :symbols="symbols" />
          <SlotReel ref="reel3" :symbols="symbols" />
          <svg
            class="reel-arrow reel-arrow-right"
            viewBox="0 0 100 100"
            width="100%"
            height="100%"
          >
            <polygon points="0,50 25,0 100,50 25,100" fill="red" />
          </svg>
        </div>
        <div class="display">
          <span class="label">{{ text }}</span>
        </div>
      </div>
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
        this.mod(
          this.$refs.reel1.currentPos - MIN_SYMBOLS_1,
          this.symbols.length
        ) -
        symbolIndex;
      const symbolsToRotate2 =
        MIN_SYMBOLS_2 +
        this.mod(
          this.$refs.reel2.currentPos - MIN_SYMBOLS_2,
          this.symbols.length
        ) -
        symbolIndex;
      const symbolsToRotate3 =
        MIN_SYMBOLS_3 +
        this.mod(
          this.$refs.reel3.currentPos - MIN_SYMBOLS_3,
          this.symbols.length
        ) -
        symbolIndex;

      this.$refs.reel1.spin(Date.now(), symbolsToRotate1, MS_PER_SYMBOL);
      this.$refs.reel2.spin(Date.now(), symbolsToRotate2, MS_PER_SYMBOL);
      this.$refs.reel3.spin(Date.now(), symbolsToRotate3, MS_PER_SYMBOL);

      const time =
        Math.max(symbolsToRotate1, symbolsToRotate2, symbolsToRotate3) *
        MS_PER_SYMBOL;

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
}

.slot-background {
  justify-items: center;
  align-content: center;
}

.top-body {
  width: 80%;
  aspect-ratio: 2/1;
  overflow: hidden;
}
.top-body div {
  background: #2e0f00;
  width: calc(100%-2rem);
  aspect-ratio: 1;
  border: 1rem solid goldenrod;
  border-style: ridge;
  border-radius: 50% 50% 0 0;
  overflow: hidden;
}
.top-body span {
  height: 100%;
  display: block;
  transform: translateY(20%);
}

.main-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(#2e0f00, #472c1e);

  border: 1rem solid goldenrod;
  border-style: ridge;
  border-radius: 1rem;
}

.reels {
  position: relative;
  display: flex;
  gap: 1rem;
  border: 1rem solid goldenrod;
  border-style: ridge;
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
  border-style: ridge;
  border-radius: 1rem;
}

.label {
  color: #f7d67e;
  font-size: 32px;
  font-weight: 900;
  -webkit-text-stroke: 1px #5d3b00;
  text-shadow: 0 0 10px #0007;
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
