const tileWidth = 101;
const tileHeight = 83;


class Enemy {
	constructor() {
		this.sprite = 'images/enemy-bug.png';
		this.speedMultiplier = Math.random() * (4 - 1) + 1;
		this.randomizeStartingPosition();
	}

	// Update the enemy's position
	// Parameter: dt, a time delta between ticks
	update(dt) {
		this.x += 100 * this.speedMultiplier * dt;

		if (this.x > 909) {
			this.randomizeStartingPosition();
		}
	}

	randomizeStartingPosition() {
		this.xStartPositions = [-101, -202, -303];
		this.yStartPositions = [45, 128, 211, 294, 377];
		this.x = this.xStartPositions[Math.floor(Math.random() * (3))];
		this.y = this.yStartPositions[Math.floor(Math.random() * (5))];
	}

	render() {
		ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
	}
};


class Player {
	constructor() {
		this.sprite = 'images/char-boy.png';
		this.x = tileWidth * 4;
		this.y = 460;
		this.lives = 2;
		this.gemsCollected = 0;
	}

	render() {
		ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
	}

	getGem() {
		this.gemsCollected += 1;

		// Add new enemy for every 10 gems collected
		switch (this.gemsCollected) {
			case 10:
			case 20:
			case 30:
			case 40:
				allEnemies.push(new Enemy());
			break;
			case 50:
				// You win
			break;
			default:
			break;
		}
	}

	hide() {
		this.x = -200;
		this.y = -200;
	}

	reset() {
		this.x = tileWidth * 4;
		this.y = 460;
		this.lives -= 1;
	}

	handleInput(key) {
		switch (key) {
			case 'left':
				this.x -= (this.x > 0) ? tileWidth : 0;
			break;
			case 'right':
				this.x += (this.x < 808) ? tileWidth : 0;
			break;
			case 'up':
				this.y -= (this.y > -32) ? tileHeight : 0;
			break;
			case 'down':
				this.y += (this.y < 383) ? tileHeight : 0;
			break;
		}
	}
}


class Gem {
	constructor() {
		this.sprite = 'images/gem-orange.png';
		this.x = 404;
		this. y = 211;
	}

	randomizeSpawnPosition() {
		this.xSpawnPositions = [101, 202, 303, 404, 505, 606, 707];
		this.ySpawnPositions = [45, 128, 211, 294, 377];
		this.x = this.xSpawnPositions[Math.floor(Math.random() * (7))];
		this.y = this.ySpawnPositions[Math.floor(Math.random() * (5))];
	}

	randomizeSprite() {
		this.sprites = ['images/gem-orange.png', 'images/gem-green.png', 'images/gem-blue.png']
		this.sprite = this.sprites[Math.floor(Math.random() * (3))];
	}

	render() {
		ctx.drawImage(Resources.get(this.sprite), this.x + 17, this.y + 50, 66, 113);
	}
}


class Splatter {
	constructor() {
		this.sprite = 'images/blood1.png';
		this.x = '-200';
		this.y = '-200';
	}

	drawBlood() {
		this.sprites = ['images/blood1.png', 'images/blood2.png', 'images/blood3.png']
		this.sprite = this.sprites[player.lives];
		this.x = player.x;
		this.y = player.y + 90;
	}

	render() {
		ctx.drawImage(Resources.get(this.sprite), this.x, this.y, 140, 70);
	}
}


let player = new Player();
let gem = new Gem();

let splatters = [];
for (let i = 0; i < 3; i++) {
	splatters[i] = new Splatter();
}

let allEnemies = [];
for (let i = 0; i < 6; i++) {
	allEnemies[i] = new Enemy();
}


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
	const allowedKeys = {
		37: 'left',
		38: 'up',
		39: 'right',
		40: 'down'
	};

	player.handleInput(allowedKeys[e.keyCode]);
});
