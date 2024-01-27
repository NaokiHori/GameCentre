import { Mode } from "./mode.js";
import { Board } from "./board.js";
import { Numkey } from "./numkey.js";
import { ClickEvents, KeyboardEvents } from "./event.js";

window.addEventListener(`load`, (/* event: Event */) => {
  Mode.initialise();
  Board.initialise();
  Numkey.initialise();
  ClickEvents.initialise();
  KeyboardEvents.initialise();
});

