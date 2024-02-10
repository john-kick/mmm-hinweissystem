import App from "../../App";
import Playable, { Room } from "./Playable";
import { fadeBackground } from "../../VolumeControl";

const HINT_PATH = ".\\audio\\hinweise\\";

export interface HintJSONData {
  de: HintLanguageData;
  en: HintLanguageData;
  room?: string;
}

interface HintLanguageData {
  title: string;
  subtitle: string;
  transcript: string;
  filename: string;
}

export interface HintData {
  de: HintLanguageData;
  en: HintLanguageData;
  room?: Room;
}

export default class Hint extends Playable {
  private static cartwall = document.querySelector(
    "#cartwall"
  ) as HTMLDivElement;
  private static hintTemplate = document.querySelector(
    "#hint-template"
  ) as HTMLTemplateElement;

  private cart: HTMLDivElement;
  public getCart(): HTMLDivElement {
    return this.cart;
  }

  constructor(private hintData: HintData) {
    super();
    this.cart = this.render();
  }

  async play(): Promise<void> {
    const app = App.getInstance();
    // If another hint was playing fading out is not needed
    let skipFadeout = false;

    // Stop and reset all help sounds (including itself)
    app.hints.forEach((hint) => {
      skipFadeout = skipFadeout || !hint.getPaused();
      hint.stop();
    });

    if (!skipFadeout) {
      // Fade background to make the hint more audible
      await fadeBackground(0.2);
    }

    // Play the hint sound
    super.play();

    // When done playing: Reset the hint sound and reset background sound volume.
    this.audio.onended = async () => {
      this.reset();
      await fadeBackground(1);
    };
  }
  stop(): void {
    super.stop();
  }

  /**
   * Builds an HTMLElement representing the cart
   */
  render(): HTMLDivElement {
    const lang = App.getInstance().getLanguage();
    const usedData = this.hintData[lang as keyof HintData] as HintLanguageData;

    this.audio = Playable.getAudioElement(
      HINT_PATH + lang + "\\" + usedData.filename,
      this.hintData.room
    );

    // Get the cart object
    const cart = document
      .importNode(Hint.hintTemplate.content, true)
      .querySelector(".cart") as HTMLDivElement;

    // Apply color if room specific
    if (this.hintData.room === Room.YELLOW_ROOM) {
      cart.classList.add("yellow");
    } else if (this.hintData.room === Room.ORANGE_ROOM) {
      cart.classList.add("orange");
    }

    // Apply title, subtitle and tooltip
    const cartTitle = cart.querySelector(".title") as HTMLHeadingElement;
    cartTitle.innerHTML = usedData.title;

    const cartSubtitle = cart.querySelector(
      ".subtitle"
    ) as HTMLParagraphElement;
    cartSubtitle.innerHTML = usedData.subtitle;

    const cartTooltip = cart.querySelector(".tooltiptext") as HTMLButtonElement;
    cartTooltip.innerText = usedData.transcript;
    console.log(usedData.transcript);

    // Initialize audio buttons
    const playButton = cart.querySelector(".playbutton") as HTMLButtonElement;
    const stopButton = cart.querySelector(".stopbutton") as HTMLButtonElement;

    playButton.onclick = () => {
      this.play();
    };
    stopButton.onclick = () => {
      this.reset();
    };

    Hint.cartwall.append(cart);
    return cart;
  }

  destroy(): void {
    this.cart.remove();
  }
}
