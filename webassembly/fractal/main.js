"use strict";

const canvas = document.getElementById("wasmCanvas");

// https://stackoverflow.com/questions/4032179/how-do-i-get-the-width-and-height-of-a-html5-canvas
const SCREEN_WIDTH = canvas.scrollWidth;
const SCREEN_HEIGHT = canvas.scrollHeight;
console.log("Canvas size", SCREEN_WIDTH, "x", SCREEN_HEIGHT, "=", SCREEN_WIDTH*SCREEN_HEIGHT, "pixels");

const START_TIME = performance.now();

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

function js_render(imgData) {
    const range = 255;
    const animTime = 0; // performance.now() - START_TIME;
    const zoomTimed = (1 + Math.cos(animTime/1000)) / 2;
    const zoom = SCREEN_WIDTH * (0.2 + zoomTimed * 20);
    // const zoom = SCREEN_WIDTH / 3 * 1.2;
    const offsetX = Math.cos(animTime/1000)/10;
    const offsetY = offsetX * 1.2;
    const centerX = 0.3 + offsetX;
    const centerY = 0 + offsetY;

    for (let i = 0; i < imgData.data.length; i += 4) {
        const x = (i / 4) % SCREEN_WIDTH;
        const y = SCREEN_HEIGHT - (i / (4 * SCREEN_HEIGHT));

        const cx = (centerX - SCREEN_WIDTH/2/zoom) + x / zoom;
        const cy = (centerY - SCREEN_WIDTH/2/zoom) + y / zoom;

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

        if (cx*cx+cy*cy < 0.0001) {
            color.x = 1;
            color.y = 1;
            color.z = 1;
        }

        imgData.data[i] = Math.max (0, Math.min (255, color.x * 255));
        imgData.data[i+1] = Math.max (0, Math.min (255, color.y * 255));
        imgData.data[i+2] = Math.max (0, Math.min (255, color.z * 255));
        imgData.data[i+3] = 255;
    }
}

// Get canvas bitmap
const ctx = canvas.getContext("2d");
ctx.fillStyle="black";
ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
const imgData = ctx.getImageData(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

function c_render(imgData) {
    let t0 = performance.now();
    const imgPointer = _c_render_mandelbrot(SCREEN_WIDTH, SCREEN_HEIGHT);
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
    // window.requestAnimationFrame(drawFrame, canvas);

    const t0 = performance.now();
    c_render (imgData);
    const t1 = performance.now();

    ctx.putImageData(imgData, 0, 0);
    captionText(document.getElementById("wasmCanvas"), "WebAssembly render time: " + (t1 - t0) + " ms");
}());
