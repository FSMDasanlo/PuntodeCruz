require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path"); // Importar módulo path
const { Anthropic } = require("@anthropic-ai/sdk");
const { execSync } = require("child_process");
const fs = require("fs");

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
  const envModel = process.env.ANTHROPIC_MODEL?.trim()
    .replace(/^=/, "")
    .replace(/['"]/g, "");
  const defaultCandidates = [
    "claude-3-5-sonnet-20240620",
    "claude-3-haiku-20240307",
    "claude-2.1",
    "claude-2",
  ];

  // Si hay un modelo en el env, lo ponemos el primero, pero dejamos los otros como reserva
  const modelCandidates = envModel
    ? [envModel, ...defaultCandidates]
    : defaultCandidates;

  let lastError;
  for (const model of modelCandidates) {
    try {
      console.log(`🔄 Probando modelo Claude: ${model}`);
      const message = await anthropic.messages.create({
        model,
        max_tokens: 1500,
        temperature: 0.0,
        system:
          "Eres un experto programador en Python y diseño de pixel art. Tu tarea es escribir scripts de Python que generen patrones de punto de cruz precisos. Responde únicamente con el código de Python, sin explicaciones.",
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

    const { description, image, imageType } = req.body;
    const maxRows = 60; // Estandarizamos a un tamaño de buena calidad
    const maxCols = 60;

    console.log("  Description:", description);
    if (image) console.log("  🖼️ Imagen recibida como referencia visual");

    if (!description) {
      return res.status(400).json({ error: "Se requiere una descripción" });
    }

    // Prompt para Claude
    const prompt = `Escribe un script de Python que genere un patrón de punto de cruz para: "${description}".
Usa la lógica procedural de 'dani.py' para que el dibujo sea realista y geométricamente correcto.

INSTRUCCIONES DE COLOR:
${image ? "- ANALIZA la imagen adjunta y extrae los colores HEX más representativos para usarlos en el patrón." : "- Usa una paleta de colores realista basada en la descripción."}
- Los códigos de color deben ser válidos (puedes aproximarlos a sus equivalentes HEX).

REQUISITOS DEL SCRIPT:
1. Debe usar numpy para crear una rejilla de ${maxRows}x${maxCols}.
2. Debe usar formas matemáticas (elipses, rectángulos, líneas) para dibujar el objeto.
3. Los valores en la rejilla deben ser 0 (fondo) y 1-5 (colores).
4. El script debe imprimir al final ÚNICAMENTE un objeto JSON con esta estructura:
   {"pattern": [[...]], "colors": ["#hex1", "#hex2", ...]}

Importante: No uses matplotlib, solo numpy y json. El resultado debe ser profesional.`;

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

    const messageResponse = await createClaudeMessage(userContent);
    const pythonCode = messageResponse.content
      .find((b) => b.type === "text")
      .text.replace(/```python/g, "")
      .replace(/```/g, "")
      .trim();

    // Guardar y ejecutar el script de Python
    const scriptPath = path.join(__dirname, "temp_generator.py");
    fs.writeFileSync(scriptPath, pythonCode);

    console.log("🐍 Ejecutando motor de Python...");
    let result;
    try {
      const pythonOutput = execSync(`python "${scriptPath}"`, {
        encoding: "utf8",
      });
      // Extraer el JSON de la salida (por si hay basura)
      const jsonMatch = pythonOutput.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Python no devolvió un JSON válido");
      result = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error("❌ Error ejecutando Python:", err.message);
      throw new Error("El motor de dibujo falló al generar la geometría.");
    } finally {
      if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath); // Limpiar
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
