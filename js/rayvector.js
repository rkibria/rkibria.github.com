/**
 * @author rkibria / http://rkibria.netlify.com/
 */

function RayVector (x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
}

RayVector.prototype.toString = function() {
	return this.x + ', ' + this.y + ', ' + this.z;
};
