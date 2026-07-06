function rectangularCollision({rectangle1, rectangle2}) {
	//c.fillRect(rectangle1.position.x, rectangle1.position.y,rectangle1.width, rectangle1.height,)
	//c.fillRect(rectangle2.position.x, rectangle2.position.y,rectangle2.width, rectangle2.height,)
	return(
		rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x && 
		rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width &&
		rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rectangle2.position.y &&
		rectangle1.attackBox.position.y <= rectangle2.position.y + enemy.height
		)
}
function rematch(){
	canvas.style.display = 'none'
	rematchModal.style.display = 'flex'
	document.querySelector('#timer').style.display = 'none'
	document.querySelector('#displayText').style.display = 'none'
	document.querySelector('#healthBarModal').style.display = 'none'
	if(!rematchModal.getAttribute('listener')){
		rematchModal.addEventListener('click', () => {
			rematchModal.setAttribute('listener', true)
			document.location.reload()
		})
	}
}
function determineWinner({player, enemy, timerId}){
	clearTimeout(timerId)
	document.querySelector('#displayText').style.display = 'flex'
	if (player.health === enemy.health){
		document.querySelector('#displayText').innerHTML = 'Tie'
		player.switchSprite('death')
		enemy.switchSprite('death')
	}else if (player.health > enemy.health){
		document.querySelector('#displayText').innerHTML = 'Player one wins'
		enemy.switchSprite('death')
		rematchModal.style.display = 'flex'
	}else if (enemy.health > player.health){
		document.querySelector('#displayText').innerHTML = 'Player two wins'
		player.switchSprite('death')
		rematchModal.style.display = 'flex'
	}
	setTimeout(rematch,3000)
}
/// win selectors
let timerId
function descreaseTimer(){
	if (timerRunning){
		if(timer > 0){
			timerId = setTimeout(descreaseTimer, 1000)
			timer--
			document.querySelector('#timer').innerHTML = timer
		}
		if(timer === 0){
			determineWinner({player,enemy, timerId})
		}
	}
}