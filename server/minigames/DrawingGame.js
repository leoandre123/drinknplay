import { Minigame } from "../Minigame.js";

export class DrawingGame extends Minigame {
    constructor() {
        super();
        this.drawingPlayers = [];
        this.phase = "drawing";
        this.timeLeft = null;
        this.currentSubject="";
        this.timer = null;
        this.timerID = null;
    }

    onPlayerJoined(player) {
        this.broadcast("gamePhase", this.phase);

    }

    onPlayerDisconnected(player) {
    }

    setTimer(seconds){
        this.timer = seconds;

        this.timerID = setInterval(()=>{
            this.timer--;
            this.broadcastHosts("timerTick", this.timer)
            if (this.timer <= 0){
                this.stopTimer();
                this.changeGamePhase();
            }
            }, 1000);
    }

    stopTimer(){
        if (this.timerID) {
            clearInterval(this.timerID)
            this.timerID=null;
        }

    }

    changeGamePhase() {
        switch (this.phase) {
            case "drawing":
                this.phase="voting";
                this.initiateVoteing();
                break;
            case "voting":
                this.phase="drawing";
                this.initiateDrawing();
                break;
        }
        this.broadcast("gamePhase", this.phase)
    }

    initiateDrawing(){
        this.setTimer(20)
        this.broadcastHosts("clearPaintings")
    }

    initiateVoteing(){
        this.setTimer(20);
    }


    registerListeners(socket) {
        socket.on("updateCanvas", (canvasData) => {
            this.broadcastHosts("updateCanvas", canvasData, socket.id);
        });


    }
    unregisterListeners(socket) {
        socket?.removeAllListeners("updateCanvas");
    }

    start() {
        this.currentSubject="CAT";
        this.broadcastHosts("currentSubject", this.currentSubject);
        this.setTimer(20);
    }
    stop() {
        this.stopTimer();
    }
}
