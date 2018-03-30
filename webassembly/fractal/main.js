"use strict";

function js_mandelbrot(cx, cy, range) {
    let k = 0;
    let zx = 0;
    let zy = 0;
    do
    {
        const xt = zx * zy;
        zx = zx * zx - zy * zy + cx;
        zy = 2 * xt + cy;
        k++;
    }
    while(k < range && (zx * zx + zy * zy) < 4);
    k /= range;
    return k;
}

function js_render(canvas) {
    // https://stackoverflow.com/questions/4032179/how-do-i-get-the-width-and-height-of-a-html5-canvas
    const width = canvas.scrollWidth;
    const height = canvas.scrollHeight;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle="black";
    ctx.fillRect(0, 0, width, height);
    const imgData = ctx.getImageData(0, 0, width, height);

    const range = 255;
    const zoom = width * (0.2);

    const offsetX = 0;
    const offsetY = offsetX * 1.2;
    const centerX = 0.3 + offsetX;
    const centerY = 0 + offsetY;

    for (let i = 0; i < imgData.data.length; i += 4) {
        const x = (i / 4) % width;
        const y = height - (i / (4 * height));

        const cx = (centerX - width/2/zoom) + x / zoom;
        const cy = (centerY - width/2/zoom) + y / zoom;

        const k = js_mandelbrot(cx, cy, range);

        const color = {x: 0, y: 0, z: 0};

        const firstRange = 0.1;
        const secondRange = 0.9;
        if (k <= firstRange)
            color.x = Math.sqrt(k / firstRange);
        else if (k <= secondRange)
            color.y = Math.sqrt(k / secondRange);
        else
            color.z = k;

        imgData.data[i] = Math.max (0, Math.min (255, color.x * 255));
        imgData.data[i+1] = Math.max (0, Math.min (255, color.y * 255));
        imgData.data[i+2] = Math.max (0, Math.min (255, color.z * 255));
        imgData.data[i+3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
}

function c_render(canvas) {
    const width = canvas.scrollWidth;
    const height = canvas.scrollHeight;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle="black";
    ctx.fillRect(0, 0, width, height);
    const imgData = ctx.getImageData(0, 0, width, height);

    let t0 = performance.now();
    const imgPointer = _c_render_mandelbrot(width, height);
    let t1 = performance.now();
    console.log("c_render_mandelbrot time: " + (t1 - t0) + " ms");

    t0 = performance.now();
    let j = 0;
    for (let i = 0; i < imgData.data.length; ++i) {
        if (i % 4 == 3)
            imgData.data[i] = 255;
        else
            imgData.data[i] = Module.HEAPU8[imgPointer + (j++)];
    }
    ctx.putImageData(imgData, 0, 0);
    t1 = performance.now();
    console.log("image buffer transfer time: " + (t1 - t0) + " ms");
}

function captionText(canvas, txt) {
    const ctx = canvas.getContext("2d");
    const x = canvas.width/2;
    const y = canvas.height - 12;
    ctx.save();
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.setLineDash([]);
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'white';
    ctx.miterLimit = 2;
    ctx.lineJoin = 'circle';
    ctx.lineWidth = 3;
    ctx.strokeText(txt, x, y);
    ctx.lineWidth = 1;
    ctx.fillText(txt, x, y);
    ctx.restore();
}

(function drawFrame () {
    const wasmCanvas = document.getElementById("wasmCanvas");
    const t0 = performance.now();
    c_render (wasmCanvas);
    const t1 = performance.now();
    captionText(wasmCanvas, "WebAssembly render time: " + (t1 - t0) + " ms");

    const jsCanvas = document.getElementById("jsCanvas");
    const t0js = performance.now();
    js_render (jsCanvas);
    const t1js = performance.now();
    captionText(jsCanvas, "JS render time: " + (t1js - t0js) + " ms");
}());
