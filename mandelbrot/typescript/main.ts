import mandelbrot_start, { Mandelbrot } from "./mandelbrot.js";

let obj: Mandelbrot;
let ids: number[] = [];

function update(): void {
  const stop: boolean = obj.execute();
  if (!stop) {
    ids.push(requestAnimationFrame(update));
  }
}

window.addEventListener(`load`, () => {
  mandelbrot_start().then(() => {
    obj = Mandelbrot.new(Math.random());
    update();
    //
    window.addEventListener(`click`, () => {
      obj.reset();
      update();
    });
    //
    window.addEventListener(`resize`, () => {
      for (const id of ids) {
        cancelAnimationFrame(id);
      }
      obj = Mandelbrot.new(Math.random());
    });
  });
});

