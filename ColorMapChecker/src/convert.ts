// convert HSV value [0:1] to RGB value [0:1]
// ref: https://github.com/python/cpython/blob/3.11/Lib/colorsys.py
export function hsvToRgb(
  hsv: [number, number, number],
): [number, number, number] {
  const h = hsv[0];
  const s = hsv[1];
  const v = hsv[2];
  if (0 === s) {
    return [v, v, v];
  }
  const f = 6 * h - Math.trunc(6 * h);
  const p = v * (1 - s);
  const q = v * (1 - s * f);
  const t = v * (1 - s * (1 - f));
  if (h < 1 / 6) {
    return [v, t, p];
  } else if (h < 2 / 6) {
    return [q, v, p];
  } else if (h < 3 / 6) {
    return [p, v, t];
  } else if (h < 4 / 6) {
    return [p, q, v];
  } else if (h < 5 / 6) {
    return [t, p, v];
  } else {
    return [v, p, q];
  }
}

// convert RGB value [0:1] to HSV value [0:1]
// ref: https://github.com/python/cpython/blob/3.11/Lib/colorsys.py
export function rgbToHsv(
  rgb: [number, number, number],
): [number, number, number] {
  const r = rgb[0];
  const g = rgb[1];
  const b = rgb[2];
  const min = Math.min(r, Math.min(g, b));
  const max = Math.max(r, Math.max(g, b));
  const h = (function () {
    if (min === max) {
      return 0;
    } else if (r === max) {
      const h = (g - b) / (max - min) / 6;
      return h + (h < 0 ? 1 : 0);
    } else if (g === max) {
      const h = (b - r) / (max - min) / 6 + 1 / 3;
      return h + (h < 0 ? 1 : 0);
    } else {
      const h = (r - g) / (max - min) / 6 + 2 / 3;
      return h + (h < 0 ? 1 : 0);
    }
  })();
  const s = (function () {
    if (0 !== max) {
      return (max - min) / max;
    } else {
      return 0;
    }
  })();
  const v = max;
  return [h, s, v];
}

// convert HSL value [0:1] to RGB value [0:1]
// https://www.peko-step.com/tool/hslrgb.html#google_vignette
export function hslToRgb(
  hsl: [number, number, number],
): [number, number, number] {
  const h = hsl[0];
  const s = hsl[1];
  const l = hsl[2];
  const min = l < 0.5 ? l - l * s : l - (1 - l) * s;
  const max = l < 0.5 ? l + l * s : l + (1 - l) * s;
  if (h < 1 / 6) {
    return [max, h * (max - min) + min, min];
  } else if (h < 2 / 6) {
    return [(2 / 6 - h) * (max - min) + min, max, min];
  } else if (h < 3 / 6) {
    return [min, max, (h - 2 / 6) * (max - min) + min];
  } else if (h < 4 / 6) {
    return [min, (4 / 6 - h) * (max - min) + min, max];
  } else if (h < 5 / 6) {
    return [(h - 4 / 6) * (max - min) + min, min, max];
  } else {
    return [max, min, (1 - h) * (max - min) + min];
  }
}
