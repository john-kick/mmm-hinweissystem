import Playable, { Room } from "./Playable";

const BACKGROUNDSOUND_PATH = ".\\audio\\hintergrundsounds\\";

export interface BackgroundSoundJSONData {
  filename: string;
  room: string;
}

export interface BackgroundSoundData {
  filename: string;
  room: Room;
}

export default class BackgroundSound extends Playable {
  constructor(backgroundSoundData: BackgroundSoundData) {
    super();

    const color =
      backgroundSoundData.room === Room.YELLOW_ROOM ? "yellow" : "orange";
    const room = document.querySelector(`#room-${color}`) as HTMLDivElement;

    const playButton = room.querySelector(".play-button") as HTMLButtonElement;
    const pauseButton = room.querySelector(
      ".pause-button"
    ) as HTMLButtonElement;
    const stopButton = room.querySelector(".stop-button") as HTMLButtonElement;

    playButton.onclick = () => {
      this.play();
    };
    pauseButton.onclick = () => {
      this.pause();
    };
    stopButton.onclick = () => {
      this.stop();
    };

    this.audio = Playable.getAudioElement(
      BACKGROUNDSOUND_PATH + backgroundSoundData.filename,
      backgroundSoundData.room
    );

    this.setupProgressBar(room.querySelector(".progress") as HTMLDivElement);
  }

  play(): void {
    super.play();

    this.audio.onended = () => {
      this.audio.currentTime = 0;
      this.audio.play();
    };
  }
}
