/**
 * @author rkibria / http://rkibria.netlify.com/
 */

var MULTIRAY = {
	Ray: null,
	Renderer: null,
	Scene: null,
	Sphere: null,
	Vector3: null,
};

(function (_export) {

/* ************************************
	CLASS: Ray
***************************************

METHODS:

at
set
toString

*/

function Ray () {
	this.origin = new Vector3();
	this.direction = new Vector3();
}

Ray.prototype.at = function(t, result) {
	return result.copy(this.direction).multiplyScalar(t).add(this.origin);
}

Ray.prototype.set = function(o, d) {
	this.origin.copy(o);
	this.direction.copy(d);
	return this;
}

Ray.prototype.toString = function rayToString() {
	return "Ray(" + String(this.origin) + "," + String(this.direction) + ")";
};

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
	console.log("[MULTIRAY] Canvas size", sW, "x", sH, "=", sW * sH, "rays");

	// Get canvas bitmap
	const ctx = canvas.getContext("2d");
	const imgData = ctx.getImageData(0, 0, sW, sH);

	this.renderToImageData(scene, depth, imgData, sW, sH);
	ctx.putImageData(imgData, 0, 0);
};

Renderer.prototype.renderToImageData = function(scene, depth, imgData, sW, sH) {
	if (depth < 1) {
		console.log("[MULTIRAY] depth < 1, not rendering");
		return;
	}
	this.maxDepth = depth;
	console.log("[MULTIRAY] Rendering", scene.objects.length, "objects with depth", this.maxDepth);

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

		//
		// color.copy(this._eyeRay.direction);
		color.mapFrom(this._eyeRay.direction, Math.abs);

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

addObject
toString

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

Scene.prototype.addObject = function(obj) {
	this.objects.push(obj);
};

Scene.prototype.toString = function sceneToString() {
	let out = "Scene(bg:" + String(this.backgroundColor) + ",light:" + this.light + "," + this.objects.length + ":[";
	for (let i = 0; i < this.objects.length; i++) {
		out += String(this.objects[i]) + " ";
	}
	out += "])";
	return out;
};

/* ************************************
	CLASS: Sphere
***************************************

METHODS:

toString

*/

function Sphere (center, radius = 0.0) {
	this.center = new Vector3();
	if (center !== undefined) {
		this.center.copy(center);
	}
	this.radius = radius;
}

Sphere.prototype.toString = function rayToString() {
	return "Sphere(" + String(this.center) + "," + this.radius + ")";
};

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
map
mapFrom
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

Vector3.prototype.map = function(f) {
	this.x = f(this.x);
	this.y = f(this.y);
	this.z = f(this.z);
	return this;
};

Vector3.prototype.mapFrom = function(v, f) {
	this.x = f(v.x);
	this.y = f(v.y);
	this.z = f(v.z);
	return this;
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
	return "V(" + this.x + ',' + this.y + ',' + this.z + ")";
};

/* ************************************
	Exports
**************************************/

_export.Ray = Ray;
_export.Renderer = Renderer;
_export.Scene = Scene;
_export.Sphere = Sphere;
_export.Vector3 = Vector3;

}(MULTIRAY));

/* ************************************
	TEST: Ray
**************************************/

(function () {
	let Ray = MULTIRAY.Ray;
	let Vector3 = MULTIRAY.Vector3;

	console.log("[MULTIRAY] Running Ray tests...");

	const r1 = new Ray();
	console.log("[MULTIRAY]", String(r1));

	r1.origin.set(10, 20, 30);
	r1.direction.set(1, 2, 3);
	const rv1 = new Vector3();
	r1.at(2.0, rv1);
	console.assert(rv1.x == 12 && rv1.y == 24 && rv1.z == 36);
}());

/* ************************************
	TEST: Scene
**************************************/

(function () {
	let Scene = MULTIRAY.Scene;
	let Sphere = MULTIRAY.Sphere;
	let Vector3 = MULTIRAY.Vector3;

	console.log("[MULTIRAY] Running Scene tests...");

	const scene = new Scene();

	const s1 = new Sphere();
	s1.center.set(0, 0, -2);
	s1.radius = 1;

	scene.addObject(s1);
	console.log("[MULTIRAY]", String(scene));
}());

/* ************************************
	TEST: Sphere
**************************************/

(function () {
	let Sphere = MULTIRAY.Sphere;
	let Vector3 = MULTIRAY.Vector3;

	console.log("[MULTIRAY] Running Sphere tests...");

	const s1 = new Sphere();
	console.log("[MULTIRAY]", String(s1));

	const rv1 = new Vector3(1, 2, 3);
	const s2 = new Sphere(rv1, 4);
	console.assert(s2.center.x == 1 && s2.center.y == 2 && s2.center.z == 3 && s2.radius == 4);
}());

/* ************************************
	TEST: Vector3
**************************************/

(function () {
	let Vector3 = MULTIRAY.Vector3;

	console.log("[MULTIRAY] Running Vector3 tests...");

	const rv1 = new Vector3();
	console.log("[MULTIRAY]", String(rv1));
	console.assert(rv1.x == 0 && rv1.y == 0 && rv1.z == 0);

	const rv2 = new Vector3(1, 2, 3);
	console.assert(rv2.x == 1 && rv2.y == 2 && rv2.z == 3);

	const rv3 = new Vector3(4, 5, 6);
	console.assert(rv3.x == 4 && rv3.y == 5 && rv3.z == 6);

	rv3.add(rv2);
	console.assert(rv3.x == 5 && rv3.y == 7 && rv3.z == 9);

	// (5,7,9)+(1,2,3)=(6,9,12)
	// (6,9,12)+(6,9,12)=(12,18,24)
	rv3.add(rv3.add(rv2));
	console.assert(rv3.x == 12 && rv3.y == 18 && rv3.z == 24);

	rv3.copy(rv2);
	console.assert(rv3.x == 1 && rv3.y == 2 && rv3.z == 3);

	rv2.addScalar(3);
	console.assert(rv2.x == 4 && rv2.y == 5 && rv2.z == 6);

	rv2.setScalar(0);
	console.assert(rv2.x == 0 && rv2.y == 0 && rv2.z == 0);

	rv2.set(1, 2, 3);
	console.assert(rv2.x == 1 && rv2.y == 2 && rv2.z == 3);

	// (1,2,3)+3*(1,2,3)=(1,2,3)+(3,6,9)=(4,8,12)
	rv2.addScaledVector(rv3, 3);
	console.assert(rv2.x == 4 && rv2.y == 8 && rv2.z == 12);

	rv1.set(99, 99, 99);
	rv2.set(1, 2, 3);
	rv3.set(7, 8, 9);
	rv1.addVectors(rv2, rv3);
	console.assert(rv1.x == 8 && rv1.y == 10 && rv1.z == 12);

	rv1.sub(rv3);
	console.assert(rv1.x == 1 && rv1.y == 2 && rv1.z == 3);

	rv1.subScalar(1);
	console.assert(rv1.x == 0 && rv1.y == 1 && rv1.z == 2);

	rv1.set(99, 99, 99);
	rv2.set(1, 2, 3);
	rv3.set(7, 8, 9);
	rv1.subVectors(rv2, rv3);
	console.assert(rv1.x == -6 && rv1.y == -6 && rv1.z == -6);

	rv1.set(1, 2, 3);
	rv2.set(1, 2, 3);
	console.assert(rv1.equals(rv2));
	rv2.set(5, 7, 3);
	console.assert(!rv1.equals(rv2));

	rv2.set(4, 9, 10);
	rv3.set(2, 3, 5);
	rv2.divide(rv3);
	console.assert(rv2.x == 2 && rv2.y == 3 && rv2.z == 2);

	rv2.set(4, 8, 10);
	rv2.divideScalar(2);
	console.assert(rv2.x == 2 && rv2.y == 4 && rv2.z == 5);

	rv2.set(4, 9, 10);
	rv3.set(2, 3, 5);
	rv2.multiply(rv3);
	console.assert(rv2.x == 8 && rv2.y == 27 && rv2.z == 50);

	rv2.set(4, 8, 10);
	rv2.multiplyScalar(2);
	console.assert(rv2.x == 8 && rv2.y == 16 && rv2.z == 20);

	rv1.set(99, 99, 99);
	rv2.set(1, 2, 3);
	rv3.set(7, 8, 9);
	rv1.multiplyVectors(rv2, rv3);
	console.assert(rv1.x == 7 && rv1.y == 16 && rv1.z == 27);

	rv1.set(2, 0, 0);
	console.assert(rv1.length() == 2);
	rv1.normalize();
	console.assert(rv1.length() == 1);
	console.assert(rv1.x == 1 && rv1.y == 0 && rv1.z == 0);

	rv1.set(1, 0, 0);
	rv2.set(0, 1, 0);
	rv3.crossVectors(rv1, rv2);
	console.assert(rv3.length() == 1);
	console.assert(rv3.x == 0 && rv3.y == 0 && rv3.z == 1);

	rv1.set(-1, -2, -5);
	rv1.map(Math.abs);
	console.assert(rv1.x == 1 && rv1.y == 2 && rv1.z == 5);
	rv2.set(-8, -4, -3);
	rv1.mapFrom(rv2, Math.abs);
	console.assert(rv1.x == 8 && rv1.y == 4 && rv1.z == 3);
}());
