/*
Final Project MVP - 3D Pong
By Team 10
Professor Hickey
*/

var scene, renderer, clock;  //Components to render the scene

var camera, p1Camera, p2Camera;  //Cameras

var p1, p2; //The two players

var ball; //the ball

var offsetVec1;

var side1, side2,gameBoard;

var introScene, introCamera, introText; //Intro objects
var winScene, winCamera, winText; //Win objects
var loseScene, loseCamera, loseText; //Lose objects

var controls =
{p1Left:false, p1Right:false, p2IsCPU:true, p2Left:false, p2Right:false,
	ballSpeed:1, p1PaddleSpeed:10, p2PaddleSpeed:10, reset:false, camera:false}
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

		gameBoard = createBoard(200, 100, 1, new THREE.Color('green'));
		gameBoard = new Physijs.BoxMesh(gameBoard.geometry, gameBoard.material,0);
		gameBoard.visible = false;
		scene.add(gameBoard);
		gameBoard.__dirtyRotation = true;
		gameBoard.__dirtyPosition = true;
		gameBoard.position.set(0,0,0);
		gameBoard.rotation.set(Math.PI/2,0,0);

		side1 = boxMesh(200,20,1, 0xffffff);
		side1 = new Physijs.BoxMesh(side1.geometry, side1.material,0);
		scene.add(side1);
		side1.__dirtyPosition = true;
		side1.position.set(0,10,-50);

		side2 = boxMesh(200,20,1, 0xffffff);
		side2 = new Physijs.BoxMesh(side2.geometry, side2.material,0);
		scene.add(side2);
		side2.__dirtyPosition = true;
		side2.position.set(0,10,50);

		// Blue side goal
		goal1 = boxMesh(1,20,100, 0xff00ff);
		goal1 = new Physijs.BoxMesh(goal1.geometry, goal1.material,0);
		scene.add(goal1);
		goal1.__dirtyPosition = true;
		goal1.position.set(-100,10,0);

		// Red side goal
		goal2 = boxMesh(1,20,100, 0xff00ff);
		goal2 = new Physijs.BoxMesh(goal2.geometry, goal2.material,0);
		scene.add(goal2);
		goal2.__dirtyPosition = true;
		goal2.position.set(100,10,0);

		p1 = boxMesh(1,5,20, new THREE.Color('blue'));
		p1 = new Physijs.BoxMesh(p1.geometry, p1.material);
		scene.add(p1);
		p1.__dirtyPosition = true;
		p1.position.set(-85,2.5,0);
		p1.setCcdMotionThreshold(1);

		ball = createBall();
		scene.add(ball);
		ball.__dirtyPosition = true;
		ball.position.set(0, 2.5, 0);

		p1.addEventListener( 'collision',
		function( other_object, relative_velocity, relative_rotation, contact_normal ) {

			if (other_object==ball){
				console.log("paddle hit the ball");
				soundEffect('good.wav');

				// TODO: Needs to fly back
			  ball.__dirtyPosition = true;
				ball.position.set(0, 2.5, 0);
			}
		}
	)

	p2 = boxMesh(1,5,20, new THREE.Color('red'));
	p2 = new Physijs.BoxMesh(p2.geometry, p2.material);
	scene.add(p2);
	p2.__dirtyPosition = true;
	p2.position.set(85,2.5,0);
	p2.setCcdMotionThreshold(1);

	p2.addEventListener( 'collision',
	function( other_object, relative_velocity, relative_rotation, contact_normal ) {

		if (other_object==ball){
			console.log("paddle hit the ball");

			// TODO: Needs to fly back
			ball.__dirtyPosition = true;
			ball.position.set(0, 2.5, 0);
		}
	}
)

ball.addEventListener( 'collision',
function( other_object, relative_velocity, relative_rotation, contact_normal ) {
	if (other_object==p1 || other_object==p2){
		console.log("ball hit the paddle");
		ball.__dirtyPosition = true;

	}
	if (other_object==goal1){
		console.log("ball hit the goal 1");
		soundEffect('good.wav');
		ball.__dirtyPosition = true;
		ball.position.set(0, 2.5, 0);
		gameInfo.p1Score += 1;
	}
	if (other_object==goal2){
		console.log("ball hit the goal 2");
		soundEffect('good.wav');
		ball.__dirtyPosition = true;
		ball.position.set(0, 2.5, 0);
		gameInfo.p2Score += 1;
	}
}
)

offsetVec1 = new THREE.Vector3(-14,3,0);

p1Camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
//p1Camera.position.set(-99,5.5,0);
p1Camera.position.addVectors(p1.position,offsetVec1);
p1Camera.lookAt(p2.position.x,0,0);

p2Camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
p2.add(p2Camera);
p2Camera.position.set(14,3,0);
p2Camera.lookAt(p1.position.x,0,0);

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
			case "3": gameInfo.camera = camera; break

			// Player 1 controls
			case "a": controls.p1Right = true; break;
			case "d": controls.p1Left = true; break;
			case "w": controls.p1Up = true; break;
			case "s": controls.p1Down = true; break;

			// Player 2 controls
			case "j": controls.p2Left = true; break;
			case "l": controls.p2Right = true; break;
			case "i": controls.p2Up = true; break;
			case "k": controls.p2Down = true; break;
		}
}

function keyup(event){
	switch (event.key){
		// Player 1 controls
		case "a": controls.p1Right = false; break;
		case "d": controls.p1Left = false; break;
		case "w": controls.p1Up = false; break;
		case "s": controls.p1Down = false; break;

		// Player 2 controls
		case "j": controls.p2Left = false; break;
		case "l": controls.p2Right = false; break;
		case "i": controls.p2Up = false; break;
		case "k": controls.p2Down = false; break;
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

function createBall(){
	var geometry = new THREE.SphereGeometry( 2, 200, 200);
	var material = new THREE.MeshLambertMaterial( { color: 0xffffff} );
	var pmaterial = new Physijs.createMaterial(material,0.9,0.95);
	var mesh = new Physijs.BoxMesh( geometry, pmaterial );
	mesh.setDamping(0.1,0.1);
	mesh.castShadow = true;
	mesh.setCcdSweptSphereRadius(0.2);
	return mesh;
}

function animate() {
	requestAnimationFrame( animate );

	switch(gameInfo.scene) {
		case "intro":
		renderer.render(introScene, introCamera);
		break;

		case "main":
		scene.simulate();
		//update the p1 camera position using the current position of p1 and an offset vector
		p1Camera.position.addVectors(p1.position,offsetVec1);

		if (gameInfo.camera != 'none'){
			renderer.render(scene, gameInfo.camera);
		}
		if(controls.p1Left){
			if(p1.position.z < 36){
			p1.__dirtyPosition = true;
			p1.position.z += 1;
			console.log("changed1 " + p1.position.z);
		  }
		}
		if(controls.p1Right){
			if(p1.position.z > -36){
			p1.__dirtyPosition = true;
			p1.position.z += -1;
			console.log("changed1 " + p1.position.z);
		  }
		}
		if(controls.p1Up){
			p1.__dirtyPosition = true;
			p1.position.y += 1;
			console.log("changed1 " + p1.position.y);
		}
		if(controls.p1Down){
			p1.__dirtyPosition = true;
			p1.position.y += -1;
			console.log("changed1 " + p1.position.y);
		}
		if(controls.p2Left){
			if(p2.position.z < 36){
			p2.__dirtyPosition = true;
			p2.position.z += 1;
			console.log("changed2 " + p2.position.z);
		  }
		}
		if(controls.p2Right){
			if(p2.position.z > -36){
			p2.__dirtyPosition = true;
			p2.position.z += -1;
			console.log("changed2 " + p2.position.z);
		  }
		}
		if(controls.p2Up){
			p2.__dirtyPosition = true;
			p2.position.y += 1;
			console.log("changed2 " + p2.position.y);
		}
		if(controls.p2Down){
			p2.__dirtyPosition = true;
			p2.position.y += -1;
			console.log("changed2 " + p2.position.y);
		}

		ball.__dirtyPosition = true;
		ball.position.x += 1;

		p2.__dirtyRotation = true;
		p2.rotation.set(0, 0, 0);

		p2.__dirtyPosition = true;
		p2.position.x = 85;

		p1.__dirtyRotation = true;
		p1.rotation.set(0, 0, 0);

		p1.__dirtyPosition = true;
		p1.position.x = -85;

		var info = document.getElementById("info");
		info.innerHTML = '<div style="font-size:24pt">Blue Score: ' + gameInfo.p1Score + ' Red Score: '+ gameInfo.p2Score + '</div>';

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
