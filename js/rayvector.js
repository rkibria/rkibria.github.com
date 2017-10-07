/**
 * @author rkibria / http://rkibria.netlify.com/
 */

function Vector3 (x = 0, y = 0, z = 0) {
	this.x = x;
	this.y = y;
	this.z = z;
}

Vector3.prototype.toString = function vector3ToString() {
	return this.x + ', ' + this.y + ', ' + this.z;
};

Vector3.prototype.copy = function(v) {
	this.x = v.x;
	this.y = v.y;
	this.z = v.z;
	return this;
};

Vector3.prototype.add = function(v) {
	this.x += v.x;
	this.y += v.y;
	this.z += v.z;
	return this;
};
