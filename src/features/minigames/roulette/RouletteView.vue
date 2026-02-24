<template>
  <NewRetroContainer v-if="state">
    <div class="layout">
      <div class="left">
        <RetroButton class="rules-button" color="blue" @click="showRules = true">
          {{ $t("roulette.howToPlay") }}
        </RetroButton>
        <RouletteRules v-if="showRules" @close="showRules = false" />

        <div class="wheel-area">
          <RouletteWheel ref="wheel" :phase="state?.phase" @spinFinished="onSpinFinished" />
          <div class="spin-button">
            <RetroButton color="yellow" @click="startSpin" :disabled="state.phase !== 'betting'">
              {{ $t("roulette.spin") }}
            </RetroButton>
          </div>
          <div class="next-round-button">
            <RetroButton
              v-if="state.phase === 'result' && state.round < state.maxRounds"
              color="pink"
              @click="nextRound"
            >
              {{ $t("roulette.nextRound") }}
            </RetroButton>
          </div>
          <div class="continue-button">
            <RetroButton
              v-if="state?.phase === 'result' && state.round >= state.maxRounds"
              color="green"
              @click="nextRound"
            >
              {{ $t("roulette.continue") }}
            </RetroButton>
          </div>
        </div>
      </div>
      <div class="right">
        <h2 class="round-info">
          {{ $t("roulette.round") }} {{ state.round }}/{{ state.maxRounds }}
        </h2>
        <div class="top-panels">
          <div class="bets-area">
            <h2 class="bets-title">{{ $t("roulette.bets") }}</h2>

            <div v-if="state.betsByPlayer.size === 0">{{ $t("roulette.noBetsPlaced") }}</div>

            <div v-else>
              <div
                v-for="[playerId, bets] in state.betsByPlayer"
                :key="playerId"
                class="player-bets"
              >
                <div class="player-name">
                  {{ context.state?.players.find((x) => x.id == playerId)?.name }}
                </div>

                <ul v-if="bets && bets.length" class="bet-list">
                  <li v-for="b in bets" :key="`${b.type} - ${b.value}`">
                    <span v-if="b.type === 'color'">
                      {{ $t("roulette.color") }}: {{ String(b.value).toUpperCase() }} -
                      {{ b.amount }} {{ $t("roulette.drinkCredits") }}
                    </span>
                    <span v-else>
                      {{ $t("roulette.number") }}: {{ b.value }} - {{ b.amount }}
                      {{ $t("roulette.drinkCredits") }}
                    </span>
                  </li>
                </ul>
                <div v-else>{{ $t("roulette.noBets") }}</div>
              </div>
            </div>
          </div>
          <div class="result-area">
            <h2 class="result-title">{{ $t("roulette.result") }}</h2>
            <div v-if="state.phase === 'betting'">
              {{ $t("roulette.waitSpin") }}
            </div>
            <div v-else-if="state.phase === 'spinning'">
              {{ $t("roulette.spinning") }}
            </div>
            <div v-else>
              <div v-if="state.spinResult">
                <div>{{ $t("roulette.number") }}: {{ state.spinResult.result }}</div>
                <div>
                  {{ $t("roulette.color") }}: {{ String(state.spinResult.color).toUpperCase() }}
                </div>

                <div>
                  {{ $t("roulette.winners") }}:
                  <div v-if="state.spinResult.winners.length === 0">
                    {{ $t("roulette.noWinners") }}
                  </div>
                  <ul v-else>
                    <li v-for="w in state.spinResult.winners" :key="w.playerId">
                      {{ w.name }} - {{ w.winningAmount }} {{ $t("roulette.drinkCredits") }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="standings">
          <h2>{{ $t("roulette.standings") }}</h2>
          <table>
            <thead>
              <tr>
                <th>{{ $t("roulette.player") }}</th>
                <th>{{ $t("roulette.amount") }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in standingsTable" :key="row.playerId">
                <td>{{ row.name }}</td>
                <td :class="{ pos: row.total > 0, neg: row.total < 0 }">
                  {{ row.total }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </NewRetroContainer>
</template>
<script setup lang="ts">
import { audioManager } from "@/AudioManager";
import RouletteWheel from "./components/RouletteWheel.vue";
import NewRetroContainer from "@/shared/components/UI/NewRetroContainer.vue";
import RouletteRules from "./components/RouletteRules.vue";
import RetroButton from "@/shared/components/UI/RetroButton.vue";
import { socket } from "@/socket";
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from "vue";
import {
  RouletteState,
  type RouletteStateDto,
} from "@shared/features/minigames/roulette/RouletteState";
import { context } from "@/context";

//const round = ref(1);
//const maxRounds = ref(3);
//const phase = ref("betting");
//const betsByPlayer = ref({});
//const spinResult = ref<SpinResult>();
//const totalPerPlayer = ref({});
const showRules = ref(false);
const spinAudio = ref<HTMLAudioElement>();

const state = ref<RouletteState>();

const wheel = useTemplateRef("wheel");

onMounted(() => {
  socket.on("roulette:update", onRouletteUpdate);
  socket.emit("roulette:requestState");

  spinAudio.value = new Audio("/sounds/Roulettewheel2.mp3");
  spinAudio.value.preload = "auto";
  spinAudio.value.volume = 0.8;
  const jazz = audioManager.play("/sounds/Jazz.mp3", { loop: true, volume: 0.5 });
});
onBeforeUnmount(() => {
  socket.off("roulette:update", onRouletteUpdate);
  audioManager.stopAll();
});

function onRouletteUpdate(data: RouletteStateDto) {
  console.log(data);
  state.value = RouletteState.toState(data);
}

const standingsTable = computed(() => {
  console.log(state.value);
  if (!state.value) return [];
  const betsByPlayer = state.value.betsByPlayer;
  const totals = state.value.totalPerPlayer;
  const rows = Object.entries(betsByPlayer).map(([playerId, p]) => ({
    playerId,
    name: p?.name ?? playerId,
    total: totals.get(playerId) ?? 0,
  }));
  rows.sort((a, b) => b.total - a.total);
  return rows;
});

function playSpinSound() {
  if (!spinAudio.value) return;
  spinAudio.value.currentTime = 0;
  spinAudio.value.play();
}
function startSpin() {
  playSpinSound();
  socket.emit("roulette:startSpin");
  wheel.value.spin();
}
function onSpinFinished(number: number) {
  socket.emit("roulette:spinResult", { number });
}
function nextRound() {
  socket.emit("roulette:nextRound");
}
</script>
<style scoped>
.layout {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 20px;
  align-items: start;
  color: white;
}
.left {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.right {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 70px;
}
.top-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  top: 100px;
}
.player-name {
  font-weight: bold;
}
.bet-list {
  margin: 6px 0 0 0;
  padding-left: 15px;
}
@media (max-width: 700px) {
  .wheel-area {
    transform: scale(0.9);
  }
}
.wheel-area {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bets-area,
.result-area,
.standings-area {
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 14px;
}
.bets-title {
  font-size: 40px;
  margin: 0;
  text-align: center;
}

.result-title {
  font-size: 40px;
  margin: 0;
  text-align: center;
}
.spin-button {
  width: 250px;
  top: -100px;
  letter-spacing: 1px;
}
.next-round-button {
  top: -60px;
  letter-spacing: 0.5px;
}

.standings table {
  width: 100%;
  border-collapse: collapse;
}
.standings th,
.standings td {
  padding: 8px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}
.pos {
  color: rgb(5, 155, 30);
  font-weight: 700;
}
.neg {
  color: #dd0606;
  font-weight: 700;
}
.rules-button {
  cursor: pointer;
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 50;
}
</style>
