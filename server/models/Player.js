export class Player {
  constructor(name, id, socket, avatarSettings) {
    this.name = name;
    this.id = id;
    this.socket = socket;

    this.connected = false;
    this.disconnectedAt = 0;
    this.disconnectTimer = null;

    this.avatarSettings = avatarSettings;

    this.glassLevel = 0;
    this.drunkness = 0;
    this.score = 0;

    this.isReady = false;
    this.gameScore = 0;

    this.credits = 0;
    this.glassesToDrink = 0;
  }

  toDto() {
    return {
      name: this.name,
      id: this.id,

      connected: this.connected,
      disconnectedAt: this.disconnectedAt,

      avatarSettings: this.avatarSettings,

      glassLevel: this.glassLevel,
      drunkness: this.drunkness,
      score: this.score,

      isReady: this.isReady,
      gameScore: this.gameScore,

      credits: this.credits,
      glassesToDrink: this.glassesToDrink,
    };
  }
}
