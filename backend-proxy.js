require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path"); // Importar módulo path
const { Anthropic } = require("@anthropic-ai/sdk");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Aumentar límite para imágenes

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, "public")));

// Inicializar cliente de Claude
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

console.log("🔧 Variables de entorno:");
console.log(
  "  ANTHROPIC_MODEL =",
  process.env.ANTHROPIC_MODEL || "<no definido>",
);
console.log(
  "  CLAUDE_API_KEY =",
  process.env.CLAUDE_API_KEY ? "<configurada>" : "<no configurada>",
);

async function createClaudeMessage(userContent) {
  // Limpiamos el nombre del modelo de posibles espacios o el símbolo "=" mal puesto
  const envModel = process.env.ANTHROPIC_MODEL?.trim().replace(/^=/, "").replace(/['"]/g, "");
  const defaultCandidates = [
    "claude-3-5-sonnet-20240620",
    "claude-3-haiku-20240307",
    "claude-2.1",
    "claude-2",
  ];

  // Si hay un modelo en el env, lo ponemos el primero, pero dejamos los otros como reserva
  const modelCandidates = envModel ? [envModel, ...defaultCandidates] : defaultCandidates;

  let lastError;
  for (const model of modelCandidates) {
    try {
      console.log(`🔄 Probando modelo Claude: ${model}`);
      const message = await anthropic.messages.create({
        model,
        max_tokens: 1500,
        temperature: 0.0,
        system:
          "Eres un experto en diseño de patrones para punto de cruz. Responde siempre con una única salida JSON válida sin texto adicional.",
        messages: [
          {
            role: "user",
            content: userContent,
          },
        ],
      });
      console.log(`✅ Modelo válido: ${model}`);
      return message;
    } catch (error) {
      lastError = error;
      const msg = error?.response?.data || error?.message || error;
      console.warn(`⚠️ Modelo ${model} falló:`, msg);
      const status = error?.status || error?.response?.status;
      const errorType =
        error?.response?.data?.error?.type || error?.type || error?.error?.type;
      const isNotFound =
        status === 404 ||
        errorType === "not_found_error" ||
        String(msg).includes("not_found_error");
      if (!isNotFound) {
        throw error;
      }
    }
  }

  throw lastError;
}

// Ruta raíz para servir el frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Endpoint de health check (ahora en /api/health para no colisionar con la raíz)
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    message: "Backend API is running.",
    frontend: "Accede a la interfaz de usuario en la raíz '/'",
    apiEndpoints: {
      generatePattern: "POST /generate-pattern",
    },
  });
});

// Endpoint para generar patrones
app.post("/generate-pattern", async (req, res) => {
  try {
    console.log("📨 NUEVA PETICIÓN RECIBIDA");
    console.log("  Timestamp:", new Date().toISOString());

    // Validar que CLAUDE_API_KEY esté configurada
    if (!process.env.CLAUDE_API_KEY) {
      console.error("❌ ERROR: CLAUDE_API_KEY no está configurada!");
      return res.status(500).json({
        error: "API key de Claude no configurada en el servidor",
        details:
          "Verifica que CLAUDE_API_KEY esté definida en las variables de entorno",
      });
    }

    console.log("✅ CLAUDE_API_KEY está configurada");

    const { description, maxRows, maxCols, image, imageType } = req.body;

    console.log("  Description:", description);
    console.log("  Dimensiones:", maxRows, "x", maxCols);
    if (image) console.log("  🖼️ Imagen recibida como referencia visual");

    if (!description) {
      return res.status(400).json({ error: "Se requiere una descripción" });
    }

    if (!maxRows || !maxCols) {
      return res
        .status(400)
        .json({ error: "Se requieren las dimensiones maxRows y maxCols" });
    }

    console.log(
      `Generando patrón para: "${description}" (${maxRows}x${maxCols})`,
    );

    // Prompt para Claude
    const prompt = `Eres un experto generador de patrones de punto de cruz. Crea un patrón de pixel art basado en la descripción: "${description}"${image ? " y la imagen adjunta como referencia visual principal" : ""}.
El patrón debe tener exactamente ${maxRows} filas y ${maxCols} columnas.

INSTRUCCIONES:
- Usa números del 1-4 para representar diferentes colores
- Usa 0 para espacios vacíos
- Si la descripción es una sola letra mayúscula, genera una letra legible con un solo color y el resto en 0
- Para letras, el patrón de la letra en sí debe ser pequeño y definido (idealmente no más de 12 columnas y 20 filas para la letra).
- Si las dimensiones solicitadas (${maxRows}x${maxCols}) son mayores que el tamaño ideal de la letra, dibuja la letra de forma legible. La letra debe estar aproximadamente centrada dentro del patrón, con un número igual o casi igual de ceros a su alrededor (arriba/abajo, izquierda/derecha). Rellena todo el espacio restante con 0.
- Si la descripción incluye un color, usa ese color como el primer color en 'colors'
- Asegúrate de que el patrón generado tenga exactamente ${maxRows} filas y ${maxCols} columnas. Rellena con 0 si es necesario para alcanzar las dimensiones.
- Mantén el patrón simple, legible y sin detalles innecesarios, especialmente para letras.
- No agregues texto, explicaciones, comentarios o etiquetas
- Devuelve SOLO un objeto JSON válido

FORMATO DE RESPUESTA:
Devuelve un objeto JSON con:
- pattern: array de arrays con números 0-4
- colors: array de 1 a 4 colores hex válidos

Ejemplo para una letra J simple:
{
  "pattern": [
    [0,0,0,1],
    [0,0,0,1],
    [0,0,0,1],
    [1,1,1,1]
  ],
  "colors": ["#0000ff"]
}

Ejemplo para una letra M simple:
{
  "pattern": [
    [1,0,0,0,1],
    [1,1,0,1,1],
    [1,0,1,0,1],
    [1,0,0,0,1]
  ],
  "colors": ["#ff0000"]
}

Ejemplo para una letra M simple centrada en un patrón de 6x7:
{
  "pattern": [
    [0,0,0,0,0,0,0],
    [0,1,0,0,0,1,0],
    [0,1,1,0,1,1,0],
    [0,1,0,1,0,1,0],
    [0,1,0,0,0,1,0],
    [0,0,0,0,0,0,0]
  ],
  "colors": ["#ff0000"]
}

Sigue el estilo de los ejemplos para la generación de letras.
Ahora crea el patrón para: "${description}" con dimensiones ${maxRows}x${maxCols}.`;

    // Llamar a Claude
    console.log("🤖 Llamando a Claude API...");

    const userContent = [];

    // Si el usuario envió una imagen, la incluimos en la petición a Claude
    if (image && imageType) {
      userContent.push({
        type: "image",
        source: {
          type: "base64",
          media_type: imageType,
          data: image,
        },
      });
    }

    userContent.push({
      type: "text",
      text: prompt,
    });

    const message = await createClaudeMessage(userContent);

    console.log("📤 Respuesta recibida de Claude");

    if (!message.content || message.content.length === 0) {
      throw new Error("Claude devolvió una respuesta vacía");
    }

    let claudeResponseText;
    // Buscamos el bloque de texto en el contenido
    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock) {
      throw new Error("La respuesta de Claude no contiene texto.");
    }

    claudeResponseText = textBlock.text.trim();
    console.log(
      "🤖 Texto crudo de Claude:",
      claudeResponseText.substring(0, 100) + "...",
    );

    // Parsear respuesta JSON
    let result;
    try {
      // Intentar limpiar posibles bloques de código Markdown (```json ... ```)
      const jsonContent = claudeResponseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      result = JSON.parse(jsonContent);
      console.log("✅ JSON parseado correctamente");
    } catch (parseError) {
      console.warn(
        "⚠️ Error parseando JSON directamente, intentando extraer...",
      );

      const jsonMatch = claudeResponseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Claude no generó un formato JSON válido.");
      }
    }

    // Validar estructura
    if (!result.pattern || !Array.isArray(result.pattern)) {
      throw new Error("El patrón no es válido");
    }

    if (!result.colors || !Array.isArray(result.colors)) {
      throw new Error("Los colores no son válidos");
    }

    // Validar dimensiones
    const height = result.pattern.length;
    const width = result.pattern[0]?.length || 0;

    // **IMPORTANTE:** Hemos modificado el prompt para que Claude genere las dimensiones correctas.
    // Este bloque de código de recorte post-generación ahora es menos necesario,
    // ya que esperamos que Claude respete las dimensiones.
    // Si Claude aún no respeta las dimensiones, este recorte podría seguir distorsionando el patrón.
    // Para empezar, lo comentaremos para ver si Claude cumple con el nuevo prompt.
    // Si los patrones siguen siendo "malos" por dimensiones incorrectas, podríamos
    // necesitar una lógica de ajuste más inteligente aquí (ej. padding con ceros).
    // if (height > maxRows || width > maxCols) {
    //   console.warn(
    //     `Patrón generado (${height}x${width}) excede límites (${maxRows}x${maxCols}), ajustando...`,
    //   );
    //   result.pattern = result.pattern
    //     .slice(0, maxRows)
    //     .map((row) => (Array.isArray(row) ? row.slice(0, maxCols) : []));
    // }

    console.log(`Patrón generado exitosamente: ${height}x${width}`);
    res.json(result);
  } catch (error) {
    console.error("Error generando patrón:", error);

    // Respuesta de error
    res.status(500).json({
      error: error.message || "Error interno del servidor",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error("Error no manejado:", error);
  res.status(500).json({
    error: "Error interno del servidor",
    details: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en puerto ${port}`);
  console.log(`🌐 Frontend disponible en: http://localhost:${port}`);
  console.log(`📊 Health check API: http://localhost:${port}/api/health`);

  // Validar configuración
  if (!process.env.CLAUDE_API_KEY) {
    console.warn(`⚠️  ADVERTENCIA: CLAUDE_API_KEY no está configurada!`);
    console.warn(
      `🔑 Configura la variable de entorno CLAUDE_API_KEY para usar la IA`,
    );
  } else {
    console.log(`✅ CLAUDE_API_KEY configurada`);
  }
});
