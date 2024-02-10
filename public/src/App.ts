import Hint, { HintData } from "./playables/elements/Hint";
import Outro, { OutroData } from "./playables/elements/Outro";
import BackgroundSound, {
  BackgroundSoundData,
} from "./playables/elements/BackgroundSound";
import playables from "./playables/config/playables";

interface BackgroundSounds {
  sound1: BackgroundSound;
  sound2: BackgroundSound;
}

export default class App {
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
      console.log("new instance");
      App.instance = new App();
    }
    console.log("got instance");
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

    this.setupHints(playables.hints);
    this.setupOutros(playables.outros);
  }

  public getBackgroundsoundsArray(): BackgroundSound[] {
    return Object.values(this.backgroundSounds);
  }

  public backgroundSounds!: BackgroundSounds;
  public outros: Outro[] = [];
  public hints: Hint[] = [];

  public fadeInterval: NodeJS.Timeout | undefined;

  public masterVolume: number = 1;

  private setupHints(hints: HintData[]) {
    hints.forEach((hintData: HintData) => {
      this.hints.push(new Hint(hintData));
    });
  }

  private setupOutros(outros: OutroData[]) {
    outros.forEach((outroData: OutroData) => {
      this.outros.push(new Outro(outroData));
    });
  }

  private setupBackgroundSounds(backgroundSoundsData: BackgroundSoundData[]) {
    const rooms = document.querySelector("rooms-wrapper") as HTMLDivElement;
    this.backgroundSounds = {
      sound1: new BackgroundSound(backgroundSoundsData[0]),
      sound2: new BackgroundSound(backgroundSoundsData[1]),
    };
  }

  public setup() {
    this.setupHints(playables.hints);
    this.setupOutros(playables.outros);
    this.setupBackgroundSounds(playables.backgroundsounds);
  }
}
