const { Engine, Render, World, Bodies } = Matter;

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const WALL_THICKNESS = 60;
const GROUND_HEIGHT = 60;
const FRUIT_BASE_RADIUS = 40;
const FRUIT_SIZE_INCREMENT = 20;
const START_Y_OFFSET = FRUIT_BASE_RADIUS + 1;

const engine = Engine.create();

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

    if (bodyA.sizeLevel !== undefined && bodyA.sizeLevel === bodyB.sizeLevel) {
      const newSizeLevel = bodyA.sizeLevel + 1;
      const newX = (bodyA.position.x + bodyB.position.x) / 2;
      const newY = (bodyA.position.y + bodyB.position.y) / 2;

      World.remove(engine.world, [bodyA, bodyB]);

      dropFruit(newX, newY, newSizeLevel);
    }
  });
});

render.canvas.addEventListener('mousedown', function(event) {
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
  // Matter.Engine.clear(engine);
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
}

Matter.Runner.run(runner, engine);

Render.run(render);
Engine.run(engine);
