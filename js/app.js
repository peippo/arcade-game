const TILE_WIDTH = 101;
const TILE_HEIGHT = 83;
const GEM_GOAL = 50;
const heartCountElement = document.querySelector('.game-stats__hearts');
const gemCountElement = document.querySelector('.game-stats__gem-count');
const minutesElement = document.querySelector('.game-stats__minutes');
const secondsElement = document.querySelector('.game-stats__seconds');
const gemSound = new Audio('sounds/Collect_Point_00.mp3');
const deathSound = new Audio('sounds/Explosion_03.mp3');
const gameOverSound = new Audio('sounds/Jingle_Lose_00.mp3');
const gameWinSound = new Audio('sounds/Jingle_Win_00.mp3');
let gameStarted = false;
let totalSeconds = 0;
let gameTimer;

gemSound.preload = 'auto';
deathSound.preload = 'auto';
gameOverSound.preload = 'auto';
gameWinSound.preload = 'auto';

class gameObject {
	render(xOffset = 0, yOffset = 0, spriteWidth = 101, spriteHeight = 171) {
		ctx.drawImage(Resources.get(this.sprite), (this.x + xOffset), (this.y + yOffset), spriteWidth, spriteHeight);
	}
}

class Enemy extends gameObject {
	constructor() {
		super();
		this.sprite = 'images/enemy-bug.png';
		this.speedMultiplier = 1;
		this.randomizeSettings();
	}

	// Update the enemy's position
	// Parameter: dt, a time delta between ticks
	update(dt) {
		this.x += 100 * this.speedMultiplier * dt;

		if (this.x > TILE_WIDTH * 9) {
			this.randomizeSettings();
		}
	}

	randomizeSettings() {
		const xStartPositions = [-TILE_WIDTH, -TILE_WIDTH * 2, -TILE_WIDTH * 3];
		const yStartPositions = [TILE_HEIGHT * 2, TILE_HEIGHT * 3, TILE_HEIGHT * 4, TILE_HEIGHT * 5, TILE_HEIGHT * 6];
		this.x = xStartPositions[Math.floor(Math.random() * (3))];
		this.y = yStartPositions[Math.floor(Math.random() * (5))];
		this.speedMultiplier = Math.random() * (4 - 1) + 1;
	}
}

class Player extends gameObject {
	constructor() {
		super();
		this.sprite = 'images/char-boy.png';
		this.xStartPosition = TILE_WIDTH * 4;
		this.yStartPosition = TILE_HEIGHT * 7;
		this.x = this.xStartPosition;
		this.y = this.yStartPosition;
		this.active = false;
		this.hearts = 3;
		this.gemsCollected = 0;
	}

	getGem() {
		this.gemsCollected += 1;
		gemCountElement.innerHTML = (this.gemsCollected < 10) ? `0${this.gemsCollected}/${GEM_GOAL}` : `${this.gemsCollected}/${GEM_GOAL}`;

		// Clone gem sound to be able to play the sound multiple times in rapid succession
		let soundClone = gemSound.cloneNode();
		soundClone.play();

		// Add new enemy for every 10 gems collected
		switch (this.gemsCollected) {
			case 10:
			case 20:
			case 30:
			case 40:
				allEnemies.push(new Enemy());
			break;
			case GEM_GOAL:
				endGame();
			break;
		}
	}

	hide() {
		this.active = false;
		this.x = -TILE_WIDTH * 5;
		this.y = -TILE_HEIGHT * 5;
	}

	die() {
		const self = this;
		deathSound.play();
		this.hearts -= 1;
		updateHeartCounter(this.hearts);
		this.hide();

		if (this.hearts === 0) {
			endGame();
		} else {
			setTimeout(() => self.reset(), 1000);
		}
	}

	reset() {
		this.x = this.xStartPosition;
		this.y = this.yStartPosition;
		this.active = true;
	}

	handleInput(key) {
		switch (key) {
			case 'space':
				startGame();
			break;
			case 'left':
				this.x -= (this.x > 0) ? TILE_WIDTH : 0;
			break;
			case 'right':
				this.x += (this.x < (TILE_WIDTH * 8)) ? TILE_WIDTH : 0;
			break;
			case 'up':
				this.y -= (this.y > TILE_HEIGHT) ? TILE_HEIGHT : 0;
			break;
			case 'down':
				this.y += (this.y < (TILE_HEIGHT * 7)) ? TILE_HEIGHT : 0;
			break;
		}
	}
}

class Gem extends gameObject {
	constructor() {
		super();
		this.sprite = 'images/gem-orange.png';
		this.x = TILE_WIDTH * 4;
		this.y = TILE_HEIGHT * 4;
	}

	randomizeSettings() {
		const sprites = ['images/gem-orange.png', 'images/gem-green.png', 'images/gem-blue.png']
		const xSpawnPositions = [TILE_WIDTH, TILE_WIDTH * 2, TILE_WIDTH * 3, TILE_WIDTH * 4, TILE_WIDTH * 5, TILE_WIDTH * 6, TILE_WIDTH * 7];
		const ySpawnPositions = [TILE_HEIGHT * 2, TILE_HEIGHT * 3, TILE_HEIGHT * 4, TILE_HEIGHT * 5, TILE_HEIGHT * 6];
		this.sprite = sprites[Math.floor(Math.random() * (3))];
		this.x = xSpawnPositions[Math.floor(Math.random() * (7))];
		this.y = ySpawnPositions[Math.floor(Math.random() * (5))];
	}
}

class Splatter extends gameObject {
	constructor() {
		super();
		this.sprite = 'images/blood1.png';
	}

	drawBlood() {
		const sprites = ['images/blood1.png', 'images/blood2.png', 'images/blood3.png']
		this.sprite = sprites[(player.hearts - 1)];
		this.x = player.x;
		this.y = player.y;
	}
}

function startGame() {
	const startScreen = document.querySelector('.start-screen');
	startScreen.classList.add('start-screen--disabled');
	gameStarted = true;
	player.active = true;
	gameTimer = setInterval(setTime, 1000);
}

function endGame() {
	let gameWon = false;
	clearInterval(gameTimer);

	if (player.gemsCollected >= GEM_GOAL) {
		gameWinSound.play();
		player.hide();
		gameWon = true;
	} else {
		gameOverSound.play();
	}

	const score = calculateScore(player.gemsCollected, player.hearts, totalSeconds, gameWon);
	showScoreModal(score);
}

function updateHeartCounter(hearts) {
	switch (hearts) {
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

function calculateScore(gems, hearts, seconds, gameWon) {
	let gemScore = gems * 100;
	let heartsScore = 0;
	let timeScore = 0;

	if (gameWon) {
		heartsScore = hearts * 2500;
		timeScore = 14000 - (seconds * 100);
		timeScore = (timeScore > 0) ? timeScore : 0;
	}

	return Math.floor(gemScore + heartsScore + timeScore);
}

function showScoreModal(score) {
	let message = 'Hey, at least you tried...';
	if (score >= 300 && score <= 500) {
		message = 'Everybody has to start somewhere';
	} else if (score >= 500 && score < 1000) {
		message = 'Well that didn\'t go so well';
	} else if (score >= 1000 && score < 2000) {
		message = 'Maybe a little more practice?';
	} else if (score >= 2000 && score < 3000) {
		message = 'I\'m sure you\'ll get the hang of it';
	} else if (score >= 3000 && score < 4000) {
		message = 'Ok, that wasn\'t too bad';
	} else if (score >= 4000 && score < 5000) {
		message = 'So close, give it another try!';
	} else if (score >= 5000 && score < 7500) {
		message = 'You made it! Can you do it faster?';
	} else if (score >= 7500 && score < 10000) {
		message = 'Nice! Now shave off some more seconds';
	} else if (score >= 10000 && score < 12500) {
		message = 'Great work, I can see you\'ve been training';
	} else if (score >= 12500 && score < 15000) {
		message = 'You\'re getting really good at this!';
	} else if (score >= 15000 && score < 17500) {
		message = 'Seriously impressive gem chasing!';
	} else if (score >= 17500 && score < 20500) {
		message = 'Wow! Not much room for improvement!';
	} else if (score >= 20500 && score < 22500) {
		message = 'You are a gem chasing god!!';
	} else if (score >= 22500) {
		message = 'You are now ranked as the #1 player in the world!';
	}

	const infoModalMarkup = `
		<h2 class="info-modal__heading">${message}</h2>
		<div class="info-modal__result">
			<h3 class="info-modal__score-heading">Final score</h3>
			<div class="info-modal__score">${score}</div>
			<button class="info-modal__button">Play again</button>
		</div>`
	const infoModal = document.createElement('div');
	infoModal.classList.add('info-modal');
	infoModal.innerHTML = infoModalMarkup;
	document.body.prepend(infoModal);
	setTimeout(() => infoModal.classList.add('info-modal--active'), 500);

	const resetButton = document.querySelector('.info-modal__button');
	resetButton.addEventListener('click', function() {
		resetGame();
	});

	document.addEventListener('keyup', function(e) {
		if (e.keyCode === 32) {
			resetGame();
		}
	});
}

function resetGame() {
	window.location.reload(false);
}

// Timer from stackoverflow, https://stackoverflow.com/questions/5517597/plain-count-up-timer-in-javascript
function setTime() {
	++totalSeconds;
	secondsElement.innerHTML = pad(totalSeconds % 60);
	minutesElement.innerHTML = pad(parseInt(totalSeconds / 60));
}

function pad(val) {
	let valString = val + '';
	if (valString.length < 2) {
		return '0' + valString;
	} else {
		return valString;
	}
}

document.addEventListener('keyup', function(e) {
	const controlKeys = {
		37: 'left',
		38: 'up',
		39: 'right',
		40: 'down'
	};

	const startKey = {32: 'space'};

	if (player.active) {
		player.handleInput(controlKeys[e.keyCode]);
	} else {
		player.handleInput(startKey[e.keyCode]);
	}
});

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
