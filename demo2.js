var scene;
var camera;
var renderer; 
var player;
var boxes = [];
var controlsEnabled = false;
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;
var jump = false;
var timer = 0;
var timer2 = 0;
var timepassed;
var raycaster = new THREE.Raycaster();
var loaded = false;
var firemode = 1;

function control(object){
	//console.log(player.getLinearVelocity().z()+" 1")
	if ( controlsEnabled ) {
		player.setActivationState(1);
		var velo = player.getLinearVelocity();
		//console.log(velo.x());
		//console.log(moveForward);
		//console.log(moveBackward);
		//player.setActivationState(1);
		var Vx = velo.x();
		var Vy = velo.y();
		var Vz = velo.z();
		
		mV = 0;
		mH = 0;
		if ( moveForward ) mV = 1;//new Ammo.btVector3( 10 , velo.y() , 0 ));
		if ( moveBackward ) mV = -1;//new Ammo.btVector3( -10 , velo.y() , 0 ));
		if ( moveLeft ) mH = 1;//new Ammo.btVector3( 0 , velo.y() , 10 ));
		if ( moveRight ) mH = -1;//new Ammo.btVector3( 0 , velo.y() , -10 ));
		var hi = Vx*Vx+Vz*Vz;
		//console.log(hi);
		if (canJump && (mV!=0 || mH!=0)){
			var rot = controls.getObject().rotation.y
			
			var xm = Math.sin(rot)*mV*-1 + Math.cos(rot)*mH*-1;
			var zm = Math.sin((90) * Math.PI / 180+rot)*mV*-1 + Math.cos((90) * Math.PI / 180+rot)*mH*-1;
			
			cel = xm*xm+zm*zm;
			Vx = xm/cel*15;
			Vz = zm/cel*15;
		}
		else if(!canJump && (mV!=0 || mH!=0)){
			var rot = controls.getObject().rotation.y
			
			var xm = Math.sin(rot)*mV*-1 + Math.cos(rot)*mH*-1;
			var zm = Math.sin((90) * Math.PI / 180+rot)*mV*-1 + Math.cos((90) * Math.PI / 180+rot)*mH*-1;
			
			cel = xm*xm+zm*zm;
			xm = xm/cel*15;
			zm = zm/cel*15;
			var hit = (velo.x()+xm*0.01)*(velo.x()+xm*0.01)+(velo.z()+zm*0.01)*(velo.z()+zm*0.01);
			//console.log(hit);
			//console.log(hit);
			if(hit < hi){
				Vx = velo.x()+xm*0.01;
				Vz = velo.z()+zm*0.01;
			}
			else{
				Vx = (velo.x()+xm*0.01)/Math.sqrt(hit)*Math.sqrt(hi);
				Vz = (velo.z()+zm*0.01)/Math.sqrt(hit)*Math.sqrt(hi);
			}
		}
		//console.log(fxV);
		//console.log(rxV);
		if(!canJump){player.setFriction(0);}
		else if(canJump && (moveForward || moveBackward || moveLeft || moveRight)){
			player.setFriction(0);
			//console.log("yay");
		}
		else{
			player.setFriction(7);
		}
		
		var disp = scene.world.getDispatcher();
		
		canJump = false;
		for (var i=0;i<disp.getNumManifolds();i++){
			var mai = disp.getManifoldByIndexInternal(i);
			if(mai.getBody0().getCollisionShape().obj == 10 || mai.getBody1().getCollisionShape().obj == 10){
				//console.log(scene.world.getDispatcher().getManifoldByIndexInternal(i).getBody0().getCollisionShape());
				//console.log(scene.world.getDispatcher().getManifoldByIndexInternal(i).getBody1().getCollisionShape());
				//console.log(player);
				for (j=0;j<mai.getNumContacts();j++){
					pt = mai.getContactPoint(j);
					//console.log(pt.getDistance());
					if (pt.getDistance()<0.00000001)
					{
						var ptA = pt.getPositionWorldOnA();
						var ptB = pt.getPositionWorldOnB();
						//console.log(controls.getObject().position.y-1.5-1.75);
						//console.log(ptB.y());
						if(pt.get_m_normalWorldOnB().y() == -1){
							canJump = true;
						}
						//console.log("what");
					}
				}
			}
			else if(mai.getBody0().getCollisionShape().obj == 11 || mai.getBody1().getCollisionShape().obj == 11){
				if(mai.getBody0().getCollisionShape().obj == 11){
					var inde = -1;//console.log(objs)
					for(var j=0;j<boxes.length;j++){
						if(mai.getBody0().getCollisionShape().objs.ptr == boxes[j].ptr){
							inde = j;
							break;
						}
					}
					if(inde > -1){
						boxes.splice(inde,1);
					}
					boom(mai.getBody0().getCollisionShape().objs);
					scene.world.removeRigidBody(mai.getBody0().getCollisionShape().objs);
					//var index = array.indexOf(mai.getBody0().getCollisionShape().mesh);
					scene.remove(mai.getBody0().getCollisionShape().mesh);
				}
				else{
					//console.log(mai.getBody1().getCollisionShape().objs)
					var inde = -1;//console.log(objs)
					for(var j=0;j<boxes.length;j++){
						if(mai.getBody1().getCollisionShape().objs.ptr == boxes[j].ptr){
							console.log(j)
							inde = j;
							break;
						}//var inde = boxes.indexOf(mai.getBody0().getCollisionShape().objs);
					}
					if(inde > -1){
						boxes.splice(inde,1);
					}
					//boxes.remove(mai.getBody1().getCollisionShape().objs);
					boom(mai.getBody1().getCollisionShape().objs);
					scene.world.removeRigidBody(mai.getBody1().getCollisionShape().objs)
					scene.remove(mai.getBody1().getCollisionShape().mesh);
				}
			}
		}
		if(jump){
			Vy = 20;
			jump=false;
		}
		player.setLinearVelocity(new Ammo.btVector3( Vx , Vy , Vz ));
		//controls.getObject().translateX(1);
		//console.log(controls);
		//player.setLinearVelocity(new Ammo.btVector3( 0 , 0 , 0 ));
	}
	//console.log(player.getLinearVelocity().z()+" 2")
	//console.log(controls.getObject().rotation);
	//console.log(player.isActive());
	//console.log(scene.world/*.getDispacher().getManifoldByIndexInternal(0)*/);
	//console.log(controls.getObject());
}

function loadfix(){
	var dim = [[0,-2,0,120,4,120,0],
[-40,20,58,40,40,4,0],
[-58,20,-2,4,40,116,0],
[-18,20,8,4,40,104,0],
[-22,4,38,4,8,4,0],
[-30,4,38,4,8,4,0],
[-26,10,38,12,4,4,0],
[-22,4,18,4,8,4,0],
[-30,4,18,4,8,4,0],
[-26,10,18,12,4,4,0],
[-22,4,-2,4,8,4,0],
[-30,4,-2,4,8,4,0],
[-26,10,-2,12,4,4,0],
[-22,1,-18,4,2,4,0],
[2,20,-58,116,40,4,0],
[-18,24,-48,4,32,8,0],
[-50,0.999997139,-50,12,1.999994278,12,0],
[-50,1,-43,12,2,2,0],
[-43,1,-49,2,2,14,0],
[-18,20,-54,4,40,4,0],
[-10,10,-38,12,20,4,0],
[6,4,-48,28,8,16,0],
[12,10,-38,8,20,4,0],
[2,4,-34,12,8,12,0],
[26,4,-36,12,8,40,0],
[50,4,-36,12,8,40,0],
[58,20,2,4,40,116,0],
[38,1,-20.00000191,12,2,71.99999619,0],
[38,3,-55,12,2,2,0],
[38,3,15,12,2,2,0],
[50,12,-50,12,8,12,0],
[18,20,-2,4,40,76,0],
[18,12,-42,4,8,4,0],
[18,12,-54,4,8,4,0],
[18,28,-48,4,24,16,0],
[24,20,54,40,40,12,0],
[26,8,42,12,16,12,0],
[2,20,30,4,40,60,0],
[8,20,-2,16,40,4,0],
[10,12,16,12,24,32,0],
[10,36,14,12,8,4,0],
[15,28,14,2,8,4,0],
[5,28,14,2,8,4,0],
[2,14,-38,12,12,0.1000003815,1],
[38,6,-20,14,0.1000003815,72,1],
[-26,4,-2,4,8,0.1000003815,1],
[-26,4,18,4,8,0.1000003815,1],
[-26,4,38,4,8,0.1000003815,1],
[-54,6,38,4,12,12,2],
[-10,10,-30,12,20,12,2],
[12,10,-30,8,20,12,2],
[2,10,-26,12,20,4,2],
[50,20,22,12,40,76,2],
[26,20,10,12,40,52,2],
[38,8,32,12,16,32,2]
]
	for (var i=0;i<dim.length;i++){
		var groundShape = new Ammo.btBoxShape(new Ammo.btVector3( dim[i][3]/2, dim[i][4]/2, dim[i][5]/2)); // Create block 50x2x50
		var groundTransform = new Ammo.btTransform();
		groundTransform.setIdentity();
		groundTransform.setOrigin(new Ammo.btVector3( dim[i][0]*-1, dim[i][1], dim[i][2]*-1 )); // Set initial position
 
		var groundMass = 0; // Mass of 0 means ground won't move from gravity or collisions
		var localInertia = new Ammo.btVector3(0, 0, 0);
		var motionState = new Ammo.btDefaultMotionState( groundTransform );
		var rbInfo = new Ammo.btRigidBodyConstructionInfo( groundMass, motionState, groundShape, localInertia );
		var groundAmmo = new Ammo.btRigidBody( rbInfo );
		groundAmmo.setFriction(0.8);
		scene.world.addRigidBody( groundAmmo , 1,62);
	}
	var loader = new THREE.ObjectLoader(); 
	loader.load('untitled-scene.json', function( obj ){ console.log(obj); scene.add( obj ); });
	
	var light = new THREE.AmbientLight( 0x808080 );
	//light.castShadow = true;
	//light.position.set(-20,10,-20);
	scene.add(light);
	
	////
	//console.log(player.setActivationState(0));
	//console.log(player.isActive());
	
}

function loaddim(){
	var mass = 95; // Matches box dimensions for simplicity
	var startTransform = new Ammo.btTransform();
	startTransform.setIdentity();
	startTransform.setOrigin(new Ammo.btVector3( -40 , 100, 0 )); // Set initial position

	var localInertia = new Ammo.btVector3(0, 0, 0);

	var boxShape = new Ammo.btBoxShape(new Ammo.btVector3( 1 , 1.75, 1 )); // Box is 3x3x3
	boxShape.calculateLocalInertia( mass, localInertia );

	var motionState = new Ammo.btDefaultMotionState( startTransform );
	var rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, boxShape, localInertia );
	var boxAmmo = new Ammo.btRigidBody( rbInfo );
	boxAmmo.setAngularFactor(new Ammo.btVector3(0,0,0));
	player = boxAmmo;
	boxAmmo.setFriction(0);
	boxAmmo.getCollisionShape().obj = 10;
	//console.log(boxAmmo);
	//boxAmmo.setMargin(0.5);
	scene.world.addRigidBody( boxAmmo , 2,1);
	
	/*var loader = new THREE.OBJMTLLoader();

// load an obj / mtl resource pair
	loader.load(
		// OBJ resource URL
		'soldier.obj',
		// MTL resource URL
		'soldier.mtl',
		// Function when both resources are loaded
		function ( object ) {
			scene.add( object );
			boxAmmo.mesh = object;
			boxes.push( boxAmmo );
		},
		// Function called when downloads progress
		function ( xhr ) {
			console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
		},
		// Function called when downloads error
		function ( xhr ) {
			console.log( 'An error happened' );
		}
	);*/
	
	//var loader = new THREE.BabylonLoader();

// load a Babylon resource
	/*loader.load(
		// resource URL
		'soldier.babylon',
		// Function when resource is loaded
		function ( object ) {
			scene.add( object );
			console.log(object);
			boxAmmo.mesh = object;
			boxes.push( boxAmmo );
		},
		// Function called when download progresses
		function ( xhr ) {
			console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
		},
		// Function called when download errors
		function ( xhr ) {
			console.log( 'An error happened' );
		}
);*/
	
	var geometry = new THREE.BoxGeometry( 2, 3.5,2);
	var material = new THREE.MeshPhongMaterial( { color: 0x00ff00, specular: 0xffffff, shininess: 30, shading: THREE.FlatShading } )
	//var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
	box2 = new THREE.Mesh(geometry,material);
	box2.castShadow = false;
	scene.add(box2);
	boxAmmo.mesh = box2; // Assign the Three.js mesh in `box`, this is used to update the model position later*/
	boxes.push( boxAmmo );
}

function initControls(){
	var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

	if ( havePointerLock ) {

		var element = document.body;

		var pointerlockchange = function ( event ) {

			if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

				controlsEnabled = true;
				controls.enabled = true;

				//blocker.style.display = 'none';

			} else {

				controls.enabled = false;
				controlsEnabled = false;

				//blocker.style.display = '-webkit-box';
				//blocker.style.display = '-moz-box';
				//blocker.style.display = 'box';

				//instructions.style.display = '';

			}

		};

		var pointerlockerror = function ( event ) {

			//instructions.style.display = '';

		};

		// Hook pointer lock state change events
		document.addEventListener( 'pointerlockchange', pointerlockchange, false );
		document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
		document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

		document.addEventListener( 'pointerlockerror', pointerlockerror, false );
		document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
		document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

		document.body.addEventListener( 'click', function ( event ) {

		//instructions.style.display = 'none';
		//controlsEnabled = true;

					// Ask the browser to lock the pointer
			element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

			if ( /Firefox/i.test( navigator.userAgent ) ) {

				var fullscreenchange = function ( event ) {

				if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

						document.removeEventListener( 'fullscreenchange', fullscreenchange );
						document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

						element.requestPointerLock();
					}

				};

				document.addEventListener( 'fullscreenchange', fullscreenchange, false );
				document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

				element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

				element.requestFullscreen();
				//controlsEnabled = true;

			} else {

				element.requestPointerLock();
				//controlsEnabled = true;

			}

		}, false );

	} else {

	//instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

	}
	
	var onKeyDown = function ( event ) {
		switch ( event.keyCode ) {
			case 38: // up
			case 87: // w
				moveForward = true;
				break;
			case 37: // left
			case 65: // a
				moveLeft = true; 
				break;
			case 40: // down
			case 83: // s
				moveBackward = true;
				break;
			case 39: // right
			case 68: // d
				moveRight = true;
			break;
			case 32: // space
				if(canJump){
					jump = true;
				}
				break;
		}
	};
	var onKeyUp = function ( event ) {
		switch( event.keyCode ) {
			case 38: // up
			case 87: // w
				moveForward = false;
				break;
			case 37: // left
			case 65: // a
				moveLeft = false;
				break;
			case 40: // down
			case 83: // s
				moveBackward = false;
				break;
			case 39: // right
			case 68: // d
				moveRight = false;
				break;
			case 32: // space
				canJump = false;
				break;
		}
	};
	
	var mousedown = function ( event ) { 
		if (controlsEnabled && timer <= 0 && event.which == 1){
			fire();
		}
		if (controlsEnabled && timer2 <= 0 && event.which == 3){
			altfire();
		} 
	}
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );
	document.addEventListener( 'mousedown', mousedown , false );
	
}

function altfire(){
	if(firemode = 1){
		var vector3 = controls.getDirection(new THREE.Vector3(0, 0, 0)).clone();
		console.log(vector3);
		var mass = 5; // Matches box dimensions for simplicity
		var startTransform = new Ammo.btTransform();
		startTransform.setIdentity();
	
		startTransform.setOrigin(new Ammo.btVector3( controls.getObject().position.x , controls.getObject().position.y , controls.getObject().position.z )); // Set initial position
		startTransform.setRotation(new Ammo.btQuaternion (vector3.x*-1,vector3.y*-1,vector3.z*-1,1));
	
		var localInertia = new Ammo.btVector3(0, 0, 0);

		var boxShape = new Ammo.btBoxShape(new Ammo.btVector3( 0.5 , 1, 0.5 )); // Box is 3x3x3
		boxShape.calculateLocalInertia( mass, localInertia );

		var motionState = new Ammo.btDefaultMotionState( startTransform );
		var rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, boxShape, localInertia );
		var boxAmmo = new Ammo.btRigidBody( rbInfo );
		console.log(boxAmmo);
		//boxAmmo.setGravity(new Ammo.btVector3(0,0,0));
		boxAmmo.setAngularFactor(new Ammo.btVector3(0,0,0));
		if(firemode = 1){
			boxAmmo.setLinearFactor(new Ammo.btVector3(0,0,0))
		}
		boxAmmo.setLinearVelocity(new Ammo.btVector3(vector3.x*30*-1,vector3.y*30*-1,vector3.z*30*-1));
		//player = boxAmmo;
		boxAmmo.setFriction(0);
		boxAmmo.getCollisionShape().obj = 11;
		boxAmmo.getCollisionShape().objs = boxAmmo;
		//boxAmmo.getCollisionShape().ob = boxAmmo;
		console.log(scene.world);
		//boxAmmo.setMargin(0.5);
		scene.world.addRigidBody( boxAmmo , 4,1);
		var geometry = new THREE.SphereGeometry( 0.5, 32, 32 );
		var material = new THREE.MeshLambertMaterial( {color: 0x404040} );
		var box2 = new THREE.Mesh( geometry, material );
		box2.castShadow = false;
		scene.add(box2);
		boxAmmo.mesh = box2;
		boxAmmo.getCollisionShape().mesh = box2;
		boxes.push( boxAmmo );
		timer = 1000;
	}
}

function fire(){
	var vector3 = controls.getDirection(new THREE.Vector3(0, 0, 0)).clone();
	console.log(vector3);
	var mass = 5; // Matches box dimensions for simplicity
	var startTransform = new Ammo.btTransform();
	startTransform.setIdentity();
	
	startTransform.setOrigin(new Ammo.btVector3( controls.getObject().position.x , controls.getObject().position.y , controls.getObject().position.z )); // Set initial position
	
	var localInertia = new Ammo.btVector3(0, 0, 0);

	var boxShape = new Ammo.btSphereShape(0.5); // Box is 3x3x3
	boxShape.calculateLocalInertia( mass, localInertia );

	var motionState = new Ammo.btDefaultMotionState( startTransform );
	var rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, boxShape, localInertia );
	var boxAmmo = new Ammo.btRigidBody( rbInfo );
	console.log(boxAmmo);
	//boxAmmo.setGravity(new Ammo.btVector3(0,0,0));
	boxAmmo.setAngularFactor(new Ammo.btVector3(0,0,0));
	if(firemode = 1){
		boxAmmo.setLinearFactor(new Ammo.btVector3(1,0,1))
	}
	boxAmmo.setLinearVelocity(new Ammo.btVector3(vector3.x*20,vector3.y*20,vector3.z*20));
	//player = boxAmmo;
	boxAmmo.setFriction(0);
	boxAmmo.getCollisionShape().obj = 11;
	boxAmmo.getCollisionShape().objs = boxAmmo;
	boxAmmo.getCollisionShape().ob = boxAmmo;
	console.log(scene.world);
	//boxAmmo.setMargin(0.5);
	scene.world.addRigidBody( boxAmmo , 4,1);
	var geometry = new THREE.SphereGeometry( 0.5, 32, 32 );
	var material = new THREE.MeshBasicMaterial( {color: 0x404040} );
	var box2 = new THREE.Mesh( geometry, material );

	box2.castShadow = false;
	scene.add(box2);
	boxAmmo.mesh = box2;
	boxAmmo.getCollisionShape().mesh = box2;
	boxes.push( boxAmmo );
	timer = 1000;
	
}

function animate() {
	
	requestAnimationFrame( animate );
	render();
	//stats.update();

}

function update() {
	var nw = new Date().getTime();
	var pass = nw - timepassed;
	timepassed = nw;
	if(timer > 0){
		timer = timer - pass;
	}
	if(timer2 > 0){
		timer2 = timer2 - pass;
	}
	for(var i=0;i<pass/1000;i=i+1/300){
		scene.world.stepSimulation( 1 / 300,1);
		control(player);
		
	}// Tells Ammo.js to apply physics for 1/60th of a second with a maximum of 5 steps
    var i, transform = new Ammo.btTransform(), origin, rotation;
     
    for ( i = 0; i < boxes.length; i++ ) {
        boxes[i].getMotionState().getWorldTransform( transform ); // Retrieve box position & rotation from Ammo
         
        // Update position
        origin = transform.getOrigin();
        boxes[i].mesh.position.x = origin.x();
        boxes[i].mesh.position.y = origin.y();
        boxes[i].mesh.position.z = origin.z();
         
        // Update rotation
        rotation = transform.getRotation();
        boxes[i].mesh.quaternion.x = rotation.x();
        boxes[i].mesh.quaternion.y = rotation.y();
        boxes[i].mesh.quaternion.z = rotation.z();
        boxes[i].mesh.quaternion.w = rotation.w();
    }
	
	player.getMotionState().getWorldTransform( transform );
	origin = transform.getOrigin();
	controls.getObject().position.x = origin.x();
	controls.getObject().position.y = origin.y()+1.5;
	controls.getObject().position.z = origin.z();
	
}

function render() {

    /*var now = new Date().getTime();
	if(!lastUpdate){
		lastUpdate = now;
	}
    dt = (now - lastUpdate) / 1000;
    lastUpdate = now;
    simulatePhysics(dt);*/
	
	//console.log(boxes[0].position.x,boxes[0].position.y,boxes[0].position.z);
	update();
	//console.log(boxes[0].position.x,boxes[0].position.y,boxes[0].position.z);
    //if (stacking) checkRestart();

    // Resize client if necessary
    /*if (w !== window.innerWidth || h !== window.innerHeight) {
        renderer.setSize(window.innerWidth, window.innerHeight);
        // set old sizes for comparison again
        w = window.innerWidth, h = window.innerHeight;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }*/

    renderer.render(scene, camera);
}

function boom(bom){
	var i, transform = new Ammo.btTransform(), origin;
	
	console.log(bom)
	bom.getMotionState().getWorldTransform(transform);
	origin = transform.getOrigin();
	var x1 = origin.x();
    var y1 = origin.y();
    var z1 = origin.z();
	
	for ( i = 0; i < boxes.length; i++ ) {
        boxes[i].getMotionState().getWorldTransform( transform ); // Retrieve box position & rotation from Ammo
         
        // Update position
        origin = transform.getOrigin();
        var x2 = origin.x();
        var y2 = origin.y();
        var z2 = origin.z(); 
		dist = Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1)+(z2-z1)*(z2-z1));
		console.log(player.getLinearVelocity().y());
		//player.setLinearVelocity(new Ammo.btVector3(0,1000,0));
		console.log(player.getLinearVelocity().y());
		/*if(dist > 0.1){
			boxes[i].applyImpulse(0,10,0)
		}
		else if(10 - dist > 0){
			//x2 = dist*(10-(x2-x1));
			//y2 = dist*(10-(y2-y1));
			//z2 = dist*(10-(z2-z1));
			
			boxes[i].applyImpulse(0,10000,0)
		}*/
    }
	player.applyImpulse(new Ammo.btVector3(0,1000,0));
	console.log(player.getLinearVelocity().y());
}

function init(){
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000);
	renderer = new THREE.WebGLRenderer();
	renderer.shadowMap.enabled = true;
	renderer.shadowMapSoft = true;
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	
	var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
	var dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
	var overlappingPairCache = new Ammo.btDbvtBroadphase();
	var solver = new Ammo.btSequentialImpulseConstraintSolver();
	scene.world = new Ammo.btDiscreteDynamicsWorld( dispatcher, overlappingPairCache, solver, collisionConfiguration );
	scene.world.setGravity(new Ammo.btVector3(0, -40, 0));
	
	loadfix();
	loaddim();
	initControls();
	//camera.position.x = 100;
	controls = new THREE.PointerLockControls( camera );
	scene.add( controls.getObject() );
	console.log(controls.getObject())
	
	var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
	directionalLight.position.set( -20, 10, 10 );
	scene.add( directionalLight );
	
	
	timepassed = new Date().getTime();
	animate();
}

window.onload = init;