import { BackgroundSoundData } from "../elements/BackgroundSound";
import { HintData } from "../elements/Hint";
import { OutroData } from "../elements/Outro";

import FirstHint from "../config/hints/FirstHint";
import FirstOutro from "../config/outros/FirstOutro";
import LeftBackgroundSound from "../config/background/LeftBackgroundSound";
import RightBackgroundSound from "../config/background/RightBackgroundSound";

const playables: {
  hints: HintData[];
  outros: OutroData[];
  backgroundsounds: BackgroundSoundData[];
} = {
  hints: [FirstHint],
  outros: [FirstOutro],
  backgroundsounds: [LeftBackgroundSound, RightBackgroundSound],
};

export default playables;
