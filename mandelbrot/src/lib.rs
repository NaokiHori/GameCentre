//! Entry point of the library crate.

mod colormap;
mod drawer;
mod mandelbrot;
mod random;

const LENGTH_EXTREMA: [f64; 2] = [1e4 * f64::EPSILON, 4.];

/// A struct to store state, which is exposed to JavaScript.
#[wasm_bindgen::prelude::wasm_bindgen]
pub struct Mandelbrot {
    colormap: colormap::ColorMap,
    rng: random::Random,
    lengths: mandelbrot::Coord<f64>,
    canvas_sizes_h: mandelbrot::Coord<usize>,
    canvas_sizes_l: mandelbrot::Coord<usize>,
    center: mandelbrot::Coord<f64>,
    points: Vec<mandelbrot::Point>,
}

fn decide_colormap(rng: &mut random::Random) -> colormap::ColorMap {
    const NCOLORMAPS: usize = 5;
    let colormap: f64 = rng.gen_range(0., NCOLORMAPS as f64);
    let colormap: colormap::ColorMap = if colormap < 1. {
        colormap::ColorMap::Magma
    } else if colormap < 2. {
        colormap::ColorMap::Viridis
    } else if colormap < 3. {
        colormap::ColorMap::Inferno
    } else if colormap < 4. {
        colormap::ColorMap::Cividis
    } else {
        colormap::ColorMap::Turbo
    };
    return colormap;
}

#[wasm_bindgen::prelude::wasm_bindgen]
impl Mandelbrot {
    /// Initialisation.
    pub fn new(seed: f64) -> Mandelbrot {
        // initialise random number generator
        let rng = random::Random::new((seed * u64::MAX as f64) as u64);
        // get canvas sizes, high and low resolutions
        let canvas_sizes_h: [i32; 2] = drawer::get_canvas_size(false);
        let canvas_sizes_l: [i32; 2] = drawer::get_canvas_size(true);
        let canvas_sizes_h = mandelbrot::Coord::<usize> {
            x: canvas_sizes_h[0] as usize,
            y: canvas_sizes_h[1] as usize,
        };
        let canvas_sizes_l = mandelbrot::Coord::<usize> {
            x: canvas_sizes_l[0] as usize,
            y: canvas_sizes_l[1] as usize,
        };
        // buffer to store pixel information
        // allocate for higher resolution
        let mut points = Vec::<mandelbrot::Point>::new();
        for _ in 0..canvas_sizes_h.x * canvas_sizes_h.y {
            points.push(mandelbrot::Point {
                is_diverged: false,
                iter: 0,
            });
        }
        //
        let mut mandelbrot = Mandelbrot {
            colormap: colormap::ColorMap::Cividis,
            rng,
            lengths: mandelbrot::Coord::<f64> { x: 0., y: 0. },
            canvas_sizes_h,
            canvas_sizes_l,
            center: mandelbrot::Coord::<f64> { x: 0., y: 0. },
            points,
        };
        mandelbrot.reset();
        mandelbrot.execute();
        return mandelbrot;
    }

    pub fn reset(&mut self) -> () {
        let cx: f64 = self.canvas_sizes_l.x as f64;
        let cy: f64 = self.canvas_sizes_l.y as f64;
        let cnorm: f64 = (cx.powi(2) + cy.powi(2)).sqrt();
        self.colormap = decide_colormap(&mut self.rng);
        self.lengths.x = LENGTH_EXTREMA[1] * cx / cnorm;
        self.lengths.y = LENGTH_EXTREMA[1] * cy / cnorm;
        self.center = mandelbrot::Coord::<f64> {
            x: self.rng.gen_range(-1., 1.),
            y: self.rng.gen_range(-1., 1.),
        };
    }

    /// Check canvas size and draw an image to the canvas.
    pub fn execute(&mut self) -> bool {
        // find and draw
        let factor: f64 = 0.925;
        let length: f64 = (self.lengths.x.powi(2) + self.lengths.y.powi(2)).sqrt();
        let done: bool = factor * length < LENGTH_EXTREMA[0];
        let max_iter: u32 = if done { 4096 } else { 1024 };
        let canvas_sizes: &mandelbrot::Coord<usize> = if done {
            &self.canvas_sizes_h
        } else {
            &self.canvas_sizes_l
        };
        let extrema: [u32; 2] = match mandelbrot::execute(
            max_iter,
            factor,
            canvas_sizes,
            &mut self.lengths,
            &mut self.center,
            &mut self.points,
        ) {
            Ok(extrema) => extrema,
            Err(_) => {
                self.reset();
                return false;
            }
        };
        drawer::draw(
            (length / LENGTH_EXTREMA[1]).log(2.) / (LENGTH_EXTREMA[0] / LENGTH_EXTREMA[1]).log(2.),
            &self.colormap,
            extrema,
            canvas_sizes,
            &self.points,
        );
        return done;
    }
}

/// Handles things when the WASM is loaded.
///
/// For now nothing to do.
#[wasm_bindgen::prelude::wasm_bindgen(start)]
pub fn init() -> () {}
