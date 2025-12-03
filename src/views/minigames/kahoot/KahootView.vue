<template>
  <div class="kahoot-container">
    <div class="title">
      <p>Q {{ currentQuestionIndex + 1 }}/{{ questionCount }}</p>
      <p>{{ currentQuestion.title }}</p>
      <p>A: {{ answerCount }}/{{ playerCount }}</p>
    </div>
    <div class="body">HEJ</div>
    <div class="answers">
      <div
        v-for="(answer, i) in currentQuestion.answers"
        class="answer"
        :class="[
          `answer-${i}`,
          { right: reveal && currentQuestion.answers[i].correct },
          { wrong: reveal && !currentQuestion.answers[i].correct },
        ]"
      >
        {{ timer == 0 ? answer.text : "-" }}
      </div>
      <div v-if="timer" class="timer-container">
        <div class="timer" :key="timer">{{ timer }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { context } from "../../../context";
import { socket } from "../../../socket";

export default {
  name: "KahootView",

  data() {
    return {
      currentQuestion: {},
      timer: 0,
      currentQuestionIndex: 0,
      questionCount: 0,
      answerCount: 0,
      playerCount: 0,
      reveal: false,
    };
  },
  components: {},
  mounted() {
    socket.on("startQuestion", this.onStartQuestion);
    socket.on("setAnswerCount", (answers, players) => {
      this.answerCount = answers;
      this.playerCount = players;
    });
    socket.on("setQuestionCount", (ind, count) => {
      this.currentQuestionIndex = ind;
      this.questionCount = count;
    });
    socket.on("revealAnswers", () => (this.reveal = true));
  },
  beforeUnmount() {
    socket.off("");
  },
  methods: {
    onStartQuestion(q) {
      this.reveal = false;
      this.currentQuestion = q;

      const updateTimer = () => {
        const delta = q.time - Date.now();
        if (delta > 0) {
          this.timer = Math.ceil(delta / 1000);
          setTimeout(updateTimer, 10);
        } else {
          this.timer = 0;
        }
      };

      updateTimer();
    },
  },
};
</script>

<style scoped>
.kahoot-container {
  display: flex;
  flex-direction: column;
  background: white;
}

.title {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 0 0 1rem 1rem;
  padding: 1rem;
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
}

.body {
  flex-grow: 1;
  align-content: center;
}

.timer-container {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(66, 37, 46, 0.779);
  align-content: center;
  justify-items: center;
  color: white;
}

.timer {
  font-size: 3rem;
  width: 3rem;
  height: 3rem;

  animation-name: timerAnimation;
  animation-duration: 1s;
}

@keyframes timerAnimation {
  0% {
    transform: scale(1);
  }
  60% {
    transform: scale(1.4);
  }
  100% {
    transform: scale(1);
  }
}

.answers {
  display: grid;
  position: relative;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
}

.answer {
  padding: 3rem;
  font-size: 2rem;
  color: white;
}

.answer-0 {
  background-color: rgb(255, 0, 0);
}
.answer-1 {
  background-color: rgb(0, 0, 255);
}
.answer-2 {
  background-color: rgb(200, 150, 0);
}
.answer-3 {
  background-color: rgb(0, 200, 0);
}

.answer-0.wrong {
  background-color: rgba(255, 0, 0, 0.25);
}
.answer-1.wrong {
  background-color: rgb(0, 0, 255, 0.25);
}
.answer-2.wrong {
  background-color: rgb(200, 150, 0, 0.25);
}
.answer-3.wrong {
  background-color: rgb(0, 200, 0, 0.25);
}
</style>
