import { Minigame } from "../Minigame.js";

export class ReactionGame extends Minigame {
  constructor() {
    super();
    this.submissions = []; // { id, amount }
    this.roundActive = false;
  }

  onPlayerJoined(player) {
    // init per player om du vill
    this.emitToPlayer(player.id, "reaction:ready");
    this.broadcastHosts("reaction:setPlayerCount", this.context.players.length);
  }

  onPlayerDisconnected(player) {
    this.submissions = this.submissions.filter((x) => x.id !== player.id);
    this.broadcastHosts("reaction:setPlayerCount", this.context.players.length);
    this.broadcastHosts("reaction:setSubmissionCount", this.submissions.length);
  }

  registerListeners(socket) {
    socket.on("reaction:submit", (amount, name) => this.onSubmit(socket.id, amount, name));
  }

  unregisterListeners(socket) {
    socket.off("reaction:submit");
  }

  start() {
    // Starta en runda
    this.submissions = [];
    this.roundActive = true;

    // Säg till players/host att spelet startat
    this.broadcastPlayers("reaction:startRound");
    this.broadcastHosts("reaction:startRound");
    this.broadcastHosts("reaction:setSubmissionCount", 0);
  }

  stop() {
    this.roundActive = false;
  }

  onSubmit(playerId, amount) {
    if (!this.roundActive) return;

    // om spelaren redan submit: ignorera/ersätt
    const existing = this.submissions.find((x) => x.id === playerId);
    if (existing) return;

    this.submissions.push({ id: playerId, amount });

    // feedback till spelaren
    this.emitToPlayer(playerId, "reaction:submitted", amount);

    // uppdatera host (som kahoot gör med answercount)
    this.broadcastHosts("reaction:setSubmissionCount", this.submissions.length);

    // om alla submit: avsluta
    const totalPlayers = this.context.players.length;
    if (this.submissions.length >= totalPlayers) {
      this.finishRound();
    }
  }

  finishRound() {
    this.roundActive = false;

    // Skicka ALLA amounts till host (du sa: ingen annan behöver få)
    this.broadcastHosts("reaction:results", this.submissions);

    // gå vidare till result screen / nästa fas
    this.onFinished();
  }
}
