// ==========================================
// ASISTENTE DE DISEÑO INTELIGENTE
// ==========================================

// Plantillas predefinidas de diseños
const DESIGN_TEMPLATES = {
  // Animales
  HEART: {
    name: "Corazón",
    category: "Símbolos",
    colors: ["#ff0000"],
    pattern: [
      [0, 1, 1, 0, 0, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0],
    ],
  },
  STAR: {
    name: "Estrella",
    category: "Símbolos",
    colors: ["#ffd700"],
    pattern: [
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
    ],
  },
  FLOWER: {
    name: "Flor",
    category: "Naturaleza",
    colors: ["#ff69b4", "#ffff00"],
    pattern: [
      [0, 0, 1, 1, 0, 0],
      [0, 1, 2, 2, 1, 0],
      [1, 2, 2, 2, 2, 1],
      [1, 2, 2, 2, 2, 1],
      [0, 1, 2, 2, 1, 0],
      [0, 0, 1, 1, 0, 0],
    ],
  },
  BUTTERFLY: {
    name: "Mariposa",
    category: "Animales",
    colors: ["#ff69b4", "#9370db"],
    pattern: [
      [0, 1, 1, 0, 2, 2, 0],
      [1, 1, 1, 1, 2, 2, 2],
      [1, 1, 1, 1, 2, 2, 2],
      [1, 1, 0, 2, 2, 0, 2],
      [1, 1, 1, 1, 2, 2, 2],
      [1, 1, 1, 1, 2, 2, 2],
      [0, 1, 1, 0, 2, 2, 0],
    ],
  },
  TREE: {
    name: "Árbol",
    category: "Naturaleza",
    colors: ["#228b22", "#8b4513"],
    pattern: [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 2, 0, 0],
      [0, 0, 2, 0, 0],
    ],
  },
  CAT_HEAD: {
    name: "Gato",
    category: "Animales",
    colors: ["#ff9900", "#ffff00"],
    pattern: [
      [1, 0, 0, 0, 1],
      [1, 1, 0, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 2, 1, 0],
      [0, 1, 1, 1, 0],
    ],
  },
  BIRD: {
    name: "Pájaro",
    category: "Animales",
    colors: ["#ff0000"],
    pattern: [
      [0, 0, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 0, 0],
    ],
  },
  SNOWFLAKE: {
    name: "Copo de nieve",
    category: "Naturaleza",
    colors: ["#00bfff"],
    pattern: [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
    ],
  },
  APPLE: {
    name: "Manzana",
    category: "Comida",
    colors: ["#ff0000", "#228b22"],
    pattern: [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 2, 1, 0],
    ],
  },
  MUSHROOM: {
    name: "Seta",
    category: "Naturaleza",
    colors: ["#ff0000", "#ffffff", "#8b4513"],
    pattern: [
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [0, 2, 2, 2, 0],
      [0, 2, 2, 2, 0],
      [0, 0, 3, 0, 0],
    ],
  },
  HOUSE: {
    name: "Casa",
    category: "Objetos",
    colors: ["#ff6b6b", "#8b4513", "#ffff00"],
    pattern: [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 2, 1, 2, 1],
      [1, 2, 3, 2, 1],
    ],
  },
  CACTUS: {
    name: "Cactus",
    category: "Naturaleza",
    colors: ["#228b22"],
    pattern: [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
    ],
  },
  FISH: {
    name: "Pez",
    category: "Animales",
    colors: ["#ff6b9d"],
    pattern: [
      [0, 0, 1, 1, 0],
      [0, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1],
      [0, 0, 1, 1, 0],
    ],
  },
  DIAMOND: {
    name: "Diamante",
    category: "Símbolos",
    colors: ["#00bfff"],
    pattern: [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
    ],
  },
  SMILE: {
    name: "Cara feliz",
    category: "Emojis",
    colors: ["#ffff00"],
    pattern: [
      [0, 1, 1, 1, 0],
      [1, 0, 1, 0, 1],
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [0, 1, 1, 1, 0],
    ],
  },
  ROCKET: {
    name: "Cohete",
    category: "Objetos",
    colors: ["#ff0000", "#ffff00"],
    pattern: [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 2, 1, 1],
      [0, 1, 2, 1, 0],
    ],
  },
  SUN: {
    name: "Sol",
    category: "Naturaleza",
    colors: ["#ffff00"],
    pattern: [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
    ],
  },
  CLOUD: {
    name: "Nube",
    category: "Naturaleza",
    colors: ["#ffffff"],
    pattern: [
      [0, 1, 1, 0, 0],
      [1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
    ],
  },
};

// Mostrar modal del asistente
function showDesignAssistant() {
  const modal = document.getElementById("designAssistantModal");
  if (modal) {
    modal.style.display = "block";
    populateTemplatesList();
  }
}

// Cerrar modal del asistente
function closeDesignAssistant() {
  const modal = document.getElementById("designAssistantModal");
  if (modal) {
    modal.style.display = "none";
  }
}

// Poblar lista de plantillas
function populateTemplatesList() {
  const container = document.getElementById("templatesContainer");
  if (!container) return;

  container.innerHTML = "";

  // Agrupar por categoría
  const categories = {};
  Object.entries(DESIGN_TEMPLATES).forEach(([key, template]) => {
    if (!categories[template.category]) {
      categories[template.category] = [];
    }
    categories[template.category].push({ key, ...template });
  });

  // Crear secciones por categoría
  Object.entries(categories).forEach(([category, templates]) => {
    const section = document.createElement("div");
    section.className = "template-category";

    const title = document.createElement("h4");
    title.textContent = category;
    section.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "template-grid";

    templates.forEach((template) => {
      const item = document.createElement("button");
      item.className = "template-item";
      item.title = template.name;
      item.onclick = () => applyTemplate(template.key);
      item.innerHTML = `
        <div class="template-preview">
          ${renderTemplatePreview(template.pattern, template.colors)}
        </div>
        <span>${template.name}</span>
      `;
      grid.appendChild(item);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
}

// Renderizar preview de plantilla
function renderTemplatePreview(pattern, colors) {
  const cellSize = 10;
  const width = pattern[0].length * cellSize;
  const height = pattern.length * cellSize;

  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

  pattern.forEach((row, y) => {
    row.forEach((colorIdx, x) => {
      if (colorIdx !== 0) {
        const color = colors[colorIdx - 1] || "#ccc";
        svg += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="${color}" stroke="#999" stroke-width="0.5"/>`;
      }
    });
  });

  svg += "</svg>";
  return svg;
}

// Aplicar plantilla a la cuadrícula
function applyTemplate(templateKey) {
  if (!gridData || gridData.length === 0) {
    alert("Por favor, configura primero el tamaño de la rejilla");
    return;
  }

  const template = DESIGN_TEMPLATES[templateKey];
  if (!template) return;

  // Guardar estado anterior para deshacer
  const previousState = {
    gridData: gridData.map((row) => [...row]),
    actionHistory,
  };

  // Limpiar diseño anterior
  gridData = gridData.map((row) => row.map(() => null));
  actionHistory = [];

  // Calcular posición centrada
  const pattern = template.pattern;
  const patternHeight = pattern.length;
  const patternWidth = pattern[0].length;

  const startRow = Math.floor((gridData.length - patternHeight) / 2);
  const startCol = Math.floor((gridData[0].length - patternWidth) / 2);

  // Aplicar plantilla
  pattern.forEach((row, y) => {
    row.forEach((colorIdx, x) => {
      if (colorIdx !== 0) {
        const gridRow = startRow + y;
        const gridCol = startCol + x;

        if (
          gridRow >= 0 &&
          gridRow < gridData.length &&
          gridCol >= 0 &&
          gridCol < gridData[0].length
        ) {
          const color = template.colors[colorIdx - 1] || template.colors[0];
          gridData[gridRow][gridCol] = color;
        }
      }
    });
  });

  // Redibujar
  redrawCanvas();

  // Cerrar modal
  closeDesignAssistant();

  // Mostrar confirmación
  showNotification(`✨ Plantilla "${template.name}" aplicada correctamente`);
}

// Enviar descripción para generar patrón
async function generateCustomDesign() {
  const textarea = document.getElementById("customDesignDescription");
  const description = textarea.value.trim();

  if (!description) {
    alert("Por favor describe el objeto que deseas crear");
    return;
  }

  if (!gridData || gridData.length === 0) {
    alert("Por favor, configura primero el tamaño de la rejilla");
    return;
  }

  const button = document.getElementById("btnGenerateCustom");
  const originalText = button.textContent;

  try {
    button.disabled = true;
    button.textContent = "⏳ Generando...";

    // Intentar usar backend primero, si falla usar generador local
    let pattern;
    try {
      pattern = await generatePatternWithBackend(
        description,
        gridData.length,
        gridData[0].length,
      );
    } catch (backendError) {
      console.warn(
        "Backend no disponible, usando generador local:",
        backendError.message,
      );
      pattern = generatePatternFromDescription(
        description,
        gridData.length,
        gridData[0].length,
      );
    }

    if (pattern) {
      applyCustomPattern(pattern);
      textarea.value = "";
      showNotification("✨ Patrón generado correctamente");
    }
  } catch (error) {
    console.error("Error:", error);
    alert(`Error al generar el patrón: ${error.message}`);
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

// Función para llamar al backend
async function generatePatternWithBackend(description, maxRows, maxCols) {
  const backendUrl = "https://puntodecruz.onrender.com/generate-pattern";

  const response = await fetch(backendUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      description,
      maxRows,
      maxCols,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error en el backend");
  }

  return await response.json();
}

// Generador inteligente de patrones basado en descripción
function generatePatternFromDescription(description, maxRows, maxCols) {
  const desc = description.toLowerCase();
  const colors = extractColorsFromDescription(desc);
  const size = Math.min(20, Math.max(8, Math.min(maxRows, maxCols)));

  let pattern;
  if (
    desc.includes("corazón") ||
    desc.includes("corazon") ||
    desc.includes("amor")
  ) {
    pattern = generateHeartPattern(size);
  } else if (
    desc.includes("mariposa") ||
    desc.includes("alas") ||
    desc.includes("butterfly")
  ) {
    pattern = generateButterflyPattern(size);
  } else if (
    desc.includes("flor") ||
    desc.includes("rosa") ||
    desc.includes("margarita")
  ) {
    pattern = generateFlowerPattern(size);
  } else if (
    desc.includes("árbol") ||
    desc.includes("arbol") ||
    desc.includes("pino")
  ) {
    pattern = generateTreePattern(size);
  } else if (
    desc.includes("sol") ||
    desc.includes("luna") ||
    desc.includes("estrella")
  ) {
    pattern = generateCirclePattern(size);
  } else if (
    desc.includes("casa") ||
    desc.includes("hogar") ||
    desc.includes("puerta")
  ) {
    pattern = generateHousePattern(size);
  } else if (
    desc.includes("gato") ||
    desc.includes("perro") ||
    desc.includes("pájaro") ||
    desc.includes("pajaro") ||
    desc.includes("pez")
  ) {
    pattern = generateSimpleAnimalPattern(size);
  } else {
    pattern = generateRandomSymmetricPattern(size);
  }

  return {
    pattern,
    colors,
  };
}

// Extraer colores de la descripción
function extractColorsFromDescription(description) {
  const palette = {
    rojo: "#ff0000",
    red: "#ff0000",
    azul: "#0066ff",
    blue: "#0066ff",
    verde: "#00aa00",
    green: "#00aa00",
    amarillo: "#ffff00",
    yellow: "#ffff00",
    naranja: "#ff9900",
    orange: "#ff9900",
    rosa: "#ff69b4",
    pink: "#ff69b4",
    púrpura: "#9370db",
    purple: "#9370db",
    negro: "#000000",
    black: "#000000",
    blanco: "#ffffff",
    white: "#ffffff",
    marrón: "#8b4513",
    marron: "#8b4513",
    brown: "#8b4513",
    gris: "#888888",
    gray: "#888888",
    oro: "#ffd700",
    gold: "#ffd700",
    plata: "#c0c0c0",
    silver: "#c0c0c0",
  };

  const results = [];
  for (const [name, hex] of Object.entries(palette)) {
    if (description.includes(name) && !results.includes(hex)) {
      results.push(hex);
    }
  }

  if (results.length === 0) {
    return ["#667eea", "#764ba2", "#ff6b6b", "#4ecdc4"];
  }

  while (results.length < 4) {
    const defaultColor = ["#667eea", "#764ba2", "#ff6b6b", "#4ecdc4"][
      results.length
    ];
    if (!results.includes(defaultColor)) {
      results.push(defaultColor);
    }
  }

  return results.slice(0, 4);
}

function generateSymmetricPattern(size, fillShapeFn) {
  const pattern = Array.from({ length: size }, () => Array(size).fill(0));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < Math.ceil(size / 2); x++) {
      const value = fillShapeFn(x, y, size);
      pattern[y][x] = value;
      pattern[y][size - 1 - x] = value;
    }
  }
  return pattern;
}

function generateHeartPattern(size) {
  return generateSymmetricPattern(size, (x, y, n) => {
    const cx = n * 0.3;
    const cy = n * 0.3;
    const dx = x - cx;
    const dy = y - cy;
    const r1 = Math.sqrt(dx * dx + dy * dy);
    const d2 = Math.sqrt((x - (n - 1 - cx)) ** 2 + dy * dy);
    const bottom = y > n * 0.5 && x >= n * 0.2 && x <= n * 0.8;
    return r1 < n * 0.25 || d2 < n * 0.25 || bottom ? 1 : 0;
  });
}

function generateFlowerPattern(size) {
  return generateSymmetricPattern(size, (x, y, n) => {
    const cx = Math.floor(n / 2);
    const cy = cx;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < n * 0.2) return 2;
    if (dist < n * 0.45 && Math.floor((x + y) / 2) % 2 === 0) return 1;
    return 0;
  });
}

function generateButterflyPattern(size) {
  return generateSymmetricPattern(size, (x, y, n) => {
    const cy = Math.floor(n / 2);
    if (y === cy) return 1;
    if (y === cy - 1 || y === cy + 1) return x >= 1 && x < n - 1 ? 2 : 0;
    if (y === cy - 2 || y === cy + 2) return x >= 2 && x < n - 2 ? 2 : 0;
    return 0;
  });
}

function generateTreePattern(size) {
  return generateSymmetricPattern(size, (x, y, n) => {
    const trunkStart = Math.floor(n * 0.6);
    const center = Math.floor(n / 2);
    if (y >= trunkStart && x >= center - 1 && x <= center + 1) return 2;
    const canopy = Math.abs(x - center) + (y - trunkStart) * 0.6;
    return y < trunkStart && canopy <= n * 0.8 ? 1 : 0;
  });
}

function generateHousePattern(size) {
  return generateSymmetricPattern(size, (x, y, n) => {
    const roofHeight = Math.floor(n * 0.4);
    const center = Math.floor(n / 2);
    if (y < roofHeight && Math.abs(x - center) <= roofHeight - y) return 1;
    if (y >= roofHeight && x >= center - 1 && x <= center + 1) return 2;
    return 0;
  });
}

function generateSimpleAnimalPattern(size) {
  return generateSymmetricPattern(size, (x, y, n) => {
    const head =
      y < Math.floor(n * 0.6) &&
      x >= Math.floor(n * 0.2) &&
      x < Math.ceil(n * 0.8);
    const ear =
      y < Math.floor(n * 0.3) &&
      (x === Math.floor(n * 0.2) || x === Math.ceil(n * 0.8) - 1);
    if (ear) return 2;
    if (head) return 1;
    return 0;
  });
}

function generateCirclePattern(size) {
  return generateSymmetricPattern(size, (x, y, n) => {
    const center = (n - 1) / 2;
    const dist = Math.sqrt((x - center) ** 2 + (y - center) ** 2);
    return dist <= n * 0.4 ? 1 : 0;
  });
}

function generateRandomSymmetricPattern(size) {
  return generateSymmetricPattern(size, () => (Math.random() > 0.7 ? 1 : 0));
}

// Aplicar patrón personalizado a la cuadrícula
function applyCustomPattern(pattern) {
  // Limpiar diseño anterior
  gridData = gridData.map((row) => row.map(() => null));
  actionHistory = [];

  const patternData = pattern.pattern;
  const colors = pattern.colors;
  const patternHeight = patternData.length;
  const patternWidth = patternData[0]?.length || 0;

  // Calcular posición centrada
  const startRow = Math.floor((gridData.length - patternHeight) / 2);
  const startCol = Math.floor((gridData[0].length - patternWidth) / 2);

  // Aplicar patrón
  patternData.forEach((row, y) => {
    row.forEach((colorIdx, x) => {
      if (colorIdx !== 0 && colorIdx > 0) {
        const gridRow = startRow + y;
        const gridCol = startCol + x;

        if (
          gridRow >= 0 &&
          gridRow < gridData.length &&
          gridCol >= 0 &&
          gridCol < gridData[0].length
        ) {
          const color = colors[colorIdx - 1] || colors[0];
          gridData[gridRow][gridCol] = color;
        }
      }
    });
  });

  // Redibujar
  redrawCanvas();

  // Cerrar modal
  closeDesignAssistant();
}

// Mostrar notificación
function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Redibujar canvas después de aplicar patrón
function redrawCanvas() {
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

  // Actualizar estado de botones
  updateActionButtons();
}

// Cerrar modal al hacer click afuera
window.addEventListener("click", function (event) {
  const modal = document.getElementById("designAssistantModal");
  if (modal && event.target === modal) {
    closeDesignAssistant();
  }
});

// Cambiar entre tabs
function switchTab(tabName) {
  // Ocultar todos los tabs
  document.querySelectorAll(".assistant-tab").forEach((tab) => {
    tab.classList.remove("active");
  });
  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Mostrar tab seleccionado
  if (tabName === "templates") {
    document.getElementById("templatesTab").classList.add("active");
    document
      .querySelector("[onclick=\"switchTab('templates')\"]")
      .classList.add("active");
  } else if (tabName === "custom") {
    document.getElementById("customTab").classList.add("active");
    document
      .querySelector("[onclick=\"switchTab('custom')\"]")
      .classList.add("active");
  }
}
