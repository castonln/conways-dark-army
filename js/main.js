// Set the size of the grid
const GRID_SIZE = 31;
const CELL_SIZE = 10;

// Set starting angel coordinates
let angelX = Math.floor(GRID_SIZE / 2); // X-coordinate of the angel
let angelY = Math.floor(GRID_SIZE / 2); // Y-coordinate of the angel

// Create the game grid
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
canvas.width = GRID_SIZE * CELL_SIZE;
canvas.height = GRID_SIZE * CELL_SIZE;

// Initialize the grid
let grid = createGrid();

// Variables for drawing
let isDrawing = false;
let isSimulationRunning = false;

// Game stabilization variables
let previousStates = [];
const STABILIZATION_THRESHOLD = 5; // Number of previous states to check for stabilization

// Event listeners for drawing
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", drawCell);
canvas.addEventListener("mouseup", stopDrawing);

// Settings
let constructiveButton = document.getElementById("constructive");
let destructiveButton = document.getElementById("destructive");
let angelCornersButton = document.getElementById("angel-corners-enable");
let constructive = false;
let destructive = true;
let angelCorners = false;
settings();

// Start the game loop
let intervalId;
drawGrid();

function createGrid() {
    const grid = new Array(GRID_SIZE);
    for (let i = 0; i < GRID_SIZE; i++) {
        grid[i] = new Array(GRID_SIZE).fill(false);
    }
    return grid;
}

function startDrawing() {
    isDrawing = true;
}

function stopDrawing() {
    isDrawing = false;
}

function drawCell(event) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const cellX = Math.floor(mouseX / CELL_SIZE);
    const cellY = Math.floor(mouseY / CELL_SIZE);

    if (!grid[cellX][cellY]) {
        grid[cellX][cellY] = true;
    }
    drawGrid();
}

function updateGrid() {
    const newGrid = createGrid();

    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const neighbors = countNeighbors(i, j);
            if (i === angelX && j === angelY) {
                // Angel square remains unchanged
                continue;
            } else if (grid[i][j]) {
                // Any live cell with fewer than two or more than three neighbors dies, otherwise, it survives
                newGrid[i][j] = neighbors === 2 || neighbors === 3;
            } else {
                // Any dead cell with exactly three neighbors becomes alive
                newGrid[i][j] = neighbors === 3;
            }
        }
    }

    // Check for game stabilization
    if (isGridStable(newGrid)) {
        stopSimulation();
        showGameOver();
    }

    // Maximum moves is 8 - the neighbors
    const validMoves = emptySquares(angelX, angelY);

    if (validMoves.length > 0) {
        // Choose a random valid square
        const randomSquare = validMoves[Math.floor(Math.random() * validMoves.length)];

        // Move the angel to the random square
        angelX = randomSquare[0];
        angelY = randomSquare[1];
    } else {
        console.log('No squares for the angel to move to. Game over.')
        stopSimulation();
        showGameOver();
    }

    grid = newGrid;
    drawGrid();
}

function emptySquares(x, y) {
    let emptySquares = [];
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const neighborX = (x + i + GRID_SIZE) % GRID_SIZE;
            const neighborY = (y + j + GRID_SIZE) % GRID_SIZE;
            if (!grid[neighborX][neighborY]) {
                emptySquares.push([neighborX, neighborY]);
            }
        }
    }
    return emptySquares;
}

function countNeighbors(x, y) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue; // Skip the current cell
            const neighborX = (x + i + GRID_SIZE) % GRID_SIZE;
            const neighborY = (y + j + GRID_SIZE) % GRID_SIZE;
            if (grid[neighborX][neighborY]) {
                count++;
            }
        }
    }
    return count;
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (i === angelX && j === angelY) {
                // Draw angel square
                ctx.fillStyle = "blue";
                ctx.fillRect(i * CELL_SIZE, j * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            } else if (grid[i][j]) {
                // Draw black squares
                ctx.fillStyle = "#000";
                ctx.fillRect(i * CELL_SIZE, j * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }
}

function isGridStable(newGrid) {
    const currentState = newGrid.flat().join('');
    previousStates.push(currentState);
    if (previousStates.length > STABILIZATION_THRESHOLD) {
        previousStates.shift();
    }
    for (var i = 0; i < previousStates.length; i++) {
        for (var j = i + 1; j < previousStates.length; j++) {
            if (previousStates[i] === previousStates[j]) {
                console.log('Repeat state found. Game over.')
                return true; // Found a duplicate value
            }
        }
    }
    return false;
}

function showGameOver() {
    ctx.fillStyle = "red";
    ctx.font = "bold 50px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const textX = canvas.width / 2;
    const textY = canvas.height / 2;
    ctx.fillText("Game Over", textX, textY);
}


function startSimulation() {
    if (isSimulationRunning) return;

    isSimulationRunning = true;
    intervalId = setInterval(updateGrid, 100);
}

function stopSimulation() {
    if (!isSimulationRunning) return;

    isSimulationRunning = false;
    clearInterval(intervalId);
}

function settings(){
    if (constructiveButton.checked){
        constructive = true
        destructive = false
    } else if (destructiveButton.checked){
        constructive = false
        destructive = true
    }
    if (angelCornersButton.checked){
        angelCorners = true
    } else if (!angelCornersButton.checked){
        angelCorners = false
    }
}

function resetGrid() {
    grid = createGrid();
    previousStates = []; // Reset the stabilization states
    angelX = Math.floor(GRID_SIZE / 2); // X-coordinate of the angel
    angelY = Math.floor(GRID_SIZE / 2); // Y-coordinate of the angel
    settings();
    drawGrid();
}