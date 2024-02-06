////////////////////////////
///  vvvv  CONFIG  vvvv  ///
////////////////////////////
/**
 * Um Carts in der Cartwall hinzuzufuegen, erstelle ein neues Objekt in diesem Format:
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
 * 		room:		Optional. YELLOW_ROOM | ORANGE_ROOM | BOTH. Dieser Sound wird nur fuer den angegebenen Raum abgespielt. BOTH ist Standard
 * 	}
 */
function getHints() {
  return [
    {
      de: {
        title: "Münze",
        subtitle: "Münze wird eingesammelt",
        tooltip: '"Ka-Ching!"',
        filename: "Coin.mp3",
      },
      en: {
        title: "Harp",
        subtitle: "Dreamy harp melody",
        tooltip: "A harp plays",
        filename: "Harp.mp3",
      },
      room: YELLOW_ROOM,
    },
    {
      de: {
        title: "Versteck aufgedeckt",
        subtitle: "Ein Versteck wurde aufgedeckt",
        tooltip: "Mysteriöses Geräusch",
        filename: "Reveal.mp3",
      },
      en: {
        title: "Notification",
        subtitle: "Samsung notification sound",
        tooltip: '"Doo dee di dap dap"',
        filename: "Notification.mp3",
      },
      room: ORANGE_ROOM,
    },
    {
      de: {
        title: "Rollenvergabe",
        subtitle: "Aus Hit-Spiel Among Us",
        tooltip: "Verdächtiges Geräusch",
        filename: "RoleReveal.mp3",
      },
      en: {
        title: "Airhorn",
        subtitle: "Warning: Loud!",
        tooltip: "Loud airhorn",
        filename: "Airhorn.mp3",
      },
    },
  ];
}

/**
 * Konfiguration der Outros. Spielen immer fuer beide Raeume.
 */
function getOutros() {
  return {
    de: {
      winner: "win.mp3",
      loser: "lose.mp3",
    },
    en: {
      winner: "win.mp3",
      loser: "lose.mp3",
    },
  };
}

/**
 * Hier werden die Hintergrundsound fuer die beiden Raeume konfiguriert.
 * Im Moment nur ein Sound pro Raum moeglich.
 * Wenn ein Sound geaendert werden soll, nur den "filename" aendern.
 */
function getBackgroundSounds() {
  return [
    {
      room: YELLOW_ROOM,
      filename: "left.mp3",
    },
    {
      room: ORANGE_ROOM,
      filename: "right.mp3",
    },
  ];
}

let lang = "de"; // Sprache der outros und hinweise

// Pfade der Audiodateien.
// Alle Ordner muessen innerhalb des "public" Ordners liegen.
// HINT_PATH und OUTRO_PATH muessen die Ordner "de" und "en" enthalten, in welchen die Audiodateien vorhanden sein muessen.
const HINT_PATH = ".\\audio\\hinweise\\";
const OUTRO_PATH = ".\\audio\\outro\\";
const HINTERGRUND_PATH = ".\\audio\\hintergrund\\";

// Dauer des Fadens bis die Ziellautstärke erreicht wird. In Millisekunden
const FADE_DURATION = 1000;
// Anzahl der Schritte beim faden. Höhere Schrittzahlen geben
// weichere Veränderung, wirken sich aber auf die Performance aus.
// Empfohlene Schrittzahl: 20;
const FADE_STEPS = 20;

////////////////////////////
/// ^^^^ CONFIG END ^^^^ ///
////////////////////////////

// Used to determine the audio channels where the audio should be played
// -1 = Left | 1 = Right | 0 = Both
const YELLOW_ROOM = -1;
const ORANGE_ROOM = 1;
const BOTH = 0;

// Store all currently playable audio-objects
const backgroundSounds = [];
const outroSounds = [];
const helpAudios = [];

// Prefetching important HTMLElements
const masterVolume = document.querySelector("#master-volume");

const yellowRoom = document.querySelector("#room-yellow");
const orangeRoom = document.querySelector("#room-orange");

const hintTemplate = document.querySelector("#hint-template");
const outroTemplate = document.querySelector("#outro-template");

// Stores the setInterval() instance so that new fadeBackground calls can interrupt the old one
let fadeInterval;

setup();

/**
 * Removes all outro- and hint-carts and re-initializes them with the newly set language
 */
async function switchLanguage() {
  // Remove all currently displayed outro- and hint-carts
  const carts = document.querySelectorAll(".cart, .outrocart");
  carts.forEach((cart) => {
    cart.remove();
  });

  // Toggle language
  lang = lang === "de" ? "en" : "de";

  // Stop all sounds
  helpAudios.concat(outroSounds).forEach((sound) => {
    sound.pause();
    sound.ended = true;
  });

  // Set background sounds to 100%
  backgroundSounds.forEach((sound) => {
    sound.volume = masterVolume.value;
  });

  // Clear the language dependant sound arrays
  outroSounds.length = 0;
  helpAudios.length = 0;

  // Re-initialize outros and hints
  setupHints();
  setupOutros();
}

/**
 * @param {String} filename Path + name of the file
 * @param {YELLOW_ROOM | ORANGE_ROOM | BOTH} room YELLOW_ROOM | ORANGE_ROOM | BOTH: The room where the audio should be played
 * @returns HTMLAudioElement which is panned either to the left, right or both audio channels
 */
function getPannedSound(filename, room) {
  // Create an HTMLAudioElement and append the file as a source
  let snd = new Audio();
  let src = document.createElement("source");
  src.type = "audio/mpeg";
  src.src = filename;
  snd.appendChild(src);

  // Create a panNode and pan the sound to the correct audio channel
  const audioCtx = new AudioContext();
  const panNode = audioCtx.createStereoPanner();
  const source = audioCtx.createMediaElementSource(snd);

  source.connect(panNode);
  panNode.connect(audioCtx.destination);
  panNode.pan.setValueAtTime(room, audioCtx.currentTime);

  return snd;
}

/**
 * Fades both background sounds to the target value.
 * Amount of steps and fade duration are configured
 * in the configuration part at the top of the file
 *
 * @param {Number} target 0 < x < 1 relative of master volume
 */
async function fadeBackground(target) {
  // Clear previous fade attempt
  clearInterval(fadeInterval);
  const refAudio = backgroundSounds[0];

  const diff = target - refAudio.volume;

  // No need to fade if volume is already at the target or is nothing is playing
  if (
    diff === 0 ||
    (backgroundSounds[0].paused && backgroundSounds[1].paused)
  ) {
    return;
  }

  // Determine the stepsize and direction
  const stepSize = (diff * -1) / FADE_STEPS;
  const intervalDuration = FADE_DURATION / FADE_STEPS;

  let stepsTaken = 0;

  return new Promise((resolve) => {
    fadeInterval = setInterval(() => {
      backgroundSounds.forEach((audio) => {
        // Clamp audio volume between 0 and the master volume
        audio.volume = Math.min(
          Math.max(audio.volume - stepSize, 0),
          masterVolume.value
        );
      });

      stepsTaken++;

      // Stop if target has been reached or overshot
      if (stepsTaken >= FADE_STEPS) {
        refAudio.volume = target * masterVolume.value;
        clearInterval(fadeInterval);
        resolve();
      }
    }, intervalDuration);
  });
}

/**
 *
 * @param {Object} {title, subtitle, tooltip, filename}
 * @param {YELLOW_ROOM | ORANGE_ROOM | BOTH} room YELLOW_ROOM | ORANGE_ROOM | BOTH: The room where the audio should be played
 */
function addHint({ title, subtitle, tooltip, filename }, room = BOTH) {
  // Get the cart object
  const cart = document
    .importNode(hintTemplate.content, true)
    .querySelector(".cart");

  // Apply color if room specific
  if (room === ORANGE_ROOM) {
    cart.classList.add("orange");
  } else if (room === YELLOW_ROOM) {
    cart.classList.add("yellow");
  }

  // Apply title, subtitle and tooltip
  const cartTitle = cart.querySelector(".title");
  cartTitle.innerHTML = title;

  const cartSubtitle = cart.querySelector(".subtitle");
  cartSubtitle.innerHTML = subtitle;

  const cartTooltip = cart.querySelector(".tooltipbutton");
  cartTooltip.title = tooltip;

  // Initialize audio buttons
  playButton = cart.querySelector(".playbutton");
  tooltipButton = cart.querySelector(".tooltipbutton");
  stopButton = cart.querySelector(".stopbutton");

  const snd = getPannedSound(HINT_PATH + `${lang}\\` + filename, room);
  helpAudios.push(snd);

  playButton.onclick = () => {
    hintPlayBehavior(snd);
  };

  tooltipButton.title = tooltip;

  stopButton.onclick = () => {
    snd.pause();
    snd.currentTime = 0;
  };

  // Add to DOM
  document.querySelector("#cartwall").append(cart);
}

/**
 * Fades down the background sounds, plays the hint and fades up the background sounds again
 *
 * @param {HTMLAudioElement} audio The audio element which the behavior should be applied to
 */
async function hintPlayBehavior(audio) {
  // If another hint was playing fading out is not needed
  let skipFadeout = false;

  // Stop and reset all help sounds (including itself)
  helpAudios.forEach((helpAudio) => {
    skipFadeout = skipFadeout || !helpAudio.paused;
    helpAudio.pause();
    helpAudio.currentTime = 0;
  });

  if (!skipFadeout) {
    // Fade background to make the hint more audible
    await fadeBackground(0.2);
  }

  // Play the hint sound
  audio.play();

  // When done playing: Reset the hint sound and reset background sound volume.
  audio.onended = async () => {
    audio.currentTime = 0;
    await fadeBackground(1);
  };
}

/**
 *
 * @param {String} title Title of the outro cart
 * @param {String} filename Path + name of the audio file
 */
function addOutro(title, filename) {
  // Get the cart element
  const cart = document
    .importNode(outroTemplate.content, true)
    .querySelector(".outrocart");

  // Set the title
  const cartTitle = cart.querySelector(".title");
  cartTitle.innerHTML = title;

  // Initialize sound control
  playButton = cart.querySelector(".playbutton");
  stopButton = cart.querySelector(".stopbutton");

  const snd = getPannedSound(OUTRO_PATH + `${lang}\\` + filename, BOTH);
  helpAudios.push(snd);

  playButton.onclick = () => {
    outroPlayBehavior(snd);
  };
  stopButton.onclick = () => {
    snd.pause();
    snd.currentTime = 0;
  };

  // Add to DOM
  document.querySelector("#outros").append(cart);
}

/**
 * Fades the background sound volume to 0 and afterwards plays the outro audio
 *
 * @param {HTMLAudioElement} sound Audio element to apply the behavior to
 */
async function outroPlayBehavior(sound) {
  // Stop and reset all hint sounds
  helpAudios.forEach((hSound) => {
    hSound.pause();
    hSound.currentTime = 0;
  });

  // Fade background noises to 0
  await fadeBackground(0);

  // Stop and reset all background sounds
  backgroundSounds.forEach((bgSound) => {
    bgSound.pause();
    bgSound.currentTime = 0;
  });

  // Play the sound
  sound.play();

  // After playing: Reset the outro sound and reset the volume of the background sounds
  sound.onended = () => {
    sound.currentTime = 0;

    backgroundSounds.forEach((bgSound) => {
      bgSound.volume = masterVolume.value;
    });
  };
}

/**
 * Sets up the room carts and their audio control
 */
function setupRooms() {
  // Receive the two audio files, one for each room
  const music = getBackgroundSounds();

  music.forEach(({ room, filename }) => {
    // Generate audio object
    const roomStr = room === YELLOW_ROOM ? "yellow" : "orange";
    const roomEl = document.querySelector(`#room-${roomStr}`);
    const snd = getPannedSound(HINTERGRUND_PATH + filename, room);
    snd.setAttribute("data-test", filename);
    backgroundSounds.push(snd);

    // Initialize audio control
    const play = roomEl.querySelector(".playbutton");
    const pause = roomEl.querySelector(".pausebutton");
    const stop = roomEl.querySelector(".stopbutton");

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
      snd.pause();
      snd.currentTime = 0;
    };
  });
}

/**
 * Adds outro carts for each, winner and loser scenario, in the configured language.
 * Audio files are configured at the top of this file.
 */
function setupOutros() {
  const outros = getOutros()[lang];
  addOutro(lang === "de" ? "Sieger" : "Winner", outros["winner"]);
  addOutro(lang === "de" ? "Verlierer" : "Loser", outros["loser"]);
}

/**
 * Adds hints to the cartwall. Configured at the top of this file.
 */
function setupHints() {
  getHints().forEach((cart) => {
    addHint(cart[lang], cart["room"]);
  });
}

/**
 * Overall setup function
 */
function setup() {
  // Initialize the master volume controller
  masterVolume.oninput = () => {
    backgroundSounds.concat(outroSounds, helpAudios).forEach((sound) => {
      sound.volume = masterVolume.value;
    });
  };

  // Setup everything
  setupHints();
  setupOutros();
  setupRooms();

  document.querySelector("#language-toggle").onclick = switchLanguage;
}
