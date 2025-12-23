import { Minigame } from "../Minigame.js";
import crypto from 'node:crypto';

export class DrawingGame extends Minigame {
    constructor() {
        super();
        this.allDrawings = [];
        this.phase = "drawing";
        this.currentSubject = "";
        this.subjects = [];
        this.timer = null;
        this.timerID = null;
        this.currentDrawingIndexToVote = 0;
    }

    onPlayerJoined(player) {
        this.broadcast("gamePhase", this.phase);

    }

    onPlayerDisconnected(player) {
    }

    setTimer(seconds) {
        this.stopTimer();
        this.timer = seconds;
        this.timerID = setInterval(() => {
            this.timer--;
            this.broadcastHosts("timerTick", this.timer)
            if (this.timer <= 0 && this.phase==="drawing") {
                this.changeGamePhase();
                console.log("GAMEPHASE CHANGING")
                console.log(this.phase)
            }
            else if (this.timer <= 0 && this.phase==="voting"){
                this.nextDrawingToVote();
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
        switch (this.phase) {
            case "drawing":
                this.phase = "voting";
                this.initiateVoteing();
                break;
            case "voting":
                this.phase = "drawing";
                this.initiateDrawing();
                break;
        }
        this.broadcast("gamePhase", this.phase)
    }

    initiateDrawing() {
        this.setTimer(20);
        this.allDrawings = [];
        this.broadcastHosts("clearPaintings");
    }

    initiateVoteing() {
        if (this.allDrawings.length>0){
        this.setTimer(20);
        this.currentDrawingIndex = 0;
        this.boradcastVoting();}
        else {this.changeGamePhase()}
    }

    boradcastVoting(){
        this.broadcast("drawingToVote", this.allDrawings[this.currentDrawingIndex])
    }

    nextDrawingToVote(){
        this.currentDrawingIndex ++;
        if (this.currentDrawingIndex < this.allDrawings.length){
        this.boradcastVoting();
        this.setTimer(20);
    }
        else {
            this.changeGamePhase();
        }
    }

    selectSubject() {
    }



    registerListeners(socket) {
        socket.on("updateCanvas", (canvasData) => {
            let drawing = this.allDrawings.find(d => d.socketId === socket.id);
            if (drawing) {
                console.log("updating pic")
                drawing.png = canvasData;
            }
            else {
                drawing = {
                    id: crypto.randomUUID(),
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


    }
    unregisterListeners(socket) {
        socket?.removeAllListeners("updateCanvas");
    }

    start() {
        this.currentSubject = "CAT";
        this.broadcastHosts("currentSubject", this.currentSubject);
        
        this.stopTimer();
        this.setTimer(20);
    }
    stop() {
        this.stopTimer();
    }
}
