import type { ServerLobbyContext } from "server/models/ServerLobbyContext.js";
import { Minigame } from "../Minigame.js";
import { shuffle } from "../Utils.js";
import allQuestions from "../data/kahoot-questions.json" assert { type: "json" };
import type { GameResult } from "server/models/GameResult.js";
import type { KahootQuestion, KahootPlayer } from "shared/minigames/kahoot/types";
import type { Player } from "server/models/Player.js";
import type { Host } from "server/models/Host.js";
import { KAHOOT_QUESTIONS_PER_GAME } from "@shared/minigames/kahoot/constants";

export class KahootGame extends Minigame {
  questions: KahootQuestion[];
  kahootPlayers: KahootPlayer[];
  currentQuestionIndex = 0;
  currentQuestion: KahootQuestion | undefined;
  currentQuestionEndTime: number;

  constructor(context: ServerLobbyContext, onFinished: (results: GameResult) => void) {
    super(context, onFinished);

    this.questions = shuffle(allQuestions).splice(0, KAHOOT_QUESTIONS_PER_GAME);

    this.currentQuestionIndex = 0;
    this.currentQuestionEndTime = 0;
    this.currentQuestion = undefined;
    this.kahootPlayers = [];
  }

  onPlayerJoined(player: Player) {
    this.kahootPlayers.push({
      playerId: player.id,
      score: 0,
      hasAnswered: false,
    });
    this.updateAnswerCount();
    this.updateQuestionsCount();
  }
  onPlayerDisconnected(player: Player) {
    this.kahootPlayers = this.kahootPlayers.filter((x) => x.playerId != player.id);
    this.updateAnswerCount();
  }
  onPlayerRejoined(player: Player) {}
  onHostJoined(_: Host) {}

  registerListeners(player: Player) {
    player.communication?.on("submitAnswer", (index, time) =>
      this.onAnswerSubmitted(player.id, index, time)
    );
  }
  unregisterListeners(player: Player) {
    player.communication?.removeAllListeners("submitAnswer");
  }

  start() {
    this.startQuestion();
  }
  stop() {}

  onAnswerSubmitted(playerId: string, answerIndex: number, time: number) {
    const player = this.kahootPlayers.find((x) => x.playerId == playerId);
    if (!player || player.hasAnswered || !this.currentQuestion) return;
    if (time < this.currentQuestionEndTime) return;
    const score = this.currentQuestion.answers[answerIndex].correct
      ? Math.round(Math.max(100 - (time - this.currentQuestionEndTime) / 50, 0))
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
    this.kahootPlayers.forEach((player) =>
      this.emitToPlayer(player.playerId, "setScore", player.score)
    );
    this.broadcastHosts("revealAnswers");

    this.currentQuestionIndex++;
    if (this.currentQuestionIndex >= this.questions.length) {
      const results: GameResult = {
        type: "scores",
        data: this.kahootPlayers.map((kp) => {
          return {
            playerId: kp.playerId,
            score: kp.score,
          };
        }),
      };
      this.onFinished(results);
    } else {
      setTimeout(() => this.startQuestion(), 2000);
    }
  }

  startQuestion() {
    this.updateAnswerCount();
    this.updateQuestionsCount();
    const q = this.questions[this.currentQuestionIndex];
    const time = Date.now() + 5000;

    this.currentQuestionEndTime = time;

    this.currentQuestion = q;

    this.kahootPlayers.forEach((p) => (p.hasAnswered = false));
    this.updateAnswerCount();

    this.broadcast("startRound");
    this.broadcast("startQuestion", q, time);
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
