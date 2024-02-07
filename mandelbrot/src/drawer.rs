use wasm_bindgen::prelude::*;

fn get_canvas() -> web_sys::HtmlCanvasElement {
    const CANVAS_ID: &'static str = "my-canvas";
    let document: web_sys::Document = web_sys::window().unwrap().document().unwrap();
    let canvas: web_sys::HtmlCanvasElement = document
        .get_element_by_id(CANVAS_ID)
        .unwrap()
        .dyn_into::<web_sys::HtmlCanvasElement>()
        .map_err(|_| ())
        .unwrap();
    return canvas;
}

fn get_context() -> web_sys::CanvasRenderingContext2d {
    let canvas: web_sys::HtmlCanvasElement = get_canvas();
    let context: web_sys::CanvasRenderingContext2d = canvas
        .get_context("2d")
        .unwrap()
        .unwrap()
        .dyn_into::<web_sys::CanvasRenderingContext2d>()
        .unwrap();
    return context;
}

fn get_progress() -> web_sys::HtmlElement {
    const ID: &'static str = "progress";
    let document: web_sys::Document = web_sys::window().unwrap().document().unwrap();
    let element: web_sys::HtmlElement = document
        .get_element_by_id(ID)
        .unwrap()
        .dyn_into::<web_sys::HtmlElement>()
        .map_err(|_| ())
        .unwrap();
    return element;
}

pub fn draw(
    progress: f64,
    colormap: &crate::colormap::ColorMap,
    extrema: [u32; 2],
    canvas_sizes: &crate::mandelbrot::Coord<usize>,
    points: &Vec<crate::mandelbrot::Point>,
) -> () {
    // update progress
    {
        let elem: &web_sys::HtmlElement = &get_progress();
        let progress: i32 = (100. * progress) as i32;
        let progress: String = format!("{:}%", progress);
        elem.set_text_content(Some(progress.as_str()));
    }
    // set canvas sizes, depending on the high / low resolutions
    let canvas: &web_sys::HtmlCanvasElement = &get_canvas();
    canvas.set_width(canvas_sizes.x as u32);
    canvas.set_height(canvas_sizes.y as u32);
    // draw as an imagedata
    let context: &web_sys::CanvasRenderingContext2d = &get_context();
    let image: web_sys::ImageData =
        web_sys::ImageData::new_with_sw(canvas_sizes.x as u32, canvas_sizes.y as u32).unwrap();
    let data: &mut wasm_bindgen::Clamped<Vec<u8>> = &mut image.data();
    for n in 0..canvas_sizes.x * canvas_sizes.y {
        let iter: f64 = (points[n].iter - extrema[0]) as f64 / (extrema[1] - extrema[0]) as f64;
        let color: [u8; 3] = crate::colormap::get(colormap, iter);
        data[4 * n + 0] = color[0];
        data[4 * n + 1] = color[1];
        data[4 * n + 2] = color[2];
        data[4 * n + 3] = 255u8;
    }
    let image = web_sys::ImageData::new_with_u8_clamped_array_and_sh(
        wasm_bindgen::Clamped(data),
        canvas_sizes.x as u32,
        canvas_sizes.y as u32,
    )
    .unwrap();
    context.put_image_data(&image, 0., 0.).unwrap();
}

pub fn get_canvas_size(give_low: bool) -> [i32; 2] {
    let canvas: &web_sys::HtmlCanvasElement = &get_canvas();
    let mut w: i32 = canvas.scroll_width();
    let mut h: i32 = canvas.scroll_height();
    if give_low {
        w = w.min(160);
        h = h.min(160);
    }
    return [w, h];
}
