// get the canvas
const cvs = document.getElementById('bird')
const ctx = cvs.getContext('2d')

// useful variables
let frames = 0
const DEGREE = Math.PI/180

// spritesheet
const sprite = new Image()
sprite.src = 'img/sprite.png' 

// audio files
const POINT_S = new Audio()
POINT_S.src = 'audio/sfx_point.wav'

const FLAP_S = new Audio()
FLAP_S.src = 'audio/sfx_flap.wav'

const HIT_S = new Audio()
HIT_S.src = 'audio/sfx_hit.wav'

const SWOOSH_S = new Audio()
SWOOSH_S.src = 'audio/sfx_swooshing.wav'

const DIE_S = new Audio()
DIE_S.src = 'audio/sfx_die.wav'

// different game states
const state = {
    current:0,
    getReady:0,
    game:1,
    over:2
}

// location of the restart button
const startButton = {
    w:83,
    h:29,
    x:120, 
    y:263
}

/* what happens when you click the screen on different game states:
    ready -> start the game 
    game -> move the bird, play flap sound
    game_over -> reset the game
*/
cvs.addEventListener('click',function(evt){
    switch(state.current){
        case state.getReady:
            state.current = state.game
            SWOOSH_S.play()
            break
        case state.game:
            bird.flap()
            FLAP_S.play()
            break
        case state.over:
            let rect = cvs.getBoundingClientRect()
            let clickX = evt.clientX -rect.left
            let clickY = evt.clientY - rect.top
            if(clickX >= startButton.x && clickX <= startButton.x + startButton.w
                && clickY >= startButton.y && clickY <= startButton.y + startButton.h){
                    pipes.reset()
                    bird.speedReset()
                    score.reset()
                    state.current = state.getReady
            }
            break
    }
})

// background
const bg = {
    sX:0,
    sY:0,
    w:275,
    h:226,
    x:0, 
    y:cvs.height - 226,
    draw: function(){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h)
    }
}

// foregraound
const fg = {
    sX:276,
    sY:0,
    w:224,
    h:112,
    x:0,
    y:cvs.height-112,
    dx:2,
    draw: function(){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h)
    },

    // shift fore ground by two pixels -> illusion of bird moving
    // only viable at game state
    update: function(){
     if(state.current == state.game){
        this.x = (this.x - this.dx) %(this.w/2)
     }   
    }
}


const bird = {
    //animation frames
    animation:[
        {sX:276, sY:112},
        {sX:276, sY:139},
        {sX:276, sY:164},
        {sX:276, sY:139},
    ],
    w:34,
    h:26,
    x:50,
    y:150,
    gravity:0.25,
    jump: 4.6,
    speed:0,
    radius: 20,
    rotation:0,

    frame:0,
    draw:function(){
        let bird = this.animation[this.frame]
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotation)
        ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, - this.w/2, - this.h/2, this.w, this.h)
        ctx.restore()
    },


    flap:function(){
        this.speed -= this.jump
    },

    // handle in game bird movements and rotations
    update:function(){
        this.preriod = state.current == state.getReady ? 10:5
        this.frame += frames % this.preriod % 5 == 0 ? 1:0
        this.frame = this.frame % this.animation.length

        // before game begins centre the bird
        if(state.current == state.getReady){
            this.y = 150
            this.rotation = 0*DEGREE
        // while in game state
        }else{
            //change speed
            this.speed += this.gravity
            this.y += this.speed

            //check if the bird has collided with the botton
            if(this.y + this.h/2 >= cvs.height - fg.h){
                this.y = cvs.height - fg.h - this.h/2
                if (state.current == state.game){
                    state.current = state.over
                    DIE_S.play()
                }
            }
            // check if bird has collided with top
            if(this.y <= 0){
                this.y = 0
                if (state.current == state.game){
                    state.current = state.over
                    DIE_S.play()
                }
            }

            /*rotate the bird -> 90 deg if moving downwards
                             -> -25 deg if moving upwards 
            */
            if(this.speed > this.jump){
                this.rotation = 90 * DEGREE
                this.frame =1
            }else{
                this.rotation = -25 * DEGREE
            }
        }
    },
    // reset when game is over
    speedReset: function(){
        this.speed = 0
    }
}


const pipes = {
    position:[],

    top:{
        sX: 553,
        sY: 0,
    },
    bottom:{
        sX:502,
        sY:0
    },
    w:53,
    h:400,
    gap:85, 
    maxYpos: -150,
    dx:2,

    draw: function(){
        for(let i=0; i<this.position.length; i++){
            let p = this.position[i]

            let topYpos = p.y
            let bottomYpos = p.y + this.h + this.gap

            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYpos, this.w, this.h)
            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYpos, this.w, this.h)
        }
    },
    update: function(){
        if(state.current !== state.game) return;

        // generate the pipes at random positions
        if (frames%100 == 0){
            this.position.push(
                {x:cvs.width, y:this.maxYpos*(Math.random() + 1)}
            )
        }
        for (let i = 0; i<this.position.length; i++){
            let p = this.position[i]

            let bottomPipeYpos = p.y + this.h + this.gap

            // check collisions
            if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > p.y
                && bird.y - bird.radius < p.y + this.h){
                    state.current = state.over
                    HIT_S.play()
                }
            if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius >bottomPipeYpos
                && bird.y - bird.radius < bottomPipeYpos + this.h){
                    state.current = state.over
                    HIT_S.play()
                }
            
            // increase score if bird has passed through the pipe
            p.x -= this.dx
            if(p.x + this.w<=0){
                // Delete pipe that has left canvas
                this.position.shift()

                // increase the score by one
                // update the best score, store it in local storage
                score.value +=1
                POINT_S.play()
                score.best = Math.max(score.value, score.best)
                localStorage.setItem('best', score.best)
            }
        }
    },
    // reset when game is over
    reset: function(){
        this.position = []
    }
}


// pregame state
const getReady ={
    sX:0,
    sY:228,
    w:173,
    h:452,
    x:cvs.width/2 -173/2,
    y:80,
    draw: function(){
        if(state.current == state.getReady){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
        }
    }
}

// game over state
const gameOver ={
    sX:175,
    sY:228,
    w:225,
    h:202,
    x:cvs.width/2 -225/2,
    y:90,
    draw: function(){
        if(state.current == state.over){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
        }
    }
}


const score = {
    best: parseInt(localStorage.getItem('best')) || 0,
    value:0,

    draw: function(){
        ctx.fillStyle = "#FFF"
        ctx.strokeStyle = "#000"

        // real time update of the score as game progresses
        if(state.current == state.game){
            ctx.lineWidth = 2
            ctx.font = '35px Teko'
            ctx.fillText(this.value, cvs.width/2,50)
            ctx.strokeText(this.value, cvs.width/2,50)
        }else if(state.current == state.over){
            ctx.font = '25px Teko'
            //current score
            ctx.fillText(this.value, 225,186)
            ctx.strokeText(this.value, 225,186)

            //best score
            ctx.fillText(this.best,225,228)
            ctx.strokeText(this.best, 225,228)
        }
    },

    // reset when game over
    reset: function(){
        this.value = 0
    }

}

// driver functions
function draw(){
 ctx.fillStyle = '#70c5ce'
 ctx.fillRect(0,0,cvs.width,cvs.height)
 bg.draw()  
 pipes.draw() 
 fg.draw()
 bird.draw()
 getReady.draw()
 gameOver.draw()
 score.draw()
}

function update(){
    pipes.update()
    bird.update()
    fg.update()
}


function loop(){
    update()
    draw()
    frames++

    requestAnimationFrame(loop)
}
loop()