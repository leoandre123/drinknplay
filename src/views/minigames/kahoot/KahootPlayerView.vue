<template>
  <div class="kahoot-container">
    <div class="title">
      <p>Q</p>
      <p>Q</p>
      <p>Score: {{ score }}</p>
    </div>
    <div class="answers">
      <div
        v-for="(_, i) in 4"
        class="answer"
        :class="[
          `answer-${i}`,
          { unselected: hasAnswered && answerIndex != i },
        ]"
        @click="answer(i)"
      >
        {{ i }}
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
      score: 0,
      hasAnswered: true,
      answerIndex: 0,
    };
  },
  components: {},
  mounted() {
    socket.on("setScore", (score) => (this.score = score));
    socket.on("answerRegistered", (answerIndex) => {
      this.hasAnswered = true;
      this.answerIndex = answerIndex;
    });
    socket.on("startRound", () => (this.hasAnswered = false));
  },
  beforeUnmount() {
    socket.off("setScore");
    socket.off("answerRegistered");
    socket.off("startRound");
  },
  methods: {
    answer(index) {
      socket.emit("submitAnswer", index, Date.now());
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

.answers {
  flex-grow: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
}

.answer {
  padding: 3rem;
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

.answer-0.unselected {
  background-color: rgba(255, 0, 0, 0.25);
}
.answer-1.unselected {
  background-color: rgb(0, 0, 255, 0.25);
}
.answer-2.unselected {
  background-color: rgb(200, 150, 0, 0.25);
}
.answer-3.unselected {
  background-color: rgb(0, 200, 0, 0.25);
}
</style>
