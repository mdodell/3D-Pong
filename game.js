
/*
Final Project MVP - 3D Pong
By Team 10
Professor Hickey
*/

	var scene, renderer, clock;  //Components to render the scene

	var birdsEyeCamera, p1Camera, p2Camera;  //Cameras

	var p1, p2; //The two players

	var introScene, introCamera, introText; //Intro objects
	var winScene, winCamera, winText; //Win objects
	var loseScene, loseCamera, loseText; //Lose objects

	var controls =
	     {fwd:false, bwd:false, left:false, right:false,
				speed:10, fly:false, reset:false, leftCamera:false, rightCamera: false, flipPlayer: false,
		    camera:false};
	var gameInfo =
	     {p1Score:0, p2Score:0, scene:'main', camera:'none'};

	init();
	initControls();
	animate();

	function createIntroScene(){
		introScene = initScene();
		gameInfo.scene='intro';
		introText = createImageMesh('Splash.png');
		introScene.add(introText);
		var light = createPointLight();
		light.position.set(0,0,-1);
		introScene.add(light);
		introCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		introCamera.position.set(0,0,-0.73);
		introCamera.rotation.y = Math.PI;
		introCamera.lookAt(0,0,0);
	}

	function init(){
      initPhysijs();
			scene = createIntroScene();
			initRenderer();
	}


	function createMainScene(){

      // setup lighting
			gameInfo.scene = 'main';
			var light1 = createPointLight();
			light1.position.set(0,200,20);
			scene.add(light1);
			var light0 = new THREE.AmbientLight( 0xffffff,0.25);
			scene.add(light0);

			// create main camera
			camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
			camera.position.set(0,50,0);
			camera.lookAt(0,0,0);


			edgeCam = new THREE.PerspectiveCamera( 80, window.innerWidth / window.innerHeight, 0.1, 1000 );
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

	function initScene(){
    var scene = new Physijs.Scene();
		return scene;
	}

	function initPhysijs(){
		Physijs.scripts.worker = '/js/physijs_worker.js';
		Physijs.scripts.ammo = '/js/ammo.js';
	}

	function initRenderer(){
		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight-50 );
		document.body.appendChild( renderer.domElement );
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	}


	function createPointLight(){
		var light = new THREE.PointLight(0xffffff);
		light.castShadow = true;
		light.shadow.mapSize.width = 2048;
		light.shadow.mapSize.height = 2048;
		light.shadow.camera.near = 0.5;
		light.shadow.camera.far = 500;
		return light;
	}

	function initControls(){
			clock = new THREE.Clock();
			clock.start();

			window.addEventListener('keydown', keydown);
			window.addEventListener('keyup', keyup);
  }

	function keydown(event){
		switch (event.key){

		}
	}

	function keyup(event){
		switch (event.key){

		}
	}

	function createImageMesh(image){
		var geometry = new THREE.BoxGeometry( 1, 1, 1);
		var texture = new THREE.TextureLoader().load( '../images/'+image );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 1, 1 );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		mesh = new Physijs.BoxMesh( geometry, material );
		mesh.castShadow = true;
		return mesh;
	}

	function animate() {
		requestAnimationFrame( animate );

		switch(gameInfo.scene) {
			case "intro":
				renderer.render(introScene, introCamera);
				break;

			case "main":
				// updateAvatar();
				// updateNPC();
				// scene.simulate();
				// edgeCam.lookAt(avatar.position)
				// if (gameInfo.camera!= 'none'){
				// 	renderer.render( scene, gameInfo.camera );
				// }
				// var info = document.getElementById("info");
				// elapsedTime = (new Date().getTime() - startDate.getTime()) / 1000;
				// info.innerHTML='<div style="font-size:24pt">Score: ' + gameInfo.score + '&nbsp;&nbsp;Health: ' + gameInfo.health + '&nbsp;&nbsp;Time Taken: ' + parseInt(elapsedTime) + ' seconds&nbsp;&nbsp;&lt;/&gt; with &hearts; by Team 10</div>';
				break;

			case "youwon":
				renderer.render(winScene, winCamera);
				break;

			case "youlose":
				renderer.render(loseScene, loseCamera);
				break;


			default:
				console.log("Invalid state. Scene name selected: "+ gameInfo.scene);
		}
	}
