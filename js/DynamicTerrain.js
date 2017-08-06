/**
 * @author rkibria / http://rkibria.netlify.com/
 */

DynamicTerrain = function ( scene, camera ) {

this.scene = scene;
this.camera = camera;

this.TERRAIN_SIZE = 10;
this.TERRAIN_SEGMENTS = 4;
this.TERRAIN_TRACKS = this.TERRAIN_SEGMENTS + 1;
this.MIN_TILE_CREATE_RANGE = 15;

this.lastTpos = new THREE.Vector3();
this.curTpos = new THREE.Vector3();

this.TerrainTiles = new Map();
this.TriggerTerrainReset = true;

this.terrainHeightCallback = null;
this.terrainTextureCallback = null;

this.showWireframe = false;

// OBJECT POOLING VARIABLES
this.tmpDeleteTpos = new THREE.Vector3();
this.tmpTerrainHeightOutput = {rndMult: 0, z: 0};
this.tmpTerrainTextureOutput = {texture: null};

this.init = function(terrainHeightCallback, terrainTextureCallback) {
	this.terrainHeightCallback = terrainHeightCallback;
	this.terrainTextureCallback = terrainTextureCallback;
};

this.getCurrentTerrainPos = function() {
	this.curTpos.x = Math.floor(this.camera.position.x / this.TERRAIN_SIZE);
	this.curTpos.y = Math.floor(this.camera.position.z / this.TERRAIN_SIZE);
	this.curTpos.z = Math.floor(Math.sqrt(Math.abs(this.camera.position.y)));
}

this.getTerrainKey = function(tx, ty) {
	return tx + "/" + ty;
}

this.getPosFromTerrainKey = function(terrainKey, tpos) {
	var tokens = terrainKey.split("/");
	tpos.x = parseInt(tokens[0]);
	tpos.y = parseInt(tokens[1]);
}

this.getTerrainHeight = function(x, y) {
	this.terrainHeightCallback(x, y, this.tmpTerrainHeightOutput);

	var rndVal = 0;
	if (this.tmpTerrainHeightOutput.rndMult != 0) {
		var heightSeed = "x" + x + "y" + y;
		Math.seedrandom(heightSeed);
		rndVal = Math.random() * this.tmpTerrainHeightOutput.rndMult;
	}

	return rndVal + this.tmpTerrainHeightOutput.z;
}

this.generateTile = function(tx, ty) {
	var terrainGeometry = new THREE.PlaneGeometry( this.TERRAIN_SIZE, this.TERRAIN_SIZE, this.TERRAIN_SEGMENTS, this.TERRAIN_SEGMENTS );
	var index = 0;
	var bx = (tx + 0.5) * this.TERRAIN_SIZE;
	var by = (ty + 0.5) * this.TERRAIN_SIZE;
	for ( var i = 0; i < this.TERRAIN_TRACKS; i ++ ) {
		for ( var k = 0; k < this.TERRAIN_TRACKS; k ++ ) {
			var x = bx + (k / this.TERRAIN_SEGMENTS) * this.TERRAIN_SIZE;
			var y = by + ((this.TERRAIN_SEGMENTS - i) / this.TERRAIN_SEGMENTS) * this.TERRAIN_SIZE;
			var z = this.getTerrainHeight(x, y);
			terrainGeometry.vertices[index].z = -z;
			index += 1;
		}
	}

	var terrainMaterial;
	if (this.showWireframe) {
		var materialColor = (Math.abs(tx + ty) % 2) ? 0x00ff00 : 0x0000ff;
		terrainMaterial = new THREE.MeshBasicMaterial( {
			color: materialColor,
			side: THREE.DoubleSide,

			transparent: true,
			opacity: 0.9,

			polygonOffset: true,
			polygonOffsetFactor: 1,
			polygonOffsetUnits: 1
			} );
	}
	else {
		this.terrainTextureCallback(bx, by, this.tmpTerrainTextureOutput);
		terrainMaterial = new THREE.MeshBasicMaterial( {
			map: this.tmpTerrainTextureOutput.texture,
			side: THREE.DoubleSide
			} );
	}

	var terrainTile = new THREE.Mesh( terrainGeometry, terrainMaterial );

	if (this.showWireframe) {
		var geo = new THREE.EdgesGeometry( terrainTile.geometry ); // or WireframeGeometry
		var mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );
		var wireframe = new THREE.LineSegments( geo, mat );
		terrainTile.add( wireframe );
	}

	var waterGeometry = new THREE.PlaneGeometry( this.TERRAIN_SIZE, this.TERRAIN_SIZE );
	var waterMaterial = new THREE.MeshPhongMaterial( {
			color: 0x0000ff,
			side: THREE.DoubleSide,
			transparent: true,
			opacity: 0.5,
			wireframe: this.showWireframe
			});
	var waterMesh = new THREE.Mesh( waterGeometry, waterMaterial );
	terrainTile.add( waterMesh );

	terrainTile.position.x = (tx + 0.5) * this.TERRAIN_SIZE;
	terrainTile.position.y = 0;
	terrainTile.position.z = (ty + 0.5) * this.TERRAIN_SIZE;
	terrainTile.rotation.x = Math.PI/2;
	terrainTile.name = this.getTerrainKey(tx, ty);

	this.scene.add( terrainTile );

	return terrainTile;
}

this.removeTerrain = function(terrainKey) {
	var terrainValue = this.TerrainTiles[terrainKey];
	this.scene.remove(this.scene.getObjectByName(terrainKey));
	this.TerrainTiles.delete(terrainKey);
}

this.deleteTiles = function(tileDeleteRange) {
	toDelete = [];
	for (var terrainKey of this.TerrainTiles.keys()) {
		this.getPosFromTerrainKey(terrainKey, this.tmpDeleteTpos);
		if (Math.abs(this.tmpDeleteTpos.x - this.curTpos.x) > tileDeleteRange || Math.abs(this.tmpDeleteTpos.y - this.curTpos.y) > tileDeleteRange) {
			toDelete.push(terrainKey);
		}
	}

	if (toDelete.length > 0) {
		dLen = toDelete.length;
		for (i = 0; i < dLen; i++) {
			var terrainKey = toDelete[i];
			this.removeTerrain(terrainKey);
		}
	}
}

this.createTiles = function(tileCreateRange) {
	for (tx = this.curTpos.x - tileCreateRange; tx <= this.curTpos.x + tileCreateRange; tx++) {
		for (ty = this.curTpos.y - tileCreateRange; ty <= this.curTpos.y + tileCreateRange; ty++) {
			var terrainKey = this.getTerrainKey(tx, ty);
			if (!this.TerrainTiles.has(terrainKey)) {
				var terrainValue = this.generateTile(tx, ty);
				this.TerrainTiles.set(terrainKey, terrainValue);
			}
		}
	}
}

this.updateTerrain = function() {
	this.getCurrentTerrainPos();

	if (!this.TriggerTerrainReset && this.curTpos.equals(this.lastTpos))
		return;

	var tileCreateRange = this.MIN_TILE_CREATE_RANGE + this.curTpos.z;

	var tileDeleteRange = tileCreateRange; // + 1; // When debugging don't add 1 to see pop-in and out easier
	if (this.TriggerTerrainReset) {
		tileDeleteRange = -1;
	}

	this.deleteTiles(tileDeleteRange);

	var t0 = performance.now();
	this.createTiles(tileCreateRange);
	var t1 = performance.now();
	console.log("createTiles(): " + (t1 - t0) + " ms")

	this.lastTpos.copy(this.curTpos);

	this.TriggerTerrainReset = false;
}

};
