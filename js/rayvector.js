/**
 * @author rkibria / http://rkibria.netlify.com/
 */

function Vector3 (x = 0, y = 0, z = 0) {
	this.x = x;
	this.y = y;
	this.z = z;
}

/*
METHODS:

add
addScalar
addScaledVector
copy
set
setScalar
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

Vector3.prototype.copy = function(v) {
	this.x = v.x;
	this.y = v.y;
	this.z = v.z;
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

Vector3.prototype.toString = function vector3ToString() {
	return "Vector3(" + this.x + '/' + this.y + '/' + this.z + ")";
};
