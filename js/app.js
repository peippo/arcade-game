const tileWidth = 101;
const tileHeight = 83;
const heartCountElement = document.querySelector('.game-stats__lives');
const gemCountElement = document.querySelector('.js-gem-count');

// Sounds from opengameart.org
const gemSound = new Audio('sounds/Collect_Point_00.mp3');
const deathSound = new Audio('sounds/Explosion_03.mp3');
const gameOverSound = new Audio('sounds/Jingle_Lose_00.mp3');
const gameWinSound = new Audio('sounds/Jingle_Win_00.mp3');
gemSound.preload = 'auto';
deathSound.preload = 'auto';
gameOverSound.preload = 'auto';
gameWinSound.preload = 'auto';


class Enemy {
	constructor() {
		this.sprite = 'images/enemy-bug.png';
		this.speedMultiplier = 1;
		this.randomizeSettings();
	}

	// Update the enemy's position
	// Parameter: dt, a time delta between ticks
	update(dt) {
		this.x += 100 * this.speedMultiplier * dt;

		if (this.x > 909) {
			this.randomizeSettings();
		}
	}

	randomizeSettings() {
		this.speedMultiplier = Math.random() * (4 - 1) + 1;
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
		this.xStartPosition = 404;
		this.yStartPosition = 460;
		this.x = this.xStartPosition;
		this.y = this.yStartPosition;
		this.active = true;
		this.lives = 3;
		this.gemsCollected = 0;
	}

	render() {
		ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
	}

	getGem() {
		this.gemsCollected += 1;
		gemCountElement.innerHTML = (this.gemsCollected < 10) ? `0${this.gemsCollected}/50` : `${this.gemsCollected}/50`;
		this.playCollectSound();

		// Add new enemy for every 10 gems collected
		switch (this.gemsCollected) {
			case 10:
			case 20:
			case 30:
			case 40:
				allEnemies.push(new Enemy());
			break;
			case 50:
				gameWinSound.play();
			break;
			default:
			break;
		}
	}

	playCollectSound() {
		// Clone gem sound to be able to play the sound multiple times in rapid succession
		let soundClone = gemSound.cloneNode();
		soundClone.play();
	}

	hide() {
		this.active = false;
		this.x = -200;
		this.y = -200;
	}

	die() {
		deathSound.play();
		this.lives -= 1;
		this.updateLifeCounter(this.lives);
		player.hide();

		if (this.lives === 0) {
			clearInterval(gameTimer);
			gameOverSound.play();
		} else {
			setTimeout(function() {
				player.reset();
			}, 1000);
		}
	}

	updateLifeCounter(lives) {
		switch (lives) {
			case 2:
				heartCountElement.innerHTML = '<i class="fa fa-lg fa-heart"></i><i class="fa fa-lg fa-heart"></i><i class="fa fa-lg fa-heart-o"></i>';
			break;
			case 1:
				heartCountElement.innerHTML = '<i class="fa fa-lg fa-heart"></i><i class="fa fa-lg fa-heart-o"></i><i class="fa fa-lg fa-heart-o"></i>';
			break;
			case 0:
				heartCountElement.innerHTML = '<i class="fa fa-lg fa-heart-o"></i><i class="fa fa-lg fa-heart-o"></i><i class="fa fa-lg fa-heart-o"></i>';
			break;
		}

	}

	reset() {
		this.x = this.xStartPosition;
		this.y = this.yStartPosition;
		this.active = true;
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
		this.y = 211;
	}

	randomizeSettings() {
		this.sprites = ['images/gem-orange.png', 'images/gem-green.png', 'images/gem-blue.png']
		this.sprite = this.sprites[Math.floor(Math.random() * (3))];
		this.xSpawnPositions = [101, 202, 303, 404, 505, 606, 707];
		this.ySpawnPositions = [45, 128, 211, 294, 377];
		this.x = this.xSpawnPositions[Math.floor(Math.random() * (7))];
		this.y = this.ySpawnPositions[Math.floor(Math.random() * (5))];
	}

	render() {
		ctx.drawImage(Resources.get(this.sprite), this.x + 17, this.y + 50, 66, 113);
	}
}


class Splatter {
	constructor() {
		this.sprite = 'images/blood1.png';
	}

	drawBlood() {
		this.sprites = ['images/blood1.png', 'images/blood2.png', 'images/blood3.png']
		this.sprite = this.sprites[(player.lives - 1)];
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


// Timer from stackoverflow, https://stackoverflow.com/questions/5517597/plain-count-up-timer-in-javascript
const minutesLabel = document.getElementById('minutes');
const secondsLabel = document.getElementById('seconds');
let totalSeconds = 0;

function setTime() {
	++totalSeconds;
	secondsLabel.innerHTML = pad(totalSeconds % 60);
	minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
}

function pad(val) {
	let valString = val + '';
	if (valString.length < 2) {
		return '0' + valString;
	} else {
		return valString;
	}
}

let gameTimer = setInterval(setTime, 1000);

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
	const allowedKeys = {
		37: 'left',
		38: 'up',
		39: 'right',
		40: 'down'
	};

	if (player.active) {
		player.handleInput(allowedKeys[e.keyCode]);
	}
});
