#![deny(missing_docs)]

//! Entry point of the binary crate.

mod colormap;
mod mandelbrot;
mod random;

const LENGTH_EXTREMA: [f64; 2] = [1e+8 * f64::EPSILON, 4.];

/// Entry point of the binary crate.
pub fn main() -> () {
    let seed: u64 = 5;
    let canvas_sizes_h = mandelbrot::Coord::<usize> { x: 1280, y: 640 };
    let canvas_sizes_l = mandelbrot::Coord::<usize> { x: 160, y: 80 };
    let mut rng = random::Random::new(seed);
    let mut lengths = mandelbrot::Coord::<f64> { x: 0., y: 0. };
    {
        let cx: f64 = canvas_sizes_h.x as f64;
        let cy: f64 = canvas_sizes_h.y as f64;
        let cnorm: f64 = (cx.powi(2) + cy.powi(2)).sqrt();
        lengths.x = LENGTH_EXTREMA[1] * cx / cnorm;
        lengths.y = LENGTH_EXTREMA[1] * cy / cnorm;
    }
    let mut center = mandelbrot::Coord::<f64> {
        x: rng.gen_range(-1., 1.),
        y: rng.gen_range(-1., 1.),
    };
    let mut points = Vec::<mandelbrot::Point>::new();
    for _ in 0..canvas_sizes_h.x * canvas_sizes_h.y {
        points.push(mandelbrot::Point {
            is_diverged: false,
            iter: 0,
        });
    }
    let factor: f64 = 0.75;
    let max_iter: u32 = 1024;
    loop {
        let length: f64 = (lengths.x.powi(2) + lengths.y.powi(2)).sqrt();
        let progress: f64 =
            (length / LENGTH_EXTREMA[1]).log(2.) / (LENGTH_EXTREMA[0] / LENGTH_EXTREMA[1]).log(2.);
        let progress: f64 = if progress < 1. { progress } else { 1. };
        println!("progress: {}%", (100. * progress) as i32);
        let done: bool = length * factor < LENGTH_EXTREMA[0];
        let canvas_sizes: &mandelbrot::Coord<usize> = if done {
            &canvas_sizes_h
        } else {
            &canvas_sizes_l
        };
        match mandelbrot::execute(
            max_iter,
            factor,
            &canvas_sizes,
            &mut lengths,
            &mut center,
            &mut points,
        ) {
            Ok(_) => {}
            Err(_) => std::process::exit(1),
        };
        if length < LENGTH_EXTREMA[0] {
            break;
        }
    }
    // convert the results of the recurrence relation to an image
    let fname: &'static str = "image.ppm";
    // decide colormap
    const NCOLORMAPS: usize = 5;
    let colormap: &fn(f64) -> [u8; 3] = match seed as usize % NCOLORMAPS {
        0 => &(crate::colormap::magma as fn(f64) -> [u8; 3]),
        1 => &(crate::colormap::viridis as fn(f64) -> [u8; 3]),
        2 => &(crate::colormap::inferno as fn(f64) -> [u8; 3]),
        3 => &(crate::colormap::cividis as fn(f64) -> [u8; 3]),
        _ => &(crate::colormap::turbo as fn(f64) -> [u8; 3]),
    };
    match output(fname, colormap, &canvas_sizes_h, points) {
        Ok(_) => {}
        Err(_) => std::process::exit(1),
    };
}

/// Pixelises and outputs the result to an image.
///   
/// * `fname`        - Target file name
/// * `canvas_sizes` - Number of grid points
/// * `point`        - Result of the recurrence relation for each point
fn output(
    fname: &'static str,
    colormap: &fn(f64) -> [u8; 3],
    canvas_sizes: &mandelbrot::Coord<usize>,
    points: Vec<mandelbrot::Point>,
) -> Result<(), ()> {
    let nitems = canvas_sizes.x * canvas_sizes.y;
    let mut pixels: Vec<u8> = vec![0u8; nitems * 3];
    // find extrema
    let min: u32 = match points.iter().min_by_key(|point| point.iter) {
        Some(point) => point.iter,
        None => {
            println!("failed to find min");
            return Err(());
        }
    };
    let max: u32 = match points.iter().max_by_key(|point| point.iter) {
        Some(point) => point.iter,
        None => {
            println!("failed to find max");
            return Err(());
        }
    };
    let min: f64 = min as f64;
    let max: f64 = max as f64;
    // convert
    for n in 0..nitems {
        let iter: f64 = points[n].iter as f64;
        let iter: f64 = (iter - min) / (max - min);
        let val: [u8; 3] = colormap(iter);
        // convert to u8
        for m in 0..3 {
            pixels[3 * n + m] = val[m];
        }
    }
    // I assume *.ppm
    const MAGIC_NUMBER: &str = "P6";
    // open and prepare stream
    let file: std::fs::File = match std::fs::File::create(fname) {
        Ok(file) => file,
        Err(_) => {
            println!("failed to open file");
            return Err(());
        }
    };
    let mut stream: std::io::BufWriter<std::fs::File> = std::io::BufWriter::new(file);
    // fwrite
    let _size: usize = match std::io::Write::write(
        &mut stream,
        format!(
            "{}\n{} {}\n255\n",
            MAGIC_NUMBER, &canvas_sizes.x, &canvas_sizes.y
        )
        .as_bytes(),
    ) {
        Ok(size) => size,
        Err(_) => {
            println!("file write failed");
            return Err(());
        }
    };
    let _size: usize = match std::io::Write::write(&mut stream, &pixels) {
        Ok(size) => size,
        Err(_) => {
            println!("file write failed");
            return Err(());
        }
    };
    return Ok(());
}
