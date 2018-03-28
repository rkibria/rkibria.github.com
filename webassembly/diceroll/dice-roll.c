/*
Compile command:
emcc dice-roll.c -s WASM=1 -O3 -o dice.js
*/

#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <emscripten/emscripten.h>

int main(int argc, char ** argv) {
	time_t seed;
	seed = time(NULL);
	printf("WebAssembly module loaded, seed random number generator with %ld\n", seed);
	srand ( seed );
}

int EMSCRIPTEN_KEEPALIVE roll_dice() {
	return rand() % 6 + 1;
}
