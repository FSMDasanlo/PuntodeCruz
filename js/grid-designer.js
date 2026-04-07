let gridCanvas;
let ctx;
let gridData = []; // Array 2D para almacenar colores de cada cuadrado
let currentScale = 1;
let currentCellSize = 0;
let actionHistory = []; // Historial de acciones para deshacer
let referenceImage = null; // Imagen de referencia cargada
let referenceDrag = {
  active: false,
  startX: 0,
  startY: 0,
  originX: 0,
  originY: 0,
  moved: false,
};
let layersSwapped = false; // Estado de las capas (false = imagen encima, true = rejilla encima)
let colorPickerMode = false; // Modo color picker activado

const DEFAULTS = {
  WIDTH_CM: 10,
  HEIGHT_CM: 10,
  CELL_SIZE_MM: 1,
  LINE_COLOR: "#e0e0e0",
  PAINT_COLOR: "#ff6b6b",
};

const CM_TO_PIXELS = 37.795;
const MM_TO_PIXELS = 3.7795;
const MAX_CANVAS_SIZE = 500;

document.addEventListener("DOMContentLoaded", function () {
  gridCanvas = document.getElementById("gridCanvas");
  ctx = gridCanvas.getContext("2d");

  // Inicializar
  generateGrid();
  updateColorPreview();
  updateActionButtons();

  // Event listeners para configuración
  document.getElementById("gridWidth").addEventListener("input", generateGrid);
  document.getElementById("gridHeight").addEventListener("input", generateGrid);
  document.getElementById("cellSize").addEventListener("input", generateGrid);
  document.getElementById("lineColor").addEventListener("input", generateGrid);

  // Event listener para selector de color
  document
    .getElementById("paintColor")
    .addEventListener("input", updateColorPreview);

  // Event listeners para botones de acción
  document.getElementById("btnUndo").addEventListener("click", undoLastAction);
  document
    .getElementById("btnLoadImage")
    .addEventListener("click", showImageGallery);
  document
    .getElementById("btnToggleLayers")
    .addEventListener("click", toggleLayers);
  document
    .getElementById("btnColorPicker")
    .addEventListener("click", enableColorPicker);
  document.getElementById("btnClear").addEventListener("click", clearAllDesign);

  // Event listeners para galería de imágenes
  document
    .getElementById("btnCloseGallery")
    .addEventListener("click", hideImageGallery);
  document
    .getElementById("imageFileInput")
    .addEventListener("change", handleFileSelection);

  // Event listeners para imagen de referencia
  document
    .getElementById("btnRemoveImage")
    .addEventListener("click", removeReferenceImage);
  const referenceContainer = document.getElementById("referenceImageContainer");
  referenceContainer.addEventListener("click", handleReferenceImageClick);
  referenceContainer.addEventListener("pointerdown", startReferenceDrag);
  document.addEventListener("pointermove", moveReferenceDrag);
  document.addEventListener("pointerup", endReferenceDrag);

  document
    .getElementById("btnSelectImages")
    .addEventListener("click", openImageFileDialog);

  // Event listener para clics en el canvas
  gridCanvas.addEventListener("click", handleCanvasClick);
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

  // Guardar valores actuales para cálculos posteriores
  currentScale = scale;
  currentCellSize = scaledCellSize;

  gridCanvas.width = Math.max(scaledWidth, 50);
  gridCanvas.height = Math.max(scaledHeight, 50);

  // Calcular nuevas dimensiones de la rejilla
  const newCols = Math.floor(gridCanvas.width / scaledCellSize);
  const newRows = Math.floor(gridCanvas.height / scaledCellSize);

  // Preservar el diseño existente si ya hay uno
  const oldGridData =
    gridData.length > 0 ? [...gridData.map((row) => [...row])] : null;

  // Inicializar nueva gridData
  gridData = Array(newRows)
    .fill()
    .map(() => Array(newCols).fill(null));

  // Si había un diseño anterior, intentar preservarlo
  if (oldGridData) {
    const oldRows = oldGridData.length;
    const oldCols = oldGridData[0] ? oldGridData[0].length : 0;

    // Copiar colores existentes a las posiciones correspondientes
    for (let row = 0; row < Math.min(newRows, oldRows); row++) {
      for (let col = 0; col < Math.min(newCols, oldCols); col++) {
        gridData[row][col] = oldGridData[row][col];
      }
    }
  }

  // Limpiar canvas
  if (layersSwapped) {
    // Rejilla encima: fondo transparente para ver la imagen detrás
    ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
  } else {
    // Imagen encima: fondo blanco
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, gridCanvas.width, gridCanvas.height);
  }

  // Dibujar colores pintados
  drawPaintedCells();

  // Dibujar rejilla
  drawGrid(gridCanvas.width, gridCanvas.height, scaledCellSize, lineColor);

  // Dibujar borde
  drawBorder(gridCanvas.width, gridCanvas.height);

  // Actualizar estado de botones
  updateActionButtons();
}

function drawGrid(width, height, cellSize, color) {
  // Usar un color más oscuro cuando la rejilla está sobre la imagen
  const gridColor = layersSwapped ? "#000000" : color || "#e0e0e0";
  ctx.strokeStyle = gridColor;
  // Líneas más gruesas cuando la rejilla está encima de la imagen
  ctx.lineWidth = layersSwapped
    ? Math.max(1, cellSize / 5)
    : Math.max(0.5, cellSize / 10);

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

function drawPaintedCells() {
  if (!gridData.length) return;

  for (let row = 0; row < gridData.length; row++) {
    for (let col = 0; col < gridData[row].length; col++) {
      const color = gridData[row][col];
      if (color) {
        paintCell(row, col, color);
      }
    }
  }
}

function handleCanvasClick(event) {
  if (colorPickerMode && referenceImage) {
    // Modo color picker: capturar color de la imagen
    const pickedColor = getImageColorAtPosition(event.clientX, event.clientY);
    document.getElementById("paintColor").value = pickedColor;
    updateColorPreview();

    // Desactivar modo color picker automáticamente
    enableColorPicker();
    return;
  }

  const rect = gridCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Calcular qué celda se ha clickeado
  const col = Math.floor(x / currentCellSize);
  const row = Math.floor(y / currentCellSize);

  // Verificar límites
  if (
    row >= 0 &&
    row < gridData.length &&
    col >= 0 &&
    col < gridData[0].length
  ) {
    const paintColor = document.getElementById("paintColor").value;
    const previousColor = gridData[row][col];

    // Solo guardar en historial si el color cambia
    if (previousColor !== paintColor) {
      // Guardar acción en historial
      actionHistory.push({
        row: row,
        col: col,
        previousColor: previousColor,
        newColor: paintColor,
      });

      // Limitar historial a 50 acciones para no consumir mucha memoria
      if (actionHistory.length > 50) {
        actionHistory.shift();
      }

      // Aplicar el nuevo color
      gridData[row][col] = paintColor;
      paintCell(row, col, paintColor);

      // Redibujar la rejilla encima
      drawGrid(
        gridCanvas.width,
        gridCanvas.height,
        currentCellSize,
        document.getElementById("lineColor").value,
      );
      drawBorder(gridCanvas.width, gridCanvas.height);

      // Actualizar botones
      updateActionButtons();
    }
  }
}

function paintCell(row, col, color) {
  const x = col * currentCellSize;
  const y = row * currentCellSize;

  ctx.fillStyle = color;
  ctx.fillRect(x, y, currentCellSize, currentCellSize);
}

function updateColorPreview() {
  const color = document.getElementById("paintColor").value;
  const preview = document.getElementById("currentColor");
  preview.textContent = `Color: ${color.toUpperCase()}`;
  preview.style.color = color;
}

function updateActionButtons() {
  const btnUndo = document.getElementById("btnUndo");
  const btnClear = document.getElementById("btnClear");
  const btnToggleLayers = document.getElementById("btnToggleLayers");
  const btnColorPicker = document.getElementById("btnColorPicker");

  // Habilitar/deshabilitar botón de deshacer
  btnUndo.disabled = actionHistory.length === 0;

  // Habilitar/deshabilitar botón de borrar todo
  const hasPaintedCells = gridData.some((row) =>
    row.some((cell) => cell !== null),
  );
  btnClear.disabled = !hasPaintedCells;

  // Habilitar/deshabilitar botones relacionados con imagen
  const hasReferenceImage = referenceImage !== null;
  btnToggleLayers.disabled = !hasReferenceImage;
  btnColorPicker.disabled = !hasReferenceImage;

  // Actualizar apariencia del botón de color picker
  if (colorPickerMode) {
    btnColorPicker.style.background = "#667eea";
    btnColorPicker.style.color = "white";
  } else {
    btnColorPicker.style.background = "";
    btnColorPicker.style.color = "";
  }
}

function undoLastAction() {
  if (actionHistory.length === 0) return;

  // Obtener la última acción
  const lastAction = actionHistory.pop();

  // Restaurar el color anterior
  gridData[lastAction.row][lastAction.col] = lastAction.previousColor;

  // Redibujar
  if (layersSwapped) {
    ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, gridCanvas.width, gridCanvas.height);
  }

  drawPaintedCells();
  drawGrid(
    gridCanvas.width,
    gridCanvas.height,
    currentCellSize,
    document.getElementById("lineColor").value,
  );
  drawBorder(gridCanvas.width, gridCanvas.height);

  // Actualizar botones
  updateActionButtons();
}

function clearAllDesign() {
  // Confirmar antes de borrar
  if (!confirm("¿Estás seguro de que quieres borrar todo el diseño?")) {
    return;
  }

  // Limpiar todos los datos
  gridData = gridData.map((row) => row.map(() => null));
  actionHistory = [];

  // Redibujar
  if (layersSwapped) {
    ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, gridCanvas.width, gridCanvas.height);
  }

  drawGrid(
    gridCanvas.width,
    gridCanvas.height,
    currentCellSize,
    document.getElementById("lineColor").value,
  );
  drawBorder(gridCanvas.width, gridCanvas.height);

  // Actualizar botones
  updateActionButtons();
}

function drawBorder(width, height) {
  ctx.strokeStyle = "#667eea";
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, width, height);
}

function showImageGallery() {
  const gallery = document.getElementById("imageGallery");
  const galleryGrid = document.getElementById("galleryGrid");

  // Limpiar galería anterior
  galleryGrid.innerHTML = "";

  // Intentar cargar imágenes del directorio img/
  loadImagesFromDirectory();

  // Mostrar galería
  gallery.style.display = "block";
}

function openImageFileDialog() {
  const fileInput = document.getElementById("imageFileInput");
  fileInput.value = "";
  fileInput.click();
}

function hideImageGallery() {
  document.getElementById("imageGallery").style.display = "none";
}

async function getImageFilesFromImgDirectory() {
  try {
    const response = await fetch("img/");
    if (!response.ok) return [];

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const links = Array.from(doc.querySelectorAll("a"));

    return links
      .map((link) => link.getAttribute("href"))
      .filter(
        (href) =>
          href &&
          !href.startsWith("../") &&
          /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(href),
      );
  } catch (error) {
    return [];
  }
}

function normalizeImgPath(path) {
  if (!path) return path;

  const trimmed = path.trim();
  if (/^https?:\/\//i.test(trimmed) || /^data:/i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("img/")) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return trimmed.replace(/^\/+/, "");
  }

  return `img/${trimmed}`;
}

function addGalleryItem(src) {
  const galleryGrid = document.getElementById("galleryGrid");
  const galleryItem = document.createElement("div");
  galleryItem.className = "gallery-item";
  galleryItem.onclick = () => {
    loadReferenceImage(normalizeImgPath(src));
    hideImageGallery();
  };

  const imgElement = document.createElement("img");
  imgElement.src = normalizeImgPath(src);
  imgElement.alt = src;

  galleryItem.appendChild(imgElement);
  galleryGrid.appendChild(galleryItem);
}

function showNoImagesMessage() {
  const galleryGrid = document.getElementById("galleryGrid");
  const message = document.createElement("p");
  message.textContent =
    "No se encontraron imágenes en /img. Usa el selector de archivos para cargar una imagen.";
  message.style.textAlign = "center";
  message.style.color = "#666";
  message.style.fontSize = "0.9rem";
  galleryGrid.appendChild(message);
}

async function loadImagesFromDirectory() {
  const commonImages = [
    "flor.png",
    "flor.jpg",
    "flor.jpeg",
    "flor.gif",
    "corazon.png",
    "corazon.jpg",
    "corazon.jpeg",
    "estrella.png",
    "estrella.jpg",
    "estrella.jpeg",
    "mariposa.png",
    "mariposa.jpg",
    "mariposa.jpeg",
  ];

  const galleryGrid = document.getElementById("galleryGrid");
  const imageFiles = await getImageFilesFromImgDirectory();
  const candidates =
    imageFiles.length > 0
      ? imageFiles.map(normalizeImgPath)
      : commonImages.map((imageName) => `img/${imageName}`);

  let loadedAny = false;

  await Promise.all(
    candidates.map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = function () {
            loadedAny = true;
            addGalleryItem(src);
            resolve();
          };
          img.onerror = function () {
            resolve();
          };
          img.src = src;
        }),
    ),
  );

  if (!loadedAny) {
    showNoImagesMessage();
  }
}

function handleFileSelection(event) {
  const files = Array.from(event.target.files || []);
  const imageFile = files.find((file) => file.type.startsWith("image/"));

  if (imageFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      loadReferenceImage(e.target.result);
      hideImageGallery();
    };
    reader.readAsDataURL(imageFile);
  }
}

function loadReferenceImage(src) {
  const referenceContainer = document.getElementById("referenceImageContainer");
  const referenceImg = document.getElementById("referenceImage");

  referenceImg.src = src;
  referenceImg.style.display = "block";
  referenceContainer.style.display = "block";
  referenceContainer.style.left = "10px";
  referenceContainer.style.top = "10px";

  // Setear z-index inicial (imagen encima)
  if (!layersSwapped) {
    gridCanvas.style.zIndex = "75";
    referenceContainer.style.zIndex = "100";
  }

  referenceImage = referenceImg;
}

function removeReferenceImage() {
  const referenceContainer = document.getElementById("referenceImageContainer");
  const referenceImg = document.getElementById("referenceImage");

  referenceImg.src = "";
  referenceImg.style.display = "none";
  referenceContainer.style.display = "none";

  // Resetear z-index
  gridCanvas.style.zIndex = "75";
  referenceContainer.style.zIndex = "100";

  referenceImage = null;
  layersSwapped = false;

  // Desactivar modo color picker si estaba activo
  if (colorPickerMode) {
    enableColorPicker();
  }

  updateActionButtons();
}

function startReferenceDrag(event) {
  if (event.target.closest(".btn-remove-image")) return;

  const referenceContainer = document.getElementById("referenceImageContainer");
  referenceDrag.active = true;
  referenceDrag.moved = false;
  referenceDrag.startX = event.clientX;
  referenceDrag.startY = event.clientY;
  referenceDrag.originX = parseInt(referenceContainer.style.left || "10", 10);
  referenceDrag.originY = parseInt(referenceContainer.style.top || "10", 10);

  referenceContainer.classList.add("dragging");
  referenceContainer.setPointerCapture(event.pointerId);
}

function moveReferenceDrag(event) {
  if (!referenceDrag.active) return;

  const referenceContainer = document.getElementById("referenceImageContainer");
  const wrapper = document.querySelector(".canvas-wrapper");
  if (!wrapper) return;

  const deltaX = event.clientX - referenceDrag.startX;
  const deltaY = event.clientY - referenceDrag.startY;
  const newLeft = referenceDrag.originX + deltaX;
  const newTop = referenceDrag.originY + deltaY;

  const wrapperRect = wrapper.getBoundingClientRect();
  const maxLeft = wrapperRect.width - referenceContainer.offsetWidth;
  const maxTop = wrapperRect.height - referenceContainer.offsetHeight;

  referenceContainer.style.left = `${Math.min(Math.max(0, newLeft), maxLeft)}px`;
  referenceContainer.style.top = `${Math.min(Math.max(0, newTop), maxTop)}px`;

  if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
    referenceDrag.moved = true;
  }
}

function endReferenceDrag(event) {
  if (!referenceDrag.active) return;

  const referenceContainer = document.getElementById("referenceImageContainer");
  referenceContainer.classList.remove("dragging");
  referenceDrag.active = false;
}

function handleReferenceImageClick(event) {
  if (!referenceImage || referenceDrag.moved) return;
  if (event.target.closest(".btn-remove-image")) return;

  const canvasRect = gridCanvas.getBoundingClientRect();
  const x = event.clientX - canvasRect.left;
  const y = event.clientY - canvasRect.top;

  const col = Math.floor(x / currentCellSize);
  const row = Math.floor(y / currentCellSize);

  if (
    row >= 0 &&
    row < gridData.length &&
    col >= 0 &&
    col < gridData[0].length
  ) {
    const paintColor = document.getElementById("paintColor").value;
    const previousColor = gridData[row][col];

    if (previousColor !== paintColor) {
      actionHistory.push({
        row,
        col,
        previousColor,
        newColor: paintColor,
      });

      if (actionHistory.length > 50) {
        actionHistory.shift();
      }

      gridData[row][col] = paintColor;
      paintCell(row, col, paintColor);

      drawGrid(
        gridCanvas.width,
        gridCanvas.height,
        currentCellSize,
        document.getElementById("lineColor").value,
      );
      drawBorder(gridCanvas.width, gridCanvas.height);
      updateActionButtons();
    }
  }
}

function toggleLayers() {
  const referenceContainer = document.getElementById("referenceImageContainer");
  if (!referenceContainer || referenceContainer.style.display === "none")
    return;

  layersSwapped = !layersSwapped;

  if (layersSwapped) {
    // Rejilla encima: canvas con z-index alto, imagen con z-index bajo
    gridCanvas.style.zIndex = "150";
    referenceContainer.style.zIndex = "50";
  } else {
    // Imagen encima: imagen con z-index alto, canvas con z-index normal
    gridCanvas.style.zIndex = "75";
    referenceContainer.style.zIndex = "100";
  }

  // Redibujar canvas con el fondo correcto
  redrawCanvas();
}

function redrawCanvas() {
  // Limpiar canvas con el fondo correcto
  if (layersSwapped) {
    // Rejilla encima: fondo transparente para ver la imagen detrás
    ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
  } else {
    // Imagen encima: fondo blanco
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, gridCanvas.width, gridCanvas.height);
  }

  // Dibujar colores pintados
  drawPaintedCells();

  // Dibujar rejilla
  drawGrid(
    gridCanvas.width,
    gridCanvas.height,
    currentCellSize,
    document.getElementById("lineColor").value,
  );

  // Dibujar borde
  drawBorder(gridCanvas.width, gridCanvas.height);
}

function enableColorPicker() {
  if (!referenceImage) return;

  colorPickerMode = !colorPickerMode;

  const btnColorPicker = document.getElementById("btnColorPicker");
  if (colorPickerMode) {
    btnColorPicker.style.background = "#667eea";
    btnColorPicker.style.color = "white";
    gridCanvas.style.cursor = "crosshair";
  } else {
    btnColorPicker.style.background = "";
    btnColorPicker.style.color = "";
    gridCanvas.style.cursor = "crosshair";
  }
}

function getImageColorAtPosition(x, y) {
  // Crear un canvas temporal para obtener el color del píxel
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  // Establecer el tamaño del canvas temporal al tamaño de la imagen
  tempCanvas.width = referenceImage.naturalWidth;
  tempCanvas.height = referenceImage.naturalHeight;

  // Dibujar la imagen en el canvas temporal
  tempCtx.drawImage(referenceImage, 0, 0);

  // Calcular las coordenadas relativas a la imagen mostrada
  const rect = referenceImage.getBoundingClientRect();
  const scaleX = referenceImage.naturalWidth / rect.width;
  const scaleY = referenceImage.naturalHeight / rect.height;

  const imageX = Math.floor((x - rect.left) * scaleX);
  const imageY = Math.floor((y - rect.top) * scaleY);

  // Obtener el color del píxel
  const imageData = tempCtx.getImageData(imageX, imageY, 1, 1);
  const [r, g, b] = imageData.data;

  // Convertir a formato hex
  const hexColor = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

  return hexColor;
}

function goBack() {
  window.location.href = "index.html";
}
