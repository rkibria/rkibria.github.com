console.log("Get random numbers from WebAssembly module");
randoms = []
for(let i=0; i < 10; ++i)
{
	randoms.push(_roll_dice());
}
console.log("Random numbers:", randoms);
