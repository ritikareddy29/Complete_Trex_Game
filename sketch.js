//TREX GAme using JS

//Declare variables for game objects and behaviour indicators(FLAGS)
var trex, trexRun, trexDead;
var ground, groundImg, invGround;
var cloud, cloudImage, cloudsGroup;
var obstacle, obsGroup, cactus1, cactus2, cactus3, cactus4, cactus5, cactus6;
var gameOver, reset, resetImg, gameOverImg;
var score, hiScore, displayHS;
var PLAY, END, gameState;
var jumpSound, die, checkPoint;

//Create Media library and load to use it during the course of the software
//executed only once at the start of the program
function preload() {
  trexRun = loadAnimation("trex1.png", "trex3.png", "trex4.png");
  trexDead = loadImage("trex_collided.png");

  groundImg = loadImage("ground2.png");

  cloudImage = loadImage("cloud.png");

  cactus1 = loadImage("obstacle1.png");
  cactus2 = loadImage("obstacle2.png");
  cactus3 = loadImage("obstacle3.png");
  cactus4 = loadImage("obstacle4.png");
  cactus5 = loadImage("obstacle5.png");
  cactus6 = loadImage("obstacle6.png");

  resetImg = loadImage("restart.png");
  gameOverImg = loadImage("gameOver.png");

  jumpSound = loadSound("jump.mp3");
  dieSound = loadSound("die.mp3");
  checkSound = loadSound("checkpoint.mp3");
}

//define the intial environment of the software(before it is used)
//by defining the declared variables with default values
//executed only once at the start of the program
function setup() {
  createCanvas(windowWidth, windowHeight);

  //create a trex sprite
  trex = createSprite(50, height - 130, 20, 50);
  trex.addAnimation("trexRun", trexRun);
  trex.addAnimation("trexDead", trexDead);
  trex.scale = 0.6;
  trex.debug = false;
  trex.setCollider("rectangle", 0, 0, 70, 100);

  //creating the ground sprite
  ground = createSprite(width / 2, height - 150, 600, 4);
  ground.addAnimation("moving", groundImg);
  ground.x = ground.width / 2;
  ground.debug = false;
  //creating the invisible ground sprite
  invGround = createSprite(50, height - 125, 200, 4);
  invGround.visible = false;

  //variables for score, highscore values
  score = 0;
  hiScore = 0;
  //indicator to check if highscore should be displayed or not
  displayHS = false;

  //default value of Gamestate
  PLAY = 1;
  END = 0;
  gameState = PLAY;

  obsGroup = createGroup();
  cloudsGroup = createGroup();

  reset = createSprite(width / 2, height / 2 + 50, 30, 30);
  reset.addImage("resetImg", resetImg);
  reset.scale = 0.5;

  gameOver = createSprite(width / 2, height / 2, 70, 10);
  gameOver.addImage("gameOverImg", gameOverImg);
  gameOver.scale = 0.9;
  gameOver.visible = false;
}

//All modifications, changes, conditions, manipulations, actions during the course of the program are written inside function draw.
//All commands to be executed and checked continously or applied throughout the program are written inside function draw.
//function draw is executed for every frame created since the start of the program.
function draw() {
  background("white");

  //display Score
  text("Score:" + score, width - 100, height - 210);
  //console.log(trex.y);

  if (gameState == PLAY) {
    //Score Calculation
    score = score + round(getFrameRate() / 30);

    //display High Score or not
    if (displayHS == true) {
      fill("black");
      stroke("black");
      text("High Score:" + hiScore, width - 200, height - 210);
    }

    //score sound for addition of every 100
    if (score % 100 == 0) {
      checkSound.play();
    }

    //console.log(height);
    //console.log(trex.y);

    //trex behaviour
    if ((touches.length == 1 || keyDown("space")) && trex.y > height - 160) {
      trex.velocityY = -13;
      jumpSound.play();
      touches = [];
    }
    trex.velocityY = trex.velocityY + 0.5;

    //ground behaviour
    ground.velocityX = -(7 + score / 70);
    if (ground.x < 0) {
      ground.x = ground.width / 2;
    }

    //function call to create and move clouds
    spawnClouds();

    //function call to create and move obstacles
    spawnObstacles();

    if (obsGroup.isTouching(trex)) {
      gameState = END;
      dieSound.play();
      //trex.velocityY = -6;
      //jumpSound.play();
    }
    reset.visible = false;
    gameOver.visible = false;
  } else if (gameState == END) {
    ground.velocityX = 0;
    trex.velocityY = 0;

    trex.changeAnimation("trexDead", trexDead);

    obsGroup.setVelocityXEach(0);
    cloudsGroup.setVelocityXEach(0);

    obsGroup.setLifetimeEach(-1);
    cloudsGroup.setLifetimeEach(-1);

    reset.visible = true;
    gameOver.visible = true;

    if (hiScore < score) {
      hiScore = score;
    }
    fill("black");
    stroke("black");
    text("High Score:" + hiScore, width - 200, height - 210);

    if (mousePressedOver(reset)) {
      startOver();
    }
  }

  trex.collide(invGround);
  drawSprites();
}

//function definition to create and move clouds
function spawnClouds() {
  if (frameCount % 30 == 0) {
    cloud = createSprite(width, height - 200, 10, 10);
    cloud.velocityX = -4;
    cloud.y = random(height - 275, height - 200);
    cloud.depth = trex.depth;
    trex.depth = trex.depth + 1;
    cloud.debug = false;
    cloud.addImage("cloud", cloudImage);
    cloud.scale = 0.5;
    cloudsGroup.add(cloud);
  }
}

//function definition to create and move obstacles
function spawnObstacles() {
  //create cactus objects after every 60 frames
  //to attain this we have to divide the framecount by 60 and check if the remainder is equal to zero
  //if framecount is divisible by given number then a cactus object will be created
  if (frameCount % 60 == 0) {
    //create and define a cactus sprite object in declare variable
    obstacle = createSprite(width, height - 160, 20, 50);

    //velocity of cactus which make sit move from left to right
    obstacle.velocityX = -(7 + score / 120);
    obstacle.debug = false;

    //generating lifetime to solve the problem of memory leak
    //by dividing the distance to be crossed by the object with the speed of the object.
    //here width = width of canvas(400) and speed is velocity of cactus(-6)
    //as velocity is negative, we need to make the lifetime as positive by muliplying the answer with -1;
    obstacle.lifetime = -1 * (width / obstacle.velocityX);

    //random is a function used to egnerate any number between given range.
    //Math.round function is used to round and convert any decimal number to its nearest whole integer.
    //generate a random number between 1 to 6 and save it in variable caseNumber.
    var caseNumber = Math.round(random(1, 6));
    console.log(caseNumber);
    //switch case passes a single variable to match with cases
    switch (caseNumber) {
      case 1:
        obstacle.addImage("cactus1", cactus1);
        //adjust the size of animation for cactus sprite by keeping the width and height ratio stable
        obstacle.scale = 0.9;
        break;
      case 2:
        obstacle.addImage("cactus2", cactus2);
        //adjust the size of animation for cactus sprite by keeping the width and height ratio stable
        obstacle.scale = 0.9;
        break;
      case 3:
        obstacle.addImage("cactus3", cactus3);
        //adjust the size of animation for cactus sprite by keeping the width and height ratio stable
        obstacle.scale = 0.85;
        break;
      case 4:
        obstacle.addImage("cactus4", cactus4);
        //adjust the size of animation for cactus sprite by keeping the width and height ratio stable
        obstacle.scale = 0.75;
        break;
      case 5:
        obstacle.addImage("cactus5", cactus5);
        //adjust the size of animation for cactus sprite by keeping the width and height ratio stable
        obstacle.scale = 0.7;
        break;
      case 6:
        obstacle.addImage("cactus6", cactus6);
        //adjust the size of animation for cactus sprite by keeping the width and height ratio stable
        obstacle.scale = 0.7;
        break;
      default:
        obstacle.addImage("cactus1", cactus1);
        //adjust the size of animation for cactus sprite by keeping the width and height ratio stable
        obstacle.scale = 0.9;
        break;
    }
    //Adding each cactus to Group
    //1. to detect collisons between trex and the group
    //2. to manage and track all cactus
    //3. because it it mot possible to modify or control any individual cactus

    //Group.add(sprite)
    obsGroup.add(obstacle);
  }
}

//function to reset score and startOver the game
function startOver() {
  gameState = PLAY;

  cloudsGroup.destroyEach();
  obsGroup.destroyEach();

  displayHS = true;
  trex.changeAnimation("trexRun", trexRun);
  if (hiScore < score) {
    hiScore = score;
  }
  score = 0;
}
