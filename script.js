const canvas = document.getElementById('gameCanvas');

const ctx = canvas.getContext('2d');

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

const wireXPositions = [150, 300, 450, 600];
const wireCount = wireXPositions.length;

let bug = {
    x: wireXPositions[0],
    y: canvasHeight / 2,
    width: 20,
    height: 20,
    color: 'green',
    wireIndex: 0
};

let obstacles = [];
let score = 0;
let gameOver = false;

function drawBug() {
    ctx.fillStyle = bug.color;
    ctx.fillRect(bug.x, bug.y, bug.width, bug.height);
}

function drawWires() {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;
    wireXPositions.forEach(x => {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
    });
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.fillStyle = 'red';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function moveObstacles() {
    obstacles = obstacles.filter(obstacle => obstacle.y + obstacle.height > 0);
    obstacles.forEach(obstacle => {
        obstacle.y += 5;
    });
}

function createObstacle() {
    const wireIndex = Math.floor(Math.random() * wireCount);
    const obstacle = {
        x: wireXPositions[wireIndex],
        y: 0,
        width: 20,
        height: 20,
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

document.addEventListener('keydown', (event) => {
    if (event.code === 'ArrowUp' && bug.y > 0) {
        bug.y -= 20;
    } else if (event.code === 'ArrowDown' && bug.y + bug.height < canvasHeight) {
        bug.y += 20;
    } else if (event.code === 'ArrowLeft' && bug.wireIndex > 0) {
        bug.wireIndex -= 1;
        bug.x = wireXPositions[bug.wireIndex];
    } else if (event.code === 'ArrowRight' && bug.wireIndex < wireCount - 1) {
        bug.wireIndex += 1;
        bug.x = wireXPositions[bug.wireIndex];
    }
});

gameLoop();
