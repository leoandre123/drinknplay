export class Player {
  constructor(name, id, socket) {
    this.name = name;
    this.id = id;
    this.socket = socket;

    this.glassFillLevel = 0;
    this.drunkness = 0;
    this.score = 0;
  }
}
