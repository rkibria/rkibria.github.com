/**
 * @author rkibria / http://rkibria.netlify.com/
 */

function Vector3 (x = 0.0, y = 0.0, z = 0.0) {
	this.x = x;
	this.y = y;
	this.z = z;
}

/*
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
	return "Vector3(" + this.x + '/' + this.y + '/' + this.z + ")";
};
