/*
Compile command:
emcc mandelbrot.c -s WASM=1 -O3 -o mandelbrot.js
*/

#include <stdio.h>
#include <stdint.h>
#include <emscripten/emscripten.h>

int main(int argc, char ** argv)
{
    printf("[C] WebAssembly module mandelbrot.c loaded\n");
}

double EMSCRIPTEN_KEEPALIVE c_mandelbrot(double cx, double cy, double range)
{
    double k = 0;
    double zx = 0;
    double zy = 0;
    do
    {
        const double xt = zx * zy;
        zx = zx * zx - zy * zy + cx;
        zy = 2.0 * xt + cy;
        k += 1.0;
    }
    while (k < range && (zx * zx + zy * zy) < 4.0);
    k /= range;
    return k;
}

uint8_t* EMSCRIPTEN_KEEPALIVE c_render_mandelbrot(int width, int height)
{
    const int bufSize = width * height * 3;

    printf("[C] dimensions %d x %d, with 3 bytes/pixel returning buffer size %d\n", width, height, bufSize);
    uint8_t values[bufSize];
    for (int i = 0; i < bufSize; i++) {
        values[i] = 13;
    }
    return &values[0];
}
