import { HintData } from "../../elements/Hint";
import { Room } from "../../elements/Playable";

const hint: HintData = {
  de: {
    title: "Test-Hinweis",
    subtitle: "Ein Test-Hinweis",
    transcript: "Dies ist nur zum testen hier.",
    filename: "Buzzer wrong answer sound effect.mp3",
  },
  en: {
    title: "Test Hint",
    subtitle: "A test hint",
    transcript: "This is just for testing",
    filename: "Guitar riff meme.mp3",
  },
  room: Room.YELLOW_ROOM,
};

export default hint;
