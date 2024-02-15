import App from "../../App";

export enum Room {
  YELLOW_ROOM = -1,
  ORANGE_ROOM = 1,
  BOTH = 0,
}

export default abstract class Playable {
  // Relative audio independent from master-volume
  protected volume: number = 1;
  protected audio!: HTMLAudioElement;

  public static getAudioElement(
    filepath: string,
    room: Room = Room.BOTH
  ): HTMLAudioElement {
    // Create an HTMLAudioElement and append the file as a source
    let audio = new Audio();
    let src = document.createElement("source");
    src.type = "audio/mpeg";
    src.src = filepath;
    audio.appendChild(src);

    // Create a panNode and pan the sound to the correct audio channel
    const audioCtx = new AudioContext();
    const panNode = audioCtx.createStereoPanner();
    const source = audioCtx.createMediaElementSource(audio);

    source.connect(panNode);
    panNode.connect(audioCtx.destination);
    panNode.pan.setValueAtTime(room, audioCtx.currentTime);

    return audio;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(volume: number): void {
    const app = App.getInstance();
    if (volume < 0 || volume > 1) {
      throw new Error("Volume must be between 0 and 1");
    }

    this.volume = volume;
    this.audio.volume = this.volume * app.masterVolume;
  }

  public setMasterVolume(volume: number): void {
    this.audio.volume = this.volume * volume;
  }

  public getPaused(): boolean {
    return this.audio.paused;
  }

  play(): void {
    this.audio.play();
  }

  pause(): void {
    this.audio.pause();
  }

  stop(): void {
    this.audio.pause();
    this.reset();
  }

  reset(): void {
    this.audio.currentTime = 0;
  }

  setupProgressBar(container: HTMLDivElement): void {
    const progressLabel = container.querySelector(
      ".progress-label"
    ) as HTMLLabelElement;
    const progressBar = container.querySelector(
      "progress"
    ) as HTMLProgressElement;

    this.audio.onloadeddata = () => {
      progressLabel.innerText = this.updateProgressLabel(
        this.audio.currentTime,
        this.audio.duration
      );

      this.audio.ontimeupdate = () => {
        progressBar.value = this.audio.currentTime / this.audio.duration;
        progressLabel.innerText = this.updateProgressLabel(
          this.audio.currentTime,
          this.audio.duration
        );
      };
    };
  }

  private updateProgressLabel(current: number, max: number): string {
    const currMinutes = Math.floor(current / 60);
    const currRemainingSeconds = Math.floor(current % 60);
    const currFormattedTime = `${currMinutes}:${
      currRemainingSeconds < 10 ? "0" : ""
    }${currRemainingSeconds}`;

    const maxMinutes = Math.floor(max / 60);
    const maxRemainingSeconds = Math.floor(max % 60);
    const maxFormattedTime = `${maxMinutes}:${
      maxRemainingSeconds < 10 ? "0" : ""
    }${maxRemainingSeconds}`;

    return `${currFormattedTime}/${maxFormattedTime}`;
  }
}
