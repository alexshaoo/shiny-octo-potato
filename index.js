import { CONSTANTS, mulberry32 } from "./constants.js";

const {
  Engine,
  Render,
  Runner,
  MouseConstraint,
  Mouse,
  Composite,
  Body,
  Bodies,
  Events,
} = Matter;

const rand = mulberry32(Date.now());

let fruitImages = {};

function preloadFruitImages() {
  Game.fruitSizes.forEach(fruit => {
    const img = new Image();
    img.src = fruit.img;
    fruitImages[fruit.img] = img;
  });
}

const Game = {
  width: 640,
  height: 960,
  elements: {
    canvas: document.getElementById("game-canvas"),
    ui: document.getElementById("game-ui"),
    score: document.getElementById("game-score"),
    end: document.getElementById("game-end-container"),
    endTitle: document.getElementById("game-end-title"),
    statusValue: document.getElementById("game-highscore-value"),
    nextFruitImg: document.getElementById("game-next-fruit"),
    previewBall: null,
  },
  cache: { highscore: 0 },

  stateIndex: CONSTANTS.GAME_STATES.MENU,

  score: 0,
  fruitsMerged: [],
  calculateScore: function () {
    const score = Game.fruitsMerged.reduce((total, count, sizeIndex) => {
      const value = Game.fruitSizes[sizeIndex].scoreValue * count;
      return total + value;
    }, 0);

    Game.score = score;
    Game.elements.score.innerText = Game.score;
  },

  fruitSizes: [
    { radius: 24, scoreValue: 1, img: "./img/circle0.png" },
    { radius: 32, scoreValue: 3, img: "./img/circle1.png" },
    { radius: 40, scoreValue: 6, img: "./img/circle2.png" },
    { radius: 56, scoreValue: 10, img: "./img/circle3.png" },
    { radius: 64, scoreValue: 15, img: "./img/circle4.png" },
    { radius: 72, scoreValue: 21, img: "./img/circle5.png" },
    { radius: 84, scoreValue: 28, img: "./img/circle6.png" },
    { radius: 96, scoreValue: 36, img: "./img/circle7.png" },
    { radius: 128, scoreValue: 45, img: "./img/circle8.png" },
    { radius: 160, scoreValue: 55, img: "./img/circle9.png" },
    { radius: 192, scoreValue: 66, img: "./img/circle10.png" },
  ],
  currentFruitSize: 0,
  nextFruitSize: 0,
  setNextFruitSize: function () {
    Game.nextFruitSize = Math.floor(rand() * 5);
    Game.elements.nextFruitImg.src = `./img/circle${Game.nextFruitSize}.png`;
  },
  showHighscore: function () {
    Game.elements.statusValue.innerText = Game.cache.highscore;
  },
  loadHighscore: function () {
    const gameCache = localStorage.getItem("suika-game-cache");
    if (gameCache === null) {
      Game.saveHighscore();
      return;
    }

    Game.cache = JSON.parse(gameCache);
    Game.showHighscore();
  },
  saveHighscore: function () {
    Game.calculateScore();
    if (Game.score < Game.cache.highscore) return;

    Game.cache.highscore = Game.score;
    Game.showHighscore();
    Game.elements.endTitle.innerText = "New Highscore!";

    localStorage.setItem("suika-game-cache", JSON.stringify(Game.cache));
  },
  initGame: function () {
    Render.run(render);
    Runner.run(runner, engine);

    Composite.add(engine.world, menuStatics);

    Game.loadHighscore();
    Game.elements.ui.style.display = "none";
    Game.fruitsMerged = Array.apply(null, Array(Game.fruitSizes.length)).map(
      () => 0
    );

    const menuMouseDown = function () {
      if (
        mouseConstraint.body === null ||
        mouseConstraint.body?.label !== "btn-start"
      ) {
        return;
      }

      Events.off(mouseConstraint, "mousedown", menuMouseDown);
      Game.startGame();
    };

    Events.on(mouseConstraint, "mousedown", menuMouseDown);
  },

  startGame: function () {
    Composite.remove(engine.world, menuStatics);
    Composite.add(engine.world, gameBorders);

    Game.calculateScore();
    Game.elements.endTitle.innerText = "Game Over!";
    Game.elements.ui.style.display = "block";
    Game.elements.end.style.display = "none";
    Game.elements.previewBall = Game.generateFruitBody(
      Game.width / 2,
      CONSTANTS.PREVIEW_BALL_HEIGHT,
      0,
      { isStatic: true }
    );
    Composite.add(engine.world, Game.elements.previewBall);

    setTimeout(() => {
      Game.stateIndex = CONSTANTS.GAME_STATES.READY;
    }, 250);

    Events.on(mouseConstraint, "mouseup", function (e) {
      Game.addFruit(e.mouse.position.x);
    });

    Events.on(mouseConstraint, "mousemove", function (e) {
      if (Game.stateIndex !== CONSTANTS.GAME_STATES.READY) return;
      if (Game.elements.previewBall === null) return;

      Game.elements.previewBall.position.x = e.mouse.position.x;
    });

    Events.on(engine, "collisionStart", function (e) {
      for (let i = 0; i < e.pairs.length; i++) {
        const { bodyA, bodyB } = e.pairs[i];

        // Skip if collision is wall
        if (bodyA.isStatic || bodyB.isStatic) continue;

        const aY = bodyA.position.y + bodyA.circleRadius;
        const bY = bodyB.position.y + bodyB.circleRadius;

        if (aY < CONSTANTS.WALL_PAD || bY < CONSTANTS.WALL_PAD) {
          Game.loseGame();
          return;
        }

        // Skip different sizes
        if (bodyA.sizeIndex !== bodyB.sizeIndex) continue;

        let newSize = bodyA.sizeIndex + 1;

        // Go back to smallest size
        if (
          bodyA.circleRadius >=
          Game.fruitSizes[Game.fruitSizes.length - 1].radius
        ) {
          newSize = 0;
        }

        Game.fruitsMerged[bodyA.sizeIndex] += 1;

        // Therefore, circles are same size, so merge them.
        const midPosX = (bodyA.position.x + bodyB.position.x) / 2;
        const midPosY = (bodyA.position.y + bodyB.position.y) / 2;

        Composite.remove(engine.world, [bodyA, bodyB]);
        Composite.add(
          engine.world,
          Game.generateFruitBody(midPosX, midPosY, newSize)
        );
        Game.calculateScore();
      }
    });
  },

  loseGame: function () {
    Game.stateIndex = CONSTANTS.GAME_STATES.LOSE;
    Game.elements.end.style.display = "flex";
    runner.enabled = false;
    Game.saveHighscore();
  },

  // Returns an index, or null
  lookupFruitIndex: function (radius) {
    const sizeIndex = Game.fruitSizes.findIndex(
      (size) => size.radius == radius
    );
    if (sizeIndex === undefined) return null;
    if (sizeIndex === Game.fruitSizes.length - 1) return null;

    return sizeIndex;
  },

  generateFruitBody: function (x, y, sizeIndex, extraConfig = {}) {
    const size = Game.fruitSizes[sizeIndex];
    const img = fruitImages[size.img];
  
    // Ensure the image is loaded
    if (!img.complete) {
      console.error("Image not loaded");
      return;
    }
  
    const actualWidth = img.width;
    const desiredDiameter = size.radius * 2;
    const scale = desiredDiameter / actualWidth;
  
    const circle = Bodies.circle(x, y, size.radius, {
      ...CONSTANTS.FRICTION,
      ...extraConfig,
      render: {
        sprite: {
          texture: size.img,
          xScale: scale,
          yScale: scale
        }
      }
    });
  
    circle.sizeIndex = sizeIndex;
  
    return circle;
  },
  

  addFruit: function (x) {
    if (Game.stateIndex !== CONSTANTS.GAME_STATES.READY) return;

    Game.stateIndex = CONSTANTS.GAME_STATES.DROP;
    const latestFruit = Game.generateFruitBody(
      x,
      CONSTANTS.PREVIEW_BALL_HEIGHT,
      Game.currentFruitSize
    );
    Composite.add(engine.world, latestFruit);

    Game.currentFruitSize = Game.nextFruitSize;
    Game.setNextFruitSize();
    Game.calculateScore();

    Composite.remove(engine.world, Game.elements.previewBall);
    Game.elements.previewBall = Game.generateFruitBody(
      render.mouse.position.x,
      CONSTANTS.PREVIEW_BALL_HEIGHT,
      Game.currentFruitSize,
      {
        isStatic: true,
        collisionFilter: { mask: 0x0040 },
      }
    );

    setTimeout(() => {
      if (Game.stateIndex === CONSTANTS.GAME_STATES.DROP) {
        Composite.add(engine.world, Game.elements.previewBall);
        Game.stateIndex = CONSTANTS.GAME_STATES.READY;
      }
    }, 500);
  },
};

const engine = Engine.create();
const runner = Runner.create();
const render = Render.create({
  element: Game.elements.canvas,
  engine,
  options: {
    width: Game.width,
    height: Game.height,
    wireframes: false,
    background: "#ffdcae",
  },
});

const menuStatics = [
  Bodies.rectangle(Game.width / 2, Game.height * 0.4, 512, 512, {
    isStatic: true,
    render: { sprite: { texture: "./img/bg-menu.png" } },
  }),

  Bodies.rectangle(Game.width / 2, Game.height * 0.75, 512, 96, {
    isStatic: true,
    label: "btn-start",
    render: { sprite: { texture: "./img/btn-start.png" } },
  }),
];

const wallProps = {
  isStatic: true,
  render: { fillStyle: "#FFEEDB" },
  ...CONSTANTS.FRICTION,
};

const gameBorders = [
  Bodies.rectangle(
    -(CONSTANTS.WALL_PAD / 2),
    Game.height / 2,
    CONSTANTS.WALL_PAD,
    Game.height,
    wallProps
  ),
  Bodies.rectangle(
    Game.width + CONSTANTS.WALL_PAD / 2,
    Game.height / 2,
    CONSTANTS.WALL_PAD,
    Game.height,
    wallProps
  ),
  Bodies.rectangle(
    Game.width / 2,
    Game.height + CONSTANTS.WALL_PAD / 2 - CONSTANTS.STATUS_BAR_HEIGHT,
    Game.width,
    CONSTANTS.WALL_PAD,
    wallProps
  ),
];

const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 0.2,
    render: {
      visible: false,
    },
  },
});
render.mouse = mouse;

Game.initGame();
preloadFruitImages();

const resizeCanvas = () => {
  const screenWidth = document.body.clientWidth;
  const screenHeight = document.body.clientHeight;

  let newWidth = Game.width;
  let newHeight = Game.height;
  let scaleUI = 1;

  if (screenWidth * 1.5 > screenHeight) {
    newHeight = Math.min(Game.height, screenHeight);
    newWidth = newHeight / 1.5;
    scaleUI = newHeight / Game.height;
  } else {
    newWidth = Math.min(Game.width, screenWidth);
    newHeight = newWidth * 1.5;
    scaleUI = newWidth / Game.width;
  }

  render.canvas.style.width = `${newWidth}px`;
  render.canvas.style.height = `${newHeight}px`;

  Game.elements.ui.style.width = `${Game.width}px`;
  Game.elements.ui.style.height = `${Game.height}px`;
  Game.elements.ui.style.transform = `scale(${scaleUI})`;
};

document.body.onload = resizeCanvas;
document.body.onresize = resizeCanvas;
