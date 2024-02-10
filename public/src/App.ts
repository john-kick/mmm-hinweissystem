import Hint, { HintData, HintJSONData } from "./playables/elements/Hint";
import Outro, { OutroData } from "./playables/elements/Outro";
import BackgroundSound, {
  BackgroundSoundData,
  BackgroundSoundJSONData,
} from "./playables/elements/BackgroundSound";
import { Room } from "./playables/elements/Playable";

interface BackgroundSounds {
  sound1: BackgroundSound;
  sound2: BackgroundSound;
}

export default class App {
  private hintsData!: HintData[];
  private outrosData!: OutroData[];
  private backgroundsoundsData!: BackgroundSoundData[];

  constructor() {
    const masterVolumeEl = document.querySelector(
      "#master-volume"
    ) as HTMLInputElement;
    masterVolumeEl.oninput = () => {
      this.getBackgroundsoundsArray()
        .concat(this.outros, this.hints)
        .forEach((playable) => {
          this.masterVolume = +masterVolumeEl.value;
          playable.setMasterVolume(+masterVolumeEl.value);
        });
    };

    const langSwitch = document.querySelector(
      "#language-toggle"
    ) as HTMLInputElement;
    langSwitch.checked = false;
    langSwitch.oninput = () => {
      const lang = langSwitch.checked ? "en" : "de";
      this.switchLanguage(lang);
    };
  }

  private static instance: App;
  public static getInstance(): App {
    if (!App.instance) {
      App.instance = new App();
    }
    return App.instance;
  }

  private lang: "de" | "en" = "de";
  public getLanguage(): string {
    return this.lang;
  }
  public switchLanguage(lang?: "de" | "en"): void {
    if (lang) {
      this.lang = lang;
    } else {
      this.lang = this.lang === "de" ? "en" : "de";
    }

    this.hints.forEach((hint) => {
      hint.destroy();
    });

    this.outros.forEach((outro) => {
      outro.destroy();
    });

    this.hints.length = 0;
    this.outros.length = 0;

    this.setupHints();
    this.setupOutros();
  }

  public getBackgroundsoundsArray(): BackgroundSound[] {
    return Object.values(this.backgroundSounds);
  }

  public backgroundSounds!: BackgroundSounds;
  public outros: Outro[] = [];
  public hints: Hint[] = [];

  public fadeInterval: NodeJS.Timeout | undefined;

  public masterVolume: number = 1;

  private setupHints() {
    this.hintsData.forEach((hintData: HintData) => {
      this.hints.push(new Hint(hintData));
    });
  }

  private setupOutros() {
    this.outrosData.forEach((outroData: OutroData) => {
      this.outros.push(new Outro(outroData));
    });
  }

  private setupBackgroundSounds() {
    this.backgroundSounds = {
      sound1: new BackgroundSound(this.backgroundsoundsData[0]),
      sound2: new BackgroundSound(this.backgroundsoundsData[1]),
    };
  }

  setupTooltipBehavior() {
    document.querySelectorAll(".tooltipbutton").forEach((tooltipbutton) => {
      const tooltip = tooltipbutton.querySelector(".tooltip") as HTMLDivElement;
      tooltip.onclick = (event: MouseEvent) => {
        event.stopPropagation();
      };
      const offclickBehavior = (event: MouseEvent) => {
        if (
          tooltipbutton.classList.contains("active") &&
          !(event.target === tooltip || event.target === tooltipbutton)
        ) {
          tooltipbutton.classList.remove("active");
          document.removeEventListener("click", offclickBehavior);
        }
      };
      tooltipbutton.addEventListener("click", () => {
        if (tooltipbutton.classList.contains("active")) {
          tooltipbutton.classList.remove("active");
        } else {
          tooltipbutton.classList.add("active");
          document.addEventListener("click", offclickBehavior);
        }
      });
    });
  }

  public async setup() {
    await fetch("./soundConfig/hints.json")
      .then((res) => res.json())
      .then((data: HintJSONData[]) => {
        this.hintsData = data.map((hintData: HintJSONData) => {
          return {
            de: hintData.de,
            en: hintData.en,
            room:
              hintData.room === "gelb"
                ? Room.YELLOW_ROOM
                : hintData.room === "orange"
                ? Room.ORANGE_ROOM
                : Room.BOTH,
          };
        });
      });

    await fetch("./soundConfig/outros.json")
      .then((res) => res.json())
      .then((data) => {
        this.outrosData = data;
      });

    await fetch("./soundConfig/backgroundSounds.json")
      .then((res) => res.json())
      .then((data: BackgroundSoundJSONData[]) => {
        this.backgroundsoundsData = data.map((backgroundsoundData) => {
          return {
            filename: backgroundsoundData.filename,
            room:
              backgroundsoundData.room === "gelb"
                ? Room.YELLOW_ROOM
                : Room.ORANGE_ROOM,
          };
        });
      });

    this.setupHints();
    this.setupOutros();
    this.setupBackgroundSounds();

    this.setupTooltipBehavior();
  }
}
