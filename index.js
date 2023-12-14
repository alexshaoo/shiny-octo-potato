const { Engine, Render, World, Bodies } = Matter;

const engine = Engine.create();

const render = Render.create({
  element: document.querySelector('#game-container'),
  engine: engine,
  options: {
    width: 800, 
    height: 600, 
    wireframes: false 
  }
});

const ground = Bodies.rectangle(400, 580, 810, 60, { isStatic: true });
const leftWall = Bodies.rectangle(0, 300, 60, 600, { isStatic: true });
const rightWall = Bodies.rectangle(800, 300, 60, 600, { isStatic: true });

World.add(engine.world, [ground, leftWall, rightWall]);

function dropFruit(x, y, sizeLevel) {
  const radius = 20 + sizeLevel * 10;
  const fruit = Bodies.circle(x, y, radius, {
    density: 0.001,
    frictionAir: 0.0,
    restitution: 0.8,
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

  dropFruit(canvasX * scaleX, -40, 0);
});

Render.run(render);
Engine.run(engine);
