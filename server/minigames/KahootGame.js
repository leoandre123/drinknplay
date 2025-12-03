import { Minigame } from "../Minigame.js";

export class KahootGame extends Minigame {
  constructor(neverEnd = false) {
    super();
    this.questions = [
      {
        title: "Vad är 5x5?",
        answers: [
          { text: "20", correct: false },
          { text: "25", correct: true },
          { text: "15", correct: false },
          { text: "35", correct: false },
        ],
      },
      {
        title: "Vad är 1x5?",
        answers: [
          { text: "1", correct: false },
          { text: "3", correct: false },
          { text: "5", correct: true },
          { text: "5", correct: true },
        ],
      },
      {
        title: "Vad är sant?",
        answers: [
          { text: "Leo är bäst", correct: true },
          { text: "Leo är sämst", correct: false },
          { text: "Leo är 22", correct: false },
          { text: "Leo är 23", correct: true },
        ],
      },
      {
        title: "Hur gammal är du",
        answers: [
          { text: "0-15", correct: true },
          { text: "15-25", correct: true },
          { text: "25-35", correct: true },
          { text: "35+", correct: true },
        ],
      },
    ];
    this.currentQuestionIndex = 0;

    this.currentQuestion = null;
    this.kahootPlayers = [];

    this.neverEnd = neverEnd;
  }

  onPlayerJoined(player) {
    this.kahootPlayers.push({
      id: player.id,
      score: 0,
      hasAnswered: false,
    });
    this.updateAnswerCount();
    this.updateQuestionsCount();
  }
  onPlayerDisconnected(player) {
    this.kahootPlayers = this.kahootPlayers.filter((x) => x.id != player.id);
    this.updateAnswerCount();
  }

  registerListeners(socket) {
    socket.on("submitAnswer", (index, time) => this.onAnswerSubmitted(socket.id, index, time));
  }
  unregisterListeners(socket) {
    socket.off("submitAnswer");
  }

  start() {
    this.startQuestion();
  }
  stop() {}

  onAnswerSubmitted(playerId, answerIndex, time) {
    const player = this.kahootPlayers.find((x) => x.id == playerId);
    if (player.hasAnswered) return;
    if (time < this.currentQuestion.time) return;
    const score = this.currentQuestion.answers[answerIndex].correct
      ? Math.max(1000 - (time - this.currentQuestion.time) / 5, 0)
      : 0;
    player.score += Math.round(score);
    player.hasAnswered = true;

    this.emitToPlayer(playerId, "answerRegistered", answerIndex);
    this.updateAnswerCount();
    if (this.kahootPlayers.every((p) => p.hasAnswered)) {
      setTimeout(() => this.onRoundFinished(), 2000);
    }
  }

  onRoundFinished() {
    this.kahootPlayers.forEach((player) => this.emitToPlayer(player.id, "setScore", player.score));
    this.broadcastHosts("revealAnswers");

    this.currentQuestionIndex++;
    if (this.currentQuestionIndex >= this.questions.length) {
      if (this.neverEnd) {
        this.currentQuestionIndex = 0;
        setTimeout(() => this.startQuestion(), 2000);
      } else {
        this.onFinished();
      }
    } else {
      setTimeout(() => this.startQuestion(), 2000);
    }
  }

  startQuestion() {
    this.updateAnswerCount();
    this.updateQuestionsCount();
    this.currentQuestion = {
      time: Date.now() + 5000,
      title: this.questions[this.currentQuestionIndex].title,
      answers: this.questions[this.currentQuestionIndex].answers,
    };
    this.kahootPlayers.forEach((p) => (p.hasAnswered = false));
    this.updateAnswerCount();
    this.broadcastPlayers("startRound");
    this.broadcastHosts("startQuestion", this.currentQuestion);
  }

  updateAnswerCount() {
    const answers = this.kahootPlayers.filter((x) => x.hasAnswered).length;
    const players = this.kahootPlayers.length;

    this.broadcastHosts("setAnswerCount", answers, players);
  }
  updateQuestionsCount() {
    this.broadcastHosts("setQuestionCount", this.currentQuestionIndex, this.questions.length);
  }
}
