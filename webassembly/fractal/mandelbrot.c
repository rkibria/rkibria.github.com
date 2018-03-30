/*
Compile command:
emcc mandelbrot.c -s WASM=1 -O3 -o mandelbrot.js
*/

#include <stdio.h>
#include <stdint.h>
#include <math.h>
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

    const double range = 255.0;
    const double zoom = width * (0.2);

    const double offsetX = 0.0;
    const double offsetY = offsetX * 1.2;
    const double centerX = 0.3 + offsetX;
    const double centerY = 0.0 + offsetY;

    const double firstRange = 0.1;
    const double secondRange = 0.9;

    printf("[C] dimensions %d x %d, with 3 bytes/pixel returning buffer size %d\n", width, height, bufSize);
    uint8_t values[bufSize];

    for (int i = 0; i < bufSize; i += 3)
    {
        const int x = (i / 3) % width;
        const int y = height - (i / (3 * height));

        const double dbX = (double) x;
        const double dbY = (double) y;

        const double cx = (centerX - width/2/zoom) + dbX / zoom;
        const double cy = (centerY - width/2/zoom) + dbY / zoom;

        const double k = c_mandelbrot(cx, cy, range);

        if (k <= firstRange)
            values[i] = (uint8_t) (sqrt(k / firstRange) * 255.0);
        else if (k <= secondRange)
            values[i+1] = (uint8_t) (sqrt(k / secondRange) * 255.0);
        else
            values[i+2] = (uint8_t) (k * 255.0);
    }

    return &values[0];
}
