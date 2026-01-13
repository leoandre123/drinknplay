export class AvatarSettings {
  body: number;
  mouth: number;
  eyes: number;

  constructor(body: number, mouth: number, eyes: number) {
    this.body = body;
    this.mouth = mouth;
    this.eyes = eyes;
  }

  static GetRandomAvatar() {
    return new AvatarSettings(
      Math.floor(Math.random() * 3),
      Math.floor(Math.random() * 2),
      Math.floor(Math.random() * 4)
    );
  }

  static readonly Default: AvatarSettings = new AvatarSettings(0, 0, 0);
}
