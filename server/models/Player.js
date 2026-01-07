export class Player {
  constructor(name, id, socket, avatarSettings) {
    this.name = name;
    this.id = id;
    this.socket = socket;

    this.connected = false;
    this.disconnectedAt = 0;
    this.disconnectTimer = null;

    this.avatarSettings = avatarSettings;

    this.glassFillLevel = 0;
    this.drunkness = 0;
    this.score = 0;

    this.isReady = false;
  }
}
