import App from "./App";
import Playable from "./playables/Playable";

const FADE_DURATION = 1000;
const FADE_STEPS = 20;

/** Sets the volume of all playables */
export function setMasterVolume(volume: number) {
  const app = App.getInstance();

  (app.hints as Playable[])
    .concat(app.outros, [
      app.backgroundSounds.sound1,
      app.backgroundSounds.sound2,
    ])
    .forEach((playable: Playable) => {
      playable.setVolume(volume);
    });
}

export async function fadeBackground(target: number) {
  const app = App.getInstance();
  // Clear previous fade attempt
  clearInterval(app.fadeInterval);
  const refAudio = app.backgroundSounds.sound1;

  const diff = target - refAudio.getVolume();

  // No need to fade if volume is already at the target or is nothing is playing
  if (
    diff === 0 ||
    (app.backgroundSounds.sound1.getPaused() &&
      app.backgroundSounds.sound2.getPaused())
  ) {
    return;
  }

  // Determine the stepsize and direction
  const stepSize = (diff * -1) / FADE_STEPS;
  const intervalDuration = FADE_DURATION / FADE_STEPS;
  let stepsTaken = 0;

  return new Promise<void>((resolve) => {
    app.fadeInterval = setInterval(() => {
      app.getBackgroundsoundsArray().forEach((room) => {
        // Clamp audio volume between 0 and 1
        room.setVolume(Math.min(Math.max(room.getVolume() - stepSize, 0), 1));
      });

      stepsTaken++;

      // Stop if target has been reached or overshot
      if (stepsTaken >= FADE_STEPS) {
        refAudio.setVolume(target);
        clearInterval(app.fadeInterval);
        resolve();
      }
    }, intervalDuration);
  });
}
