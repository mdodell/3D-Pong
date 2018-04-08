
/*
Final Project MVP - 3D Pong
By Team 10
Professor Hickey
*/

	var scene, renderer, clock;  //Components to render the scene

	var camera, p1Camera, p2Camera;  //Cameras

	var p1, p2; //The two players

	var introScene, introCamera, introText; //Intro objects
	var winScene, winCamera, winText; //Win objects
	var loseScene, loseCamera, loseText; //Lose objects

	var controls =
	     {p1Left:false, p1Right:false, p2IsCPU:true, p2Left:false, p2Right:false,
				ballSpeed:10, p1PaddleSpeed:10, p2PaddleSpeed:10, reset:false, camera:false}
	var gameInfo =
	     {p1Score:0, p2Score:0, scene:'main', camera:'none', difficulty:'medium'}

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
			light1.position.set(0,200,0);
			scene.add(light1);
			var light0 = new THREE.AmbientLight( 0xffffff,0.25);
			scene.add(light0);

			// create main camera
			camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
			camera.position.set(0,100,0);
			camera.lookAt(0,0,0);



			gameInfo.camera = camera;

			var gameBoard = createBoard(200, 100, 1, new THREE.Color('green'));
			scene.add(gameBoard);
			gameBoard.position.set(0,0,0);

			var side1 = boxMesh(200,20,1, 0xffffff);
			scene.add(side1);
			side1.position.set(0,10,-50);


			var side2 = boxMesh(200,20,1, 0xffffff);
			scene.add(side2);
			side2.position.set(0,10,50);

			var goal1 = boxMesh(1,20,100, 0xff00ff);
			scene.add(goal1);
			goal1.position.set(-100,10,0);

			var goal2 = boxMesh(1,20,100, 0xff00ff);
			scene.add(goal2);
			goal2.position.set(100,10,0);

			p1 = boxMesh(1,5,20, new THREE.Color('blue'));
			p1 = new Physijs.BoxMesh(p1.geometry, p1.material);
			scene.add(p1);
			p1.position.set(-85,2.5,0);


			p2 = boxMesh(1,5,20, new THREE.Color('red'));
			p2 = new Physijs.BoxMesh(p2.geometry, p2.material);
			scene.add(p2);
			p2.position.set(85,2.5,0);

			p1Camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
			p1Camera.position.set(-99,5.5,0);
			p1Camera.lookAt(85,0,0);

			p2Camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
			p2.add(p2Camera);
			p2Camera.position.set(14,3,0);
			p2Camera.lookAt(-85,0,0);

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
		return renderer;
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
			case "p": scene = initScene(); createMainScene(); console.log("Scene changed..."); break;
			case "1": gameInfo.camera = p1Camera; break;
			case "2": gameInfo.camera = p2Camera; break;
			case "3": gameInfo.camera = camera; break;
			case "a": controls.p1Left = true; break;
			case "d": controls.p1Right = true; break;
		}
	}

	function keyup(event){
		switch (event.key){
			case "a": controls.p1Left = false; break;
			case "d": controls.p1Right = false; break;
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

	function boxMesh(x, y, z, color){
		var geometry = new THREE.BoxGeometry(x,y,z);
		var material = new THREE.MeshLambertMaterial({color: color});
		var mesh = new THREE.Mesh(geometry, material);
		return mesh;
	}

	function createBoard(x, y, z, color){
		var geometry = new THREE.PlaneGeometry(x, y, z);
		var material = new THREE.MeshLambertMaterial ({color: color, side: THREE.DoubleSide});
		var plane = new THREE.Mesh(geometry, material);
		plane.rotateX(Math.PI/2);
		return plane;
	}

	function animate() {
		requestAnimationFrame( animate );

		switch(gameInfo.scene) {
			case "intro":
				renderer.render(introScene, introCamera);
				break;

			case "main":

				if (gameInfo.camera != 'none'){
					renderer.render(scene, gameInfo.camera);
				}
				if(controls.p1Left){
					p1.__dirtyPosition = true;
					p1.position.z += 1;
					console.log("changed" + p1.position.z);
				}
				if(controls.p1Right){
					p1.__dirtyPosition = true;
					p1.position.z += -1;
					console.log("changed" + p1.position.z);
				}
			  var info = document.getElementById("info");
				break;
				scene.simulate();
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
