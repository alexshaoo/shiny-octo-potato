export const CONSTANTS = {
  WALL_THICKNESS: 60,
  GROUND_HEIGHT: 60,
  FRUIT_BASE_RADIUS: 4,
  FRUIT_SIZE_INCREMENT: 20,
  START_Y_OFFSET: 5,
  WALL_PAD: 64,
  LOSE_HEIGHT: 84,
  STATUS_BAR_HEIGHT: 48,
  PREVIEW_BALL_HEIGHT: 32,
  FRICTION: {
    friction: 0.006,
    frictionStatic: 0.006,
    frictionAir: 0,
    restitution: 0.1
  },
  GAME_STATES: {
    MENU: 0,
    READY: 1,
    DROP: 2,
    LOSE: 3,
  },
  FRUIT_SIZES: [
		{ radius: 24,  scoreValue: 1,  img: './img/circle0.png'  },
		{ radius: 32,  scoreValue: 3,  img: './img/circle1.png'  },
		{ radius: 40,  scoreValue: 6,  img: './img/circle2.png'  },
		{ radius: 56,  scoreValue: 10, img: './img/circle3.png'  },
		{ radius: 64,  scoreValue: 15, img: './img/circle4.png'  },
		{ radius: 72,  scoreValue: 21, img: './img/circle5.png'  },
		{ radius: 84,  scoreValue: 28, img: './img/circle6.png'  },
		{ radius: 96,  scoreValue: 36, img: './img/circle7.png'  },
		{ radius: 128, scoreValue: 45, img: './img/circle8.png'  },
		{ radius: 160, scoreValue: 55, img: './img/circle9.png'  },
		{ radius: 192, scoreValue: 66, img: './img/circle10.png' },
    // { radius: 48,  scoreValue: 1,  img: './img/circle0.png'  },
    // { radius: 64,  scoreValue: 3,  img: './img/circle1.png'  },
    // { radius: 80,  scoreValue: 6,  img: './img/circle2.png'  },
    // { radius: 112, scoreValue: 10, img: './img/circle3.png'  },
    // { radius: 128, scoreValue: 15, img: './img/circle4.png'  },
    // { radius: 144, scoreValue: 21, img: './img/circle5.png'  },
    // { radius: 168, scoreValue: 28, img: './img/circle6.png'  },
    // { radius: 192, scoreValue: 36, img: './img/circle7.png'  },
    // { radius: 256, scoreValue: 45, img: './img/circle8.png'  },
    // { radius: 320, scoreValue: 55, img: './img/circle9.png'  },
    // { radius: 384, scoreValue: 66, img: './img/circle10.png' },
	],
  WALL_PROPS: {
    isStatic: true,
    render: { fillStyle: '#FFEEDB' },
    friction: 0.006,
    frictionStatic: 0.006,
    frictionAir: 0,
    restitution: 0.1
  },
  RENDER_OPTIONS: {
    width: 640,
    height: 960,
    wireframes: false,
    background: '#ffdcae'
  }
};

// random number generator from https://stackoverflow.com/a/47593316
export function mulberry32(a) {
	return function() {
		let t = a += 0x6D2B79F5;
		t = Math.imul(t ^ t >>> 15, t | 1);
		t ^= t + Math.imul(t ^ t >>> 7, t | 61);
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	}
}
