/*
Compile command:
emcc mandelbrot.c -s WASM=1 -O3 -o mandelbrot.js
*/

#include <stdio.h>
#include <stdlib.h>
#include <emscripten/emscripten.h>

int main(int argc, char ** argv) {
	printf("WebAssembly module loaded\n");
}

double EMSCRIPTEN_KEEPALIVE c_mandelbrot(double cx, double cy, double range) {
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
