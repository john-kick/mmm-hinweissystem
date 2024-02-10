import Playable, { Room } from "./Playable";

const BACKGROUNDSOUND_PATH = ".\\audio\\hintergrundsound\\";

export interface BackgroundSoundData {
  filename: string;
  room: Room;
}

export default class BackgroundSound extends Playable {
  constructor(backgroundSoundData: BackgroundSoundData) {
    super();

    this.audio = Playable.getAudioElement(
      BACKGROUNDSOUND_PATH + backgroundSoundData.filename,
      backgroundSoundData.room
    );

    const color =
      backgroundSoundData.room === Room.YELLOW_ROOM ? "yellow" : "orange";
    const room = document.querySelector(`#room-${color}`) as HTMLDivElement;

    const playButton = room.querySelector(".playbutton") as HTMLButtonElement;
    const pauseButton = room.querySelector(".pausebutton") as HTMLButtonElement;
    const stopButton = room.querySelector(".stopbutton") as HTMLButtonElement;

    playButton.onclick = () => {
      this.play();
    };
    pauseButton.onclick = () => {
      this.pause();
    };
    stopButton.onclick = () => {
      this.reset();
    };
  }
}
