import BackgroundSound, {
  BackgroundSoundData,
  BackgroundSoundJSONData,
} from "./playables/elements/BackgroundSound";
import Hint, { HintsData, JSONHintSection } from "./playables/elements/Hint";
import Outro, { OutroData } from "./playables/elements/Outro";
import { Room } from "./playables/elements/Playable";

interface BackgroundSounds {
  sound1: BackgroundSound;
  sound2: BackgroundSound;
}

export default class App {
  private hintsData!: HintsData;
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
      hint.stop();
      hint.destroy();
    });

    this.outros.forEach((outro) => {
      outro.stop();
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

  private setupHintsForRoom(roomData: JSONHintSection[], room: Room) {
    roomData.forEach((section) => {
      let sectionDiv = document.querySelector(`#${section.id}`);
      if (!sectionDiv) {
        sectionDiv = document
          .importNode(Hint.sectionTemplate.content, true)
          .querySelector(".section") as HTMLDivElement;
        sectionDiv.id = section.id;

        const sectionTitle = sectionDiv.querySelector(
          ".section-title"
        ) as HTMLHeadingElement;
        sectionTitle.innerText = section.name;

        (
          document.querySelector(
            `#cartwall-${Hint.getRoomString(room)}`
          ) as HTMLDivElement
        ).append(sectionDiv);
      }

      section.hints.forEach((hint) => {
        this.hints.push(new Hint(hint, room, sectionDiv as HTMLDivElement));
      });
    });
  }

  private setupHints() {
    this.setupHintsForRoom(this.hintsData.yellow, Room.YELLOW_ROOM);
    this.setupHintsForRoom(this.hintsData.orange, Room.ORANGE_ROOM);
    this.setupHintsForRoom(this.hintsData.both, Room.BOTH);
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

  public async setup() {
    await fetch("./soundConfig/hints.json")
      .then((res) => res.json())
      .then((data: HintsData) => {
        this.hintsData = data;
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

    Hint.setupTabs();
    this.setupHints();
    this.setupOutros();
    this.setupBackgroundSounds();
  }
}
