let gridCanvas;
let ctx;

const DEFAULTS = {
  WIDTH_CM: 10,
  HEIGHT_CM: 10,
  CELL_SIZE_MM: 1,
  LINE_COLOR: "#e0e0e0",
};

const CM_TO_PIXELS = 37.795;
const MM_TO_PIXELS = 3.7795;
const MAX_CANVAS_SIZE = 500;

document.addEventListener("DOMContentLoaded", function () {
  gridCanvas = document.getElementById("gridCanvas");
  ctx = gridCanvas.getContext("2d");

  generateGrid();

  document.getElementById("gridWidth").addEventListener("input", generateGrid);
  document.getElementById("gridHeight").addEventListener("input", generateGrid);
  document.getElementById("cellSize").addEventListener("input", generateGrid);
  document.getElementById("lineColor").addEventListener("input", generateGrid);
});

function generateGrid() {
  const widthCm =
    parseFloat(document.getElementById("gridWidth").value) || DEFAULTS.WIDTH_CM;
  const heightCm =
    parseFloat(document.getElementById("gridHeight").value) ||
    DEFAULTS.HEIGHT_CM;
  const cellSizeMm =
    parseFloat(document.getElementById("cellSize").value) ||
    DEFAULTS.CELL_SIZE_MM;
  const lineColor =
    document.getElementById("lineColor").value || DEFAULTS.LINE_COLOR;

  const widthPixels = widthCm * CM_TO_PIXELS;
  const heightPixels = heightCm * CM_TO_PIXELS;
  const cellSizePixels = cellSizeMm * MM_TO_PIXELS;

  const scaleX = Math.min(1, MAX_CANVAS_SIZE / widthPixels);
  const scaleY = Math.min(1, MAX_CANVAS_SIZE / heightPixels);
  const scale = Math.min(scaleX, scaleY);

  const scaledWidth = widthPixels * scale;
  const scaledHeight = heightPixels * scale;
  const scaledCellSize = cellSizePixels * scale;

  gridCanvas.width = Math.max(scaledWidth, 50);
  gridCanvas.height = Math.max(scaledHeight, 50);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, gridCanvas.width, gridCanvas.height);

  drawGrid(gridCanvas.width, gridCanvas.height, scaledCellSize, lineColor);
  drawBorder(gridCanvas.width, gridCanvas.height);
}

function drawGrid(width, height, cellSize, color) {
  ctx.strokeStyle = color || "#e0e0e0";
  ctx.lineWidth = Math.max(0.5, cellSize / 10);

  if (cellSize <= 0) cellSize = 1;

  for (let x = 0; x <= width; x += cellSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y <= height; y += cellSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawBorder(width, height) {
  ctx.strokeStyle = "#667eea";
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, width, height);
}

function goBack() {
  window.location.href = "index.html";
}
