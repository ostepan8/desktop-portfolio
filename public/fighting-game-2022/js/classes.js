class Sprite{
	constructor({position, imageSrc, scale = 1, scaleX = scale, framesX = 1, framesY = 1, offset = {x:0, y:0}}){
		this.position = position	
		this.height = 150
		this.width = 50
		this.image = new Image()
		this.image.src = imageSrc
		this.scale = scale
		this.scaleX = scaleX
		this.framesX = framesX
		this.framesY = framesY
		this.framesCurrentX = 0
		this.framesCurrentY = 0
		this.framesElapsed = 0
		this.framesHold = 2.5
		this.offset = offset
	}
	draw(){
		c.drawImage(
			this.image, 
			this.framesCurrentX * (this.image.width/this.framesX),
			this.framesCurrentY * (this.image.height/this.framesY),
			this.image.width/this.framesX,
			this.image.height/this.framesY,
			this.position.x - this.offset.x, 
			this.position.y - this.offset.y, 
			this.image.width /this.framesX * this.scaleX, 
			this.image.height/this.framesY * this.scale
		)
	}
	animateFrames(){
		this.framesElapsed++
		if (this.framesElapsed % this.framesHold === 0){
			if (this.framesCurrentX < this.framesX - 1) {
				this.framesCurrentX ++
				}else{
				this.framesCurrentX = 0
					if (this.framesCurrentY < this.framesY - 1) {
					this.framesCurrentY ++
				}else{
					this.framesCurrentY = 0
				}

			}
		}
	}
	update(){
		this.draw() 
		this.animateFrames()
	}
}
class Fighter extends Sprite{
	constructor({
		position, 
		velocity, 
		color = 'red',   
		imageSrc, 
		scale = 1, 
		framesX = 1, 
		framesY = 1,
		offset = { x: 0, y :0},
		sprites,
		attackBox = {offset: {}, width: undefined, height: undefined }
	}) {
		super({
			position,
			imageSrc,
			scale,
			framesX,
			framesY,
			offset
		})
		this.velocity = velocity
		this.height = 175
		this.width = 75
		this.lastKey
		this.color = color
		this.attackBox = {
			position: {
				x: this.position.x,
				y: this.position.y
			},
			offset: attackBox.offset,
			width: attackBox.width,
			height: attackBox.height
		}
		this.isAttacking
		this.health = 100
		this.framesCurrentX = 0
		this.framesCurrentY = 0
		this.framesElapsed = 0
		this.framesHold = 2.5
		this.sprites = sprites
		this.dead = false
		this.blocking = false
		this.takingHit = false
		this.isJumping = false
		for (const sprite in this.sprites){
			sprites[sprite].image = new Image()
			sprites[sprite].image.src = sprites[sprite].imageSrc
		}
	}
	update(){
		this.draw()
		if (!this.dead){
			this.animateFrames()
		}
		///attack boxes
		this.attackBox.position.x = this.position.x + this.attackBox.offset.x
		this.attackBox.position.y = this.position.y + this.attackBox.offset.y
		/// attack box
		//c.fillRect(this.attackBox.position.x, this.attackBox.position.y,this.attackBox.width, this.attackBox.height,)
		
		this.position.x += this.velocity.x
		this.position.y += this.velocity.y
		
		/// gravity function
		if (this.position.y + this.height + this.velocity.y >= canvas.height - 71.5) {
			this.velocity.y = 0
			this.position.y = 330

		}else{
			this.velocity.y += gravity
		}
	}
	attack(){
		this.switchSprite('attack1')
		this.isAttacking = true
	}
	attack1Flipped(){
		this.switchSprite('attack1Flipped')
		this.isAttacking = true
	}
	kick(){
		this.switchSprite('kick')
		this.isAttacking = true
	}
	kickFlipped(){
		this.switchSprite('kickFlipped')
		this.isAttacking = true
	}
	heavy(){
		this.switchSprite('heavy')
		this.isAttacking = true
	}
	heavyFlipped(){
		this.switchSprite('heavyFlipped')
		this.isAttacking = true
	}
	hurt(){
		this.switchSprite('hurt')	
	}
	hurtFlipped(){
		this.switchSprite('hurtFlipped')
	}
	jumpAttack(){
		this.switchSprite('jumpAttack')
		this.isAttacking = true
	}
	jumpAttackFlipped(){
		this.switchSprite('jumpAttackFlipped')
		this.isAttacking = true
	}
	takeHit(number = 20){
		punchAudio.play()
		this.takingHit = true
		this.number = number
		if(!this.dead){
			this.health -= this.number
			if (this.health <= 0){
				this.switchSprite('death')
			}else{
				this.switchSprite('hurt')
			}
		}
	}
	takeHitFlipped(number = 20){
		punchAudio.play()
		this.takingHit = true
		this.number = number
		if(!this.dead){
			this.health -= this.number
			if (this.health <= 0){
				this.switchSprite('deathFlipped')
			}else{
				this.switchSprite('hurtFlipped')
			}
		}
	}

	switchSprite(sprite){
		if(this.image === this.sprites.death.image){
			if(this.framesCurrentX === this.sprites.death.framesX - 1){
				this.dead = true
			}
			return
			if(this.framesCurrentX === this.sprites.deathFlipped.framesX - 1){
				this.dead = true
			}
			return
		}
		if(this.image === this.sprites.attack1.image && this.framesCurrentX < this.sprites.attack1.framesX - 1){
			return
		}
		if(this.image === this.sprites.attack1Flipped.image && this.framesCurrentX < this.sprites.attack1Flipped.framesX - 1){
			return
		}
		if(this.image === this.sprites.kick.image && this.framesCurrentX < this.sprites.kick.framesX - 1){
			return
		}
		if(this.image === this.sprites.kickFlipped.image && this.framesCurrentX < this.sprites.kickFlipped.framesX - 1){
			return
		}
		if(this.image === this.sprites.heavy.image && this.framesCurrentX < this.sprites.heavy.framesX - 1){
			return
		}
		if(this.image === this.sprites.heavyFlipped.image && this.framesCurrentX < this.sprites.heavyFlipped.framesX - 1){
			return
		}
		if(this.image === this.sprites.jumpAttack.image && this.framesCurrentX < this.sprites.jumpAttack.framesX - 1){
			return
		}
		if(this.image === this.sprites.jumpAttackFlipped.image && this.framesCurrentX < this.sprites.jumpAttackFlipped.framesX - 1){
			return
		}
		///override all animations for attack animation
		if(this.image === this.sprites.jump.image && this.framesCurrentX < this.sprites.jump.framesX - 1){
			return
		}
		if(this.image === this.sprites.jumpFlipped.image && this.framesCurrentX < this.sprites.jumpFlipped.framesX - 1){
			return
		}
		/// override all animations for when fighter gets hit
		if(this.image === this.sprites.hurt.image && this.framesCurrentX < this.sprites.hurt.framesX - 1){
			return
		}
		if(this.image === this.sprites.hurtFlipped.image && this.framesCurrentX < this.sprites.hurtFlipped.framesX - 1){
			return
		}
		switch(sprite){
			case 'idle':
				if (this.image !== this.sprites.idle.image){
					this.takingHit = false
					this.image = this.sprites.idle.image
					this.framesX = this.sprites.idle.framesX
					this.framesCurrentX = 0
				}
				break;
			case 'run':
				if (this.image !== this.sprites.run.image){
					this.image = this.sprites.run.image
					this.framesX = this.sprites.run.framesX
					this.framesCurrentX = 0
				}
				break;
			case 'jump':
				if (this.image !== this.sprites.jump.image){
					this.image = this.sprites.jump.image
					this.framesX = this.sprites.jump.framesX
					this.framesCurrentX = 0
				}
				break;
			case 'attack1':
				if (this.image !== this.sprites.attack1.image){
					this.image = this.sprites.attack1.image
					this.framesX = this.sprites.attack1.framesX
					this.framesCurrentX = 0
				}

				break;
			case 'hurt':
				if (this.image !== this.sprites.hurt.image){
					this.image = this.sprites.hurt.image
					this.framesX = this.sprites.hurt.framesX
					this.framesCurrentX = 0
				}
				break;
			case 'death':
				if (this.image !== this.sprites.death.image){
					this.image = this.sprites.death.image
					this.framesX = this.sprites.death.framesX
					this.framesCurrentX = 0
				}
				break;
			case 'kick':
				if (this.image !== this.sprites.kick.image){
					this.image = this.sprites.kick.image
					this.framesX = this.sprites.kick.framesX
					this.framesCurrentX = 0
				}
				break;
			case 'block':
				if (this.image !== this.sprites.block.image ){
					this.image = this.sprites.block.image
					this.framesX = this.sprites.block.framesX
					this.framesCurrentX = 0
				}
				break;
			case 'heavy':
				if (this.image !== this.sprites.heavy.image ){
					this.image = this.sprites.heavy.image
					this.framesX = this.sprites.heavy.framesX
					this.framesCurrentX = 0
				}
				break;
			case 'idleFlipped':
				this.takingHit = false
				if (this.image !== this.sprites.idleFlipped.image ){
					this.image = this.sprites.idleFlipped.image
					this.framesX = this.sprites.idleFlipped.framesX
					this.framesCurrentX = 0
				}
				break;
			case 'runFlipped':
				if (this.image !== this.sprites.runFlipped.image){
					this.image = this.sprites.runFlipped.image
					this.framesX = this.sprites.runFlipped.framesX
					this.framesCurrentX = 0
				}
				break;
			case 'jumpFlipped':
				if (this.image !== this.sprites.jumpFlipped.image){
					this.image = this.sprites.jumpFlipped.image
					this.framesX = this.sprites.jumpFlipped.framesX
					this.framesCurrentX = 0
				}
				break;
			case 'attack1Flipped':
				if (this.image !== this.sprites.attack1Flipped.image){
					this.image = this.sprites.attack1Flipped.image
					this.framesX = this.sprites.attack1Flipped.framesX
					this.framesCurrentX = 0
				}

				break;
			case 'hurtFlipped':
				if (this.image !== this.sprites.hurtFlipped.image){
					this.image = this.sprites.hurtFlipped.image
					this.framesX = this.sprites.hurtFlipped.framesX
					this.framesCurrentX = 0
				}
				break;
			case 'deathFlipped':
				if (this.image !== this.sprites.deathFlipped.image){
					this.image = this.sprites.deathFlipped.image
					this.framesX = this.sprites.deathFlipped.framesX
					this.framesCurrentX = 0
				}
				break;
			case 'kickFlipped':
				if (this.image !== this.sprites.kickFlipped.image){
					this.image = this.sprites.kickFlipped.image
					this.framesX = this.sprites.kickFlipped.framesX
					this.framesCurrentX = 0
				}
				break;
			case 'blockFlipped':
				if (this.image !== this.sprites.blockFlipped.image ){
					this.image = this.sprites.blockFlipped.image
					this.framesX = this.sprites.blockFlipped.framesX
					this.framesCurrentX = 0
				}
				break;
			case 'heavyFlipped':
				if (this.image !== this.sprites.heavyFlipped.image ){
					this.image = this.sprites.heavyFlipped.image
					this.framesX = this.sprites.heavyFlipped.framesX
					this.framesCurrentX = 0
				}
				break;
			case 'jumpAttack':
				if (this.image !== this.sprites.jumpAttack.image ){
					this.image = this.sprites.jumpAttack.image
					this.framesX = this.sprites.jumpAttack.framesX
					this.framesCurrentX = 0
				}
				break;
			case 'jumpAttackFlipped':
				if (this.image !== this.sprites.jumpAttackFlipped.image ){
					this.image = this.sprites.jumpAttackFlipped.image
					this.framesX = this.sprites.jumpAttackFlipped.framesX
					this.framesCurrentX = 0
				}
				break;
		}
	}
}