import type { Player } from "server/models/Player.js";
import { Minigame } from "../Minigame.js";
import type { GameResult } from "server/models/GameResult.js";
import type { Host } from "server/models/Host.js";
import type { ServerLobbyContext } from "server/models/ServerLobbyContext.js";
import type { DrawingPlayer, Drawing } from "@shared/minigames/drawing/types";

export class DrawingGame extends Minigame {
  drawingPlayers: DrawingPlayer[];
  allDrawings: Drawing[];
  phase: string;
  currentSubject: string;
  subjects: string[];
  timer: number;
  timerID?: NodeJS.Timeout;
  currentDrawingIndex: number;

  constructor(context: ServerLobbyContext, onFinished: (results: GameResult) => void) {
    super(context, onFinished);

    this.drawingPlayers = [];
    this.allDrawings = [];
    this.phase = "start";
    this.currentSubject = "";
    this.subjects = [];
    this.timer = 0;
    this.timerID = undefined;
    this.currentDrawingIndex = 0;
  }

  onPlayerJoined(player: Player) {
    this.logger.debug("Player joined");
    this.broadcastPlayers("gamePhase", this.phase);
    this.drawingPlayers.push({
      playerId: player.id,
      score: 0,
      subjectSubmitted: false,
    });
  }
  onPlayerRejoined(player: Player) {
    this.broadcastPlayers("gamePhase", this.phase);
  }

  onHostJoined(_: Host) {}

  onPlayerDisconnected(_: Player) {}

  //runs the game phase switching with timer
  setTimer(seconds: number) {
    this.stopTimer();
    this.timer = seconds;
    this.broadcast("timerTick", this.timer);
    this.timerID = setInterval(() => {
      if (this.timer >= 0) {
        this.broadcast("timerTick", this.timer);
        this.timer--;
      }
      if (this.timer < 0) {
        if (this.phase === "voting") {
          this.stopTimer();
          this.nextDrawingToVote();
        } else {
          this.stopTimer();
          this.changeGamePhase();
          this.logger.debug("GAMEPHASE CHANGING");
          this.logger.debug(this.phase);
        }
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerID) {
      clearInterval(this.timerID);
      this.timerID = undefined;
    }
  }

  //Handles switching game phase, gets called by setTimer and voting methods
  changeGamePhase() {
    switch (this.phase) {
      case "start":
        this.phase = "drawing";
        this.initiateDrawing();
        break;
      case "drawing":
        this.phase = "voting";
        this.initiateVoteing();
        break;
      case "voting":
        this.phase = "results";
        this.initiateResults();
        break;
      case "results":
        if (this.subjects.length > 0) {
          this.phase = "drawing";
          this.initiateDrawing();
        } else {
          this.gameFinished();
        }
        break;
    }
    this.broadcast("gamePhase", this.phase);
  }

  gameFinished() {
    const results: GameResult = {
      type: "scores",
      data: this.drawingPlayers.map((dp) => ({
        playerId: dp.playerId,
        score: dp.score ?? 0,
      })),
    };
    this.logger.debug("GAME FINISHED");
    this.onFinished?.(results);
  }

  initiateDrawing() {
    this.logger.debug(this.subjects);
    this.setTimer(90);
    this.changeSubject();
    this.allDrawings = [];
    this.broadcastHosts("clearPaintings");
    this.broadcast("currentSubject", this.currentSubject);
  }

  changeSubject() {
    const randomIndex = Math.floor(Math.random() * this.subjects.length);
    this.currentSubject = this.subjects[randomIndex] ?? "Out of subjects";
    this.subjects.splice(randomIndex, 1);
  }

  //Handles voting
  initiateVoteing() {
    if (this.allDrawings.length > 0) {
      this.setTimer(15);
      this.currentDrawingIndex = 0;
      this.broadcastVoting();
      this.logger.debug("INITIATE VOITNG");
    } else {
      this.changeGamePhase();
    }
  }

  broadcastVoting() {
    this.broadcast("drawingToVote", this.allDrawings[this.currentDrawingIndex]);
  }

  nextDrawingToVote() {
    this.currentDrawingIndex++;
    if (this.currentDrawingIndex < this.allDrawings.length) {
      this.broadcastVoting();
      this.setTimer(15);
    } else {
      this.changeGamePhase();
    }
  }

  //Sends score to Host to display in result vue, both player total score & drawing scores
  initiateResults() {
    this.setTimer(10);
    this.sortResults();
    this.broadcastHosts("results", {
      players: this.drawingPlayers,
      drawings: this.allDrawings,
    });
  }

  sortResults() {
    this.drawingPlayers.sort((a, b) => b.score - a.score);
    this.allDrawings.sort((a, b) => b.score - a.score);
  }

  registerListeners(player: Player) {
    //Add subject that each player decides
    player.communication?.on("submitSubject", (subject) => {
      this.subjects.push(subject);
      const drawingPlayer = this.drawingPlayers.find((d) => d.playerId == player.id);
      if (!drawingPlayer) return;

      drawingPlayer.subjectSubmitted = true;
      const allSubmitted = this.drawingPlayers.every((p) => p.subjectSubmitted === true);
      if (allSubmitted && this.drawingPlayers.length > 0) {
        this.changeGamePhase();
      }
    });

    //push drawings and update them to host
    player.communication?.on("updateCanvas", (canvasData) => {
      let drawing = this.allDrawings.find((d) => d.playerId == player.id);
      if (drawing) {
        drawing.png = canvasData;
      } else {
        let drawingPlayer = this.drawingPlayers.find((d) => d.playerId == player.id);
        if (!drawingPlayer) return;
        drawing = {
          playerId: player.id,
          png: canvasData,
          score: 0,
        };
        this.allDrawings.push(drawing);
      }
      this.broadcastHosts("updateCanvas", drawing);
    });
    //add scores to players
    player.communication?.on("playerVote", (scoreInfoFromPlayer) => {
      const drawing = this.allDrawings.find((d) => d.playerId === scoreInfoFromPlayer.playerId);
      if (drawing) {
        this.logger.debug(scoreInfoFromPlayer.score);
        drawing.score += scoreInfoFromPlayer.score;
        this.logger.debug(`Updated score for ${drawing.playerId}: ${drawing.score}`);
      }

      const drawingPlayer = this.drawingPlayers.find((p) => p.playerId === player.id);
      if (drawingPlayer) {
        player.score += scoreInfoFromPlayer.score;
      }
      this.logger.debug(`Updated score for ${player.name}: ${player.score}`);
    });
  }

  unregisterListeners(player: Player) {
    player.communication?.removeAllListeners("submitSubject");
    player.communication?.removeAllListeners("updateCanvas");
    player.communication?.removeAllListeners("playerVote");
  }

  start() {}
  stop() {
    this.stopTimer();
  }
}
