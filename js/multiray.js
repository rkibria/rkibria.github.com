/**
 * @author rkibria / http://rkibria.netlify.com/
 */

var MULTIRAY = {
	Renderer: null,
	Scene: null,
	Vector3: null,
};

(function (_export) {

/* ************************************
	CLASS: Renderer
***************************************

METHODS:

renderToCanvas
renderToImageData

*/

function Renderer () {
	this.VECTOR_UP = new Vector3(0, 1, 0);

	this.pixelcolor = new Vector3();
}

Renderer.prototype.renderToCanvas = function(scene, canvas) {
	// https://stackoverflow.com/questions/4032179/how-do-i-get-the-width-and-height-of-a-html5-canvas
	const sW = canvas.scrollWidth;
	const sH = canvas.scrollHeight;
	console.log("Canvas size", sW, "x", sH, "=", sW * sH, "rays");

	// Get canvas bitmap
	const ctx = canvas.getContext("2d");
	const imgData = ctx.getImageData(0, 0, sW, sH);

	this.renderToImageData(scene, imgData, sW, sH);
	ctx.putImageData(imgData, 0, 0);
};

Renderer.prototype.renderToImageData = function(scene, imgData, sW, sH) {
	console.log("Rendering objects:", scene.objects.length);

	const dataLen = imgData.data.length;
	for (let i = 0; i < dataLen; i += 4) {
		const x = (i / 4) % sW;
		const y = sH - (i / (4 * sH));

		this.pixelcolor.copy(scene.backgroundColor);

		const pixel = imgData.data;
		pixel[i] = Math.max (0, Math.min (255, this.pixelcolor.x * 255));
		pixel[i+1] = Math.max (0, Math.min (255, this.pixelcolor.y * 255));
		pixel[i+2] = Math.max (0, Math.min (255, this.pixelcolor.z * 255));
		pixel[i+3] = 255;
	}
}

/* ************************************
	CLASS: Scene
***************************************

METHODS:


*/

function Scene () {
	this.camera = {
		pos: new Vector3(0.0, 0.0, 0.0),
		point: new Vector3(0.0, 0.0, -1.0),
		fov: 45.0,
		};

	this.objects = [];

	this.backgroundColor = new Vector3(0.0, 0.0, 0.0);

	this.light = new Vector3(0.0, 0.0, 0.0);
}


/* ************************************
	CLASS: Vector3
***************************************

METHODS:

add
addScalar
addScaledVector
addVectors
copy
divide
divideScalar
equals
multiply
multiplyScalar
multiplyVectors
set
setScalar
sub
subScalar
subVectors
toString

*/

function Vector3 (x = 0.0, y = 0.0, z = 0.0) {
	this.x = x;
	this.y = y;
	this.z = z;
}

Vector3.prototype.add = function(v) {
	this.x += v.x;
	this.y += v.y;
	this.z += v.z;
	return this;
};

Vector3.prototype.addScalar = function(s) {
	this.x += s;
	this.y += s;
	this.z += s;
	return this;
};

Vector3.prototype.addScaledVector = function(v, s) {
	this.x += v.x * s;
	this.y += v.y * s;
	this.z += v.z * s;
	return this;
};

Vector3.prototype.addVectors = function(a, b) {
	this.x = a.x + b.x;
	this.y = a.y + b.y;
	this.z = a.z + b.z;
	return this;
};

Vector3.prototype.copy = function(v) {
	this.x = v.x;
	this.y = v.y;
	this.z = v.z;
	return this;
};

Vector3.prototype.divide = function(v) {
	this.x /= v.x;
	this.y /= v.y;
	this.z /= v.z;
	return this;
};

Vector3.prototype.divideScalar = function(s) {
	this.x /= s;
	this.y /= s;
	this.z /= s;
	return this;
};

Vector3.prototype.equals = function(v) {
	return this.x == v.x && this.y == v.y && this.z == v.z;
};

Vector3.prototype.multiply = function(v) {
	this.x *= v.x;
	this.y *= v.y;
	this.z *= v.z;
	return this;
};

Vector3.prototype.multiplyScalar = function(s) {
	this.x *= s;
	this.y *= s;
	this.z *= s;
	return this;
};

Vector3.prototype.multiplyVectors = function(a, b) {
	this.x = a.x * b.x;
	this.y = a.y * b.y;
	this.z = a.z * b.z;
	return this;
};

Vector3.prototype.set = function(x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
	return this;
};

Vector3.prototype.setScalar = function(s) {
	this.x = s;
	this.y = s;
	this.z = s;
	return this;
};

Vector3.prototype.sub = function(v) {
	this.x -= v.x;
	this.y -= v.y;
	this.z -= v.z;
	return this;
};

Vector3.prototype.subScalar = function(s) {
	this.x -= s;
	this.y -= s;
	this.z -= s;
	return this;
};

Vector3.prototype.subVectors = function(a, b) {
	this.x = a.x - b.x;
	this.y = a.y - b.y;
	this.z = a.z - b.z;
	return this;
};

Vector3.prototype.toString = function vector3ToString() {
	return "MULTIRAY.Vector3(" + this.x + '/' + this.y + '/' + this.z + ")";
};

/* ************************************
	Exports
**************************************/

_export.Renderer = Renderer;
_export.Scene = Scene;
_export.Vector3 = Vector3;

}(MULTIRAY));
