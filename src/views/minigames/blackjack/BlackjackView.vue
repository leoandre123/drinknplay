<template>
  <div class="blackjack-container">
    <div class="table" ref="table">
      <div class="dealer">
        <PlayingCard v-for="rank in 2" :rank="rank" suit="hearts" />
      </div>
      <div v-for="(rank, i) in 8" class="white-box" :style="playerStyle(i, 8)">
        <div class="card-stack">
          <div>
            <PlayingCard :rank="rank" suit="hearts" />
          </div>
          <div>
            <PlayingCard :rank="rank" suit="hearts" />
          </div>
        </div>
        <div class="bet-stack">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PlayingCard from "../../../components/PlayingCard.vue";
import { context } from "../../../context";
import { socket } from "../../../socket";

export default {
  name: "Black",

  data() {
    return {
      tableWidth: 0,
      tableHeight: 0,
    };
  },
  components: { PlayingCard },
  mounted() {
    this.observer = new ResizeObserver((entries) => {
      this.tableWidth = entries[0].contentRect.width;
      this.tableHeight = entries[0].contentRect.height;
    });

    this.observer.observe(this.$refs.table);
  },
  beforeUnmount() {},
  methods: {
    playerStyle(i, count) {
      const rx = this.tableWidth / 2;
      const ry = this.tableHeight / 2;

      const t0 = 0.5; // angle offset in radians
      const t1 = Math.PI - 0.5;

      // arc-length at the endpoints (these are in "distance" units)
      const s0 = arclen(rx, ry, t0);
      const s1 = arclen(rx, ry, t1);

      function findTForArc(targetS) {
        let lo = t0,
          hi = t1;
        for (let iter = 0; iter < 35; iter++) {
          const mid = (lo + hi) * 0.5;
          if (arclen(rx, ry, mid) < targetS) lo = mid;
          else hi = mid;
        }
        return (lo + hi) * 0.5;
      }

      // distribute evenly in ARC LENGTH between t0..t1
      const u = i / (count - 1); // 0..1 (ensure i is 0..count-1)
      const targetS = s0 + u * (s1 - s0);

      const t = findTForArc(targetS);

      const x = rx * Math.cos(t);
      const y = ry * Math.sin(t);

      const tangent = Math.atan2(ry * Math.cos(t), -rx * Math.sin(t));

      return {
        transform: `
      translate(-50%, -50%)
      translate(${x}px, ${y}px)
      rotate(${tangent + Math.PI}rad)
    `,
      };
    },
  },
  computed: {},
};

function arclen(a, b, theta) {
  const f = (t) => Math.sqrt(a * a * Math.sin(t) ** 2 + b * b * Math.cos(t) ** 2);

  function simpson(f, a, b) {
    const c = (a + b) / 2;
    return ((b - a) / 6) * (f(a) + 4 * f(c) + f(b));
  }

  function adaptiveSimpson(f, a, b, eps, whole) {
    const c = (a + b) / 2;
    const left = simpson(f, a, c);
    const right = simpson(f, c, b);
    if (Math.abs(left + right - whole) < 15 * eps) {
      return left + right + (left + right - whole) / 15;
    }
    return adaptiveSimpson(f, a, c, eps / 2, left) + adaptiveSimpson(f, c, b, eps / 2, right);
  }

  const initial = simpson(f, 0, theta);
  return adaptiveSimpson(f, 0, theta, 1e-8, initial);
}

function ellipseRadius(rx, ry, angleRad) {
  return (rx * ry) / Math.sqrt((ry * Math.cos(angleRad)) ** 2 + (rx * Math.sin(angleRad)) ** 2);
}
</script>

<style scoped>
.blackjack-container {
  width: 100dvw;
  height: 100dvh;
  overflow: hidden;
  box-sizing: border-box;
  gap: 1rem;
}

.table {
  background-color: rgb(105, 194, 89);
  border-radius: 0 0 50% 50%;
  width: 100%;
  position: absolute;
  top: 0;

  bottom: 1rem;
  border: 1rem ridge brown;
  box-sizing: border-box;
  padding: 8rem;
  justify-items: center;

  display: flex;
  flex-direction: column;
}
.table::after {
  content: "";
  border: 0.5rem solid yellow;
  position: absolute;
  border-radius: 0 0 50% 50%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.dealer {
  display: flex;
  transform: translateY(-1rem);
}

.players {
  width: 100%;
  height: 10rem;
  position: relative;
  justify-items: center;
  flex-grow: 1;
}

.white-box {
  position: absolute;
  width: 5rem;
  height: 8rem;
  left: 50%;
  top: 50%;
  border: 0.2rem solid white;
  justify-items: center;
  align-content: center;
}

.card-stack {
  position: absolute;
  top: -6rem;
  width: 4rem;
  height: 6rem;
}
.card-stack > *:nth-child(1) {
  transform: translateX(-0.5rem) rotate(-10deg);
}
.card-stack > *:nth-child(2) {
  transform: translateX(2rem) rotate(20deg);
}

.bet-stack > div {
  transform: translate(-50%, -50%);
  position: absolute;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background-image: url("https://png.pngtree.com/png-vector/20220729/ourmid/pngtree-poker-chip-png-image_6091092.png");
  background-size: contain;
}

.playing-card {
  position: absolute;
  width: 4rem;
  left: 50%;
  top: 50%;
  border: 1px solid white;
  transform: translate(-50%, 0%);
}

.playing-card:hover {
  transform: scale(1.1);
}
</style>
