/**
 * @author rkibria / http://rkibria.netlify.com/
 */

var MULTIRAY = {
	Ray: null,
	Renderer: null,
	Scene: null,
	Vector3: null,
};

(function (_export) {

/* ************************************
	CLASS: Ray
***************************************

METHODS:

set

*/

function Ray () {
	this.origin = new Vector3();
	this.direction = new Vector3();
}

Ray.prototype.set = function(o, d) {
	this.origin.copy(o);
	this.direction.copy(d);
}

/* ************************************
	CLASS: Renderer
***************************************

METHODS:

renderToCanvas
renderToImageData - main render loop

*/

function Renderer () {
	this.VECTOR_UP = new Vector3(0, 1, 0);

	this.maxDepth = 0;

	this._eyeRightVector = new Vector3();
	this._eyeUpVector = new Vector3();
	this._eyeVector = new Vector3();
	this._rayDirection = new Vector3();
	this._xcomp = new Vector3();
	this._ycomp = new Vector3();
	this._eyeRay = new Ray();
	this._traceStack = [];
}

Renderer.prototype.renderToCanvas = function(scene, depth, canvas) {
	// https://stackoverflow.com/questions/4032179/how-do-i-get-the-width-and-height-of-a-html5-canvas
	const sW = canvas.scrollWidth;
	const sH = canvas.scrollHeight;
	console.log("Canvas size", sW, "x", sH, "=", sW * sH, "rays");

	// Get canvas bitmap
	const ctx = canvas.getContext("2d");
	const imgData = ctx.getImageData(0, 0, sW, sH);

	this.renderToImageData(scene, depth, imgData, sW, sH);
	ctx.putImageData(imgData, 0, 0);
};

Renderer.prototype.renderToImageData = function(scene, depth, imgData, sW, sH) {
	if (depth < 1) {
		console.log("depth < 1, not rendering");
		return;
	}
	this.maxDepth = depth;
	console.log("Rendering", scene.objects.length, "objects with depth", this.maxDepth);

	if (this._traceStack.length < this.maxDepth) {
		this._traceStack = new Array(this.maxDepth);
		for (let i = 0; i < this.maxDepth; i++) {
			this._traceStack[i] = {
				// Inputs
				eyeRay: new Ray(),

				// Temps

				// Outputs
				color: new Vector3(),
				};
		}
	}

	this._eyeVector.subVectors (scene.camera.point, scene.camera.pos).normalize();
	this._eyeRightVector.crossVectors (this._eyeVector, this.VECTOR_UP).normalize();
	this._eyeUpVector.crossVectors (this._eyeRightVector, this._eyeVector).normalize();

	const fovRadians = Math.PI * (scene.camera.fov / 2) / 180;
	const halfWidth = Math.tan(fovRadians);

	const heightWidthRatio = sW / sH;
	const halfHeight = heightWidthRatio * halfWidth;

	const camerawidth = halfWidth * 2.0;
	const cameraheight = halfHeight * 2.0;
	const pixelWidth = camerawidth / (sW - 1.0);
	const pixelHeight = cameraheight / (sH - 1.0);

	const dataLen = imgData.data.length;
	for (let i = 0; i < dataLen; i += 4) {
		const x = (i / 4) % sW;
		const y = sH - (i / (4 * sH));

		// Compute the current eye ray
		this._xcomp.copy (this._eyeRightVector);
		this._xcomp.multiplyScalar ((x * pixelWidth) - halfWidth);

		this._ycomp.copy (this._eyeUpVector);
		this._ycomp.multiplyScalar ((y * pixelHeight) - halfHeight);

		this._rayDirection.copy (this._eyeVector);
		this._rayDirection.add (this._xcomp);
		this._rayDirection.add (this._ycomp).normalize();

		this._eyeRay.set (scene.camera.pos, this._rayDirection);

		//
		const color = this._traceStack[0].color;
		color.copy(scene.backgroundColor);

		const pixel = imgData.data;
		pixel[i] = Math.max (0, Math.min (255, color.x * 255));
		pixel[i+1] = Math.max (0, Math.min (255, color.y * 255));
		pixel[i+2] = Math.max (0, Math.min (255, color.z * 255));
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
crossVectors
divide
divideScalar
equals
length
multiply
multiplyScalar
multiplyVectors
normalize
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

Vector3.prototype.crossVectors = function(a, b) {
	const ax = a.x, ay = a.y, az = a.z;
	const bx = b.x, by = b.y, bz = b.z;

	this.x = ay * bz - az * by;
	this.y = az * bx - ax * bz;
	this.z = ax * by - ay * bx;

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

Vector3.prototype.length = function() {
	return Math.sqrt (this.x * this.x + this.y * this.y + this.z * this.z);
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

Vector3.prototype.normalize = function() {
	return this.divideScalar (this.length());
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

_export.Ray = Ray;
_export.Renderer = Renderer;
_export.Scene = Scene;
_export.Vector3 = Vector3;

}(MULTIRAY));
