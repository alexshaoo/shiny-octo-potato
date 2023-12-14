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

function dropFruit(x) {
  const radius = 20;
  const y = -radius * 2;
  const fruit = Bodies.circle(x, y, radius, {
    density: 0.001,
    frictionAir: 0.0,
    restitution: 0.8,
    friction: 0.1,
  });
  World.add(engine.world, fruit);
}

render.canvas.addEventListener('mousedown', function(event) {
  const canvasBounds = render.canvas.getBoundingClientRect();
  const scaleX = render.canvas.width / canvasBounds.width;
  const scaleY = render.canvas.height / canvasBounds.height;
  const canvasX = event.clientX - canvasBounds.left;
  const canvasY = event.clientY - canvasBounds.top;

  dropFruit(canvasX * scaleX, canvasY * scaleY);
});

Render.run(render);
Engine.run(engine);
