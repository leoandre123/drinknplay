import { KAHOOT_QUESTIONS_PER_GAME } from "../Constants.js";
import { Minigame } from "../Minigame.js";
import { shuffle } from "../Utils.js";
import  allQuestions  from "../data/kahoot-questions.json" with { type: 'json' };

export class KahootGame extends Minigame {
  constructor(neverEnd = false) {
    super();
    this.questions = shuffle(allQuestions).splice(0, KAHOOT_QUESTIONS_PER_GAME);

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
    socket.removeAllListeners("submitAnswer");
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

    q.time = time;

    this.currentQuestion = q;

    this.kahootPlayers.forEach((p) => (p.hasAnswered = false));
    this.updateAnswerCount();

    this.broadcast("startRound");
    this.broadcast("startQuestion", q);
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
