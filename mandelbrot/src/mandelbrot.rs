#![deny(missing_docs)]

//! Detects complex structures in the Mandelbrot set automatically and outputs the results as an image.  

/// Stores general two-dimensional information.
pub struct Coord<T> {
    /// horizontal
    pub x: T,
    /// vertical
    pub y: T,
}

/// Stores the result of the recurrence relations of the Mandelbrot set
pub struct Point {
    /// flag to tell the convergence of the recurrence relation
    pub is_diverged: bool,
    /// number of iterations to diverge
    pub iter: u32,
}

/// Finds a nice image center so that the resulting image has something to display.
///
/// * `length` - Domain length.
/// * `center` - Center of the image.
pub fn execute(
    max_iter: u32,
    factor: f64,
    resols: &Coord<usize>,
    lengths: &mut Coord<f64>,
    center: &mut Coord<f64>,
    points: &mut Vec<Point>,
) -> Result<[u32; 2], ()> {
    // consider a rougher image for faster check
    let deltas = Coord::<f64> {
        x: lengths.x / resols.x as f64,
        y: lengths.y / resols.y as f64,
    };
    match solve(max_iter, factor, &deltas, resols, center, points) {
        Ok(extrema) => {
            lengths.x *= factor;
            lengths.y *= factor;
            return Ok(extrema);
        }
        // no structure is found inside the domain
        // try another random seed to change the initial condition
        Err(_) => return Err(()),
    }
}

/// Computes the negtive / positive boundary of the given domain.
///   
/// This is a private function intended to be used only inside [`crate::mandelbrot`].
///   
/// * `sign`   - Side of the boundary of interest: negtive (-1) or positive (+1)
/// * `resol`  - Number of pixels in the direction
/// * `center` - Center of the domain in the direction
/// * `delta`  - Inter-pixel distance
/// * `factor` - Retraction factor
fn get_bound(sign: f64, resol: usize, center: f64, delta: f64, factor: f64) -> f64 {
    return center + sign * 0.5 * factor * resol as f64 * delta;
}

/// Solves the recurrence relation for each pixel to see the convergence and to count the number of iterations needed to diverge.
///   
/// * `center` - The center of the domain.
/// * `delta`  - The inter-pixel size.
/// * `resols` - The number of pixels in two directions.
fn solve(
    max_iter: u32,
    factor: f64,
    deltas: &Coord<f64>,
    resols: &Coord<usize>,
    center: &mut Coord<f64>,
    points: &mut Vec<Point>,
) -> Result<[u32; 2], ()> {
    // left-bottom corner
    let corner: Coord<f64> = Coord {
        x: get_bound(-1., resols.x, center.x, deltas.x, 1.),
        y: get_bound(-1., resols.y, center.y, deltas.y, 1.),
    };
    // minimum / maximum number of iterations
    let mut extrema: [u32; 2] = [u32::MAX, u32::MIN];
    // complexity
    let mut vals: [i32; 4] = [0; 4];
    let mut mins: [i32; 4] = [0; 4];
    let mut maxs: [i32; 4] = [0; 4];
    for j in 0..resols.y {
        let y: f64 = corner.y + j as f64 * deltas.y;
        for i in 0..resols.x {
            let x: f64 = corner.x + i as f64 * deltas.x;
            let ii: usize = if i < resols.x / 2 { 0 } else { 1 };
            let jj: usize = if j < resols.y / 2 { 0 } else { 1 };
            let p: Point = kernel(max_iter, &Coord::<f64> { x, y });
            extrema[0] = extrema[0].min(p.iter);
            extrema[1] = extrema[1].max(p.iter);
            let val: i32 = if p.is_diverged { 1 } else { -1 };
            vals[jj * 2 + ii] += val;
            mins[jj * 2 + ii] -= 1;
            maxs[jj * 2 + ii] += 1;
            points[j * resols.x + i] = p;
        }
    }
    if vals == maxs || vals == mins {
        return Err(());
    }
    // take out maximum and its index
    let index: usize = {
        let (index, &_) = vals
            .iter()
            .enumerate()
            .min_by_key(|&(_, val)| val.abs())
            .unwrap();
        index
    };
    let conditions: [[Coord<f64>; 2]; 4] = {
        // store two scalars for pretty print
        let sngl: f64 = 1.;
        let fctr: f64 = factor;
        [
            [Coord { x: sngl, y: sngl }, Coord { x: fctr, y: fctr }],
            [Coord { x: fctr, y: sngl }, Coord { x: sngl, y: fctr }],
            [Coord { x: sngl, y: fctr }, Coord { x: fctr, y: sngl }],
            [Coord { x: fctr, y: fctr }, Coord { x: sngl, y: sngl }],
        ]
    };
    let corners: [Coord<f64>; 2] = [
        Coord {
            x: get_bound(-1., resols.x, center.x, deltas.x, conditions[index][0].x),
            y: get_bound(-1., resols.y, center.y, deltas.y, conditions[index][0].y),
        },
        Coord {
            x: get_bound(1., resols.x, center.x, deltas.x, conditions[index][1].x),
            y: get_bound(1., resols.y, center.y, deltas.y, conditions[index][1].y),
        },
    ];
    center.x = 0.5 * corners[0].x + 0.5 * corners[1].x;
    center.y = 0.5 * corners[0].y + 0.5 * corners[1].y;
    return Ok(extrema);
}

/// Solves the recurrence relation for a single given point.
///   
/// * `p0` - A specific point in the complex plane to which the recurrence relation is considered.
fn kernel(max_iter: u32, p0: &Coord<f64>) -> Point {
    // p0: given   complex number (c)
    // p1: current complex number (z^n)
    // p2: next    complex number (z^{n+1})
    let mut p1: Coord<f64> = {
        let x: f64 = 0.;
        let y: f64 = 0.;
        Coord { x, y }
    };
    // solve recurrence relation to determine
    //   this pixel is inside/outside the Mandelbrot set
    let mut iter: u32 = 0;
    loop {
        // compute z^{n+1}
        let p2: Coord<f64> = {
            let x: f64 = p0.x + p1.x * p1.x - p1.y * p1.y;
            let y: f64 = p0.y + 2. * p1.x * p1.y;
            Coord { x, y }
        };
        iter = iter + 1;
        // check whether maximum number of iteration has been reached,
        //   i.e., this point has not diverged and thus inside Mandelbrot set
        if max_iter < iter {
            return Point {
                is_diverged: false,
                iter: max_iter,
            };
        }
        // check L^2 on the complex plane to see the divergence
        if 4. < p2.x.powi(2) + p2.y.powi(2) {
            return Point {
                is_diverged: true,
                iter: iter,
            };
        }
        // update z^n
        p1 = p2;
    }
}

#[cfg(test)]
mod test {
    use super::kernel;
    use super::Coord;
    use super::Point;
    #[test]
    fn case0() -> () {
        let point: Point = kernel(1024, &Coord::<f64> { x: 2., y: 0. });
        assert_eq!(true, point.is_diverged);
        assert_eq!(2, point.iter);
    }
    #[test]
    fn case1() -> () {
        let point: Point = kernel(1024, &Coord::<f64> { x: 0., y: 0. });
        assert_eq!(false, point.is_diverged);
        assert_eq!(MAX_ITER, point.iter);
    }
    #[test]
    fn case2() -> () {
        let point: Point = kernel(1024, &Coord::<f64> { x: -2., y: 0. });
        assert_eq!(false, point.is_diverged);
        assert_eq!(MAX_ITER, point.iter);
    }
}
