<template>
  <div class="reaction-game-player-container">
    <h1>REACTION GAME</h1>
    <div v-if="winner === myId && showRoundResult">
      <h2>{{ $t("reaction.you_win") }}</h2>
    </div>
    <div v-else-if="winner && showRoundResult">
      <h2>{{ winnerName }} {{ $t("reaction.player_wins") }}</h2>
    </div>
    <div v-else-if="showRoundResult">
      <h2>{{ $t("reaction.no_winner") }}</h2>
    </div>
    <div class="amount-display">
      <h2>{{ amount }}</h2>

      <div class="button-container">
        <RetroButton color="red" size="large" @click="remove">-</RetroButton>
        <RetroButton color="green" size="large" @click="add">+</RetroButton>

        <div class="done-button-container">
          <RetroButton color="purple" size="large" @click="submit" :disabled="submitDisabled">
            {{ $t("reaction.done") }}
          </RetroButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { socket } from "../../../socket";
import RetroButton from "@/shared/components/UI/RetroButton.vue";

export default {
  components: {
    RetroButton,
  },
  name: "ReactionGamePlayerView",
  data: function () {
    return {
      amount: 0,
      winner: null,
      winnerName: null,
      showRoundResult: false,
      submitDisabled: true,
      myPlayerId: null,
    };
  },

  created() {
    socket.on("reaction:roundResult", ({ winner, winnerName, scores }) => {
      console.log("Round result received:", { winner, winnerName, scores });
      this.amount = 0;
      this.winner = winner;
      this.winnerName = winnerName;
      this.showRoundResult = true;
      this.playRoundResultSound();
      setTimeout(() => (this.showRoundResult = false), 1500);
      this.submitDisabled = true;
    });
    socket.on("reaction:startRound", () => {
      setTimeout(() => {
        this.submitDisabled = false;
      }, 6000);
    });
    socket.on("player:yourId", (id) => {
      this.myPlayerId = id;
      console.log("My playerId:", id);
    });
  },

  computed: {
    myId() {
      return this.myPlayerId;
    },
  },

  beforeUnmount() {
    socket.off("reaction:roundResult");
    socket.off("reaction:startRound");
    socket.off("player:yourId");
  },

  methods: {
    playRoundResultSound() {
      if (!this.showRoundResult) return;

      if (this.winner === null) {
        const audio = new Audio("/sounds/nowinner.mp3");
        audio.play();
        return;
      }

      if (this.winner) {
        const audio = new Audio("/sounds/winner.mp3");
        audio.play();
        return;
      }
    },

    playSound() {
      const audio = new Audio("/sounds/buttonclick.mp3");
      audio.play();
    },
    playSubmitSound() {
      const audio = new Audio("/sounds/submitbutton.mp3");
      audio.play();
    },
    remove() {
      if (this.amount > 0) {
        this.amount--;
        this.playSound();
      }
    },
    add() {
      this.playSound();
      this.amount++;
    },
    submit() {
      this.playSubmitSound();
      socket.emit("reaction:submit", { amount: this.amount, time: Date.now() });
    },
  },
};
</script>

<style scoped>
.reaction-game-player-container {
  display: grid;
  min-height: 100dvh;
  width: 100vw;
  height: 100dvh;
  justify-items: center;
  align-content: center;
  background-image: radial-gradient(
    circle farthest-corner at 10% 20%,
    rgb(102, 0, 32) 0%,
    rgb(116, 18, 92) 49.5%,
    rgb(164, 34, 144) 90%
  );
  color: white;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
  box-sizing: border-box;
  padding-bottom: 100px;
}

.amount-display {
  margin-top: 20px;
  font-size: clamp(70px, 15vw, 100px);
  line-height: 1;
}

.button-container {
  margin-top: 25px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.submit-button:disabled {
  opacity: 0.4;
  pointer-events: none;
  cursor: not-allowed;
}

.done-button-container {
  position: fixed;
  left: 50%;
  bottom: 30px;
  transform: translateX(-50%);
  width: min(92vw, 320px);
}
</style>
