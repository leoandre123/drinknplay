<template>
  <NewRetroContainer>
    <div class="whole-page">
      <h1 class="title">Roulette</h1>
      <div class="board-wrap">
        <div class="betting-board">
          <div
            class="square zero"
            :class="{ selected: selectedNumber === 0 }"
            @click="selectNumber(0)"
          >
            0
          </div>

          <div
            v-for="n in NUMBERS"
            :key="n"
            class="square"
            :style="{ backgroundColor: color(n) }"
            :class="{ selected: selectedNumber === n }"
            @click="selectNumber(n)"
          >
            {{ n }}
          </div>

          <div
            class="square bet-red"
            :class="{ selected: selectedColor === 'red' }"
            @click="placeColorBet('red')"
          >
            {{ $t("roulette.red") }}
          </div>

          <div
            class="square bet-black"
            :class="{ selected: selectedColor === 'black' }"
            @click="placeColorBet('black')"
          >
            {{ $t("roulette.black") }}
          </div>
        </div>
      </div>

      <div class="bet-info">
        <div class="row column">
          <span
            ><b> {{ $t("roulette.addAmountBet") }}:</b></span
          >

          <div class="bet-amount-control">
            <button @click="decreaseStake" :disabled="stake <= 1">-</button>
            <span class="stake">{{ stake }}</span>
            <button @click="increaseStake">+</button>
          </div>
          <span v-if="selectedNumber !== null"
            >{{ $t("roulette.number") }}: {{ selectedNumber }}</span
          >
          <span v-else-if="selectedColor">
            {{ $t("roulette.color") }}: {{ selectedColor.toUpperCase() }}</span
          >
          <span v-else
            >{{ $t("roulette.choose") }} {{ $t("roulette.color") }}/{{
              $t("roulette.number")
            }}!</span
          >
          <button
            class="place-bet"
            @click="placeBet"
            :disabled="!selectedColor && selectedNumber === null"
          >
            {{ $t("roulette.placeBet") }}
          </button>
        </div>

        <div class="place-bet-section">
          <span
            ><b>{{ $t("roulette.yourBet") }}:</b></span
          >
          <div v-if="placedBets.length === 0">{{ $t("roulette.noBetsPlaced") }}</div>

          <ul v-else class="bet-list">
            <li v-for="(b, i) in placedBets" :key="`${b.type}- ${b.value}`">
              <span>
                {{ b.type === "color" ? b.value.toUpperCase() : "Number: " + b.value }}
                - {{ b.amount }} {{ $t("roulette.drinkCredits") }}
              </span>
            </li>
          </ul>
        </div>

        <div class="clear-section">
          <button class="clear" @click="clearBets" :disabled="placedBets.length === 0">
            {{ $t("roulette.clearBet") }}
          </button>
        </div>
      </div>
    </div>
  </NewRetroContainer>
</template>

<script setup lang="ts">
import { socket } from "@/socket";
import { context } from "@/context";
import NewRetroContainer from "@/shared/components/UI/NewRetroContainer.vue";
import { onBeforeUnmount, onMounted, ref } from "vue";
import type { Bet, RouletteStateDto } from "@shared/features/minigames/roulette/RouletteState";

const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

const NUMBERS = [
  3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 1, 4, 7,
  10, 13, 16, 19, 22, 25, 28, 31, 34,
];

const selectedColor = ref<string>();
const selectedNumber = ref<number>();
const stake = ref(1);
const placedBets = ref<Bet[]>([]);

onMounted(() => {
  socket.emit("roulette:requestState");

  socket.on("roulette:update", onRouletteUpdate);
});

onBeforeUnmount(() => {
  socket.off("roulette:update", onRouletteUpdate);
});

function onRouletteUpdate(state: RouletteStateDto) {
  console.log(state.betsByPlayer);
  const playerBets = state?.betsByPlayer?.find((x) => x[0] == context.playerId)?.[1] ?? [];
  console.log(playerBets);
  placedBets.value = playerBets;
}

function color(number: number) {
  if (number === 0) return "rgb(2,112,2)";
  return RED_NUMBERS.has(number) ? "rgb(172,8,8)" : "rgb(0,0,0)";
}
function placeColorBet(color: string) {
  selectedColor.value = color;
  selectedNumber.value = undefined;
}
function increaseStake() {
  stake.value += 1;
}
function decreaseStake() {
  if (stake.value > 1) stake.value -= 1;
}
function placeBet() {
  console.log("place bet");
  if (!selectedColor && selectedNumber === null) return;
  console.log("place be2t");
  let bet;

  if (selectedNumber.value === 0) {
    bet = { type: "color", value: "green", amount: stake };
  } else if (selectedNumber !== null) {
    bet = { type: "number", value: selectedNumber, amount: stake };
  } else {
    bet = { type: "color", value: selectedColor, amount: stake };
  }

  socket.emit("roulette:placeBet", bet);
}
function clearBets() {
  socket.emit("roulette:clearBets");
  selectedColor.value = undefined;
  selectedNumber.value = undefined;
  placedBets.value = [];
}

function selectNumber(n: number) {
  selectedNumber.value = n;
  selectedColor.value = undefined;
}
</script>

<style scoped>
.whole-page {
  padding: 16px;
  display: grid;
  place-items: center;
  gap: 5px;
  width: 100%;
  max-width: 100%;
}
.title {
  color: rgb(219, 52, 202);
  margin: 0;
  font-size: 50px;
}
.board-wrap {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;

  -webkit-overflow-scrolling: touch;
  display: flex;
  justify-content: center;
}
.betting-board {
  display: grid;
  grid-template-columns: 70px repeat(12, 52px);
  grid-template-rows: repeat(3, 52px) 52px;

  gap: 3px;
  padding: 10px;
  background: rgb(5, 66, 5);
  border-radius: 12px;
  flex: 0 0 auto;
  transform-origin: top center;
}
@media (max-width: 900px) {
  .betting-board {
    transform: scale(0.9);
  }
  .bet-info {
    transform: scale(0.9);
  }
}

@media (max-width: 700px) {
  .betting-board {
    transform: scale(0.8);
  }
}

@media (max-width: 600px) {
  .betting-board {
    transform: scale(0.7);
  }
}

.square {
  border: 1px solid rgba(255, 255, 255, 0.65);
  border-radius: 8px;
  display: grid;
  place-items: center;
  color: white;
  font-weight: bold;
  user-select: none;
}

.zero {
  grid-column: 1;
  grid-row: 1 / span 3;
  background: rgb(2, 112, 2);
  font-weight: bold;
  font-size: 20px;
}

.bet-red {
  grid-row: 4;
  grid-column: 3 / span 4;
  background: rgb(172, 8, 8);
  font-weight: bold;
  letter-spacing: 1px;
  border: 3px solid rgba(250, 250, 250, 0.75);
}

.bet-black {
  grid-row: 4;
  grid-column: 8 / span 4;
  background: black;
  font-weight: bold;
  letter-spacing: 1px;
  border: 3px solid rgba(250, 250, 250, 0.75);
}

.bet-info {
  width: min(900px, 100%);
  max-width: 100%;
  padding: 15px;
  border-radius: 10px;
  border: 2px solid rgba(250, 250, 250, 0.5);
  color: white;
  box-sizing: border-box;
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;
  position: relative;
  font-size: 20px;
}

.bet-info .row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 15px;
}

.column {
  flex-direction: column;
  gap: 6px;
}
.bet-amount-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bet-amount-control button {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid rgba(250, 250, 250, 0.5);
  background: rgba(0, 0, 0, 0.3);
  color: white;
  font-weight: bold;
  cursor: pointer;
}

.bet-amount-control button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.place-bet-section {
  grid-column: 2;
  grid-row: 1;

  display: flex;
  flex-direction: column;
  gap: 10px;
}
.place-bet {
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(250, 250, 250, 0.6);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-weight: bold;
  cursor: pointer;
}
.place-bet:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.stake {
  min-width: 20px;
  text-align: center;
  font-weight: bold;
}
.clear {
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(250, 250, 250, 0.6);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-weight: bold;
  cursor: pointer;
}
.clear-section {
  grid-column: 2;
  grid-row: 2;

  display: flex;
  align-items: center;
}

.selected {
  outline: 3px solid rgba(234, 200, 8, 0.8);
  transform: translateY(-1px);
}
.bet-list {
  list-style: none;
  padding: 0;
  margin: 8px 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.bet-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
</style>
