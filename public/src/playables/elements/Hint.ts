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

    // Get the cart object
    const cart = document
      .importNode(Hint.hintTemplate.content, true)
      .querySelector(".cart") as HTMLDivElement;

    // Apply title, subtitle and tooltip
    const cartTitle = cart.querySelector("h4") as HTMLHeadingElement;
    cartTitle.innerHTML = usedData.title;

    const cartSubtitle = cart.querySelector(
      ".subtitle"
    ) as HTMLParagraphElement;
    cartSubtitle.innerHTML = usedData.subtitle;

    const cartTooltip = cart.querySelector(".tooltiptext") as HTMLButtonElement;
    cartTooltip.innerText = usedData.transcript;

    // Initialize audio buttons
    const playButton = cart.querySelector(".playbutton") as HTMLButtonElement;
    const stopButton = cart.querySelector(".stopbutton") as HTMLButtonElement;

    playButton.onclick = () => {
      this.play();
    };
    stopButton.onclick = () => {
      this.reset();
    };

    this.audio = Playable.getAudioElement(
      HINT_PATH + lang + "\\" + usedData.filename,
      this.hintData.room
    );

    this.setupProgressBar(cart.querySelector(".progress") as HTMLDivElement);

    let roomStr: String;
    switch (this.hintData.room) {
      case Room.YELLOW_ROOM:
        roomStr = "yellow";
        break;
      case Room.ORANGE_ROOM:
        roomStr = "orange";
        break;
      default:
        roomStr = "both";
    }

    const cartwall = document.querySelector(
      `#cartwall-${roomStr}`
    ) as HTMLDivElement;
    cartwall.append(cart);
    return cart;
  }

  static setupTabs(): void {
    const yellowButton = document.querySelector(
      "#tab-button-yellow"
    ) as HTMLButtonElement;
    const orangeButton = document.querySelector(
      "#tab-button-orange"
    ) as HTMLButtonElement;

    yellowButton.onclick = () => {
      Hint.switchCartwall("yellow");
    };
    orangeButton.onclick = () => {
      Hint.switchCartwall("orange");
    };
  }

  static switchCartwall(room: "yellow" | "orange"): void {
    const tabs = document.querySelectorAll(
      ".tab-content"
    ) as NodeListOf<HTMLDivElement>;

    tabs.forEach((tab) => {
      tab.style.display = "none";
    });

    const tablinks = document.querySelectorAll(
      ".tablink"
    ) as NodeListOf<HTMLDivElement>;
    tablinks.forEach((tablink) => {
      tablink.className = tablink.className.replace(" active", "");
    });

    const hintsContainer = document.querySelector(
      "#hints-container"
    ) as HTMLDivElement;
    hintsContainer.classList.remove("yellow", "orange");

    const cartWall = document.querySelector(
      `#cartwall-${room}`
    ) as HTMLDivElement;
    cartWall.style.display = "flex";

    const tablink = document.querySelector(
      `#tab-button-${room}`
    ) as HTMLButtonElement;
    tablink.className += " active";

    hintsContainer.classList.add(room);
    const outros = document.querySelector(
      "#outros-container"
    ) as HTMLDivElement;
    outros.style.display = room === "orange" ? "block" : "none";
  }

  destroy(): void {
    this.cart.remove();
  }
}
