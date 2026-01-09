class AudioManager {
  constructor() {
    this.unlocked = false;
    this.muted = localStorage.getItem("muted") === "true";
    this.ctx = null;
    this.queue = [];
    this.masterGain = null;
    this.playing = new Set();
  }

  async unlock() {
    if (this.unlocked) return;

    this.ctx = new (window.AudioContext || window.webkitAudioContext)();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.muted ? 0 : 1;
    this.masterGain.connect(this.ctx.destination);

    // Unlock audio
    const buffer = this.ctx.createBuffer(1, 1, 22050);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.masterGain);
    source.start();

    this.unlocked = true;

    // Play queued sounds
    this.queue.forEach((args) => this.play(...args));
    this.queue.length = 0;
  }

  play(path, { loop = false, volume = 1 } = {}) {
    if (!this.unlocked) {
      this.queue.push([path, { loop, volume }]);
      return;
    }
    if (this.muted) return;

    fetch(path)
      .then((r) => r.arrayBuffer())
      .then((b) => this.ctx.decodeAudioData(b))
      .then((buffer) => {
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = loop;

        const gain = this.ctx.createGain();
        gain.gain.value = volume;

        source.connect(gain).connect(this.masterGain);
        source.start();

        this.playing.add(source);
      });

    source.onended = () => this.playing.delete(source);
    return source;
  }

  stop(source) {
    if (!source) return;
    try {
      source.stop();
      this.playing.delete(source);
    } catch {}
  }

  stopAll() {
    for (let source of this.playing) {
      try {
        source.stop();
      } catch {}
    }
    this.playing.clear();
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem("muted", this.muted);
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : 1;
    }
  }
}

export const audioManager = new AudioManager();
