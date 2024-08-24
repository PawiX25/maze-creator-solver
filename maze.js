const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");

let WIDTH = 21;  
let HEIGHT = 21; 
const CELL_SIZE = 20;

canvas.width = WIDTH * CELL_SIZE;
canvas.height = HEIGHT * CELL_SIZE;

let maze = Array.from({ length: WIDTH }, () => Array(HEIGHT).fill(1));
const DIRECTIONS = [
    [0, 1],  
    [1, 0],  
    [0, -1], 
    [-1, 0]  
];

let path = [];
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function inBounds(x, y) {
    return x >= 0 && y >= 0 && x < WIDTH && y < HEIGHT;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

async function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let x = 0; x < WIDTH; x++) {
        for (let y = 0; y < HEIGHT; y++) {
            if (maze[x][y] === 1) {
                ctx.fillStyle = 'black';
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            } else {
                ctx.fillStyle = 'white';
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }
}

async function drawPath() {
    if (path.length === 0) return;
    ctx.fillStyle = 'red';
    for (let [x, y] of path) {
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        await delay(30); 
    }
}

async function generateMazeDFS() {
    maze = Array.from({ length: WIDTH }, () => Array(HEIGHT).fill(1));
    
    async function dfs(x, y) {
        maze[x][y] = 0;
        await drawMaze();
        await delay(30);

        let directions = [...DIRECTIONS];
        shuffle(directions);

        for (let [dx, dy] of directions) {
            const nx = x + 2 * dx;
            const ny = y + 2 * dy;

            if (inBounds(nx, ny) && maze[nx][ny] === 1) {
                maze[x + dx][y + dy] = 0;
                await drawMaze();
                await delay(30);
                await dfs(nx, ny);
            }
        }
    }

    await dfs(0, 0);
    drawMaze();
}

async function generateMazeBFS() {
    maze = Array.from({ length: WIDTH }, () => Array(HEIGHT).fill(1));

    const queue = [];
    const start = [0, 0];
    const goal = [WIDTH - 1, HEIGHT - 1];
    queue.push(start);
    maze[start[0]][start[1]] = 0;

    while (queue.length > 0) {
        const current = queue.shift();
        const [x, y] = current;

        let neighbors = [];
        for (let [dx, dy] of DIRECTIONS) {
            const nx = x + 2 * dx;
            const ny = y + 2 * dy;

            if (inBounds(nx, ny) && maze[nx][ny] === 1) {
                maze[x + dx][y + dy] = 0; 
                neighbors.push([nx, ny]);
            }
        }

        shuffle(neighbors);

        for (let [nx, ny] of neighbors) {
            if (maze[nx][ny] === 1) {
                maze[nx][ny] = 0;
                queue.push([nx, ny]);
                await drawMaze();
                await delay(30);
            }
        }
    }

    maze[goal[0]][goal[1]] = 0;
    drawMaze();

    if (!(await validateMazePath(start, goal))) {
        console.log('Maze is not solvable.');
    }
}

async function validateMazePath(start, goal) {
    const stack = [start];
    const visited = Array.from({ length: WIDTH }, () => Array(HEIGHT).fill(false));
    visited[start[0]][start[1]] = true;

    while (stack.length > 0) {
        const [x, y] = stack.pop();

        if (x === goal[0] && y === goal[1]) {
            return true; 
        }

        for (let [dx, dy] of DIRECTIONS) {
            const nx = x + dx;
            const ny = y + dy;
            if (inBounds(nx, ny) && maze[nx][ny] === 0 && !visited[nx][ny]) {
                stack.push([nx, ny]);
                visited[nx][ny] = true;
            }
        }
    }
    return false; 
}

async function solveMazeDFS() {
    const stack = [];
    const start = [0, 0];
    const goal = [WIDTH - 1, HEIGHT - 1];
    const cameFrom = {};

    stack.push(start);
    cameFrom[start] = null;

    while (stack.length > 0) {
        const current = stack.pop();
        const [x, y] = current;

        if (x === goal[0] && y === goal[1]) {
            break;
        }

        for (let [dx, dy] of DIRECTIONS) {
            const nx = x + dx;
            const ny = y + dy;
            const neighborKey = `${nx},${ny}`;
            if (inBounds(nx, ny) && maze[nx][ny] === 0 && !(neighborKey in cameFrom)) {
                stack.push([nx, ny]);
                cameFrom[neighborKey] = current;
            }
        }
    }

    path = [];
    let current = goal;
    while (current) {
        path.push(current);
        const key = `${current[0]},${current[1]}`;
        current = cameFrom[key];
    }
    path.reverse();

    await drawPath();
}

async function solveMazeBFS() {
    const queue = [];
    const start = [0, 0];
    const goal = [WIDTH - 1, HEIGHT - 1];
    const cameFrom = {};

    queue.push(start);
    cameFrom[start] = null;

    while (queue.length > 0) {
        const current = queue.shift();
        const [x, y] = current;

        if (x === goal[0] && y === goal[1]) {
            break;
        }

        for (let [dx, dy] of DIRECTIONS) {
            const nx = x + dx;
            const ny = y + dy;
            const neighborKey = `${nx},${ny}`;
            if (inBounds(nx, ny) && maze[nx][ny] === 0 && !(neighborKey in cameFrom)) {
                queue.push([nx, ny]);
                cameFrom[neighborKey] = current;
            }
        }
    }

    path = [];
    let current = goal;
    while (current) {
        path.push(current);
        const key = `${current[0]},${current[1]}`;
        current = cameFrom[key];
    }
    path.reverse();

    await drawPath();
}

function resizeMaze() {
    const newWidth = parseInt(document.getElementById('widthSlider').value);
    const newHeight = parseInt(document.getElementById('heightSlider').value);

    if (newWidth >= 5 && newHeight >= 5) {
        WIDTH = newWidth;
        HEIGHT = newHeight;
        canvas.width = WIDTH * CELL_SIZE;
        canvas.height = HEIGHT * CELL_SIZE;
        maze = Array.from({ length: WIDTH }, () => Array(HEIGHT).fill(1));
        generateMazeDFS();
    }
}

const widthSlider = document.getElementById('widthSlider');
const heightSlider = document.getElementById('heightSlider');
const widthValue = document.getElementById('widthValue');
const heightValue = document.getElementById('heightValue');

widthSlider.addEventListener('input', () => {
    widthValue.textContent = widthSlider.value;
});

heightSlider.addEventListener('input', () => {
    heightValue.textContent = heightSlider.value;
});
