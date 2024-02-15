import App from "../../App";
import Playable, { Room } from "./Playable";
import { fadeBackground } from "../../VolumeControl";
import Hint from "./Hint";
import BackgroundSound from "./BackgroundSound";

interface OutroLanguageData<T> {
  title: string;
  subtitle: T;
  filename: string;
}

export interface OutroData {
  de: OutroLanguageData<"Sieger" | "Verlierer">;
  en: OutroLanguageData<"Winner" | "Loser">;
}

const OUTRO_PATH = ".\\audio\\outros\\";

export default class Outro extends Playable {
  private static outroCartwall = document.querySelector(
    "#outros"
  ) as HTMLDivElement;
  private static outroTemplate = document.querySelector(
    "#outro-template"
  ) as HTMLTemplateElement;

  private cart: HTMLDivElement;
  public getCart(): HTMLDivElement {
    return this.cart;
  }

  constructor(private outroData: OutroData) {
    super();
    this.cart = this.render();
  }

  async play(): Promise<void> {
    const app = App.getInstance();
    // Stop and reset all hint sounds
    app.hints.forEach((hint: Hint) => {
      hint.stop();
    });
    app.outros.forEach((outro: Outro) => {
      outro.stop();
    });

    // Fade background noises to 0
    await fadeBackground(0);

    // Stop and reset all background sounds
    app
      .getBackgroundsoundsArray()
      .forEach((backgroundSound: BackgroundSound) => {
        backgroundSound.stop();
      });

    // Play the sound
    super.play();

    // After playing: Reset the outro sound and reset the volume of the background sounds
    this.audio.onended = () => {
      this.reset();

      app.getBackgroundsoundsArray().forEach((room) => {
        room.setVolume(app.masterVolume);
      });

      this.audio.onended = null;
    };
  }

  render(): HTMLDivElement {
    const lang = App.getInstance().getLanguage();
    const usedData = this.outroData[lang as keyof OutroData];

    // Get the cart element
    const cart = document
      .importNode(Outro.outroTemplate.content, true)
      .querySelector(".cart") as HTMLDivElement;

    // Set the title
    const cartTitle = cart.querySelector("h4") as HTMLHeadingElement;
    cartTitle.innerHTML = usedData.title;

    // Initialize sound control
    const playButton = cart.querySelector(".playbutton") as HTMLButtonElement;
    const stopButton = cart.querySelector(".stopbutton") as HTMLButtonElement;

    playButton.onclick = () => {
      this.play();
    };
    stopButton.onclick = () => {
      this.stop();
    };

    this.audio = Playable.getAudioElement(
      OUTRO_PATH + lang + "\\" + usedData.filename,
      Room.BOTH
    );

    this.setupProgressBar(cart.querySelector(".progress") as HTMLDivElement);

    Outro.outroCartwall.append(cart);
    return cart;
  }

  destroy(): void {
    this.cart.remove();
  }
}
