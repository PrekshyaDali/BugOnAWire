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
    isJumping: false,
    jumpHeight: 150,
    jumpSpeed: 10,
    jumpCount: 0,
    gravity: 0.5,
    terminalVelocity: 10,
};

let obstacles = [];
let score = 0;
let gameOver = false;

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

        catFrameCount++;
        if (catFrameCount % 10 === 0) {
            catCurrentFrame = (catCurrentFrame + 1) % totalCatFrames;
        }
    });
}

function moveObstacles() {
    obstacles.forEach((obstacle, index) => {
        obstacle.x -= 5;
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1); 
            score++; 
        }
    });
}

function createObstacle() {
    const wireIndex = Math.floor(Math.random() * wireCount);
    const obstacle = {
        x: canvasWidth,
        y: wireYPositions[wireIndex] + 70,
        width: 100,
        height: 80
    };
    obstacles.push(obstacle);
}

function checkCollision() {
    for (let obstacle of obstacles) {
        let bugLeft = bug.x;
        let bugRight = bug.x + bug.width;
        let bugTop = bug.y - (bug.isJumping ? bug.jumpCount : 0);
        let bugBottom = bugTop + bug.height;

        let obstacleLeft = obstacle.x;
        let obstacleRight = obstacle.x + obstacle.width;
        let obstacleTop = obstacle.y;
        let obstacleBottom = obstacle.y + obstacle.height;

        if (
            bugRight > obstacleLeft &&
            bugLeft < obstacleRight &&
            bugBottom > obstacleTop &&
            bugTop < obstacleBottom
        ) {
            // Collision detected
            gameOver = true;
            return;
        }
    }
}

function drawScore() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Score: " + score, 10, 30);
}

function gameLoop() {
    if (gameOver) {
        ctx.font = "30px Arial";
        ctx.fillText("Game Over! Score: " + score, canvasWidth / 4, canvasHeight / 2);
        return;
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawWires();

    if (bug.isJumping) {
        handleJump(); 
    } else {
        drawBug(); 
        if (bug.y !== wireYPositions[bug.wireIndex] + bugVerticalOffset - bugFrameHeight) {
            bug.y = wireYPositions[bug.wireIndex] + bugVerticalOffset - bugFrameHeight;
        }
    }

    moveObstacles();
    drawObstacles();
    checkCollision();
    drawScore();
    requestAnimationFrame(gameLoop);
}

setInterval(createObstacle, 2000);
function handleJump() {
    if (bug.isJumping) {
   
        bug.y -= bug.jumpSpeed;
        bug.jumpCount += bug.jumpSpeed;

        if (bug.jumpCount >= bug.jumpHeight) {
            bug.isJumping = false;
        }
    } else {
        if (bug.y < wireYPositions[bug.wireIndex] + bugVerticalOffset - bugFrameHeight) {
            bug.y += bug.gravity;

            if (bug.y - wireYPositions[bug.wireIndex] - bugVerticalOffset + bugFrameHeight > bug.terminalVelocity) {
                bug.y = wireYPositions[bug.wireIndex] - bugVerticalOffset + bugFrameHeight + bug.terminalVelocity;
            }
            bug.y = wireYPositions[bug.wireIndex] + bugVerticalOffset - bugFrameHeight;
            bug.isJumping = false;
            bug.jumpCount = 0;
        }
    }

    drawBug(); 
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'ArrowUp' && bug.wireIndex > 0) {
        bug.wireIndex -= 1;
        bug.y = wireYPositions[bug.wireIndex] + bugVerticalOffset - bugFrameHeight;
    } else if (event.code === 'ArrowDown' && bug.wireIndex < wireCount - 1) {
        bug.wireIndex += 1;
        bug.y = wireYPositions[bug.wireIndex] + bugVerticalOffset - bugFrameHeight;
    } else if (event.code === 'Space' && !bug.isJumping) {
        bug.isJumping = true;
        bug.jumpCount = 0;
    }

    console.log(`Wire Index: ${bug.wireIndex}, Bug Y: ${bug.y}`);
});

bugImage.onload = function () {
    gameLoop();
};
