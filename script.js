window.onload = function (){
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

const wireYPositions = [150, 300, 450, 600];
const wireCount = wireYPositions.length;

const bugImage = new Image();
bugImage.src = './bug.png';

const birdImage = new Image();
birdImage.src = './catrunning.png';
const clashMusic = new Audio('./clash.wav');
const backgroundMusic = document.getElementById('backgroundMusic');
let isbackgroundMusicPlaying = true;
backgroundMusic.currentTime = 0;

const updownMusic = new Audio('./updown.wav')
updownMusic.speed = 0.2
updownMusic.load()

// Pressing the M key to mute the background
function toggleBackgroundMusic() {
    if (isBackgroundMusicPlaying) {
        backgroundMusic.pause(); // Pause the music
    } else {
        backgroundMusic.play(); // Play the music
    }
    isbackgroundMusicPlaying = !isBackgroundMusicPlaying; // Toggle the boolean
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'KeyM') {
        toggleBackgroundMusic();
    }
});


// for the bug
const spriteSheetWidth = 612;
const spriteSheetHeight = 408;
const bugFrameWidth = spriteSheetWidth / 3;
const bugFrameHeight = spriteSheetHeight / 2;
const totalBugFrames = 6;
let bugCurrentFrame = 0;
let frameCount = 0;

// for the obstacle
const catSpriteWidth = 448;
const catSpriteHeight = 556;
const catFrameWidth = catSpriteWidth / 2;
const catFrameHeight = catSpriteHeight / 4;
const totalCatFrames = 8;
let catCurrentFrame = 0;
let catFrameCount = 0;

// Calculating vertical offset for bug starting position
const bugVerticalOffset = (wireYPositions[1] - wireYPositions[0]) / 1.5;

let bug = {
    x: canvasWidth / 6,
    y: wireYPositions[0] + bugVerticalOffset - bugFrameHeight,
    width: 100,
    height: 100,
    wireIndex: 0,
};

let obstacles = [];
let score = 0;
let gameOver = false;
let highScore = localStorage.getItem('highScore') || 0;

const levels = [
    { scoreThreshold: 0, speed: 5, obstacleInterval: 1500 },
    { scoreThreshold: 10, speed: 6, obstacleInterval: 1000 },
    { scoreThreshold: 20, speed: 7, obstacleInterval: 800 },
    { scoreThreshold: 30, speed: 8, obstacleInterval: 500 },
    { scoreThreshold: 40, speed: 9, obstacleInterval: 400 },
    { scoreThreshold: 50, speed: 10, obstacleInterval: 200 },
];

function getObstacleSpeed() {
    let currentSpeed = levels[0].speed;
    for (let level of levels) {
        if (score >= level.scoreThreshold) {
            currentSpeed = level.speed;
        } else {
            break;
        }
    }
    return currentSpeed;
}

function getObstacleInterval() {
    let currentInterval = levels[0].obstacleInterval;
    for (let level of levels) {
        if (score >= level.scoreThreshold) {
            currentInterval = level.obstacleInterval;
        } else {
            break;
        }
    }
    return currentInterval;
}

function drawBug() {
    const row = Math.floor(bugCurrentFrame / 3);
    const col = bugCurrentFrame % 3;
    ctx.drawImage(
        bugImage,
        col * bugFrameWidth, row * bugFrameHeight,
        bugFrameWidth, bugFrameHeight,
        bug.x, bug.y,
        bug.width, bug.height
    );

    frameCount++;
    if (frameCount % 10 === 0) {
        bugCurrentFrame = (bugCurrentFrame + 1) % totalBugFrames;
    }
}

function drawWires() {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;
    wireYPositions.forEach(y => {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
    });
}

function createObstacle() {
    const wireIndex = Math.floor(Math.random() * wireCount);
    console.log(wireIndex)
    const obstacle = {
        x: canvasWidth,
        y: wireYPositions[wireIndex] + 70,
        width: 100,
        height: 80
    };
    obstacles.push(obstacle);
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        const rowBird = Math.floor(catCurrentFrame / 2);
        const colBird = catCurrentFrame % 2;
        ctx.drawImage(
            birdImage,
            colBird * catFrameWidth, rowBird * catFrameHeight,
            catFrameWidth, catFrameHeight,
            obstacle.x, obstacle.y,
            obstacle.width, obstacle.height
        );
    });

    catFrameCount++;
    if (catFrameCount % 10 === 0) {
        catCurrentFrame = (catCurrentFrame + 1) % totalCatFrames;
    }
}

function moveObstacles() {
    const obstacleSpeed = getObstacleSpeed();
    const obstacleInterval = getObstacleInterval();

    // Move existing obstacles
    obstacles.forEach((obstacle, index) => {
        obstacle.x -= obstacleSpeed;
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
            score += 2;
        }
    });

    // Create new obstacles based on the interval
    if (frameCount % Math.round(obstacleInterval / 10) === 0) {
        createObstacle();
    }
}

// check collison
function checkCollision() {
    for (let obstacle of obstacles) {
        // Bug's bounding box
        let bugLeft = bug.x;
        let bugRight = bug.x + bug.width;
        let bugTop = bug.y;
        let bugBottom = bugTop + bug.height;

        // Obstacle's bounding box
        let obstacleLeft = obstacle.x;
        let obstacleRight = obstacle.x + obstacle.width;
        let obstacleTop = obstacle.y;
        let obstacleBottom = obstacle.y + obstacle.height;

        // Collision check
        if (
            bugRight > obstacleLeft &&
            bugLeft < obstacleRight &&
            bugBottom > obstacleTop &&
            bugTop < obstacleBottom
        ) {
            // Collision detected
            gameOver = true;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('highScore', highScore);
            }
            clashMusic.play()
            showGameOverModal();
            return;
        }
    }
}



function drawScore() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Score: " + score, 10, 30);
}

function updateScore() {
    document.getElementById('highScore').innerText = highScore;
}

function gameLoop() {
    if (gameOver) {
        return;
    }
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawWires();
    drawBug()
    moveObstacles();
    drawObstacles();
    checkCollision();
    drawScore();
    backgroundMusic.play();
    requestAnimationFrame(gameLoop);
}

// Event listeners for dog movement
document.addEventListener('keydown', (event) => {
    if (event.code === 'ArrowUp' && bug.wireIndex > 0) {
        updownMusic.play()
        updownMusic.currentTime = 0;  
        bug.wireIndex -= 1;
        bug.y = wireYPositions[bug.wireIndex] + bugVerticalOffset - bugFrameHeight;
    } else if (event.code === 'ArrowDown' && bug.wireIndex < wireCount - 1) {
        updownMusic.play()
        updownMusic.currentTime = 0;  
        bug.wireIndex += 1;
        bug.y = wireYPositions[bug.wireIndex] + bugVerticalOffset - bugFrameHeight;
    }
});

// Restart button functionality
document.getElementById('restartButton').addEventListener('click', function () {
    gameOver = false;
    score = 0;
    bug.wireIndex = 0;
    bug.y = wireYPositions[0] + bugVerticalOffset - bugFrameHeight;
    bug.isJumping = false;
    bug.jumpCount = 0;
    obstacles = [];
    document.getElementById('game-modal').style.display = "none";
    updateScore();
    gameLoop();
});

// Modal display for the gameover
function showGameOverModal() {
    document.getElementById('finalScore').innerText = "Score: " + score;
    if (score > highScore) {
        document.getElementById('congrats').innerText = "Congrats, you have achieved a new high score!";
    }
    document.getElementById('game-modal').style.display = "block";
}

updateScore();
gameLoop();
}