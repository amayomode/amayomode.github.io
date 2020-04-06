//first check if the device is a phone
//game optimized for desktop browsers
function Redirect() {
    window.location = "https://amayomode.github.io/";
 }

// device detection
const isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

if(isMobile.any()) {
    //redirect
    alert("This game is best played when using a laptop or desktop computer");
    alert("You will be redirected to home page in 5 sec.");
    setTimeout('Redirect()', 5000);
 }


//game code

//canvas
const cvs = document.getElementById("snake");
const ctx = cvs.getContext("2d");

//game states
const gameOver = document.getElementById("game-over-container");
const gameOn = document.getElementById("wrapper");

//restart
function restart(){
    location.reload();
}
// pixel unit
const box = 21;

// load sprite shhets

const ground = new Image();
ground.src = "img/ground.png";

const foodImg = new Image();
foodImg.src = "img/food.png";

// load audio files

let dead = new Audio();
let eat = new Audio();
let up = new Audio();
let right = new Audio();
let left = new Audio();
let down = new Audio();

dead.src = "audio/dead.mp3";
eat.src = "audio/eat.mp3";
up.src = "audio/up.mp3";
right.src = "audio/right.mp3";
left.src = "audio/left.mp3";
down.src = "audio/down.mp3";

// create the snake

let snake = [];

// snake head

snake[0] = {
    x : 9 * box,
    y : 10 * box
};

// create the food

let food = {
    x : Math.floor(Math.random()*17+1) * box,
    y : Math.floor(Math.random()*15+3) * box
}

// create the score var

let score = 0;
let bestScore = parseInt(localStorage.getItem('best_s')) || 0

//control the snake's motion

let d;

document.addEventListener("keydown",direction);

function direction(event){
    let key = event.keyCode;
    if( key == 37 && d != "RIGHT"){
        left.play();
        d = "LEFT";
    }else if(key == 38 && d != "DOWN"){
        d = "UP";
        up.play();
    }else if(key == 39 && d != "LEFT"){
        d = "RIGHT";
        right.play();
    }else if(key == 40 && d != "UP"){
        d = "DOWN";
        down.play();
    }
}
function Up(){
    d = "UP"
}
function Down(){
    d = "DOWN"
}
function Left(){
    d= "LEFT"
}
function Right(){
    d = "RIGHT"
}
// cheack collision function
function collision(head,array){
    for(let i = 0; i < array.length; i++){
        if(head.x == array[i].x && head.y == array[i].y){
            return true;
        }
    }
    return false;
}

// draw everything to the canvas

function draw(){
    
    ctx.drawImage(ground,0,0);
    
    for( let i = 0; i < snake.length ; i++){
        ctx.fillStyle = ( i == 0 )? "green" : "white";
        ctx.fillRect(snake[i].x,snake[i].y,box,box);
        
        ctx.strokeStyle = "red";
        ctx.strokeRect(snake[i].x,snake[i].y,box,box);
    }

    //draw food
    
    ctx.drawImage(foodImg, food.x, food.y);
    
    // old head position
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;
    
    // adjust the direction
    if( d == "LEFT") snakeX -= box;
    if( d == "UP") snakeY -= box;
    if( d == "RIGHT") snakeX += box;
    if( d == "DOWN") snakeY += box;
    
    // increase snake size if it eats food
    if(snakeX == food.x && snakeY == food.y){
        score++;
        eat.play();
        food = {
            x : Math.floor(Math.random()*17+1) * box,
            y : Math.floor(Math.random()*15+3) * box
        }
    }else{
        // remove the tail
        snake.pop();
    }
    
    // add new Head
    let newHead = {
        x : snakeX,
        y : snakeY
    }
    
    // game over if collided with box or self
    
    if(snakeX < box || snakeX > 17 * box || snakeY < 3*box || snakeY > 17*box || collision(newHead,snake)){
        if(bestScore<score){
            bestScore = score
            localStorage.setItem('best_s',bestScore)
        }
        clearInterval(game);
        dead.play();
        gameOver.style.display = "block";
    }
    
    snake.unshift(newHead);
    
    ctx.fillStyle = "white";
    ctx.font = "30px Changa one";
    ctx.fillText(score,2*box,1.6*box);

    ctx.fillText("Best:",14*box,1.6*box);
    ctx.fillText(bestScore,17*box,1.6*box);
}

// call draw function every 100 ms

let game = setInterval(draw,100);


















