
/*
PA02 - Game 0 Revisions
By Team 10
Professor Hickey
*/

	// First we declare the variables that hold the objects we need
	// in the animation code
	var scene, renderer;  // all threejs programs need these
	var camera, avatarCam, edgeCam;  // we have two cameras in the main scene
	var avatar, npc;
	// here are some mesh objects ...

	var cone;

	var introScene, introCamera, introText;
	var endScene, endCamera, endText;
	var loseScene, loseCamera, loseText;


	// create an AudioListener and add it to the camera
	var listener1 = new THREE.AudioListener();

	// create the PositionalAudio object (passing in the listener)
	var sound1 = new THREE.PositionalAudio( listener1 );

	var controls =
	     {fwd:false, bwd:false, left:false, right:false,
				speed:10, fly:false, reset:false, leftCamera:false, rightCamera: false, flipPlayer: false,
		    camera:camera}

	var gameState =
	     {score:0, health:10, scene:'main', camera:'none' }

  var startDate = new Date();
	var elapsedTime;


	// Here is the main game control
	init(); //
	initControls();
	animate();  // start the animation loop!



	function createIntroScene(){
		introScene = initScene();
		gameState.scene='intro';
		introText = createImageMesh('Splash.png');
		//endText.rotateX(Math.PI);
		introScene.add(introText);
		var light1 = createPointLight();
		light1.position.set(0,0,-1);
		introScene.add(light1);
		introCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		introCamera.position.set(0,0,-0.73);
		introCamera.rotation.y = Math.PI;
		introCamera.lookAt(0,0,0);

	}
	function createEndScene(){
		endScene = initScene();
		endText = createSkyBox('youwon.png',10);
		//endText.rotateX(Math.PI);
		endScene.add(endText);
		var light1 = createPointLight();
		light1.position.set(0,200,20);
		endScene.add(light1);
		endCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		endCamera.position.set(0,50,1);
		endCamera.lookAt(0,0,0);

	}
	function createLoseScene(){
		loseScene = initScene();
		loseText = createSkyBox('youlose.png',10);

		loseScene.add(loseText);
		var light1 = createPointLight();
		light1.position.set(0,200,20);
		loseScene.add(light1);
		loseCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		loseCamera.position.set(0,50,1);
		loseCamera.lookAt(0,0,0);
	}

	/**
	  To initialize the scene, we initialize each of its components
	*/
	function init(){
      initPhysijs();
			scene = createIntroScene();
			createEndScene();
			createLoseScene();
			initRenderer();
	}


	function createMainScene(){

      // setup lighting
			gameState.scene = 'main';
			var light1 = createPointLight();
			light1.position.set(0,200,20);
			scene.add(light1);
			var light0 = new THREE.AmbientLight( 0xffffff,0.25);
			scene.add(light0);

			// create main camera
			camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
			camera.position.set(0,50,0);
			camera.lookAt(0,0,0);

			// create the ground and the skybox
			var ground = createGround('grass.png');
			scene.add(ground);
			var skybox = createSkyBox('sky.jpg',1);
			scene.add(skybox);

			// create the avatar
			avatarCam = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
			createAvatar();

			avatarCam.translateY(4);
			avatarCam.translateZ(3);
			avatarCam.rotation.y = Math.PI;

			gameState.camera = avatarCam;

			edgeCam = new THREE.PerspectiveCamera( 80, window.innerWidth / window.innerHeight, 0.1, 1000 );


			addBalls();

			npc = createBoxMesh(0x0000ff,1,2,4);
			npc.position.set(30,5,-30);
			scene.add(npc);

			cone = createConeMesh(4,6);
			cone.position.set(10,3,7);
			scene.add(cone);


		// load a sound and set it as the PositionalAudio object's buffer -- adds Jaws music
		var audioLoader1 = new THREE.AudioLoader();
		audioLoader1.load( '/sounds/Jaws-theme-song.mp3', function( buffer ) {
			sound1.setBuffer( buffer );
			sound1.setRefDistance( 0.75 );
			sound1.play();
		});


			//playGameMusic();

	}


	function randN(n){
		return Math.random()*n;
	}

	function addBalls(){
		var numBalls = 2


		for(i=0;i<numBalls;i++){
			var ball = createBall();
			ball.position.set(randN(20)+15,30,randN(20)+15);
			scene.add(ball);

			ball.addEventListener('collision',
				function( other_object, relative_velocity, relative_rotation, contact_normal ) {
					if (other_object==cone){
						console.log("ball "+i+" hit the cone");
						soundEffect('good.wav');
						gameState.score += 1;  // add one to the score
						if (gameState.score==numBalls) {
							gameState.scene='youwon';
						}
						// make the ball drop below the scene ..
						// threejs doesn't let us remove it from the schene...
						this.position.y = this.position.y - 100;
						this.__dirtyPosition = true;
					}
				}
			)
		}
	}

	function playGameMusic(){
		// create an AudioListener and add it to the camera
		var listener = new THREE.AudioListener();
		camera.add( listener );

		// create a global audio source
		var sound = new THREE.Audio( listener );

		// load a sound and set it as the Audio object's buffer
		var audioLoader = new THREE.AudioLoader();
		audioLoader.load( '/sounds/loop.mp3', function( buffer ) {
			sound.setBuffer( buffer );
			sound.setLoop( true );
			sound.setVolume( 0.05 );
			sound.play();
		});
	}

	function soundEffect(file){
		// create an AudioListener and add it to the camera
		var listener = new THREE.AudioListener();
		camera.add( listener );

		// create a global audio source
		var sound = new THREE.Audio( listener );

		// load a sound and set it as the Audio object's buffer
		var audioLoader = new THREE.AudioLoader();
		audioLoader.load( '/sounds/'+file, function( buffer ) {
			sound.setBuffer( buffer );
			sound.setLoop( false );
			sound.setVolume( 0.5 );
			sound.play();
		});
	}

	/* We don't do much here, but we could do more!*/
	function initScene(){
		//scene = new THREE.Scene();
    var scene = new Physijs.Scene();
		return scene;
	}

	function initPhysijs(){

		Physijs.scripts.worker = '/js/physijs_worker.js';
		Physijs.scripts.ammo = '/js/ammo.js';
	}

	/*
		The renderer needs a size and the actual canvas we draw on
		needs to be added to the body of the webpage. We also specify
		that the renderer will be computing soft shadows
	*/
	function initRenderer(){
		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight-50 );
		document.body.appendChild( renderer.domElement );
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	}


	function createPointLight(){
		var light;
		light = new THREE.PointLight( 0xffffff);
		light.castShadow = true;
		//Set up shadow properties for the light
		light.shadow.mapSize.width = 2048;  // default
		light.shadow.mapSize.height = 2048; // default
		light.shadow.camera.near = 0.5;       // default
		light.shadow.camera.far = 500      // default
		return light;
	}



	function createBoxMesh(color){
		var geometry = new THREE.BoxGeometry( 1, 1, 1);
		var material = new THREE.MeshLambertMaterial( { color: color} );
		mesh = new Physijs.BoxMesh( geometry, material );
    //mesh = new Physijs.BoxMesh( geometry, material,0 );
		mesh.castShadow = true;
		return mesh;
	}
	function createBoxMesh(color,a,b,c){
		var geometry = new THREE.BoxGeometry( a, b, c);
		var material = new THREE.MeshLambertMaterial( { color: color} );
		mesh = new Physijs.BoxMesh( geometry, material );
    //mesh = new Physijs.BoxMesh( geometry, material,0 );
		mesh.castShadow = true;
		return mesh;
	}

	function createImageMesh(image){
		var geometry = new THREE.BoxGeometry( 1, 1, 1);
		var texture = new THREE.TextureLoader().load( '../images/'+image );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 1, 1 );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		mesh = new Physijs.BoxMesh( geometry, material );
		//mesh = new Physijs.BoxMesh( geometry, material,0 );
		mesh.castShadow = true;
		return mesh;
	}

	function createGround(image){
		// creating a textured plane which receives shadows
		var geometry = new THREE.PlaneGeometry( 180, 180, 128 );
		var texture = new THREE.TextureLoader().load( '../images/'+image );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 15, 15 );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
		//var mesh = new THREE.Mesh( geometry, material );
		var mesh = new Physijs.BoxMesh( geometry, pmaterial, 0 );

		mesh.receiveShadow = true;

		mesh.rotateX(Math.PI/2);
		return mesh
		// we need to rotate the mesh 90 degrees to make it horizontal not vertical
	}

	function createSkyBox(image,k){
		// creating a textured plane which receives shadows
		var geometry = new THREE.SphereGeometry( 80, 80, 80 );
		var texture = new THREE.TextureLoader().load( '../images/'+image );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( k, k );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		//var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
		//var mesh = new THREE.Mesh( geometry, material );
		var mesh = new THREE.Mesh( geometry, material, 0 );

		mesh.receiveShadow = false;

		// we need to rotate the mesh 90 degrees to make it horizontal not vertical
		return mesh
	}

	function createAvatar(){

		// Constructs the OBJ Loader
		var loader = new THREE.JSONLoader();
		loader.load(

		// File Location
		"/models/suzanne.json",

			// Function called upon load
			function (geometry, materials){

				var material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
				var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
				monkey = new Physijs.BoxMesh( geometry, pmaterial );

				monkey.setDamping(0.1,0.1);
				monkey.castShadow = true;

				// Sets the avatar to the mesh
				avatar = monkey;
				avatar.add(avatarCam);
				avatar.translateY(20);
				scene.add(avatar);
				avatar.addEventListener('collision',
					function( other_object, relative_velocity, relative_rotation, contact_normal ) {
						if (other_object==npc){
							console.log("npc "+i+" hit the avatar");
							gameState.health -= 1;  // add one to the score
							npc.position.set(randN(20)+15,avatar.position.y,randN(20)+15);
							npc.__dirtyPosition = true;
							if (gameState.health<1) {
								gameState.scene='youlose';
							}
						}
					}
				)
				console.log("done");

			}
			);

	}


	// finally add the sound to the mesh
	function createConeMesh(r,h){
		var geometry = new THREE.ConeGeometry( r, h, 32);
		var texture = new THREE.TextureLoader().load( '../images/tile.jpg' );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 1, 1 );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
		var mesh = new Physijs.ConeMesh( geometry, pmaterial, 0 );
		mesh.add( sound1 ); //adds Jaws music to cone as you get closer
		mesh.castShadow = true;
		return mesh;
	}

	function createBall(){
		//var geometry = new THREE.SphereGeometry( 4, 20, 20);
		var geometry = new THREE.SphereGeometry( 1, 16, 16);
		var material = new THREE.MeshLambertMaterial( { color: 0xffff00} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
    var mesh = new Physijs.BoxMesh( geometry, material );
		mesh.setDamping(0.1,0.1);
		mesh.castShadow = true;
		return mesh;
	}

	var clock;

	function initControls(){
		// here is where we create the eventListeners to respond to operations

		  //create a clock for the time-based animation ...
			clock = new THREE.Clock();
			clock.start();

			window.addEventListener( 'keydown', keydown);
			window.addEventListener( 'keyup',   keyup );
  }

	function keydown(event){
		console.log("Keydown:"+event.key);
		//console.dir(event);
		// first we handle the "play again" key in the "youwon" scene
		if (gameState.scene == 'youwon' && event.key=='r') {
			gameState.scene = 'main';
			gameState.score = 0;
			gameState.health = 10;
			addBalls();
			return;
		}
		if(gameState.scene == 'youlose' && event.key=='r'){
			gameState.scene = 'main';
			gameState.score = 0;
			gameState.health = 10;
			addBalls();
			return;
		}

		// this is the regular scene
		switch (event.key){
			// change the way the avatar is moving
			case "w": controls.fwd = true;  break;
			case "s": controls.bwd = true; break;
			case "a": controls.left = true; break;
			case "d": controls.right = true; break;

			case "W": controls.speed = 20; controls.fwd = true;  break;
			case "S": controls.speed = 20; controls.bwd = true; break;
			case "A": controls.speed = 20; controls.left = true; break;
			case "D": controls.speed = 20; controls.right = true; break;

			case "i": avatar.visible = false;  break;
			case "I": avatar.visible = true;  break;

			case "r": controls.up = true; break;
			case "f": controls.down = true; break;
			case "m": controls.speed = 30; break;
			case " ": controls.fly = true; break;
			case "h": controls.reset = true; break;
			case "~": gameState.scene = 'youlose'; break;

			case "p": scene = initScene(); createMainScene(); break;

			case "y": soundEffect("victory_fanfare.mp3");

			// switch cameras
			case "1": gameState.camera = camera; break;
			case "2": gameState.camera = avatarCam; break;
			case "3": gameState.camera = edgeCam; break;

			//rotate avatar camera
			case "q": controls.leftCamera = true; break;
			case "e": controls.rightCamera = true;break;

			// move the camera around, relative to the avatar
			case "ArrowLeft": avatarCam.translateY(1);break;
			case "ArrowRight": avatarCam.translateY(-1);break;
			case "ArrowUp": avatarCam.translateZ(-1);break;
			case "ArrowDown": avatarCam.translateZ(1);break;

			case "u": controls.flipPlayer = true; break;


		}

	}

	function keyup(event){
		//console.log("Keydown:"+event.key);
		//console.dir(event);
		switch (event.key){
			case "w": controls.fwd   = false; controls.speed = 10; break;
			case "s": controls.bwd   = false; controls.speed = 10; break;
			case "a": controls.left  = false; controls.speed = 10; break;
			case "d": controls.right = false; controls.speed = 10; break;

			case "W": controls.fwd   = false; controls.speed = 10; break;
			case "S": controls.bwd   = false; controls.speed = 10; break;
			case "A": controls.left  = false; controls.speed = 10; break;
			case "D": controls.right = false; controls.speed = 10; break;

			case "r": controls.up    = false; break;
			case "f": controls.down  = false; break;
			case "m": controls.speed = 10; break;
		    case " ": controls.fly = false; break;
		    case "h": controls.reset = false; break;
				case "~": gameState.scene = 'youlose'; break;

			//rotate avatar camera
			case "q": controls.leftCamera = false; break;
			case "e": controls.rightCamera = false;break;

			case "u": controls.flipPlayer = false; break;
		}
	}

  function updateAvatar(){
		"change the avatar's linear or angular velocity based on controls state (set by WSAD key presses)"

		var forward = avatar.getWorldDirection();

		if (controls.fwd){
			avatar.setLinearVelocity(forward.multiplyScalar(controls.speed));
		}
		else if (controls.bwd){
			avatar.setLinearVelocity(forward.multiplyScalar(-controls.speed));
		}
		else {
			var velocity = avatar.getLinearVelocity();
			velocity.x=velocity.z=0;
			avatar.setLinearVelocity(velocity); //stop the xz motion
		}

		if (controls.fly){
		  avatar.setLinearVelocity(new THREE.Vector3(0,controls.speed,0));
		}

		if (controls.left){
			avatar.setAngularVelocity(new THREE.Vector3(0,controls.speed*0.1,0));
		} else if (controls.right){
			avatar.setAngularVelocity(new THREE.Vector3(0,-controls.speed*0.1,0));
		}

		if (controls.reset){
		  avatar.__dirtyPosition = true;
		  avatar.position.set(40,10,40);
		}

		if (controls.leftCamera){
			avatarCam.rotateY(0.01);
		} else if(controls.rightCamera){
			avatarCam.rotateY(-0.01);
		}
		if (controls.flipPlayer){
			avatar.__dirtyRotation = true;
			avatar.rotateX(Math.PI/2);
		}
	}

	function updateNPC(){

			npc.lookAt(avatar.position);
		  npc.__dirtyPosition = true;
			npc.__dirtyRotation = true;
			if (npc.position.distanceTo(avatar.position) < 25) {
				npc.setLinearVelocity(npc.getWorldDirection().multiplyScalar(3));
			}
	}

	function animate() {

		requestAnimationFrame( animate );

		switch(gameState.scene) {

			case "intro":
				endText.rotateY(0.005);
				renderer.render( introScene, introCamera );
				break;

			case "youwon":
				endText.rotateY(0.005);
				renderer.render( endScene, endCamera );
				break;

			case "main":
				updateAvatar();
				updateNPC();
	    	scene.simulate();
				edgeCam.lookAt(avatar.position)
				if (gameState.camera!= 'none'){
					renderer.render( scene, gameState.camera );
				}
				var info = document.getElementById("info");
				elapsedTime = (new Date().getTime() - startDate.getTime()) / 1000;
			 	info.innerHTML='<div style="font-size:24pt">Score: ' + gameState.score + '&nbsp;&nbsp;Health: ' + gameState.health + '&nbsp;&nbsp;Time Taken: ' + parseInt(elapsedTime) + ' seconds&nbsp;&nbsp;&lt;/&gt; with &hearts; by Team 10</div>';
				break;

				case "youlose":
				loseText.rotateY(0.005);
				renderer.render(loseScene,loseCamera);
				break;


			default:
			  console.log("don't know the scene "+gameState.scene);
		}
	}
