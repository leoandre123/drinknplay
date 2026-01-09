import { Minigame } from "../Minigame.js";

export class DrawingGame extends Minigame {
    constructor() {
        super();
        this.drawingPlayers = [];
        this.allDrawings = [];
        this.phase = "start";
        this.currentSubject = "";
        this.subjects = [];
        this.timer = null;
        this.timerID = null;
        this.currentDrawingIndexToVote = 0;
    }

    onPlayerJoined(player) {
        this.broadcastPlayers("gamePhase", this.phase);
        this.drawingPlayers.push({
            playerId: player.id,
            score: 0,
            name: player.name,
            subjectSubmitted: false,
        })
    }

    onPlayerDisconnected(player) {
    }

    //runs the game phase switching with timer
    setTimer(seconds) {
        this.stopTimer();
        this.timer = seconds;
        this.broadcastHosts("timerTick", this.timer)
        this.timerID = setInterval(() => {
            if (this.timer >= 0) {
                this.broadcastHosts("timerTick", this.timer)
                this.timer--;
            }
            if (this.timer < 0) {
                if (this.phase === "voting") {
                    this.stopTimer()
                    this.nextDrawingToVote();
                }
                else {
                    this.stopTimer()
                    this.changeGamePhase();
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

    //Handles switching game phase, gets called by setTimer and voting methods
    changeGamePhase() {

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
                if (this.allDrawings.length>0){
                this.phase = "drawing";
                this.initiateDrawing()}
                else{
                    this.gameFinished();
                };
                break;
        }
        this.broadcast("gamePhase", this.phase)
    },
    gameFinished(){
        const results = this.drawingPlayers.map(dp => ({
            playerId: dp.playerId,
            score: dp.score
        }));
        this.onFinished?.(results);
    },

    initiateDrawing() {
        console.log(this.subjects);
        this.setTimer(40);
        this.changeSubject();
        this.allDrawings = [];
        this.broadcastHosts("clearPaintings");
        this.broadcast("currentSubject", this.currentSubject)
    }

    changeSubject() {
        const randomIndex = Math.floor(Math.random() * this.subjects.length);
        this.currentSubject = this.subjects[randomIndex] ?? "Out of subjects";
        this.subjects.splice(randomIndex, 1);
    }

    //Handles voting 
    initiateVoteing() {
        if (this.allDrawings.length > 0) {
            this.setTimer(10);
            this.currentDrawingIndex = 0;
            this.broadcastVoting();
            console.log("INITIATE VOITNG")
        }
        else { this.changeGamePhase() }
    }

    broadcastVoting() {
        this.broadcast("drawingToVote", this.allDrawings[this.currentDrawingIndex])
    }

    nextDrawingToVote() {
        this.currentDrawingIndex++;
        if (this.currentDrawingIndex < this.allDrawings.length) {
            this.broadcastVoting();
            this.setTimer(10);
        }
        else {
            this.changeGamePhase();
        }
    }

    //Sends score to Host to display in result vue, both player total score & drawing scores
    initiateResults() {
        this.setTimer(20);
        this.sortResults();
        this.broadcastHosts("results", {
            players: this.drawingPlayers,
            drawings: this.allDrawings
        })
    }

    sortResults() {
        this.drawingPlayers.sort((a, b) => b.score - a.score);
        this.allDrawings.sort((a, b) => b.score - a.score);
    }


    registerListeners(socket) {
        //Add subject that each player decides
        socket.on("submitSubject", (subject) => {
            this.subjects.push(subject)
            const player = this.drawingPlayers.find(d => d.playerId === socket.data.playerId);
            player.subjectSubmitted = true;
            const allSubmitted = this.drawingPlayers.every(p => p.subjectSubmitted === true);
            if (allSubmitted && this.drawingPlayers.length>0){
            this.changeGamePhase();  
            }
        })

        //push drawings and update them to host
        socket.on("updateCanvas", (canvasData) => {
            console.log(this.allDrawings)
            console.log(socket.data.playerId)
            let drawing = this.allDrawings.find(d => d.playerId === socket.data.playerId);
            if (drawing) {
                console.log("updating pic")
                drawing.png = canvasData;
            }
            else {
                drawing = {
                    playerId: socket.data.playerId,
                    playerName: socket.data.username,
                    png: canvasData,
                    score: 0,
                };
                this.allDrawings.push(drawing);
                console.log("new pic");
                console.log(drawing.playerName);
            };
            this.broadcastHosts("updateCanvas", drawing);
        });
        //add scores to players
        socket.on("playerVote", (scoreInfoFromPlayer) => {
            const drawing = this.allDrawings.find(d => d.playerId === scoreInfoFromPlayer.playerId)
            if (drawing) {
                console.log(scoreInfoFromPlayer.score)
                drawing.score += scoreInfoFromPlayer.score;
                console.log(`Updated score for ${drawing.playerName}: ${drawing.score}`);
            }

            const player = this.drawingPlayers.find(p => p.playerId === drawing.playerId);
            if (player) {
                player.score += scoreInfoFromPlayer.score;
            }
            console.log(`Updated score for ${player.name}: ${player.score}`);
        })
    }

    unregisterListeners(socket) {
        socket?.removeAllListeners("updateCanvas");
        socket?.removeAllListeners("playerVote");
    }

    start() {
    }
    stop() {
        this.stopTimer();
    }
}
