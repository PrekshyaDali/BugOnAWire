const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

const wireYPositions = [150, 300, 450, 600]; // Positions for horizontal wires
const wireCount = wireYPositions.length;

const bugImage = new Image();
bugImage.src = './bug.png';

const fenceImage = new Image();
fenceImage.src = './fence.png'

const spriteSheetWidth = 612;
const spriteSheetHeight = 408;
const bugFrameWidth = spriteSheetWidth / 3;
const bugFrameHeight = spriteSheetHeight / 2;
const totalBugFrames = 6;
let bugCurrentFrame = 0;
let frameCount = 0;



let bug = {
    x: canvasWidth / 6, // x axis of the start of the bug
    y: wireYPositions[0] + 70, 
    // width: bugFrameWidth,
    width: 80,
    // height: bugFrameHeight,
    height: 80,
    wireIndex: 0
};

let obstacles = [];
let score = 0;
let gameOver = false;

function drawBug() {
    const row = Math.floor(bugCurrentFrame / 3);
    const col = bugCurrentFrame % 3;
    ctx.drawImage(
        bugImage,
        col * bugFrameWidth, row * bugFrameHeight, // Source x, y
        bugFrameWidth, bugFrameHeight, // Source width, height
        bug.x, bug.y, // Destination x, y
        bug.width, bug.height // Destination width, height
    );

    // Update frame count and switch frame if needed
    frameCount++;
    if (frameCount % 10 === 0) { // Change frame every 10 game loops
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
        // ctx.fillStyle = 'red';
        // ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        ctx.drawImage(
            fenceImage,
            obstacle.x, obstacle.y,
            obstacle.width, obstacle.height
        )
    });
}

function moveObstacles() {
    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0); // Remove obstacles that have moved past the canvas
    obstacles.forEach(obstacle => {
        obstacle.x -= 5; // Move obstacles to the left (change to positive value to move right)
    });
}

function createObstacle() {
    const wireIndex = Math.floor(Math.random() * wireCount);
    const obstacle = {
        x: canvasWidth, // Start obstacles from the right side of the canvas
        y: wireYPositions[wireIndex],
        width: bugFrameWidth - 20,
        height: bugFrameHeight -20,
    };
    obstacles.push(obstacle);
}

function checkCollision() {
    for (let obstacle of obstacles) {
        if (bug.x < obstacle.x + obstacle.width &&
            bug.x + bug.width > obstacle.x &&
            bug.y < obstacle.y + obstacle.height &&
            bug.y + bug.height > obstacle.y) {
            gameOver = true;
        }
    }
}

function updateScore() {
    score += 1;
}

function gameLoop() {
    if (gameOver) {
        ctx.font = "30px Arial";
        ctx.fillText("Game Over! Score: " + score, canvasWidth / 4, canvasHeight / 2);
        return;
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    drawWires();
    drawBug();
    moveObstacles();
    drawObstacles();
    checkCollision();
    updateScore();

    requestAnimationFrame(gameLoop);
}

setInterval(createObstacle, 2000);

// event listening to up and down 
document.addEventListener('keydown', (event) => {
    const wireHeightDifference = wireYPositions[1] - wireYPositions[0];
    const bugVerticalOffset = (wireHeightDifference - bug.height) ;

    if (event.code === 'ArrowUp' && bug.wireIndex > 0) {
        bug.wireIndex -= 1;
        bug.y = wireYPositions[bug.wireIndex] + bugVerticalOffset;
    } else if (event.code === 'ArrowDown' && bug.wireIndex < wireCount - 1) {
        bug.wireIndex += 1;
        bug.y = wireYPositions[bug.wireIndex] + bugVerticalOffset;
    }
});

bugImage.onload = function () {
    gameLoop();
};

