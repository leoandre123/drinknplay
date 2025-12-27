<template>
  <div class="blackjack-container">
    <div class="table" ref="table">
      <div class="dealer">
        <PlayingCard v-for="rank in 2" :rank="rank" suit="hearts" />
      </div>
      <div v-for="rank in 8" class="playing-card" :style="playerStyle(rank)">
        <PlayingCard :rank="rank" suit="hearts" />
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
    playerStyle(i) {
      const count = 8;
      const angle = Math.PI / 2 + ((i - 1) * Math.PI) / (count - 1);

      const rx = this.tableHeight / 2;
      const ry = this.tableWidth / 2;

      const radius = ellipseRadius(rx, ry, angle) * 1;

      const tangent = Math.atan2(ry * Math.cos(angle), -rx * Math.sin(angle));
      return {
        transform: `
          translate(-50%, -50%)
          rotate(${angle}rad)
          translateY(-${radius}px)
          rotate(${-angle}rad)
          rotate(${tangent + Math.PI / 2}rad)
        `,
      };
    },
  },
  computed: {},
};

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
  padding: 5rem;
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
}

.players {
  width: 100%;
  height: 10rem;
  position: relative;
  justify-items: center;
  flex-grow: 1;
}

.playing-card {
  position: absolute;
  width: 4rem;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.playing-card:hover {
  transform: scale(1.1);
}
</style>
