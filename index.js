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

const testBox = Bodies.rectangle(400, 200, 80, 80, { isStatic: true });
World.add(engine.world, [testBox]);

Render.run(render);
Engine.run(engine);
