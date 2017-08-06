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

this.LastTerrainPos = null;
this.TerrainTiles = new Map();
this.TriggerTerrainReset = false;

this.init = function () {
	this.TerrainTexture = new THREE.TextureLoader().load( "images/graystone.jpg" );
	this.TerrainTexture.wrapS = THREE.RepeatWrapping;
	this.TerrainTexture.wrapT = THREE.RepeatWrapping;
};

this.getCurrentTerrainPos = function() {
	var tx = Math.floor(this.camera.position.x / this.TERRAIN_SIZE);
	var ty = Math.floor(this.camera.position.z / this.TERRAIN_SIZE);
	var tz = Math.floor(Math.sqrt(Math.abs(this.camera.position.y)));
	return new THREE.Vector3(tx, ty, tz);
}

this.getTerrainKey = function(tx, ty) {
	return tx + "/" + ty;
}

this.getPosFromTerrainKey = function(terrainKey) {
	tokens = terrainKey.split("/");
	var tx = parseInt(tokens[0]);
	var ty = parseInt(tokens[1]);
	return new THREE.Vector2(tx, ty);
}

this.getTerrainHeight = function(x, y) {
	var heightSeed = "x" + x + "y" + y;
	Math.seedrandom(heightSeed);

	var r = Math.random();
	var z = r * 4;

	var d = Math.sqrt(x*x + y*y);
	var w = Math.sin(d / 10) * 5 + (Math.sin(x/10) + Math.cos(y/10)) * 5;

	var h = w + z;

	return h;
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
			terrainGeometry.vertices[index].z = z;
			index += 1;
		}
	}

	var terrainMaterial;
	if (GuiParameters.showWireframe) {
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
		terrainMaterial = new THREE.MeshBasicMaterial( {
			map: this.TerrainTexture,
			side: THREE.DoubleSide
			} );
	}

	var terrainTile = new THREE.Mesh( terrainGeometry, terrainMaterial );

	if (GuiParameters.showWireframe) {
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
			wireframe: GuiParameters.showWireframe
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

this.deleteTiles = function(curTpos, tileDeleteRange) {
	toDelete = [];
	for (var terrainKey of this.TerrainTiles.keys()) {
		var tpos = this.getPosFromTerrainKey(terrainKey);
		if (Math.abs(tpos.x - curTpos.x) > tileDeleteRange || Math.abs(tpos.y - curTpos.y) > tileDeleteRange) {
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

this.createTiles = function(curTpos, tileCreateRange) {
	for (tx = curTpos.x - tileCreateRange; tx <= curTpos.x + tileCreateRange; tx++) {
		for (ty = curTpos.y - tileCreateRange; ty <= curTpos.y + tileCreateRange; ty++) {
			var terrainKey = this.getTerrainKey(tx, ty);
			if (!this.TerrainTiles.has(terrainKey)) {
				var terrainValue = this.generateTile(tx, ty);
				this.TerrainTiles.set(terrainKey, terrainValue);
			}
		}
	}
}

this.updateTerrain = function() {
	var curTpos = this.getCurrentTerrainPos();
	if (!this.TriggerTerrainReset && (this.LastTerrainPos !== null && curTpos.equals(this.LastTerrainPos)))
		return;

	var tileCreateRange = this.MIN_TILE_CREATE_RANGE + curTpos.z;

	var tileDeleteRange = tileCreateRange; // + 1; // When debugging don't add 1 to see pop-in and out easier
	if (this.TriggerTerrainReset) {
		tileDeleteRange = -1;
	}

	this.deleteTiles(curTpos, tileDeleteRange);

	var t0 = performance.now();
	this.createTiles(curTpos, tileCreateRange);
	var t1 = performance.now();
	console.log("createTiles(): " + (t1 - t0) + " ms")

	this.LastTerrainPos = this.getCurrentTerrainPos();

	this.TriggerTerrainReset = false;
}

};
