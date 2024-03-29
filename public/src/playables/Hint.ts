import App from "../App";
import Playable, { Room } from "./Playable";
import { fadeBackground } from "../VolumeControl";

const HINT_PATH = ".\\audio\\hinweise\\";

export interface HintsData {
  yellow: JSONHintSection[];
  orange: JSONHintSection[];
  both: JSONHintSection[];
}

export interface JSONHintSection {
  id: string;
  name: string;
  hints: HintData[];
}

interface HintLanguageData {
  title: string;
  subtitle: string;
  transcript: string;
  filename: string;
}

interface HintData {
  de: HintLanguageData;
  en: HintLanguageData;
}

export default class Hint extends Playable {
  private static hintTemplate = document.querySelector(
    "#hint-template"
  ) as HTMLTemplateElement;

  public static sectionTemplate = document.querySelector(
    "#hint-section-template"
  ) as HTMLTemplateElement;

  private cart: HTMLDivElement;

  constructor(
    private hintData: HintData,
    private room: Room,
    private section: HTMLDivElement
  ) {
    super();
    this.cart = this.render();
  }

  public updateVolume(): void {
    const app = App.getInstance();
    this.audio.volume = app.masterVolume * app.hintVolume;
  }

  public getCart(): HTMLDivElement {
    return this.cart;
  }

  async play(): Promise<void> {
    const app = App.getInstance();
    let skipFadeout = this.handlePreviousHints(app);

    if (!skipFadeout) {
      await fadeBackground(0.1);
    }

    super.play();

    this.audio.onended = async () => {
      console.log("hint ended");
      this.reset();
      await fadeBackground(1);
    };
  }

  stop(): void {
    super.stop();
  }

  render(): HTMLDivElement {
    const lang = App.getInstance().getLanguage();
    const usedData = this.hintData[lang as keyof HintData] as HintLanguageData;

    const cart = this.createCartElement(usedData);

    this.section.append(cart);
    return cart;
  }

  private handlePreviousHints(app: App): boolean {
    let skipFadeout = false;

    app.hints.forEach((hint) => {
      skipFadeout = skipFadeout || !hint.getPaused();
      hint.pause();
      hint.reset();
    });

    return skipFadeout;
  }

  private createCartElement(usedData: HintLanguageData): HTMLDivElement {
    const cart = document
      .importNode(Hint.hintTemplate.content, true)
      .querySelector(".cart") as HTMLDivElement;

    this.setupCartContent(cart, usedData);
    this.setupAudioButtons(cart, usedData);

    return cart;
  }

  private setupCartContent(
    cart: HTMLDivElement,
    usedData: HintLanguageData
  ): void {
    cart.querySelector("h4")!.innerHTML = usedData.title;
    cart.querySelector(".subtitle")!.innerHTML = usedData.subtitle;
    (cart.querySelector(".tooltiptext") as HTMLSpanElement).innerText =
      usedData.transcript;
  }

  private setupAudioButtons(
    cart: HTMLDivElement,
    usedData: HintLanguageData
  ): void {
    const playButton = cart.querySelector(".play-button") as HTMLButtonElement;
    const stopButton = cart.querySelector(".stop-button") as HTMLButtonElement;
    const tipButton = cart.querySelector(
      ".tooltip-button"
    ) as HTMLButtonElement;

    playButton.onclick = () => this.play();
    stopButton.onclick = () => this.stop();
    this.setupTooltipButton(tipButton);

    let room = this.room;
    if (!this.room || this.room === Room.ORANGE_ROOM) {
      room = Room.BOTH;
    }

    this.audio = Playable.getAudioElement(
      HINT_PATH + App.getInstance().getLanguage() + "\\" + usedData.filename,
      room
    );

    this.setupProgressBar(cart.querySelector(".progress") as HTMLDivElement);
  }

  private setupTooltipButton(button: HTMLButtonElement): void {
    const tooltip = button.querySelector(".tooltip") as HTMLDivElement;
    tooltip.onclick = (event: MouseEvent) => {
      event.stopPropagation();
    };
    const offclickBehavior = (event: MouseEvent) => {
      if (
        button.classList.contains("active") &&
        !(event.target === tooltip || event.target === button)
      ) {
        button.classList.remove("active");
        document.removeEventListener("click", offclickBehavior);
      }
    };
    button.addEventListener("click", () => {
      if (button.classList.contains("active")) {
        button.classList.remove("active");
      } else {
        button.classList.add("active");
        document.addEventListener("click", offclickBehavior);
      }
    });
  }

  static getRoomString(room: Room): string {
    switch (room) {
      case Room.YELLOW_ROOM:
        return "yellow";
      case Room.ORANGE_ROOM:
        return "orange";
      default:
        return "both";
    }
  }

  static setupTabs(): void {
    this.setupTab("yellow", "#tab-button-yellow");
    this.setupTab("orange", "#tab-button-orange");
  }

  static switchCartwall(room: "yellow" | "orange"): void {
    const tabs = document.querySelectorAll(
      ".tab-content"
    ) as NodeListOf<HTMLDivElement>;

    tabs.forEach((tab) => {
      tab.style.display = "none";
    });

    this.updateTabLinks(room);
    this.updateHintsContainer(room);

    const cartWall = document.querySelector(
      `#cartwall-${room}`
    ) as HTMLDivElement;
    cartWall.style.display = "flex";
  }

  private static setupTab(room: "yellow" | "orange", buttonId: string): void {
    const button = document.querySelector(buttonId) as HTMLButtonElement;

    button.onclick = () => {
      Hint.switchCartwall(room);
    };
  }

  private static updateTabLinks(room: "yellow" | "orange"): void {
    const tablinks = document.querySelectorAll(
      ".tablink"
    ) as NodeListOf<HTMLDivElement>;

    tablinks.forEach((tablink) => {
      tablink.className = tablink.className.replace(" active", "");
    });

    const tablink = document.querySelector(
      `#tab-button-${room}`
    ) as HTMLButtonElement;
    tablink.className += " active";
  }

  private static updateHintsContainer(room: "yellow" | "orange"): void {
    const hintsContainer = document.querySelector(
      "#hints-container"
    ) as HTMLDivElement;
    hintsContainer.classList.remove("yellow", "orange");
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
