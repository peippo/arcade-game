const tileWidth = 101;
const tileHeight = 83;

// Enemies our player must avoid
class Enemy {
	constructor() {
		this.sprite = 'images/enemy-bug.png';
		this.speedMultiplier = Math.random() * (4 - 1) + 1;
		this.randomizeStartingPosition();
	}

	// Update the enemy's position, required method for game
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

	// Draw the enemy on the screen, required method for game
	render() {
		ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
	}
};



class Player {
	constructor() {
		this.sprite = 'images/char-boy.png';
		this.x = tileWidth * 4;
		this.y = 460;
	}

	render() {
		ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
	}

	update() {

	}

	hide() {
		this.x = -200;
		this.y = -200;
	}

	reset() {
		this.x = tileWidth * 4;
		this.y = 460;
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



class Splatter {
	constructor() {
		this.sprite = 'images/blood1.png';
		this.x = '-200';
		this.y = '-200';
	}

	update() {
		this.sprites = ['images/blood1.png', 'images/blood2.png', 'images/blood3.png']
		this.sprite = this.sprites[Math.floor(Math.random() * (3))];
		this.x = player.x;
		this.y = player.y + 90;
	}

	render() {
		// TODO fade out image after some time
		ctx.drawImage(Resources.get(this.sprite), this.x, this.y, 140, 70);
	}
}

let player = new Player();
let splatter = new Splatter();

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
