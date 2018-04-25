/*
Final Project MVP - 3D Pong
By Team 10 - Adam, Mitchell, Staci, Anthony, Zach, Devi
Professor Hickey
*/

var scene, renderer, clock;  //Components to render the scene

var camera, p1Camera, p2Camera;  //Cameras

var p1, p2; //The two players

var ball; //The ball

var offsetVec1; //Vector for handling cameras

var topSide, bottomSide, goal1, goal2, gameBoard, gameCeiling; //Game borders

var introScene, introCamera, introText; //Intro objects

var endScene, endCamera, endText; //End objects

var gui; //A dat.gui

var ballXVelocity=0;
var ballZVelocity=0; //ball velocity variables



var controls =
{p1Fwd:false, p1Bwd:false, p1Left:false, p1Right:false, p2IsCPU:false, p2Fwd:false, p2Bwd:false, p2Left:false, p2Right:false,
	p1PaddleSpeed:60, p2PaddleSpeed:60, reset:false, camera:false}
	var gameInfo =
	{p1Color:'#0000FF', p2Color:'#FF0000', ballColor:'#FFFFFF', goal1Color:'#FF00FF', goal2Color:'#FF00FF', gameBoardColor:'#FFFFFF', p1Texture:'', p2Texture:'', ballTexture:'', goal1Texture:'', goal2Texture:'', gameBoardTexture:'', lastP1Texture:'', lastP2Texture:'', lastBallTexture:'', lastGoal1Texture:'', lastGoal2Texture:'', lastGameBoardTexture:'', p1Score:0, p2Score:0, scene:'main', camera:'none', difficulty:'medium', scoreThreshold:10}

	init();
	initControls();
	animate();

	function createIntroScene(){

		introScene = initScene();
		gameInfo.scene='intro';
		introText = createImageMesh('splash.png');
		introScene.add(introText);
		var light = createPointLight();
		introText.add(light);
		light.position.set(0,0,-5);
		introCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		introCamera.position.set(0,0,-0.73);
		introCamera.rotation.y = Math.PI;
		introCamera.lookAt(0,0,0);
	}

	function createEndScene(p1Won){

		endScene = initScene();
		gameInfo.scene='end';
		if(p1Won){
			endText = createImageMesh('p1win.png');
		}
		else{
			endText = createImageMesh('p2win.png');
		}
		soundEffect('win.wav');
		endScene.add(endText);
		var light = createPointLight();
		endText.add(light);
		light.position.set(0,0,-5);
		endCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		endCamera.position.set(0,0,-0.73);
		endCamera.rotation.y = Math.PI;
		endCamera.lookAt(0,0,0);
	}

	function init(){
		initPhysijs();
		scene = createIntroScene();
		initRenderer();
	}

	function createMainScene(){
		if(gui == null){
			gui = new dat.GUI();
			gui.add(gameInfo, 'scoreThreshold', 1, 100).listen();
			gui.add(controls, 'p1PaddleSpeed', 1, 90).listen();
			gui.add(controls, 'p2PaddleSpeed', 1, 90).listen();
			gui.addColor(gameInfo, 'p1Color').listen();
			gui.addColor(gameInfo, 'p2Color').listen();
			gui.addColor(gameInfo, 'ballColor').listen();
			gui.addColor(gameInfo, 'goal1Color').listen();
			gui.addColor(gameInfo, 'goal2Color').listen();
			gui.addColor(gameInfo, 'gameBoardColor').listen();
			gui.add(gameInfo, 'p1Texture').listen();
			gui.add(gameInfo, 'p2Texture').listen();
			gui.add(gameInfo, 'ballTexture').listen();
			gui.add(gameInfo, 'goal1Texture').listen();
			gui.add(gameInfo, 'goal2Texture').listen();
			gui.add(gameInfo, 'gameBoardTexture').listen();
		}
		gameInfo.scene = 'main';
		var light1 = createPointLight();
		light1.position.set(0,200,0);
		scene.add(light1);
		var light0 = new THREE.AmbientLight( 0xffffff,0.25);
		scene.add(light0);

		camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		camera.position.set(0,100,0);
		camera.lookAt(0,0,0);

		gameInfo.camera = camera;

		gameBoard = createBoard(200, 100, 1, new THREE.Color('green'));
		gameBoard = new Physijs.BoxMesh(gameBoard.geometry, gameBoard.material,0);
		scene.add(gameBoard);
		gameBoard.__dirtyRotation = true;
		gameBoard.__dirtyPosition = true;
		gameBoard.position.set(0,0,0);
		gameBoard.rotation.set(Math.PI/2,0,Math.PI);

		gameCeiling = createBoard(200, 100, 1, new THREE.Color('green'));
		gameCeiling = new Physijs.BoxMesh(gameCeiling.geometry, gameCeiling.material,0);
		gameCeiling.visible = false;
		scene.add(gameCeiling);
		gameCeiling.__dirtyRotation = true;
		gameCeiling.__dirtyPosition = true;
		gameCeiling.position.set(0,5,0);
		gameCeiling.rotation.set(Math.PI/2,0,0);

		topSide = boxMesh(200,20,1, 0xffffff);
		topSide = new Physijs.BoxMesh(topSide.geometry, topSide.material,0);
		scene.add(topSide);
		topSide.__dirtyPosition = true;
		topSide.position.set(0,10,-50);

		bottomSide = boxMesh(200,20,1, 0xffffff);
		bottomSide = new Physijs.BoxMesh(bottomSide.geometry, bottomSide.material,0);
		scene.add(bottomSide);
		bottomSide.__dirtyPosition = true;
		bottomSide.position.set(0,10,50);

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

		p1 = boxMesh(5,5,20, new THREE.Color('blue'));
		var p1material = new Physijs.createMaterial(p1.material,0.9,0);
		p1 = new Physijs.BoxMesh(p1.geometry, p1material);
		scene.add(p1);
		p1.__dirtyPosition = true;
		p1.position.set(-85,2.5,0);
		p1.setCcdMotionThreshold(200);

		ball = createBall();
		scene.add(ball);
		ball.__dirtyPosition = true;
		ball.position.set(0, 2.5, 0);

		p1.addEventListener( 'collision',
		function( other_object, relative_velocity, relative_rotation, contact_normal ) {

			if (other_object==ball){
				console.log("paddle1 hit the ball");
			}
		}
	)

	p2 = boxMesh(5,5,20, new THREE.Color('red'));
	var p2material = new Physijs.createMaterial(p2.material,0.9,0);
	p2 = new Physijs.BoxMesh(p2.geometry, p2material);
	scene.add(p2);
	p2.__dirtyPosition = true;
	p2.position.set(85,2.5,0);
	p2.setCcdMotionThreshold(200);

	p2.addEventListener( 'collision',
	function( other_object, relative_velocity, relative_rotation, contact_normal ) {

		if (other_object==ball){
			console.log("paddle2 hit the ball");
		}

	}
)
p1.__dirtyPosition = true;
p1.position.x = -85;

p2.__dirtyPosition = true;
p2.position.x = 85;

ball.addEventListener( 'collision',
function( other_object, relative_velocity, relative_rotation, contact_normal ) {
	if (other_object==p1 || other_object==p2){
		console.log("ball hit the paddle");
		soundEffect(`${getRandomIntInclusive(1,15)}.wav`);

	}
	if (other_object==topSide || other_object==bottomSide){
		console.log("ball hit the side");
		soundEffect(`${getRandomIntInclusive(1,15)}.wav`);
	}

	if (other_object==goal1){
		console.log("ball hit the goal 1");
		soundEffect('good.wav');
		ball.__dirtyPosition = true;
		ball.setLinearVelocity(new THREE.Vector3(randomizeXVelocity(),0,randomizeZVelocity()));
		ball.position.set(0, 2.5, 0);
		gameInfo.p1Score += 1;
	}
	if (other_object==goal2){
		console.log("ball hit the goal 2");
		soundEffect('good.wav');
		ball.__dirtyPosition = true;
		ball.setLinearVelocity(new THREE.Vector3(randomizeXVelocity(),0,randomizeZVelocity()));
		ball.position.set(0, 2.5, 0);
		gameInfo.p2Score += 1;
	}
}
)

offsetVec1 = new THREE.Vector3(-14,3,0);

p1Camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
p1Camera.position.addVectors(p1.position,offsetVec1);
p1Camera.lookAt(p2.position.x,0,0);

p2Camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
p2.add(p2Camera);
p2Camera.position.set(14,3,0);
p2Camera.lookAt(p1.position.x,0,0);

}

function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

function soundEffect(file){
	var listener = new THREE.AudioListener();
	camera.add(listener);
	var sound = new THREE.Audio(listener);

	var audioLoader = new THREE.AudioLoader();
	audioLoader.load( './sounds/'+file, function( buffer ) {
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
	Physijs.scripts.worker = './physijs_worker.js';
	Physijs.scripts.ammo = './ammo.js';
}

function randomizeXVelocity(){
	ballXVelocity = Math.floor((Math.random()*100)-50);
	if (ballXVelocity==0 || ballXVelocity>-40 && ballXVelocity<40){
		return randomizeXVelocity();
	} else {
		console.log("BallXVelocity is " + ballXVelocity);
		return ballXVelocity;
	}
}

function randomizeZVelocity(){
	ballZVelocity = Math.floor((Math.random()*100)-50);
	if (ballZVelocity==0 || ballZVelocity>-40 && ballZVelocity<40 ){
		return randomizeZVelocity();
	} else {
		console.log("BallZVelocity is " + ballZVelocity);
		return ballZVelocity;
	}
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

var keys = [];
function keydown(event){
	console.log(event.key)
	console.log(keys)
	keys[event.key] = true;

	//P1 Controls
	if(keys['w'] && keys['d']){
		controls.p1RightUpDiag = true;
	}

	if(keys['s'] && keys['d']){
		controls.p1RightDownDiag = true;
	}

	if(keys['w'] && keys['a']){
		controls.p1LeftUpDiag = true;
	}
	if(keys['a'] && keys['s']){
		controls.p1LeftDownDiag = true;
	}

	//P2 Controls
	if(keys['i'] && keys['j']){
		controls.p2LeftUpDiag = true;
	}
	if(keys['k'] && keys['j']){
		controls.p2LeftDownDiag = true;
	}
	if(keys['i'] && keys['l']){
		controls.p2RightUpDiag = true;
	}
	if(keys['l'] && keys['k']){
		controls.p2RightDownDiag = true;
	}
	
	switch (event.key){
		case "p": scene = initScene(); createMainScene(); soundEffect('menuselect.wav'); console.log("Scene changed..."); break;
		case "1": gameInfo.camera = p1Camera; break;
		case "2": gameInfo.camera = p2Camera; break;
		case "3": gameInfo.camera = camera; break;

		// Player 1 controls
		case "d": controls.p1Left = true; break;
		case "a": controls.p1Right = true; break;
		case "s": controls.p1Fwd = true; break;
		case "w": controls.p1Bwd = true; break;

		// Player 2 controls
		case "j": controls.p2Left = true; break;
		case "l": controls.p2Right = true; break;
		case "k": controls.p2Fwd = true; break;
		case "i": controls.p2Bwd = true; break;
	}

}

function keyup(event){
	keys[event.key] = false;
	//P1 Diagonal Controls


	switch (event.key){
		// Player 1 controls
		case "d": controls.p1Left = false; p1.setLinearVelocity(new THREE.Vector3(0, p1.getWorldDirection().y, p1.getWorldDirection().z)); break;
		case "a": controls.p1Right = false; p1.setLinearVelocity(new THREE.Vector3(0, p1.getWorldDirection().y, p1.getWorldDirection().z)); break;
		case "s": controls.p1Fwd = false; p1.setLinearVelocity(new THREE.Vector3(p1.getWorldDirection().x, p1.getWorldDirection().y, 0)); break;
		case "w": controls.p1Bwd = false; p1.setLinearVelocity(new THREE.Vector3(p1.getWorldDirection().x, p1.getWorldDirection().y, 0)); break;

		// Player 2 controls
		case "j": controls.p2Left = false; p2.setLinearVelocity(new THREE.Vector3(0, p2.getWorldDirection().y, p2.getWorldDirection().z)); break;
		case "l": controls.p2Right = false; p2.setLinearVelocity(new THREE.Vector3(0, p2.getWorldDirection().y, p2.getWorldDirection().z)); break;
		case "k": controls.p2Fwd = false; p2.setLinearVelocity(new THREE.Vector3(p2.getWorldDirection().x, p2.getWorldDirection().y, 0)); break;
		case "i": controls.p2Bwd = false; p2.setLinearVelocity(new THREE.Vector3(p2.getWorldDirection().x, p2.getWorldDirection().y, 0)); break;
	}
	if((!keys['w'] || !keys['d']) || (!keys['w'] && !keys['d'])){
		controls.p1RightUpDiag = false;
		//p1.setLinearVelocity(new THREE.Vector3(p1.getWorldDirection().x, p1.getWorldDirection().y, p1.getWorldDirection().z));
	}
	if((!keys['s'] || !keys['d']) || (!keys['s'] && !keys['d'])){
		controls.p1RightDownDiag = false;
		//p1.setLinearVelocity(new THREE.Vector3(p1.getWorldDirection().x, p1.getWorldDirection().y, p1.getWorldDirection().z));
	}
	if((!keys['w'] || !keys['a']) || (!keys['w'] && !keys['a'])){
		controls.p1LeftUpDiag = false;
	}
	if((!keys['a'] || !keys['s']) || (!keys['a'] && !keys['s'])){
		controls.p1LeftDownDiag = false;
	}
	//P2 Diagonal Controls
	if((!keys['i'] || !keys['j']) || (!keys['i'] && !keys['j'])){
		controls.p2LeftUpDiag = false;
	}
	if((!keys['k'] || !keys['j']) || (!keys['k'] && !keys['j'])){
		controls.p2LeftDownDiag = false;
	}
	if((!keys['i'] || !keys['l']) || (!keys['i'] && !keys['l'])){
		controls.p2RightUpDiag = false;
	}
	if((!keys['l'] || !keys['k']) || (!keys['l'] && !keys['k'])){
		controls.p2RightDownDiag = false;
	}
}

function createImageMesh(image){
	var geometry = new THREE.BoxGeometry( 1, 1, 1);
	var texture = new THREE.TextureLoader().load( './images/'+image );
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
	var texture = new THREE.TextureLoader().load("./textures/pokemonfield.png" );
	var material = new THREE.MeshLambertMaterial ({color: color, map: texture, side:THREE.DoubleSide});
	var plane = new THREE.Mesh(geometry, material);
	plane.rotateX(Math.PI/2);
	return plane;
}

function createBall(){
	var geometry = new THREE.SphereGeometry( 2, 200, 200);
	var texture = new THREE.TextureLoader().load("./textures/pokeball.png" );
	var material = new THREE.MeshLambertMaterial( { color: 0xffffff, map: texture} );
	var pmaterial = new Physijs.createMaterial(material,0.01,0);
	var mesh = new Physijs.SphereMesh( geometry, pmaterial );
	mesh.setDamping(0.1,0.1);
	mesh.castShadow = true;
	mesh.setCcdMotionThreshold(200);
	mesh.setCcdSweptSphereRadius(100);
	return mesh;
}

function controlsHandling(){
	p1Direction = new THREE.Vector3(0,0,0);
	if(controls.p1Fwd || controls.p1Bwd){
		p1Direction = new THREE.Vector3(p1Direction.x, p1Direction.y, 1);
		if (controls.p1Fwd){
			p1.setLinearVelocity(new THREE.Vector3(p1Direction.x, p1Direction.y, p1Direction.z * controls.p1PaddleSpeed));
		}
		else if (controls.p1Bwd){
			p1.setLinearVelocity(new THREE.Vector3(p1Direction.x, p1Direction.y, -p1Direction.z * controls.p1PaddleSpeed));
		}
	}
	if(controls.p1Left || controls.p1Right){
		p1Direction = new THREE.Vector3(1, p1Direction.y, p1Direction.z);
		if (controls.p1Left){
			p1.setLinearVelocity(new THREE.Vector3(p1Direction.x * controls.p1PaddleSpeed, p1Direction.y, p1Direction.z));
		}
		else if (controls.p1Right){
			p1.setLinearVelocity(new THREE.Vector3(-p1Direction.x * controls.p1PaddleSpeed, p1Direction.y, p1Direction.z));
		}
	}
	if(controls.p1RightUpDiag || controls.p1RightDownDiag){
		p1Direction = new THREE.Vector3(p1Direction.x, p1Direction.y, 1);
		if (controls.p1RightUpDiag){
			p1.setLinearVelocity(new THREE.Vector3(p1Direction.x*controls.p1PaddleSpeed, p1Direction.y, -p1Direction.z * controls.p1PaddleSpeed));
		}
		else if (controls.p1RightDownDiag){
			p1.setLinearVelocity(new THREE.Vector3(p1Direction.x*controls.p1PaddleSpeed, p1Direction.y, p1Direction.z * controls.p1PaddleSpeed));
		}
	}
	if(controls.p1LeftUpDiag || controls.p1LeftDownDiag){
		p1Direction = new THREE.Vector3(1,p1Direction.y, p1Direction.z);
		if (controls.p1LeftUpDiag){
			p1.setLinearVelocity(new THREE.Vector3(-p1Direction.x*controls.p1PaddleSpeed, p1Direction.y, -p1Direction.z * controls.p1PaddleSpeed));
		}
		else if (controls.p1LeftDownDiag){
			p1.setLinearVelocity(new THREE.Vector3(-p1Direction.x*controls.p1PaddleSpeed, p1Direction.y, p1Direction.z * controls.p1PaddleSpeed));
		}
	}
	p1.__dirtyRotation = true;
	p1.rotation.set(0, 0, 0);

	p2Direction = new THREE.Vector3(0,0,0);
	if(controls.p2Fwd || controls.p2Bwd){
		p2Direction = new THREE.Vector3(p2Direction.x, p2Direction.y, 1);
		if (controls.p2Fwd){
			p2.setLinearVelocity(new THREE.Vector3(p2Direction.x, p2Direction.y, p2Direction.z * controls.p2PaddleSpeed));
		}
		else if (controls.p2Bwd){
			p2.setLinearVelocity(new THREE.Vector3(p2Direction.x, p2Direction.y, -p2Direction.z * controls.p2PaddleSpeed));
		}
	}
	if(controls.p2Left || controls.p2Right){
		p2Direction = new THREE.Vector3(1, p2Direction.y, p2Direction.z);
		if (controls.p2Left){
			p2.setLinearVelocity(new THREE.Vector3(-p2Direction.x * controls.p2PaddleSpeed, p2Direction.y, p2Direction.z));
		}
		else if (controls.p2Right){
			p2.setLinearVelocity(new THREE.Vector3(p2Direction.x * controls.p2PaddleSpeed, p2Direction.y, p2Direction.z));
		}
	}
	if(controls.p2RightUpDiag || controls.p2RightDownDiag){
		p1Direction = new THREE.Vector3(p2Direction.x, p2Direction.y, 1);
		if (controls.p2RightUpDiag){
			p2.setLinearVelocity(new THREE.Vector3(p2Direction.x*controls.p2PaddleSpeed, p2Direction.y, -p2Direction.z * controls.p2PaddleSpeed));
		}
		else if (controls.p2RightDownDiag){
			p2.setLinearVelocity(new THREE.Vector3(p2Direction.x*controls.p2PaddleSpeed, p2Direction.y, p2Direction.z * controls.p2PaddleSpeed));
		}
	}
	if(controls.p2LeftUpDiag || controls.p2LeftDownDiag){
		p1Direction = new THREE.Vector3(1,p2Direction.y, p2Direction.z);
		if (controls.p2LeftUpDiag){
			p2.setLinearVelocity(new THREE.Vector3(-p2Direction.x*controls.p2PaddleSpeed, p2Direction.y, -p2Direction.z * controls.p2PaddleSpeed));
		}
		else if (controls.p2LeftDownDiag){
			p2.setLinearVelocity(new THREE.Vector3(-p2Direction.x*controls.p2PaddleSpeed, p2Direction.y, p2Direction.z * controls.p2PaddleSpeed));
		}
	}
	p2.__dirtyRotation = true;
	p2.rotation.set(0, 0, 0);

}

function outOfBoundsHandling(){
	if(ball.position.y < -10){
		ball.__dirtyPosition = true;
		ball.position.y = 2;
		console.log("Recovered ball from out of bounds");
	}
	if(p1.position.y < -10){
		p1.__dirtyPosition = true;
		p1.position.y = 2;
		console.log("Recovered p1 from out of bounds");
	}
	if(p2.position.y < -10){
		p2.__dirtyPosition = true;
		p2.position.y = 2;
		console.log("Recovered p2 from out of bounds");
	}
}

function checkScore(){
	if(gameInfo.p1Score == Math.round(gameInfo.scoreThreshold)){
		console.log("check");
		createEndScene(true);
	}
	else if(gameInfo.p2Score == Math.round(gameInfo.scoreThreshold)){
		console.log("check");
		createEndScene(false);
	}
}

function colorChanges(){
	if (gameInfo.p1Color.toLowerCase() != ("#"+p1.material.color.getHexString())){
		p1.material.color.set(gameInfo.p1Color.toLowerCase());
	}
	if (gameInfo.p2Color.toLowerCase() != ("#"+p2.material.color.getHexString())){
		p2.material.color.set(gameInfo.p2Color.toLowerCase());
	}
	if (gameInfo.goal1Color.toLowerCase() != ("#"+goal1.material.color.getHexString())){
		goal1.material.color.set(gameInfo.goal1Color.toLowerCase());
	}
	if (gameInfo.goal2Color.toLowerCase() != ("#"+goal2.material.color.getHexString())){
		goal2.material.color.set(gameInfo.goal2Color.toLowerCase());
	}
	if (gameInfo.ballColor.toLowerCase() != ("#"+ball.material.color.getHexString())){
		ball.material.color.set(gameInfo.ballColor.toLowerCase());
	}
	if (gameInfo.gameBoardColor.toLowerCase() != ("#"+gameBoard.material.color.getHexString())){
		gameBoard.material.color.set(gameInfo.gameBoardColor.toLowerCase());
	}
}

function materialChanges(){

	var loader = new THREE.TextureLoader();
	loader.setCrossOrigin("anonymous");

	if (gameInfo.p1Texture != gameInfo.lastP1Texture){
		p1.material = new THREE.MeshLambertMaterial({color: p1.material.color, map: loader.load(gameInfo.p1Texture), side: THREE.DoubleSide});
		gameInfo.lastP1Texture = gameInfo.p1Texture;
	}
	if (gameInfo.p2Texture != gameInfo.lastP2Texture){
		p2.material = new THREE.MeshLambertMaterial({color: p2.material.color, map: loader.load(gameInfo.p2Texture), side: THREE.DoubleSide});
		gameInfo.lastP2Texture = gameInfo.p2Texture;
	}
	if (gameInfo.goal1Texture != gameInfo.lastGoal1Texture){
		goal1.material = new THREE.MeshLambertMaterial({color: goal1.material.color, map: loader.load(gameInfo.goal1Texture), side: THREE.DoubleSide});
		gameInfo.lastGoal1Texture = gameInfo.goal1Texture;
	}
	if (gameInfo.goal2Texture != gameInfo.lastGoal2Texture){
		goal2.material = new THREE.MeshLambertMaterial({color: goal2.material.color, map: loader.load(gameInfo.goal2Texture), side: THREE.DoubleSide});
		gameInfo.lastGoal2Texture = gameInfo.goal2Texture;
	}
	if (gameInfo.ballTexture != gameInfo.lastBallTexture){
		ball.material = new THREE.MeshLambertMaterial({color: ball.material.color, map: loader.load(gameInfo.ballTexture), side: THREE.DoubleSide});
		gameInfo.lastBallTexture = gameInfo.ballTexture;
	}
	if (gameInfo.gameBoardTexture != gameInfo.lastGameBoardTexture){
		gameBoard.material = new THREE.MeshLambertMaterial({color: gameBoard.material.color, map: loader.load(gameInfo.gameBoardTexture), side: THREE.DoubleSide});
		gameInfo.lastGameBoardTexture = gameInfo.gameBoardTexture;
	}
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
		controlsHandling();
		outOfBoundsHandling();
		checkScore();
		colorChanges();
		materialChanges();
		var info = document.getElementById("info");
		info.innerHTML = '<div style="color: white; font-size:24pt; text-align: center; font-family: GameFont, sans-serif;">Blue Score: ' + gameInfo.p1Score + ' Red Score: '+ gameInfo.p2Score + '<br>Coded with <3 by Team 10</div>';
		break;

		case "end":
		renderer.render(endScene, endCamera);
		break;

		default:
		console.log("Invalid state. Scene name selected: "+ gameInfo.scene);
	}
}
