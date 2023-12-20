const { Engine, Render, World, Bodies } = Matter;

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const WALL_THICKNESS = 60;
const GROUND_HEIGHT = 60;
const FRUIT_BASE_RADIUS = 40;
const FRUIT_SIZE_INCREMENT = 20;
const START_Y_OFFSET = FRUIT_BASE_RADIUS + 1;

const engine = Engine.create();

const Game = {
  score: 0,
  highScore: 0,
  fruitSizes: [
    { radius: 24, scoreValue: 1, img: './assets/img/circle0.png' },
    { radius: 32, scoreValue: 3, img: './assets/img/circle1.png' },
    { radius: 40, scoreValue: 6, img: './assets/img/circle2.png' },
    { radius: 56, scoreValue: 10, img: './assets/img/circle3.png' },
    { radius: 64, scoreValue: 15, img: './assets/img/circle4.png' },
    { radius: 72, scoreValue: 21, img: './assets/img/circle5.png' },
    { radius: 84, scoreValue: 28, img: './assets/img/circle6.png' },
    { radius: 96, scoreValue: 36, img: './assets/img/circle7.png' },
    { radius: 128, scoreValue: 45, img: './assets/img/circle8.png' },
    { radius: 160, scoreValue: 55, img: './assets/img/circle9.png' },
    { radius: 192, scoreValue: 66, img: './assets/img/circle10.png' },
  ],
  currentFruitSize: 0,
  nextFruitSize: 0,
  fruitsMerged: [],
};

let isGameOver = false;

const render = Render.create({
  element: document.querySelector('#game-container'),
  engine: engine,
  options: {
    width: CANVAS_WIDTH, 
    height: CANVAS_HEIGHT, 
    wireframes: false 
  }
});

const ground = Bodies.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT - GROUND_HEIGHT / 2, CANVAS_WIDTH, GROUND_HEIGHT, { isStatic: true });
const leftWall = Bodies.rectangle(WALL_THICKNESS / 2, CANVAS_HEIGHT / 2, WALL_THICKNESS, CANVAS_HEIGHT, { isStatic: true });
const rightWall = Bodies.rectangle(CANVAS_WIDTH - WALL_THICKNESS / 2, CANVAS_HEIGHT / 2, WALL_THICKNESS, CANVAS_HEIGHT, { isStatic: true });

World.add(engine.world, [ground, leftWall, rightWall]);

function dropFruit(x, y, sizeLevel) {
  const radius = FRUIT_BASE_RADIUS + sizeLevel * FRUIT_SIZE_INCREMENT;
  const fruit = Bodies.circle(x, y, radius, {
    density: 0.001,
    frictionAir: 0.0,
    label: 'Fruit',
    restitution: 0.2,
    friction: 0.1,
    sizeLevel: sizeLevel
  });
  World.add(engine.world, fruit);
}

Matter.Events.on(engine, 'collisionStart', function(event) {
  let pairs = event.pairs;

  pairs.forEach(function(pair) {
    let bodyA = pair.bodyA;
    let bodyB = pair.bodyB;

    if (bodyA.label === 'Fruit' && bodyB.label === 'Fruit' && bodyA.sizeLevel !== undefined && bodyA.sizeLevel === bodyB.sizeLevel) {
      const newSizeLevel = Math.min(bodyA.sizeLevel + 1, Game.fruitSizes.length - 1);
      console.log(Game.score);
      const newX = (bodyA.position.x + bodyB.position.x) / 2;
      const newY = (bodyA.position.y + bodyB.position.y) / 2;

      Game.score += Game.fruitSizes[newSizeLevel].scoreValue;
      document.getElementById('game-score').innerText = "Score: " + Game.score;

      World.remove(engine.world, [bodyA, bodyB]);
      dropFruit(newX, newY, newSizeLevel);
    }
  });
});

render.canvas.addEventListener('mousedown', function(event) {
  if (isGameOver) return;

  const canvasBounds = render.canvas.getBoundingClientRect();
  const scaleX = render.canvas.width / canvasBounds.width;
  const canvasX = event.clientX - canvasBounds.left;

  dropFruit(canvasX * scaleX, START_Y_OFFSET, 0);
});

const runner = Matter.Runner.create();

function gameOver() {
  if (isGameOver) return;
  isGameOver = true;
  console.log("Game Over!");
  document.getElementById("game-over").style.display = "block";
  Matter.Runner.stop(runner);
  
  if (Game.score > Game.highScore) {
    Game.highScore = Game.score;
    document.getElementById('game-highscore').innerText = "High Score: " + Game.highScore;
  }
}

Matter.Events.on(engine, 'beforeUpdate', function() {
  for (let body of engine.world.bodies) {
    if (body.label === 'Fruit' && body.position.y - body.circleRadius <= 0) {
      gameOver();
      break;
    }
  }
});

function restartGame() {
  isGameOver = false;
  document.getElementById("game-over").style.display = "none";
  Matter.World.clear(engine.world, false);
  World.add(engine.world, [ground, leftWall, rightWall]);
  Engine.run(engine);

  Game.score = 0;
  document.getElementById('game-score').innerText = "Score: " + Game.score;
}

Matter.Runner.run(runner, engine);

Render.run(render);
Engine.run(engine);
