import { Minigame } from "../Minigame.js";

export class DrawingGame extends Minigame {
    constructor() {
        super();
        this.drawingPlayers = [];
        this.allDrawings = [];
        this.phase = "results";
        this.currentSubject = "";
        this.subjects = [];
        this.timer = null;
        this.timerID = null;
        this.currentDrawingIndexToVote = 0;
    }

    onPlayerJoined(player) {
        this.broadcast("gamePhase", this.phase);
        this.drawingPlayers.push({
            id: player.id,
            score: 0,
            name: player.name
        })

    }

    onPlayerDisconnected(player) {
    }

    setTimer(seconds) {
        this.stopTimer();
        this.timer = seconds;
        this.broadcastHosts("timerTick", this.timer)
        this.timerID = setInterval(() => {
            if (this.timer >= 0) {
                this.broadcastHosts("timerTick", this.timer)
            this.timer--;}
            if (this.timer < 0) {
                if (this.phase === "voting") {
                        //this.nextDrawingToVote();
                }
                else {
                    //this.changeGamePhase();
                    console.log("GAMEPHASE CHANGING")
                    console.log(this.phase)
                }
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerID) {
            clearInterval(this.timerID)
            this.timerID = null;
        }

    }

    changeGamePhase() {
        setTimeout(() => {
            switch (this.phase) {
                case "start":
                    this.phase = "drawing"
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
                    this.phase = "drawing";
                    this.initiateDrawing();
                    break;
            }
            this.broadcast("gamePhase", this.phase)
        }, 500);
    }

    initiateDrawing() {
        this.setTimer(20);
        this.allDrawings = [];
        this.broadcastHosts("clearPaintings");
    }

    initiateVoteing() {
        if (this.allDrawings.length > 0) {
            this.setTimer(20);
            this.currentDrawingIndex = 0;
            this.boradcastVoting();
        }
        else { this.changeGamePhase() }
    }

    boradcastVoting() {
        this.broadcast("drawingToVote", this.allDrawings[this.currentDrawingIndex])
    }

    nextDrawingToVote() {
        this.currentDrawingIndex++;
        if (this.currentDrawingIndex < this.allDrawings.length) {
            this.boradcastVoting();
            this.setTimer(20);
        }
        else {
            this.changeGamePhase();
        }
    }

    initiateResults(){
        this.setTimer(20);
        this.broadcastHosts("results", {
            player: this.drawingPlayers,
            drawings: this.allDrawings
    })}

    registerListeners(socket) {
        socket.on("updateCanvas", (canvasData) => {
            let drawing = this.allDrawings.find(d => d.socketId === socket.id);
            if (drawing) {
                console.log("updating pic")
                drawing.png = canvasData;
            }
            else {
                drawing = {
                    socketId: socket.id,
                    playerName: socket.data.username,
                    png: canvasData,
                    score: 0
                };
                this.allDrawings.push(drawing);
                console.log("new pic");
                console.log(drawing.playerName);
            };
            this.broadcastHosts("updateCanvas", drawing);
        });

        socket.on("playerVote", (scoreInfoFromPlayer) => {
            const drawing = this.allDrawings.find(d => d.socketId === scoreInfoFromPlayer.socketId)
            if (drawing) {
                console.log(scoreInfoFromPlayer.score)
                drawing.score += scoreInfoFromPlayer.score;
                console.log(`Updated score for ${drawing.playerName}: ${drawing.score}`);
            }

            const player = this.drawingPlayers.find(p => p.id === drawing.socketId);
            if (player) {
                player.score += scoreInfoFromPlayer.score;
            }
            console.log(`Updated score for ${player.name}: ${player.score}`);
        })

    }
    unregisterListeners(socket) {
        socket?.removeAllListeners("updateCanvas");
    }

    start() {
        setTimeout(() => {
            //this.setTimer(10)
            this.broadcast("gamePhase", this.phase)
        }, 5000);
    }
    stop() {
        this.stopTimer();
    }
}
