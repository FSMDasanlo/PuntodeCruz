const express = require("express");
const cors = require("cors");
const { Anthropic } = require("@anthropic-ai/sdk");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Inicializar cliente de Claude
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    name: "Punto de Cruz - Backend API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      health: "GET /health",
      generatePattern: "POST /generate-pattern",
    },
  });
});

// Endpoint para generar patrones
app.post("/generate-pattern", async (req, res) => {
  try {
    // Validar que CLAUDE_API_KEY esté configurada
    if (!process.env.CLAUDE_API_KEY) {
      return res.status(500).json({
        error: "API key de Claude no configurada en el servidor",
        details:
          "Verifica que CLAUDE_API_KEY esté definida en las variables de entorno",
      });
    }

    const { description, maxRows, maxCols } = req.body;

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
    const prompt = `Eres un experto en diseño de patrones para punto de cruz. Crea un patrón de pixel art basado en la descripción: "${description}".

INSTRUCCIONES:
- El patrón debe ser simétrico cuando sea apropiado (como flores, animales, objetos)
- Usa números del 1-4 para representar diferentes colores
- Usa 0 para espacios vacíos
- El patrón debe ser legible y reconocible
- Mantén el patrón simple pero detallado
- Dimensiones máximas: ${maxRows}x${maxCols} (pero puedes usar menos)
- Devuelve SOLO el patrón como array de arrays, sin texto adicional

FORMATO DE RESPUESTA:
Devuelve un objeto JSON con:
- pattern: array de arrays con números 0-4
- colors: array de 4 colores hex (ej: ["#ff0000", "#00ff00", "#0000ff", "#ffff00"])

Ejemplo para un corazón simple:
{
  "pattern": [
    [0,1,1,0],
    [1,1,1,1],
    [1,1,1,1],
    [0,1,1,0]
  ],
  "colors": ["#ff0000", "#ff69b4", "#ffffff", "#000000"]
}

Ahora crea el patrón para: ${description}`;

    // Llamar a Claude
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 2000,
      temperature: 0.7,
      system:
        "Eres un experto en diseño de patrones para punto de cruz. Siempre respondes con JSON válido.",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const response = message.content[0].text;
    console.log("Respuesta de Claude:", response);

    // Parsear respuesta JSON
    let result;
    try {
      // Intentar parsear directamente
      result = JSON.parse(response);
    } catch (parseError) {
      console.log("Error parseando JSON directamente, intentando extraer...");

      // Intentar extraer JSON del texto
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No se pudo parsear la respuesta como JSON");
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

    if (height > maxRows || width > maxCols) {
      console.warn(
        `Patrón generado (${height}x${width}) excede límites (${maxRows}x${maxCols}), ajustando...`,
      );

      // Recortar si es necesario
      result.pattern = result.pattern
        .slice(0, maxRows)
        .map((row) => (Array.isArray(row) ? row.slice(0, maxCols) : []));
    }

    console.log(
      `Patrón generado exitosamente: ${result.pattern.length}x${result.pattern[0]?.length || 0}`,
    );
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

// Endpoint de health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
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
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🎨 API de patrones: http://localhost:${port}/generate-pattern`);

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
