import { Minigame } from "../Minigame.js";

export class KahootGame extends Minigame {
  constructor(neverEnd = false) {
    super();
    this.questions = [
      {
        titleKey: "kahoot.q1.title",
        answers: [
          { textKey: "kahoot.q1.a1", correct: false },
          { textKey: "kahoot.q1.a2", correct: true },
          { textKey: "kahoot.q1.a3", correct: false },
          { textKey: "kahoot.q1.a4", correct: false },
        ],
      },
      {
        titleKey: "kahoot.q2.title",
        answers: [
          { textKey: "kahoot.q2.a1", correct: false },
          { textKey: "kahoot.q2.a2", correct: false },
          { textKey: "kahoot.q2.a3", correct: true },
          { textKey: "kahoot.q2.a4", correct: false },
        ],
      },
      {
        titleKey: "kahoot.q3.title",
        answers: [
          { textKey: "kahoot.q3.a1", correct: true },
          { textKey: "kahoot.q3.a2", correct: false },
          { textKey: "kahoot.q3.a3", correct: false },
          { textKey: "kahoot.q3.a4", correct: true },
        ],
      },
      {
        titleKey: "kahoot.q4.title",
        answers: [
          { textKey: "kahoot.q4.a1", correct: true },
          { textKey: "kahoot.q4.a2", correct: true },
          { textKey: "kahoot.q4.a3", correct: true },
          { textKey: "kahoot.q4.a4", correct: true },
        ],
      },
      {
        titleKey: "kahoot.q5.title",
        answers: [
          { textKey: "kahoot.q5.a1", correct: false },
          { textKey: "kahoot.q5.a2", correct: true },
          { textKey: "kahoot.q5.a3", correct: false },
          { textKey: "kahoot.q5.a4", correct: false },
        ],
      },
      {
        titleKey: "kahoot.q6.title",
        answers: [
          { textKey: "kahoot.q6.a1", correct: true },
          { textKey: "kahoot.q6.a2", correct: false },
          { textKey: "kahoot.q6.a3", correct: false },
          { textKey: "kahoot.q6.a4", correct: false },
        ],
      },
      {
        titleKey: "kahoot.q7.title",
        answers: [
          { textKey: "kahoot.q7.a1", correct: false },
          { textKey: "kahoot.q7.a2", correct: false },
          { textKey: "kahoot.q7.a3", correct: true },
          { textKey: "kahoot.q7.a4", correct: false },
        ],
      },
      {
        titleKey: "kahoot.q8.title",
        answers: [
          { textKey: "kahoot.q8.a1", correct: false },
          { textKey: "kahoot.q8.a2", correct: false },
          { textKey: "kahoot.q8.a3", correct: false },
          { textKey: "kahoot.q8.a4", correct: true },
        ],
      },
      {
        titleKey: "kahoot.q9.title",
        answers: [
          { textKey: "kahoot.q9.a1", correct: false },
          { textKey: "kahoot.q9.a2", correct: false },
          { textKey: "kahoot.q9.a3", correct: false },
          { textKey: "kahoot.q9.a4", correct: true },
        ],
      },
      {
        titleKey: "kahoot.q10.title",
        answers: [
          { textKey: "kahoot.q10.a1", correct: false },
          { textKey: "kahoot.q10.a2", correct: true },
          { textKey: "kahoot.q10.a3", correct: false },
          { textKey: "kahoot.q10.a4", correct: false },
        ],
      },
      {
        titleKey: "kahoot.q11.title",
        answers: [
          { textKey: "kahoot.q11.a1", correct: false },
          { textKey: "kahoot.q11.a2", correct: false },
          { textKey: "kahoot.q11.a3", correct: false },
          { textKey: "kahoot.q11.a4", correct: true },
        ],
      },
      {
        titleKey: "kahoot.q12.title",
        answers: [
          { textKey: "kahoot.q12.a1", correct: true },
          { textKey: "kahoot.q12.a2", correct: false },
          { textKey: "kahoot.q12.a3", correct: false },
          { textKey: "kahoot.q12.a4", correct: false },
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
    socket.on("submitAnswer", (index, time) =>
      this.onAnswerSubmitted(socket.data.playerId, index, time)
    );
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
      ? Math.round(Math.max(100 - (time - this.currentQuestion.time) / 50, 0))
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
        const results = {
          type: "scores",
          data: this.kahootPlayers.map((kp) => {
            return {
              playerId: kp.id,
              score: kp.score,
            };
          }),
        };
        this.onFinished(results);
      }
    } else {
      setTimeout(() => this.startQuestion(), 2000);
    }
  }

  startQuestion() {
    this.updateAnswerCount();
    this.updateQuestionsCount();
    const q = this.questions[this.currentQuestionIndex];
    const time = Date.now() + 5000;

    const questionForHost = {
      time,
      titleKey: q.titleKey,
      answers: q.answers.map((a) => ({
        textKey: a.textKey,
        correct: a.correct,
      })),
    };

    const questionForPlayers = {
      time,
      titleKey: q.titleKey,
      answers: q.answers.map((a) => ({
        textKey: a.textKey,
      })),
    };

    this.currentQuestion = questionForHost;

    this.kahootPlayers.forEach((p) => (p.hasAnswered = false));
    this.updateAnswerCount();

    this.broadcastPlayers("startRound");
    this.broadcastPlayers("startQuestion", questionForPlayers);

    this.broadcastHosts("startQuestion", questionForHost);
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
