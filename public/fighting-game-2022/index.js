const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

/// sets up ^^^
const gravity = .7
const startGameBtn = document.querySelector('#startGameBtn')
const modalEl = document.querySelector('#modalEl')
const healthBarModal = document.querySelector('#healthBarModal')
const menuEl = document.querySelector('#menuEl')
const playBtn = document.querySelector('#playWithFriends')
const rematchBtn = document.querySelector('#rematchEl')
const characterSelect = document.querySelector('#characterSelect')
const ryuSelect = document.querySelector('#ryuSelect')
const kenSelect = document.querySelector('#kenSelect')
const gokuSelect = document.querySelector('#gokuSelect')
const controls = document.querySelector('#control')
const controlButton = document.querySelector('#controlButton')
const kenCharRight = document.querySelector('#kenCharRight')
const ryuCharRight = document.querySelector('#ryuCharRight')
const gokuCharRight = document.querySelector('#gokuCharRight')
const ryuCharLeft = document.querySelector('#ryuCharLeft')
const kenCharLeft = document.querySelector('#kenCharLeft')
const gokuCharLeft = document.querySelector('#gokuCharLeft')
const displayText = document.querySelector('#displayText')

const gameStart = document.querySelector('#gameStart')
const forrestButton = document.querySelector('#forrestButton')
const yorkButton = document.querySelector('#yorkButton')
const kingdomButton = document.querySelector('#kingdomButton')
const backgroundModal = document.querySelector('#backgroundModal')
const pauseOptions = document.querySelector('#pauseOptions')
const pauseRematch = document.querySelector('#pauseRestart')
const pauseBack = document.querySelector('#pauseBack')
const pauseModal = document.querySelector('#pauseModal')
const rematchModal = document.querySelector('#rematchModal')

const backgroundAudio = new Audio('./audio/backgroundMusic.mp3')
const punchAudio = new Howl({
	src: './audio/punch.mp3'
})
const vegetaAudio = new Audio('./audio/vegeta.mp4')
const marioAudio = new Audio('./audio/mario.mp4')
const koAudio = new Audio('./audio/ko.mp4')
const gameSelectAudio = new Howl({
	src: './audio/gameSelect.mp3'
})

var player1 = undefined
var player2 = undefined
var playerStartPosition = 100
var enemyStartPosition = 800
let playerTurn = true
let enemyTurn = false
let timerRunning = true

function createBackground({src}){
	const background = new Sprite({
		position: {
			x:0,
			y: 0
		},
		imageSrc:src
	})
	return background
}


// const player = new Fighter()
//function callPlayers(){
const playerDict ={
		"KenP1": {
	position:{
		x: 100,
		y: 100
	},
	velocity:{
		x: 0,
		y: 0,
	},
	offset: {
		x: 0,
		y: 0
	},
	imageSrc: './img/fighter1/Idle.png',
	framesX: 8,
	framesY: 1,
	scale: 2,
	scaleX: 2,
	offset: {
		x: 5, 
		y: 15
	},
	sprites: {
		idle: {
			imageSrc:'./img/fighter1/Idle.png',
			framesX: 4,
			framesY: 1,
		},
		run: {
			imageSrc:'./img/fighter1/Run.png',
			framesX: 5,
			framesY: 1
		},
		jump: {
			imageSrc:'./img/fighter1/Jump.png',
			framesX: 7,
			framesY: 1
		},
		attack1: {
			imageSrc:'./img/fighter1/Attack1.png',
			framesX: 3,
			framesY: 1
		},
		hurt: {
			imageSrc:'./img/fighter1/hurtFlipped.png',
			framesX: 4,
			framesY: 1
		},
		death: {
			imageSrc:'./img/fighter1/Death.png',
			framesX: 5,
			framesY: 1
		},
		kick: {
			imageSrc:'./img/fighter1/kick.png',
			framesX: 5,
			framesY: 1
		},
		block: {
			imageSrc:'./img/fighter1/block.png',
			framesX: 1,
			framesY: 1
		},
		heavy: {
			imageSrc:'./img/fighter1/heavy.png',
			framesX: 5,
			framesY: 1
		},
		jumpAttack: {
			imageSrc:'./img/fighter1/jumpAttack.png',
			framesX: 4,
			framesY: 1
		},
		idleFlipped: {
			imageSrc:'./img/fighter1/idleFlipped.png',
			framesX: 4,
			framesY: 1,
		},
		runFlipped: {
			imageSrc:'./img/fighter1/runFlipped.png',
			framesX: 5,
			framesY: 1
		},
		jumpFlipped: {
			imageSrc:'./img/fighter1/jumpFlipped.png',
			framesX: 7,
			framesY: 1
		},
		attack1Flipped: {
			imageSrc:'./img/fighter1/Attack1Flipped.png',
			framesX: 3,
			framesY: 1
		},
		hurtFlipped: {
			imageSrc:'./img/fighter1/Hurt.png',
			framesX: 4,
			framesY: 1
		},
		deathFlipped: {
			imageSrc:'./img/fighter1/deathFlipped.png',
			framesX: 5,
			framesY: 1
		},
		kickFlipped: {
			imageSrc:'./img/fighter1/kickFlipped.png',
			framesX: 5,
			framesY: 1
		},
		blockFlipped: {
			imageSrc:'./img/fighter1/blockFlipped.png',
			framesX: 1,
			framesY: 1
		},
		heavyFlipped: {
			imageSrc:'./img/fighter1/heavyFlipped.png',
			framesX: 5,
			framesY: 1
		},
		jumpAttackFlipped: {
			imageSrc:'./img/fighter1/jumpAttackFlipped.png',
			framesX: 4,
			framesY: 1
		}
	},
	attackBox: {
		offset: {
			x: 75,
			y: -50
		},
		width: 180,
		height: 100
	}
},
"KenP2": {
	position:{
		x: 100,
		y: 100
	},
	velocity:{
		x: 0,
		y: 0,
	},
	offset: {
		x: 0,
		y: 0
	},
	imageSrc: './img/fighter1/Idle.png',
	framesX: 8,
	framesY: 1,
	scale: 2,
	scaleX: 2,
	offset: {
		x: 5, 
		y: 15
	},
	sprites: {
		idle: {
			imageSrc:'./img/fighter1/idleFlipped.png',
			framesX: 4,
			framesY: 1,
		},
		run: {
			imageSrc:'./img/fighter1/runFlipped.png',
			framesX: 5,
			framesY: 1
		},
		jump: {
			imageSrc:'./img/fighter1/jumpFlipped.png',
			framesX: 7,
			framesY: 1
		},
		attack1: {
			imageSrc:'./img/fighter1/Attack1Flipped.png',
			framesX: 3,
			framesY: 1
		},
		hurt: {
			imageSrc:'./img/fighter1/hurtFlipped.png',
			framesX: 4,
			framesY: 1
		},
		death: {
			imageSrc:'./img/fighter1/deathFlipped.png',
			framesX: 5,
			framesY: 1
		},
		kick: {
			imageSrc:'./img/fighter1/kickFlipped.png',
			framesX: 5,
			framesY: 1
		},
		block: {
			imageSrc:'./img/fighter1/blockFlipped.png',
			framesX: 1,
			framesY: 1
		},
		heavy: {
			imageSrc:'./img/fighter1/heavy.png',
			framesX: 5,
			framesY: 1
		},
		idleFlipped: {
			imageSrc:'./img/fighter1/Idle.png',
			framesX: 4,
			framesY: 1,
		},
		runFlipped: {
			imageSrc:'./img/fighter1/Run.png',
			framesX: 5,
			framesY: 1
		},
		jumpFlipped: {
			imageSrc:'./img/fighter1/Jump.png',
			framesX: 7,
			framesY: 1
		},
		attack1Flipped: {
			imageSrc:'./img/fighter1/Attack1.png',
			framesX: 3,
			framesY: 1
		},
		hurtFlipped: {
			imageSrc:'./img/fighter1/Hurt.png',
			framesX: 4,
			framesY: 1
		},
		deathFlipped: {
			imageSrc:'./img/fighter1/Death.png',
			framesX: 5,
			framesY: 1
		},
		kickFlipped: {
			imageSrc:'./img/fighter1/kick.png',
			framesX: 5,
			framesY: 1
		},
		blockFlipped: {
			imageSrc:'./img/fighter1/block.png',
			framesX: 1,
			framesY: 1
		},
		heavyFlipped: {
			imageSrc:'./img/fighter1/heavyFlipped.png',
			framesX: 5,
			framesY: 1
		},
		jumpAttackFlipped: {
			imageSrc:'./img/fighter1/jumpAttack.png',
			framesX: 4,
			framesY: 1
		},
		jumpAttack: {
			imageSrc:'./img/fighter1/jumpAttackFlipped.png',
			framesX: 4,
			framesY: 1
		}
	},
	attackBox: {
		offset: {
			x: 75,
			y: -50
		},
		width: 180,
		height: 100
	}
},
"GokuP1": {
		position:{
			x: 100,
			y: 100
		},
		velocity:{
			x: 0,
			y: 0,
		},
		offset: {
			x: 0,
			y: 0
		},
		imageSrc: './img/goku/Idle.png',
		framesX: 8,
		framesY: 1,
		scale: 1.2,
		scaleX: 1.2,
		offset: {
			x: 25, 
			y: -25
		},
		sprites: {
			idle: {
				imageSrc:'./img/goku/idleFlipped.png',
				framesX: 4,
				framesY: 1,
			},
			run: {
				imageSrc:'./img/goku/runFlipped.png',
				framesX: 6,
				framesY: 1
			},
			jump: {
				imageSrc:'./img/goku/jumpFlipped.png',
				framesX: 8,
				framesY: 1
			},
			attack1: {
				imageSrc:'./img/goku/punchFlipped.png',
				framesX: 4,
				framesY: 1
			},
			hurt: {
				imageSrc:'./img/goku/takehitFlipped.png',
				framesX: 4,
				framesY: 1
			},
			death: {
				imageSrc:'./img/goku/deathFlipped.png',
				framesX: 3,
				framesY: 1
			},
			kick: {
				imageSrc:'./img/goku/kickFlipped.png',
				framesX: 6,
				framesY: 1
			},
			block: {
				imageSrc:'./img/goku/blockFlipped.png',
				framesX: 1,
				framesY: 1
			},
			heavy: {
				imageSrc:'./img/goku/heavyFlipped.png',
				framesX: 6,
				framesY: 1
			},
			idleFlipped: {
				imageSrc:'./img/goku/idle.png',
				framesX: 4,
				framesY: 1,
			},
			runFlipped: {
				imageSrc:'./img/goku/run.png',
				framesX: 6,
				framesY: 1
			},
			jumpFlipped: {
				imageSrc:'./img/goku/jump.png',
				framesX: 8,
				framesY: 1
			},
			attack1Flipped: {
				imageSrc:'./img/goku/punch.png',
				framesX: 4,
				framesY: 1
			},
			hurtFlipped: {
				imageSrc:'./img/goku/takeHit.png',
				framesX: 4,
				framesY: 1
			},
			deathFlipped: {
				imageSrc:'./img/goku/death.png',
				framesX: 3,
				framesY: 1
			},
			kickFlipped: {
				imageSrc:'./img/goku/kick.png',
				framesX: 6,
				framesY: 1
			},
			blockFlipped: {
				imageSrc:'./img/goku/block.png',
				framesX: 1,
				framesY: 1
			},
			heavyFlipped: {
				imageSrc:'./img/goku/heavy.png',
				framesX: 6,
				framesY: 1
			},
			jumpAttack: {
			imageSrc:'./img/goku/jumpAttackFlipped.png',
			framesX: 7,
			framesY: 1
		},
		jumpAttackFlipped: {
			imageSrc:'./img/goku/jumpAttack.png',
			framesX: 7,
			framesY: 1
		}
		},
		attackBox: {
			offset: {
				x: 75,
				y: -50
			},
			width: 150,
			height: 100
		}
	},
	"GokuP2": {
		position:{
			x: 100,
			y: 100
		},
		velocity:{
			x: 0,
			y: 0,
		},
		offset: {
			x: 0,
			y: 0
		},
		imageSrc: './img/goku/Idle.png',
		framesX: 8,
		framesY: 1,
		scale: 1.2,
		scaleX: 1.2,
		offset: {
			x: 25, 
			y: -25
		},
		sprites: {
			idle: {
				imageSrc:'./img/goku/idle.png',
				framesX: 4,
				framesY: 1,
			},
			run: {
				imageSrc:'./img/goku/run.png',
				framesX: 6,
				framesY: 1
			},
			jump: {
				imageSrc:'./img/goku/jump.png',
				framesX: 8,
				framesY: 1
			},
			attack1: {
				imageSrc:'./img/goku/punch.png',
				framesX: 4,
				framesY: 1
			},
			hurt: {
				imageSrc:'./img/goku/takehitFlipped.png',
				framesX: 4,
				framesY: 1
			},
			death: {
				imageSrc:'./img/goku/death.png',
				framesX: 3,
				framesY: 1
			},
			kick: {
				imageSrc:'./img/goku/kick.png',
				framesX: 6,
				framesY: 1
			},
			block: {
				imageSrc:'./img/goku/block.png',
				framesX: 1,
				framesY: 1
			},
			heavy: {
				imageSrc:'./img/goku/heavyFlipped.png',
				framesX: 6,
				framesY: 1
			},
			idleFlipped: {
				imageSrc:'./img/goku/idleFlipped.png',
				framesX: 4,
				framesY: 1,
			},
			runFlipped: {
				imageSrc:'./img/goku/runFlipped.png',
				framesX: 6,
				framesY: 1
			},
			jumpFlipped: {
				imageSrc:'./img/goku/jumpFlipped.png',
				framesX: 8,
				framesY: 1
			},
			attack1Flipped: {
				imageSrc:'./img/goku/punchFlipped.png',
				framesX: 4,
				framesY: 1
			},
			hurtFlipped: {
				imageSrc:'./img/goku/takehit.png',
				framesX: 4,
				framesY: 1
			},
			deathFlipped: {
				imageSrc:'./img/goku/deathFlipped.png',
				framesX: 3,
				framesY: 1
			},
			kickFlipped: {
				imageSrc:'./img/goku/kickFlipped.png',
				framesX: 6,
				framesY: 1
			},
			blockFlipped: {
				imageSrc:'./img/goku/blockFlipped.png',
				framesX: 1,
				framesY: 1
			},
			heavyFlipped: {
				imageSrc:'./img/goku/heavy.png',
				framesX: 6,
				framesY: 1
			},
			jumpAttackFlipped: {
				imageSrc:'./img/goku/jumpAttackFlipped.png',
				framesX: 7,
				framesY: 1
			},
			jumpAttack: {
				imageSrc:'./img/goku/jumpAttack.png',
				framesX: 7,
				framesY: 1
			}
		},
		attackBox: {
			offset: {
				x: 75,
				y: -50
			},
			width: 150,
			height: 100
		}
	},
	"RyuP2": {
		position:{
			x: 800,
			y: 100
		},
		velocity:{
			x: 0,
			y: 0
		},
		color: 'blue',
		offset: {
			x: -50,
			y: 0
		},
		imageSrc: './img/fighter2/Idle.png',
		framesX: 4,
		framesY: 1,
		scale: 2,
		offset: {
			x: 17.5, 
			y: 15
		},
		sprites: {
			idle: {
				imageSrc:'./img/fighter2/Idle.png',
				framesX: 4,
				framesY: 1,
			},
			run: {
				imageSrc:'./img/fighter2/Run.png',
				framesX: 5,
				framesY: 1
			},
			jump: {
				imageSrc:'./img/fighter2/Jump.png',
				framesX: 7,
				framesY: 1
			},
			attack1: {
				imageSrc:'./img/fighter2/Attack.png',
				framesX: 3,
				framesY: 1
			},
			hurt: {
				imageSrc:'./img/fighter2/hurtFlipped.png',
				framesX: 4,
				framesY: 1
			},
			death: {
				imageSrc:'./img/fighter2/Death.png',
				framesX: 5,
				framesY: 1
			},
			kick: {
				imageSrc:'./img/fighter2/Kick.png',
				framesX: 3,
				framesY: 1
			},
			block: {
				imageSrc:'./img/fighter2/block.png',
				framesX: 1,
				framesY: 1
			},
			heavy: {
				imageSrc:'./img/fighter2/kame.png',
				framesX: 5,
				framesY: 1
			},
			idleFlipped: {
				imageSrc:'./img/fighter2/Idle.png',
				framesX: 4,
				framesY: 1,
			},
			runFlipped: {
				imageSrc:'./img/fighter2/runFlipped.png',
				framesX: 5,
				framesY: 1
			},
			jumpFlipped: {
				imageSrc:'./img/fighter2/jumpFlipped.png',
				framesX: 7,
				framesY: 1
			},
			attack1Flipped: {
				imageSrc:'./img/fighter2/attack1Flipped.png',
				framesX: 3,
				framesY: 1
			},
			hurtFlipped: {
				imageSrc:'./img/fighter2/Hurt.png',
				framesX: 4,
				framesY: 1
			},
			deathFlipped: {
				imageSrc:'./img/fighter2/Death.png',
				framesX: 5,
				framesY: 1
			},
			kickFlipped: {
				imageSrc:'./img/fighter2/kickFlipped.png',
				framesX: 3,
				framesY: 1
			},
			blockFlipped: {
				imageSrc:'./img/fighter2/blockFlipped.png',
				framesX: 1,
				framesY: 1
			},
			heavyFlipped: {
				imageSrc:'./img/fighter2/kameFlipped.png',
				framesX: 5,
				framesY: 1
			},
			jumpAttackFlipped: {
				imageSrc:'./img/fighter2/jumpAttackFlipped.png',
				framesX: 4,
				framesY: 1
			},
			jumpAttack: {
				imageSrc:'./img/fighter2/jumpAttack.png',
				framesX: 4,
				framesY: 1
			}
		},
		attackBox: {
			offset: {
				x: -150,
				y: 25
			},
			width: 180,
			height: 100
		}
	},
		"RyuP1": {
		position:{
			x: 800,
			y: 100
		},
		velocity:{
			x: 0,
			y: 0
		},
		color: 'blue',
		offset: {
			x: -50,
			y: 0
		},
		imageSrc: './img/fighter2/idleFlipped.png',
		framesX: 4,
		framesY: 1,
		scale: 2,
		offset: {
			x: 17.5, 
			y: 15
		},
		sprites: {
			idle: {
				imageSrc:'./img/fighter2/idleFlipped.png',
				framesX: 4,
				framesY: 1,
			},
			run: {
				imageSrc:'./img/fighter2/runFlipped.png',
				framesX: 5,
				framesY: 1
			},
			jump: {
				imageSrc:'./img/fighter2/jumpFlipped.png',
				framesX: 7,
				framesY: 1
			},
			attack1: {
				imageSrc:'./img/fighter2/attack1Flipped.png',
				framesX: 3,
				framesY: 1
			},
			hurt: {
				imageSrc:'./img/fighter2/hurtFlipped.png',
				framesX: 4,
				framesY: 1
			},
			death: {
				imageSrc:'./img/fighter2/Death.png',
				framesX: 5,
				framesY: 1
			},
			kick: {
				imageSrc:'./img/fighter2/kickFlipped.png',
				framesX: 3,
				framesY: 1
			},
			block: {
				imageSrc:'./img/fighter2/blockFlipped.png',
				framesX: 1,
				framesY: 1
			},
			heavy: {
				imageSrc:'./img/fighter2/kameFlipped.png',
				framesX: 5,
				framesY: 1
			},
			idleFlipped: {
				imageSrc:'./img/fighter2/Idle.png',
				framesX: 4,
				framesY: 1,
			},
			runFlipped: {
				imageSrc:'./img/fighter2/Run.png',
				framesX: 5,
				framesY: 1
			},
			jumpFlipped: {
				imageSrc:'./img/fighter2/Jump.png',
				framesX: 7,
				framesY: 1
			},
			attack1Flipped: {
				imageSrc:'./img/fighter2/Attack1.png',
				framesX: 3,
				framesY: 1
			},
			hurtFlipped: {
				imageSrc:'./img/fighter2/Hurt.png',
				framesX: 4,
				framesY: 1
			},
			deathFlipped: {
				imageSrc:'./img/fighter2/Death.png',
				framesX: 5,
				framesY: 1
			},
			kickFlipped: {
				imageSrc:'./img/fighter2/Kick.png',
				framesX: 3,
				framesY: 1
			},
			blockFlipped: {
				imageSrc:'./img/fighter2/block.png',
				framesX: 1,
				framesY: 1
			},
			heavyFlipped: {
				imageSrc:'./img/fighter2/kame.png',
				framesX: 5,
				framesY: 1
			},
			jumpAttackFlipped: {
				imageSrc:'./img/fighter2/jumpAttackFlipped.png',
				framesX: 4,
				framesY: 1
			},
			jumpAttack: {
				imageSrc:'./img/fighter2/jumpAttack.png',
				framesX: 4,
				framesY: 1
			}
		},
		attackBox: {
			offset: {
				x: -150,
				y: 25
			},
			width: 180,
			height: 100
		}
	}
}
	// var player = new Fighter(fighterDict)
	// var enemy = new Fighter(enemyDict)
	var player = null
	var enemy = null
//callPlayers()

const keys = {
	a: {
		pressed: false
	},
	d: {
		pressed: false
	},
	w: {
		pressed: false
	},
	ArrowRight:{
		pressed: false
	},
	ArrowLeft:{
		pressed: false
	},
	ArrowUp:{
		pressed: false
	}
}
let id 
let background
let backgroundId 
/// creates a everlasting loop
function play(){
	background = createBackground({src: backgroundId})
	id = window.requestAnimationFrame(play)
	c.fillStyle = 'black'
	c.fillRect(0,0,canvas.width,canvas.height)
	background.update()
	c.fillStyle = 'rgba(255,255,255,0.10)'
	c.fillRect(0,0, canvas.width, canvas.height)
	if (player.position.x + player.velocity.x <= 0)
		player.velocity.x = 0
	if (player.position.x + player.velocity.x + player.width>= canvas.width)
		player.velocity.x = 0
	if (enemy.position.x + enemy.velocity.x + enemy.width >= canvas.width)
		enemy.velocity.x = 0
	if (enemy.position.x + enemy.velocity.x <= 0)
		enemy.velocity.x = 0
	if (player.blocking){
		if (player.position.x <= enemy.position.x) {
			player.switchSprite('block')
		}else{
			player.switchSprite('blockFlipped')
		}
	}
	player.update()
	if (enemy.blocking){
		if (player.position.x <= enemy.position.x) {
			enemy.switchSprite('block')
		}else{
			enemy.switchSprite('blockFlipped')
		}
	}
	enemy.update()
	player.velocity.x = 0
	enemy.velocity.x = 0
	if (player.velocity.y == 0){
		player.isJumping = false
	}
	if (enemy.velocity.y == 0){
		enemy.isJumping = false
	}
	/// player movement
	if(keys.a.pressed && player.lastKey === 'a'&& !player.blocking && !player.isAttacking){
		if (player.position.x >= enemy.position.x){
			player.velocity.x = -5
			player.switchSprite('runFlipped')
		}else{
			player.velocity.x = -5
			player.switchSprite('run')
		}
	}else if (keys.d.pressed && player.lastKey === 'd'&& !player.blocking && !player.isAttacking){
		if (player.position.x >= enemy.position.x){
			player.velocity.x = 5
			player.switchSprite('runFlipped')
		}else{
			player.velocity.x = 5
			player.switchSprite('run')
		}
	}else{
		if (player.position.x >= enemy.position.x){
			player.switchSprite('idleFlipped')
		}else{
			player.switchSprite('idle')
		}
	}
	// /jumping 
	if (!player.takingHit&& !player.blocking && player.velocity.y < 0){
		if (player.position.x >= enemy.position.x){
			player.switchSprite('jumpFlipped')
		}if  (player.position.x <= enemy.position.x){
			player.switchSprite('jump')
		}
	}
	///enemy movement
	if(keys.ArrowLeft.pressed && enemy.lastKey === 'j' && !enemy.blocking && !enemy.takingHit){
		enemy.velocity.x = -5
		if (player.position.x <= enemy.position.x) {
			enemy.switchSprite('run')
		}else{
			enemy.switchSprite('runFlipped')
		}
	} else if (keys.ArrowRight.pressed && enemy.lastKey === 'l'&& !enemy.blocking  && !enemy.takingHit){
		enemy.velocity.x = 5
		if (player.position.x <= enemy.position.x) {
			enemy.switchSprite('run')
		}else{
			enemy.switchSprite('runFlipped')
		}
	}else{
		if (player.position.x <= enemy.position.x) {
			enemy.switchSprite('idle')
		}else{
			enemy.switchSprite('idleFlipped')
		}
	}
	if (enemy.velocity.y < 0 && !enemy.blocking  && !enemy.takingHit){
		if (player.position.x >= enemy.position.x){
			enemy.switchSprite('jumpFlipped')
		}
		if(player.position.x <= enemy.position.x){
			enemy.switchSprite('jump')
		}
	}
	/// detect collision
	/// if enemy gets hit
	if (
		rectangularCollision({rectangle1: player, rectangle2: enemy})&& 
		player.isAttacking && player.framesCurrentX == 1 && !enemy.blocking && !enemy.takingHit && player.attackBox.width == 40){
		if (player.position.x <= enemy.position.x) {
			enemy.takeHitFlipped(10)
		}else{
			enemy.takeHit(10)
		}
		if (enemy.takingHit){
			player.isAttacking = false
		}
		//player.isAttacking = false
		gsap.to('#enemyHealth',{
			width: enemy.health + '%'
		})
	}
	if (
		rectangularCollision({rectangle1: player, rectangle2: enemy})&& 
		player.isAttacking && player.framesCurrentX == 1 && !enemy.blocking && !enemy.takingHit && player.attackBox.width == 50){
		if (player.position.x <= enemy.position.x) {
			enemy.takeHitFlipped(5)
		}else{
			enemy.takeHit(5)
		}
		if (enemy.takingHit){
			player.isAttacking = false
		}
		//player.isAttacking = false
		gsap.to('#enemyHealth',{
			width: enemy.health + '%'
		})
	}
	if (
		rectangularCollision({rectangle1: player, rectangle2: enemy})&& 
		player.isAttacking && player.framesCurrentX == 1 && !enemy.blocking && !enemy.takingHit && player.attackBox.width == 45){
		if (player.position.x <= enemy.position.x) {
			enemy.takeHitFlipped(15)
		}else{
			enemy.takeHit(15)
		}
		enemy.velocity.y=-10
		if (player.position.x <= enemy.position.x){
			enemy.velocity.x = 45
		}else{
			enemy.velocity.x = -45
		}
		if (enemy.takingHit){
			player.isAttacking = false
		}
		//player.isAttacking = false
		gsap.to('#enemyHealth',{
			width: enemy.health + '%'
		})
	}
	/// if player misses
//	if (player.isAttacking && player.framesCurrentX == 1){
//		player.isAttacking = false
//	}
	/// if player gets hit
	if (
		rectangularCollision({rectangle1: enemy, rectangle2: player})&& 
		enemy.isAttacking && enemy.framesCurrentX == 1 && !player.blocking && !player.takingHit && enemy.attackBox.width == 30){
		player.takeHit(player,enemy,5)
		if (player.takingHit){
			enemy.isAttacking = false
		}
		///enemy.isAttacking = false
		gsap.to('#playerHealth',{
			width: player.health + '%'
		})
	/// if enemy misses 
	}
	if (
		rectangularCollision({rectangle1: enemy, rectangle2: player})&&
		enemy.isAttacking && enemy.framesCurrentX == 1 && !player.blocking && !player.takingHit && enemy.attackBox.width == 50 ){
		if (player.position.x >= enemy.position.x) {
			player.takeHitFlipped(5)
		}else{
			player.takeHit(5)
		}
		if (player.takingHit){
			enemy.isAttacking = false
		}
		///enemy.isAttacking = false
		gsap.to('#playerHealth',{
			width: player.health + '%'
		})
	/// if enemy misses 
	}
	if (
		rectangularCollision({rectangle1: enemy, rectangle2: player})&&
		enemy.isAttacking && enemy.framesCurrentX == 1 && !player.blocking && !player.takingHit && enemy.attackBox.width == 35){
		if (player.position.x >= enemy.position.x) {
			player.takeHitFlipped(10)
		}else{
			player.takeHit(10)
		}
		if (player.takingHit){
			enemy.isAttacking = false
		}
		///enemy.isAttacking = false
		gsap.to('#playerHealth',{
			width: player.health + '%'
		})
	}
	if (
		rectangularCollision({rectangle1: enemy, rectangle2: player})&&
		enemy.isAttacking && enemy.framesCurrentX == 1 && !player.blocking && !player.takingHit && enemy.attackBox.width == 45){
		if (player.position.x >= enemy.position.x) {
			player.takeHit(15)
		}else{
			player.takeHitFlipped(15)
		}
		player.velocity.y=-10
		if (player.position.x <= enemy.position.x){
			player.velocity.x = -45
		}else{
			player.velocity.x = 45
		}
		if (player.takingHit){
			enemy.isAttacking = false
		}
		///enemy.isAttacking = false
		gsap.to('#playerHealth',{
			width: player.health + '%'
		})
	}
	//if (enemy.isAttacking && enemy.framesCurrentX == 1){
	//	enemy.isAttacking = false
	//}
	// end game
	if (enemy.health <= 0 || player.health <= 0){
		determineWinner({player,enemy, timerId})
	}
}
// setInterval(() => {
//     const myGamepad = navigator.getGamepads()[0]; // use the first gamepad
//     console.log(`Left stick at (${myGamepad.axes[0]}, ${myGamepad.axes[1]})` );
//     console.log(`Right stick at (${myGamepad.axes[2]}, ${myGamepad.axes[3]})` );
//     console.log(myGamepad.axes)
// }, 100)
let called
addEventListener('keydown', (event)=>{
	called = false
	if (event.keyCode == 27 && canvas.style.display == "flex" && !called){
		called = true
		timerRunning = false
		cancelAnimation()
		pauseModal.style.display = 'flex'
		healthBarModal.style.display = 'none'
		canvas.style.display = 'none'
		if(!pauseBack.getAttribute('listener')){
			pauseBack.addEventListener('click', () => {
				pauseBack.setAttribute('listener', true)
				canvas.style.display = 'flex'
				healthBarModal.style.display = 'flex'
				pauseModal.style.display = 'none'
				timerRunning = true
				descreaseTimer()
				play()
			})
		}
		if(!pauseRematch.getAttribute('listener')){
			pauseRematch.addEventListener('click', () => {
				pauseRematch.setAttribute('listener', true)
				document.location.reload()
			})
		}
	}
	if (!player.dead){
		switch(event.key){
			case 'd':
			keys.d.pressed = true
			player.lastKey = 'd'
			break
			case 'a':
			keys.a.pressed = true
			player.lastKey = 'a'
			break
			case 'w':
			if (!player.velocity.y&& !player.blocking){
				player.isJumping = true
				player.velocity.y = -18
			}
			break
			case 'f':
			if (!player.isAttacking && !player.takingHit && !player.blocking){
				if(player.position.x <= enemy.position.x && !player.isJumping){
					player.attackBox.width = 50
					player.attackBox.height = 15
					player.attackBox.offset.x = 65
					player.attackBox.offset.y = 57
					player.attack()
				}
				if (player.position.x >= enemy.position.x &&  !player.isJumping){
					player.attackBox.width = 50
					player.attackBox.height = 15
					player.attackBox.offset.x = -5
					player.attackBox.offset.y = 57
					player.attack1Flipped()
				}
				if(player.position.x <= enemy.position.x && player.isJumping){
					player.attackBox.width = 45
					player.attackBox.height = 35
					player.attackBox.offset.x = 65
					player.attackBox.offset.y = 80
					player.jumpAttack()
				}
				if(player.position.x >= enemy.position.x){
					player.attackBox.width = 45
					player.attackBox.height = 35
					player.attackBox.offset.x = -15
					player.attackBox.offset.y = 80
					player.jumpAttackFlipped()
				}
			}
			break
			case 'q':
			if (!player.isAttacking && !player.takingHit && !player.blocking){
				if (player.position.x >= enemy.position.x){
					player.attackBox.width = 40
					player.attackBox.height = 45
					player.attackBox.offset.x = 100 - 150
					player.attackBox.offset.y = 20
					player.kickFlipped()

				}else{
					player.attackBox.width = 40
					player.attackBox.height = 45
					player.attackBox.offset.x = 100
					player.attackBox.offset.y = 20
					player.kick()
				}
			}
			break
			case 'r':
			if (!player.isAttacking && !player.takingHit && !player.blocking){
				if (player.position.x <= enemy.position.x) {
					player.attackBox.width = 45
					player.attackBox.height = 60
					player.attackBox.offset.x = 75
					player.attackBox.offset.y = 0
					player.heavy()
				}else{
					player.attackBox.width = 45
					player.attackBox.height = 60
					player.attackBox.offset.x = -20
					player.attackBox.offset.y = 0
					player.heavyFlipped()
				}
			}
			break
			case 'e':
			player.blocking = true
			player.switchSprite('block')
		}
	}
	if (!enemy.dead){
		switch(event.key){
			case 'l':
			keys.ArrowRight.pressed = true
			enemy.lastKey = 'l'
			break
			case 'j':
			keys.ArrowLeft.pressed = true
			enemy.lastKey = 'j'
			break
			case 'i':
			if (!enemy.velocity.y && !enemy.blocking && !enemy.takingHit){
				enemy.isJumping = true
				enemy.velocity.y = -18
			}
			break
			case 'h':
			if (!enemy.isAttacking && !enemy.blocking && !enemy.takingHit){
				if (player.position.x <= enemy.position.x && !enemy.isJumping) {
					enemy.attackBox.width = 50
					enemy.attackBox.height = 15
					enemy.attackBox.offset.x = -15
					enemy.attackBox.offset.y = 57
					enemy.attack()
				}
				if (player.position.x >= enemy.position.x && !enemy.isJumping) {
					enemy.attackBox.width = 50
					enemy.attackBox.height = 15
					enemy.attackBox.offset.x = 40
					enemy.attackBox.offset.y = 57
					enemy.attack1Flipped()
				}
				if(enemy.position.x <= enemy.position.x && enemy.isJumping){
					enemy.attackBox.width = 45
					enemy.attackBox.height = 35
					enemy.attackBox.offset.x = 65
					enemy.attackBox.offset.y = 80
					enemy.jumpAttack()
				}
				if(enemy.position.x >= enemy.position.x && enemy.isJumping){
					enemy.attackBox.width = 45
					enemy.attackBox.height = 35
					enemy.attackBox.offset.x = 80
					enemy.attackBox.offset.y = 80
					enemy.jumpAttackFlipped()
				}

			}
			break
			case 'p':
			if (!enemy.isAttacking && !enemy.blocking && !enemy.takingHit){
				if (player.position.x <= enemy.position.x) {
					enemy.attackBox.width = 35
					enemy.attackBox.height = 45
					enemy.attackBox.offset.x = -15
					enemy.attackBox.offset.y = 20
					enemy.kick()
				}else{
					enemy.attackBox.width = 35
					enemy.attackBox.height = 45
					enemy.attackBox.offset.x = 150
					enemy.attackBox.offset.y = 20
					enemy.kickFlipped()
				}
			}
			break
			case 'o':
			if (!enemy.isAttacking && !enemy.blocking && !enemy.takingHit){
				if (player.position.x <= enemy.position.x) {
					enemy.attackBox.width = 45
					enemy.attackBox.height = 60
					enemy.attackBox.offset.x = -23
					enemy.attackBox.offset.y = 0
					enemy.heavyFlipped()
				}else{
					enemy.attackBox.width = 45
					enemy.attackBox.height = 60
					enemy.attackBox.offset.x = 65
					enemy.attackBox.offset.y = 10
					enemy.heavy()
				}
			}
			break
			case 'u':
			enemy.blocking = true
			enemy.switchSprite('block')
			break
		}
	}
})
window.addEventListener('keyup', (event)=>{
	switch(event.key){
		case 'd':
		keys.d.pressed = false
		break
		case 'a':
		keys.a.pressed = false
		break
		case 'e':
		player.blocking = false
		break
		case 'f':
		player.isAttacking = false
		break
		case 'q':
		player.isAttacking = false
		break
		case 'r':
		player.isAttacking = false
		break
	}
	///enemy keys
	switch(event.key){
		case 'l':
		keys.ArrowRight.pressed = false
		break
		case 'j':
		keys.ArrowLeft.pressed = false
		break
		case 'u':
		enemy.blocking = false
		break
		case 'o':
		enemy.isAttacking = false
		break
		case 'h':
		enemy.isAttacking = false
		break
		case 'p':
		enemy.isAttacking = false
		break
	}
})
function playGame(players){
	var player1Dict = playerDict[players[0]]
	var player2Dict = playerDict[players[1]]
	player = new Fighter(player1Dict)
	enemy = new Fighter(player2Dict)
	characterSelect.style.display = 'none'
	canvas.style.display = 'flex'
	menuEl.style.display ='none'
	c.fillRect(0,0,canvas.width,canvas.height)
	healthBarModal.style.display ='flex'
	descreaseTimer()
	play()
	modalEl.style.display ='none'
	player.position.x = playerStartPosition
	enemy.position.x = enemyStartPosition
}
var timer = 30
let playerId = 0
function init(){
	var player1 = undefined
	var player2 = undefined
	var playerStartPosition = 100
	var enemyStartPosition = 800
	var playerTurn = true
	var enemyTurn = false
	control.style.display ='none'
	pauseModal.style.display = 'none'
	modalEl.style.display = 'flex'
	backgroundModal.style.display ='none'
	kenCharRight.style.display = 'none'
	ryuCharRight.style.display = 'none'
	gokuCharRight.style.display = 'none'
	kenCharLeft.style.display = 'none'
	ryuCharLeft.style.display = 'none'
	gokuCharLeft.style.display = 'none'
	rematchModal.style.display = 'none'
	gameStart.style.display = 'none'
	backBtn.style.display = 'none'
	canvas.style.display = 'none'
	healthBarModal.style.display ='none'
	menuEl.style.display ='none'
	rematchBtn.style.display = 'none'
	characterSelect.style.display = 'none'
	document.body.style.backgroundImage = "url('./img/titleScreen.png')"
	if(!startGameBtn.getAttribute('listener')){
		startGameBtn.addEventListener('click', () => {
			startGameBtn.setAttribute('listener', true)
			gameSelectAudio.play()
			var random = Math.random()
			if (random <= .3333){
				backgroundAudio.play()
			}
			else if (random >= .3333){
				if (random <= .6666){
					marioAudio.play()
				}else{
					vegetaAudio.play()
				}
			}
			document.body.style.backgroundImage = "none"
			document.body.style.backgroundColor = "black";
			modalEl.style.display ='none'
			menuEl.style.display = 'flex'	
			if(!controlButton.getAttribute('listener')){
				controlButton.addEventListener('click', () => {
					controlButton.setAttribute('listener', true)
					gameSelectAudio.play()
					control.style.display = 'flex'
					menuEl.style.display = 'none'
					backBtn.style.display = 'flex'
					if(!backBtn.getAttribute('listener')){
						backBtn.addEventListener('click',()=>{
							backBtn.setAttribute('listener',true)
							gameSelectAudio.play()
							control.style.display = 'none'
							menuEl.style.display = 'flex'
							backBtn.style.display = 'none'
						})
					}
				})
			}
			if(!playBtn.getAttribute('listener')){
				playBtn.addEventListener('click', () => {
					playBtn.setAttribute('listener', true)
					gameSelectAudio.play()
					menuEl.style.display = 'none'
					characterSelect.style.display = 'flex'
					if(!kenSelect.getAttribute('listener')){
							kenSelect.addEventListener('click', () => {
								kenSelect.setAttribute('listener', true)
								gameSelectAudio.play()
								if(playerTurn){
									kenCharLeft.style.display = 'flex'
									player1 = "Ken"
								}
								if(enemyTurn){
									kenCharRight.style.display = 'flex'
									player2 = "Ken"
								}
								if(kenCharLeft.style.display == 'flex'){
									playerTurn = false
									enemyTurn = true
								}
								if(kenCharRight.style.display == 'flex'){
									playerTurn = false
									enemyTurn = false
								}
								if(!enemyTurn && !player){
									backBtn.style.display = 'flex'
									gameStart.style.display = 'flex'
								}
							})
						}
						if(!ryuSelect.getAttribute('listener')){
							ryuSelect.addEventListener('click', () => {
								ryuSelect.setAttribute('listener', true)
								gameSelectAudio.play()
								if(playerTurn){
									ryuCharLeft.style.display = 'flex'
									player1 = "Ryu"
								}
								if(enemyTurn){
									ryuCharRight.style.display = 'flex'
									player2 = "Ryu"
								}
								if(ryuCharLeft.style.display == 'flex'){
									playerTurn = false
									enemyTurn = true
								}
								if(ryuCharRight.style.display == 'flex'){
									playerTurn = false
									enemyTurn = false
								}
								if(!enemyTurn && !playerTurn){
									backBtn.style.display = 'flex'
									gameStart.style.display = 'flex'
								}
							})
						}
						if(!gokuSelect.getAttribute('listener')){
							gokuSelect.addEventListener('click', () => {
								gokuSelect.setAttribute('listener', true)
								gameSelectAudio.play()
								if(playerTurn){
									gokuCharLeft.style.display = 'flex'
									player1 = "Goku"
								}
								if(enemyTurn){
									gokuCharRight.style.display = 'flex'
									player2 = "Goku"
								}
								if(gokuCharLeft.style.display == 'flex'){
									playerTurn = false
									enemyTurn = true
								}
								if(gokuCharRight.style.display == 'flex'){
									playerTurn = false
									enemyTurn = false
								}
								if(!enemyTurn && !playerTurn){
									backBtn.style.display = 'flex'
									gameStart.style.display = 'flex'
								}
							})
						}
						if(!gameStart.getAttribute('listener')){
							gameStart.addEventListener('click', () => {
								gameStart.setAttribute('listener', true)
								gameSelectAudio.play()
								backgroundModal.style.display = 'flex'
								kenCharRight.style.display = 'none'
								ryuCharRight.style.display = 'none'
								gokuCharRight.style.display = 'none'
								kenCharLeft.style.display = 'none'
								gokuCharLeft.style.display = 'none'
								ryuCharLeft.style.display = 'none'
								characterSelect.style.display ='none'
								gameStart.style.display = 'none'
								backBtn.style.display = 'none'
								if(!kingdomButton.getAttribute('listener')){
									kingdomButton.addEventListener('click', () => {
										kingdomButton.setAttribute('listener', true)
										gameSelectAudio.play()
										backgroundModal.style.display = 'none'
										backgroundId = './img/background2.png'
										chooseSides(player1,player2)
									})
								}
								if(!forrestButton.getAttribute('listener')){
									forrestButton.addEventListener('click', () => {
										forrestButton.setAttribute('listener', true)
										gameSelectAudio.play()
										backgroundModal.style.display = 'none'
										backgroundId = './img/background.png'
										chooseSides(player1,player2)
									})
								}
								if(!yorkButton.getAttribute('listener')){
									yorkButton.addEventListener('click', () => {
										yorkButton.setAttribute('listener', true)
										gameSelectAudio.play()
										backgroundModal.style.display = 'none'
										backgroundId = './img/background1.png'
										chooseSides(player1,player2)
									})
								}
							})
						}
					if(!backBtn.getAttribute('listener')){
						backBtn.addEventListener('click', () => {
							backBtn.setAttribute('listener', true)
							gameSelectAudio.play()
							playerTurn = true
							enemyTurn = false
							kenCharRight.style.display = 'none'
							ryuCharRight.style.display = 'none'
							gokuCharRight.style.display = 'none'
							kenCharLeft.style.display = 'none'
							gokuCharLeft.style.display = 'none'
							ryuCharLeft.style.display = 'none'
							gameStart.style.display = 'none'
							backBtn.style.display = 'none'
						})
					}
				})
			}
		})
	}
}
function cancelAnimation(){
	window.cancelAnimationFrame(id)
}
function chooseSides(player1,player2){
	if(player1 == "Ken" && player2 == "Ken"){
		playGame(["KenP1", "KenP2"])	
	}
	if(player1 == "Ken" && player2 == "Ryu"){
		playGame(["KenP1", "RyuP2"])	
	}
	if(player1 == "Ken" && player2 == "Goku"){
		playGame(["KenP1", "GokuP2"])	
	}
	if(player1 == "Ryu" && player2 == "Ken"){
		playGame(["RyuP1", "KenP2"])	
	}
	if(player1 == "Ryu" && player2 == "Ryu"){
		playGame(["RyuP1", "RyuP2"])	
	}
	if(player1 == "Ryu" && player2 == "Goku"){
		playGame(["RyuP1", "GokuP2"])	
	}
	if(player1 == "Goku" && player2 == "Ken"){
		playGame(["GokuP1", "KenP2"])	
	}
	if(player1 == "Goku" && player2 == "Ryu"){
		playGame(["GokuP1", "RyuP2"])	
	}
	if(player1 == "Goku" && player2 == "Goku"){
		playGame(["GokuP1", "GokuP2"])	
	}
}
// backgroundId = './img/background1.png'
// 	modalEl.style.display = 'none'
// 	backgroundModal.style.display ='none'
// 	kenChar.style.display = 'none'
// 	ryuChar.style.display = 'none'
// 	gameStart.style.display = 'none'
// 	backBtn.style.display = 'none'
// 	healthBarModal.style.display ='flex'
// 	menuEl.style.display ='none'
// 	rematchBtn.style.display = 'none'
// 	characterSelect.style.display = 'none'
// play()
init()
