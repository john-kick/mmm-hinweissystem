/**
 * Um Carts in der Cartwall hinzuzufügen, erstelle ein neues Objekt in diesem Format:
 *
 * 	{
 * 		de: {
 * 			title: 			Deutscher Titel
 * 			subtitle:		Deutscher Untertitel
 * 			tooltip: 		Deutscher Hinweis-Tooltip
 * 			filename: 	Name der deutschen Audiodatei. Muss im ordner /public/audio/hinweise/de/ enthalten sein.
 * 		},
 * 		en: {
 * 			title:			Englischer Titel
 * 			tooltip:		Englischer Hinweis-Tooltip
 * 			filename:		Name der englischen Audiodatei. Muss im ordner/public/audio/hinweise/en/ enthalten sein.
 * 		}
 * 		room:		Optional. YELLOW_ROOM | ORANGE_ROOM | BOTH. Dieser Sound wird nur für den angegebenen Raum abgespielt. BOTH ist Standard
 * 	}
 */
function getHints() {
  return [
    {
      de: {
        title: "Buzzer",
        subtitle: "Buzzer sound effect",
        tooltip: "Ich bin ein tooltip",
        filename: "Buzzer wrong answer sound effect.mp3",
      },
      en: {
        title: "Guitar",
        subtitle: "Sick guitar riff",
        tooltip: "I am a tooltip",
        filename: "Guitar riff meme.mp3",
      },
      room: YELLOW_ROOM,
    },
    {
      de: {
        title: "Versteck aufgedeckt",
        subtitle: "Ein Versteck wurde gefunden",
        tooltip: "Ich bin ein tooltip",
        filename: "Legend of Zelda Hidden Area Sound Effect.mp3",
      },
      en: {
        title: "Good evening, soab!",
        subtitle: "Kind evening from swidish guy",
        tooltip: "I am a tooltip",
        filename: "Guten Abend Hurensohn.mp3",
      },
      room: ORANGE_ROOM,
    },
    {
      de: {
        title: "Spiel zuende",
        subtitle: "Mario Coin sound effect",
        tooltip: "Ich bin ein tooltip",
        filename: "Mario coin sound effect.mp3",
      },
      en: {
        title: "Puddin' eatin'",
        subtitle: "EAT THE PUDDIN EAT THE PUDDIN EAT THE PUDDIN",
        tooltip: "I am a tooltip",
        filename: "issdenpuddingissdenpuddingissdenpuddingissdenpudding.mp3",
      },
      room: BOTH,
    },
  ];
}

function getOutroSounds() {
  return [];
}

/**
 * Hier werden die Hintergrundsound für die beiden Räume konfiguriert.
 * Im moment ist nur ein Sound pro Raum möglich. Wenn ein Sound geändert werden soll,
 * bitte nur den "filename" ändern.
 */
function getHintergrundSounds() {
  return [
    {
      room: YELLOW_ROOM,
      filename: "Aria Math.mp3",
    },
    {
      room: ORANGE_ROOM,
      filename: "Skyrim Theme.mp3",
    },
  ];
}

/**
 * @param {Number} relVolume Relative volume. E.g. 0.5 halves the volume
 * @param {Number} ms
 */
async function fadeBackground(relVolume, ms) {
  return new Promise((resolve) => {
    hintergrundSounds.forEach((audio) => {
      if (relVolume === 1) {
        resolve();
        return;
      }

      const target = audio.volume * relVolume;
      const diff = audio.volume - target;

      const stepSize = diff > 0 ? 0.1 : -0.1;
      const steps = diff / stepSize;

      let stepsTaken = 0;
      const i = setInterval(() => {
        audio.volume = Math.min(Math.max(audio.volume - stepSize, 0), 1);
        stepsTaken++;
        if (stepsTaken === steps) {
          audio.volume = target;
          clearInterval(i);
          resolve();
        }
      }, ms / steps);
    });
  });
}

let lang = "de";

const YELLOW_ROOM = -1;
const ORANGE_ROOM = 1;
const BOTH = 0;

const HINT_PATH = `.\\audio\\hinweise\\`;
const HINTERGRUND_PATH = `.\\audio\\hintergrundsound\\`;

const hintergrundSounds = [];
const outroSounds = [];
const helpSounds = [];

function getPannedSound(filename, room) {
  let snd = new Audio();
  let src = document.createElement("source");
  src.type = "audio/mpeg";
  src.src = filename;
  snd.appendChild(src);

  const audioCtx = new AudioContext();
  const panNode = audioCtx.createStereoPanner();

  const source = audioCtx.createMediaElementSource(snd);
  source.connect(panNode);
  panNode.connect(audioCtx.destination);

  panNode.pan.setValueAtTime(room, audioCtx.currentTime);
  return snd;
}

async function switchLanguage() {
  const cartwall = document.querySelector("#cartwall");
  const carts = cartwall.querySelectorAll(".cart");

  carts.forEach((cart) => {
    cart.remove();
  });

  lang = lang === "de" ? "en" : "de";

  // Stop all sounds
  outroSounds.concat(helpSounds).forEach((sound) => {
    sound.pause();
    sound.ended = true;
  });

  // Set background sounds to 100%
  hintergrundSounds.forEach((sound) => {
    sound.volume = document.querySelector("#master-volume").value / 100;
  });

  // Clear the language dependant sound arrays
  outroSounds.length = 0;
  helpSounds.length = 0;

  setupHints();
}

function addHint({ title, subtitle, tooltip, filename }, room = BOTH) {
  const template = document.querySelector("#hint-template");

  const cart = document
    .importNode(template.content, true)
    .querySelector(".cart");

  if (room === ORANGE_ROOM) {
    cart.classList.add("orange");
  } else if (room === YELLOW_ROOM) {
    cart.classList.add("yellow");
  }

  const cartTitle = cart.querySelector(".cart-title");
  cartTitle.innerHTML = title;

  const cartSubtitle = cart.querySelector(".cart-subtitle");
  cartSubtitle.innerHTML = subtitle;

  const cartTooltip = cart.querySelector(".cart-tooltip");
  cartTooltip.title = tooltip;

  playButton = cart.querySelector(".cart-play");
  tooptipButton = cart.querySelector(".cart-tooltip");
  stopButton = cart.querySelector(".cart-stop");

  const snd = getPannedSound(HINT_PATH + `${lang}\\` + filename, room);
  helpSounds.push(snd);

  playButton.onclick = () => {
    hintPlayBehavior(snd);
  };
  stopButton.onclick = () => {
    snd.pause();
    snd.currentTime = 0;
  };

  document.querySelector(".carts").append(cart);
}

async function hintPlayBehavior(snd) {
  let skipFadeout = false;
  helpSounds.forEach((sound) => {
    skipFadeout = skipFadeout || !sound.paused;
    sound.pause();
    sound.currentTime = 0;
  });
  if (!skipFadeout) {
    await fadeBackground(0.2, 200);
  }
  snd.play();
  // Possible improvement: Stop fading in if sound was interrupted by another sound
  snd.onended = async () => {
    snd.currentTime = 0;
    await fadeBackground(5, 200);
  };
}

function setupHints() {
  getHints().forEach((cart) => {
    addHint(cart[lang], cart["room"]);
  });
}

function setupRooms() {
  const music = getHintergrundSounds();

  music.forEach(({ room, filename }) => {
    const roomStr = room === YELLOW_ROOM ? "yellow" : "orange";
    const roomEl = document.querySelector(`#room-${roomStr}`);
    const snd = getPannedSound(HINTERGRUND_PATH + filename, room);
    hintergrundSounds.push(snd);

    const play = roomEl.querySelector(`#play-${roomStr}`);
    const pause = roomEl.querySelector(`#pause-${roomStr}`);
    const stop = roomEl.querySelector(`#stop-${roomStr}`);

    play.onclick = () => {
      snd.play();
      snd.onended = () => {
        snd.currentTime = 0;
        snd.play();
      };
    };

    pause.onclick = () => {
      snd.pause();
    };

    stop.onclick = () => {
      snd.ended = true;
      snd.pause();
    };
  });
}

function setup() {
  const masterVolume = document.querySelector("#master-volume");
  masterVolume.oninput = () => {
    hintergrundSounds.concat(outroSounds, helpSounds).forEach((sound) => {
      sound.volume = masterVolume.value / 100;
    });
  };

  setupHints();
  setupRooms();

  document.querySelector("#language-toggle").onclick = switchLanguage;
}

setup();
