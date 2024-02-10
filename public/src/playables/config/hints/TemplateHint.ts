import { HintData } from "../../elements/Hint";
import { Room } from "../../elements/Playable";

const hint: HintData = {
  de: {
    title: "Basis-Hinweis",
    subtitle: "Eine Vorlage für Hinweise",
    transcript: "Dies sollte nicht auf der Benutzeroberfläche erscheinen.",
    filename: "nix.mp3",
  },
  en: {
    title: "Base-Hint",
    subtitle: "A template for hints",
    transcript: "This should not appear in the UI",
    filename: "none.mp3",
  },
  room: Room.BOTH,
};

export default hint;
