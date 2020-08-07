console.log("connected");

//--------------------------------------------Global Variables----------------------------------------------

var start = false;
var gameover = false;
var interval;
var moveAccept=true;
var error = 0.00000000000001;
var fruit;
var score;

//-----------------------------------------------Playing Area Dimensions--------------------------------
// Window Screen size
// var height = Math.floor(window.screen.height/50)*50;
// var width = Math.floor(window.screen.width/50)*50;

// View-Port Size
var height = Math.floor(document.documentElement.clientHeight/50)*50;
var width = Math.floor(document.documentElement.clientWidth/50)*50;

console.log(height + " " + width);

//----------------------------------------------Game Sounds--------------------------------------------
// Sounds
var gameSound = new Audio('Sounds/gameSound01.mp3');
var gameOverSound = new Audio('Sounds/gameOver02.mp3');
var selfHitSound = new Audio('Sounds/selfHit01.wav');
var fruitEatenSound = new Audio('Sounds/fruitEaten02.wav');
var wallHitSound = new Audio('Sounds/wallHit01.wav');

// Silent Sound for testing purpose
// var gameSound = new Audio('Sounds/silent.mp3');
// var gameOverSound = new Audio('Sounds/silent.mp3');
// var selfHitSound = new Audio('Sounds/silent.mp3');
// var fruitEatenSound = new Audio('Sounds/silent.mp3');
// var wallHitSound = new Audio('Sounds/silent.mp3');

//Sounds Listners
gameSound.onended = function() {gameSound.currentTime = 0;gameSound.play();}
wallHitSound.onended = function(){displayGameOver();gameOverSound.play();}
selfHitSound.onended = function(){displayGameOver();gameOverSound.play();}
gameOverSound.onended = function(){GameOver();}

//--------------------------------------------Classes to create snake---------------------------------
// class Node to create a single unit of snake
class Node{
	constructor(x, y, prev, next){
		this.div = document.createElement('div');
		this.div.classList.add("snake");
		this.div.style.left = x;
		this.div.style.top = y;
		this.prev = prev;
		this.next = next;
		console.log(x + " " + y);
		document.querySelector('body').appendChild(this.div);
	}
}
//--------------------------------------------End of class Node--------------------------------------

// class Snake to create snake using LinkedList basically and manage snake operations
class Snake{
	// Creates only single unit length snake object and gives random dimensions
	constructor(){
		var x;
		var y;
		var r = board.length;
		var c = board[0].length;

		while(true)
		{
			y = Math.floor(Math.random() * (height) / 50);
			x = Math.floor(Math.random() * (width) / 50);

			if(y>0 && y<r-1 && x>0 && x<c-1 && board[y][x] == 0) break;
			else console.log(y + " " + x + " position is rejected!");

		}

		board[y][x] = 1;
		x = (x*50) + "px";
		y = (y*50) + "px";
		this.head = new Node(x, y, null, null);
		this.tail = this.head;
		this.tail.div.classList.add("endNode");
		this.head.div.classList.add("headNode");
		this.length = 1;
		this.dir = "left";
	}

	// Adds node on fruit eating
	addNode(tailProps)
	{
		var x = (tailProps.left) + "px";
		var y = (tailProps.top)+ "px";
		var node = new Node(x, y, this.tail, null);
		this.tail.div.classList.remove("endNode");
		this.tail = node;
		this.tail.div.classList.add("endNode");
		this.length++;

		var tailProps = this.tail.div.getBoundingClientRect();
		var tailX = Math.floor(tailProps.top/50);
		var tailY = Math.floor(tailProps.left/50);
		if(tailX >=0 && tailX<=Math.floor(height/50)-1 && tailY >=0 && tailY<=Math.floor(width/50)){
			board[tailX][tailY] = 1;
		}
	}

	// Moves down the snake
	moveDown()
	{
		this.dir = "down";

		if(this.length == 1) {
			var head = this.head.div;
			var headProps = head.getBoundingClientRect();
			head.style.top = (headProps.top+50) + "px";

			var headX = Math.floor(headProps.top/50);
			var headY = Math.floor(headProps.left/50);
			if(headX >=0 && headX<Math.floor(height/50)-1 && headY >=0 && headY<=Math.floor(width/50)){
				board[headX][headY] = 0;
				board[headX+1][headY] = 1;
				console.log((headX+1) + " " + headY);
			}

			return;
		}

		var tailProps = this.tail.div.getBoundingClientRect();
		var tailX = Math.floor(tailProps.top/50);
		var tailY = Math.floor(tailProps.left/50);
		if(tailX >=0 && tailX<=Math.floor(height/50)-1 && tailY >=0 && tailY<=Math.floor(width/50)){
			board[tailX][tailY] = 0;
		}

		var tail = this.tail;
		var head = this.head;
		this.tail.div.classList.remove("endNode");
		this.tail = tail.prev;
		this.tail.div.classList.add("endNode");

		// moving tail node to the head
		tail.prev.next = null;
		tail.prev = null;
		head.prev = tail;
		tail.next = head;
		this.head.div.classList.remove("headNode");
		this.head = tail;
		this.head.div.classList.add("headNode");
		head = tail;

		var oldHeadProps = head.next.div.getBoundingClientRect();
		head.div.style.top = (oldHeadProps.top+50) + "px";
		head.div.style.left = (oldHeadProps.left) + "px";

		var headProps = this.head.div.getBoundingClientRect();
		var headX = Math.floor(headProps.top/50);
		var headY = Math.floor(headProps.left/50);
		if(headX >=0 && headX<Math.floor(height/50) && headY >=0 && headY<=Math.floor(width/50)){
			if(board[headX][headY] == 1){
				gameSound.pause();
				clearInterval(interval);
				selfHitSound.play();
				// GameOver  ==> see the soundlistners
			}
			else board[headX][headY] = 1;
		}

	}

	// Moves up the snake
	moveUp()
	{
		this.dir = "up";

		if(this.length == 1) {
			var head = this.head.div;
			var headProps = head.getBoundingClientRect();
			head.style.top = (headProps.top-50) + "px";

			var headX = Math.floor(headProps.top/50);
			var headY = Math.floor(headProps.left/50);

			if(headX >0 && headX<=Math.floor(height/50) && headY >=0 && headY<=Math.floor(width/50)){
				board[headX][headY] = 0;
				board[headX-1][headY] = 1;
				console.log((headX-1) + " " + headY);
			}
			
			return;
		}

		var tailProps = this.tail.div.getBoundingClientRect();
		var tailX = Math.floor(tailProps.top/50);
		var tailY = Math.floor(tailProps.left/50);
		if(tailX >=0 && tailX<=Math.floor(height/50)-1 && tailY >=0 && tailY<=Math.floor(width/50)){
			board[tailX][tailY] = 0;
		}

		var tail = this.tail;
		var head = this.head;
		this.tail.div.classList.remove("endNode");
		this.tail = tail.prev;
		this.tail.div.classList.add("endNode");

		// moving tail node to the head
		tail.prev.next = null;
		tail.prev = null;
		head.prev = tail;
		tail.next = head;
		this.head.div.classList.remove("headNode");
		this.head = tail;
		this.head.div.classList.add("headNode");
		head = tail;

		var oldHeadProps = head.next.div.getBoundingClientRect();
		head.div.style.top = (oldHeadProps.top-50) + "px";
		head.div.style.left = (oldHeadProps.left) + "px";

		var headProps = this.head.div.getBoundingClientRect();
		var headX = Math.floor(headProps.top/50);
		var headY = Math.floor(headProps.left/50);
		if(headX >=0 && headX<=Math.floor(height/50) && headY >=0 && headY<=Math.floor(width/50)){
			if(board[headX][headY] == 1){
				gameSound.pause();
				clearInterval(interval);
				selfHitSound.play();
				// GameOver  ==> see the soundlistners
			}
			else board[headX][headY] = 1;
		}
		
	}

	// Moves right the snake
	moveRight()
	{
		this.dir = "right";

		if(this.length == 1) {
			var head = this.head.div;
			var headProps = head.getBoundingClientRect();
			head.style.left = (headProps.left+50) + "px";

			var headX = Math.floor(headProps.top/50);
			var headY = Math.floor(headProps.left/50);
			if(headX >=0 && headX<=Math.floor(height/50) && headY >=0 && headY<Math.floor(width/50)){
				board[headX][headY] = 0;
				board[headX][headY+1] = 1;
				console.log(headX + " " + (headY+1));
			}

			return;
		}

		var tailProps = this.tail.div.getBoundingClientRect();
		var tailX = Math.floor(tailProps.top/50);
		var tailY = Math.floor(tailProps.left/50);
		if(tailX >=0 && tailX<=Math.floor(height/50)-1 && tailY >=0 && tailY<=Math.floor(width/50)){
			board[tailX][tailY] = 0;
		}

		var tail = this.tail;
		var head = this.head;
		this.tail.div.classList.remove("endNode");
		this.tail = tail.prev;
		this.tail.div.classList.add("endNode");

		// moving tail node to the head
		tail.prev.next = null;
		tail.prev = null;
		head.prev = tail;
		tail.next = head;
		this.head.div.classList.remove("headNode");
		this.head = tail;
		this.head.div.classList.add("headNode");
		head = tail;

		var oldHeadProps = head.next.div.getBoundingClientRect();
		head.div.style.top = (oldHeadProps.top) + "px";
		head.div.style.left = (oldHeadProps.left+50) + "px";

		var headProps = this.head.div.getBoundingClientRect();
		var headX = Math.floor(headProps.top/50);
		var headY = Math.floor(headProps.left/50);
		if(headX >=0 && headX<=Math.floor(height/50) && headY >=0 && headY<=Math.floor(width/50)){
			if(board[headX][headY] == 1){
				gameSound.pause();
				clearInterval(interval);
				selfHitSound.play();
				// GameOver  ==> see the soundlistners
			}
			else board[headX][headY] = 1;
		}
	}

	// Moves left the snake
	moveLeft()
	{
		this.dir = "left";

		if(this.length == 1) {
			var head = this.head.div;
			var headProps = head.getBoundingClientRect();
			head.style.left = (headProps.left-50) + "px";

			var headX = Math.floor(headProps.top/50);
			var headY = Math.floor(headProps.left/50);
			if(headX >=0 && headX<=Math.floor(height/50) && headY >0 && headY<=Math.floor(width/50)){
				board[headX][headY] = 0;
				board[headX][headY-1] = 1;
				console.log(headX + " " + (headY-1));
			}

			return;
		}

		var tailProps = this.tail.div.getBoundingClientRect();
		var tailX = Math.floor(tailProps.top/50);
		var tailY = Math.floor(tailProps.left/50);
		if(tailX >=0 && tailX<=Math.floor(height/50)-1 && tailY >=0 && tailY<=Math.floor(width/50)){
			board[tailX][tailY] = 0;
		}

		var tail = this.tail;
		var head = this.head;
		this.tail.div.classList.remove("endNode");
		this.tail = tail.prev;
		this.tail.div.classList.add("endNode");

		// moving tail node to the head
		tail.prev.next = null;
		tail.prev = null;
		head.prev = tail;
		tail.next = head;
		this.head.div.classList.remove("headNode");
		this.head = tail;
		this.head.div.classList.add("headNode");
		head = tail;

		var oldHeadProps = head.next.div.getBoundingClientRect();
		head.div.style.top = (oldHeadProps.top) + "px";
		head.div.style.left = (oldHeadProps.left-50) + "px";

		var headProps = this.head.div.getBoundingClientRect();
		var headX = Math.floor(headProps.top/50);
		var headY = Math.floor(headProps.left/50);
		if(headX >=0 && headX<=Math.floor(height/50) && headY >=0 && headY<=Math.floor(width/50)){
			if(board[headX][headY] == 1){
				gameSound.pause();
				clearInterval(interval);
				selfHitSound.play();
				// GameOver  ==> see the soundlistners
			}
			else board[headX][headY] = 1;
		}
	}

	// Takes one single step in current moving direction of the snake
	run()
	{
		// Storing current tail dimensions to add the node at the end on eating the fruit
		var tailProps = this.tail.div.getBoundingClientRect();

		if(this.dir == "up") snake.moveUp();
		if(this.dir == "down") snake.moveDown();
		if(this.dir == "right") snake.moveRight();
		if(this.dir == "left") snake.moveLeft();

		eatCheck(tailProps);	// Check if fruit is eaten after making move

		wallHitCheck();			// Check if wall hit is occured after making move

		moveAccept = true;		// Ready to accept next move
	}
}
//--------------------------------------------End of class Snake--------------------------------------------

//--------------------------------------------Creating Arrays-----------------------------------------------
//creating board and stadium array
var board = new Array(Math.floor(height/50));
var stadium = new Array(Math.floor(height/50));

for(var i=0; i<height/50; i++) 
{
	board[i] = new Array(Math.floor(width/50));
	stadium[i] = new Array(Math.floor(width/50));

	for(var j=0; j<width/50; j++) board[i][j] = stadium[i][j] = 0;
}

//-------------------------------------------Definition of Functions----------------------------------------

// Cteates outer wall blocks and if true then inner wall blocks also
function createStadium(innerWallBlocks = false){

	// vertical wall blocks at the left and right side
	for(var i=0; i<height/50; i++) 
	{
		board[i][0] = board[i][Math.floor(width/50)] = -1;
		stadium[i][0] = stadium[i][Math.floor(width/50)] = -1;

		let divLeft = document.createElement('div');
		let divRight = document.createElement('div');
		
		divLeft.classList.add("wall");
		divRight.classList.add("wall");

		divLeft.style.left = 0 + "px";
		divLeft.style.top = (i * 50) + "px";

		divRight.style.left = Math.floor(width/50)*50 + "px";
		divRight.style.top = (i * 50) + "px";

		document.querySelector('body').appendChild(divLeft);
		document.querySelector('body').appendChild(divRight);
	}

	// horizontal wall blocks at the up and down side
	for(var i=1; i<width/50; i++) 
	{
		board[0][i] = board[Math.floor(height/50)-1][i] = -1;
		stadium[0][i] = stadium[Math.floor(height/50)-1][i] = -1;

		let divUp = document.createElement('div');
		let divDown = document.createElement('div');
		
		divUp.classList.add("wall");
		divDown.classList.add("wall");

		divUp.style.left = (i * 50) + "px";
		divUp.style.top = 0 + "px";

		divDown.style.left = (i * 50) + "px";
		divDown.style.top = Math.floor(height/50 - 1)*50 + "px";

		document.querySelector('body').appendChild(divUp);
		document.querySelector('body').appendChild(divDown);
	}

	// Randomly creates 8 inner wall blocks
	if(innerWallBlocks)
	{
		var r = board.length;
		var c = board[0].length;
		for(var i=0; i<8; i++)
		{
			let x;
			let y;

			while(true)
			{
				y = Math.floor(Math.random() * (height) / 50);
				x = Math.floor(Math.random() * (width) / 50);

				if(y>1 && y<r-2 && x>1 && x<c-2 && board[y][x] == 0) break;
			}

			board[y][x] = stadium[y][x] = -1;

			let divInner = document.createElement('div');
			divInner.classList.add("wall");

			divInner.style.left = (x * 50) + "px";
			divInner.style.top = (y * 50) + "px";

			document.querySelector('body').appendChild(divInner);
		}
	}
	console.log("Stadium Created");
}

// Sets fruit at new random position
function resetFruit(){
	var fruitProps = fruit.getBoundingClientRect();
	var x;
	var y; 

	while(true)
	{
		y = Math.floor(Math.random() * (height) / 50);
		x = Math.floor(Math.random() * (width) / 50);

		if(board[y][x] == 0) break;
		else console.log(y + " " + x + " is rejected!");
	}
	console.log(y + " " + x);
	fruit.style.left = x*50 + "px";
	fruit.style.top = y*50 + "px";
}

// Detects key event and act accordingly
function move(event){

	// On game start, on any key pressed, it start running the snake.run() function every 150ms
	if(!start && event) {
		start = true;
		interval = setInterval(()=>{snake.run();}, 200);
		gameSound.play();
		document.querySelector('.pressEnterImg').style.display = 'none';
		return;
	}

	// Set ctrlKey to stop playing the game
	if(event.ctrlKey) {console.log("ctrl");gameSound.pause();clearInterval(interval);return;}

	// Set enterKey to reload and start new game when game is over
	if(event.keyCode == 13 && gameover) {location.reload();return;}

	var key = event.key;		// Detect which key is pressed

	// If snake.run() function is ready to accept next move then it accept the move according to pressed key
	// and sets direction for the next move for snake.run() function (see the last line of run() in class Snake)
	if(moveAccept)
	{
		if(key == 'ArrowLeft' && snake.dir != "right") {snake.dir = "left";	moveAccept = false;}
		if(key == 'ArrowRight' && snake.dir != "left") {snake.dir = "right";	moveAccept = false;}
		if(key == 'ArrowUp' && snake.dir != "down") {snake.dir = "up";	moveAccept = false;}
		if(key == 'ArrowDown' && snake.dir != "up") {snake.dir = "down";	moveAccept = false;}
	}

}

// Checks if any inner or outer wall hit is occured after making move
function wallHitCheck(){
	// var fruitProps = fruit.getBoundingClientRect();
	var snakeProps = snake.head.div.getBoundingClientRect();

	console.log(Math.floor(snakeProps.top/50) + " <> " + Math.floor(snakeProps.left/50));
	if(/*snakeProps.x <= 0 || snakeProps.x > width-50 || snakeProps.y<=0 || snakeProps.y > height-100 ||*/
		stadium[Math.floor((snakeProps.top+error)/50)][Math.floor(snakeProps.left/50)] == -1)
	{
		gameSound.pause();
		clearInterval(interval);
		wallHitSound.pause();
		wallHitSound.currentTime = 0;
		wallHitSound.play();
		// GameOver  ==> see the soundlistners
	}
}

// Checks if fruit is eaten after making move
function eatCheck(tailProps){
	var snakeProps = snake.head.div.getBoundingClientRect();
	var fruitProps = fruit.getBoundingClientRect();

	if(Math.abs(snakeProps.x - fruitProps.x)<49 && Math.abs(snakeProps.y - fruitProps.y)<49)
	{
		snake.addNode(tailProps);
		
		score.textContent = parseInt(score.textContent) + 1;

		fruitEatenSound.play();
		resetFruit();
	}
}

// Displays Game Over
function displayGameOver(){
	var img = new Image();
	img.src = 'Images/gameOverImg01.png';
	img.classList.add("gameOverImg");
	document.querySelector('body').appendChild(img);
}
// Displays press Enter
function displayPressEnter(){
	var img = new Image();
	img.src = 'Images/pressEnter.png';
	img.classList.add("pressEnterImg");
	document.querySelector('body').appendChild(img);
}


// Sets gameover to true So now enterKey is enable to reload and start new game
function GameOver(){
	console.log("Game Over");
	gameover = true;
	document.querySelector('.gameOverImg').style.display = 'none';
	document.querySelector('.pressEnterImg').style.display = 'block';

}
//-------------------------------------------End of Definition of Functions---------------------------------


//--------------------------------------------Function main to start the game------------------------------

function main(){

	// Tell player to start the game by pressing Enter
	displayPressEnter();

	// Getting necessary HTML elements-------------------------
	fruit = document.querySelector(".fruit");
	score = document.querySelector(".score");

	// Stadium Creation
	createStadium(true);

	// Snake Creation
	snake = new Snake();

	// Setting fruit at random position
	resetFruit();
}
