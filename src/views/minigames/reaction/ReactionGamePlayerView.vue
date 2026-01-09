<template>
  <div class="reaction-game-player-container">
    <h1>REACTION GAME - PLAYER VIEW</h1>
    <div v-if="winner === myId && showRoundResult">
      <h2>YOU WIN THIS ROUND!</h2>
    </div>
    <div v-else-if="winner && showRoundResult">
      <h2>{{ winnerName }} WON THIS ROUND!</h2>
    </div>
    <div v-else-if="showRoundResult">
      <h2>No winner this round</h2>
    </div>
    <div class="amount-display">
      <h2>{{ amount }}</h2>

      <div class="button-container">
        <button class="remove-button" @click="remove">-</button>
        <button class="add-button" @click="add">+</button>

        <div class="done-button-container">
          <button class="submit-button" @click="submit" :disabled="submitDisabled">DONE</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { socket } from "../../../socket";

export default {
  name: "ReactionGamePlayerView",
  data: function () {
    return {
      amount: 0,
      winner: null,
      winnerName: null,
      showRoundResult: false,
      submitDisabled: true,
    };
  },

  created() {
    socket.on("reaction:roundResult", ({ winner, winnerName, scores }) => {
      console.log("Round result received:", { winnerName, scores });
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
      }, 5000);
    });
  },

  computed: {
    myId() {
      return socket.id;
    },
  },

  beforeUnmount() {
    socket.off("reaction:roundResult");
    socket.off("connect");
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
      navigator.vibrate(200);

      this.amount++;
    },
    submit() {
      this.playSubmitSound();
      socket.emit("reaction:submit", { amount: this.amount, time: Date.now() });
    },
  },
};
</script>

<style>
.reaction-game-player-container {
  display: grid;
  min-height: 100vh;
  width: 100vw;
  height: 100vh;
  justify-items: center;
  align-content: center;
  background-image: radial-gradient(
    circle farthest-corner at 10% 20%,
    rgb(102, 0, 32) 0%,
    rgb(116, 18, 92) 49.5%,
    rgb(164, 34, 144) 90%
  );
  color: white;
}

.amount-display {
  margin-top: 50px;
  font-size: 100px;
}

.button-container {
  margin-top: 50px;
}

.remove-button,
.add-button {
  justify-items: center;
  grid-template-rows: 100px;
  width: 200px;
  height: 200px;
  font-size: 50px;
  font-weight: bold;
  margin: 20px;
  touch-action: manipulation;
}

.add-button {
  background-color: #40bf44;
  color: black;
  border: none;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
}

.submit-button:disabled {
  opacity: 0.4;
  pointer-events: none;
  cursor: not-allowed;
}

.remove-button {
  background-color: #d54339;
  /* Red */
  color: black;
  border: none;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
}

.done-button-container {
  position: fixed;
  right: 100px;
  top: 200px;
}

.submit-button {
  display: grid;
  justify-content: center;
  width: 200px;
  padding-top: 200px;
  padding-bottom: 10px;
  margin: 10px;
  font-weight: bold;
  font-size: 30;
  background-color: rgb(239, 215, 244);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
}
</style>
