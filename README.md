# Punto de Cruz - Diseñador de Rejillas

Un diseñador interactivo de rejillas para crear patrones de punto de cruz con un asistente de diseño inteligente powered by Claude AI.

## ✨ Características

- **Diseño de Rejillas Interactivo**: Crea rejillas personalizables con diferentes tamaños y colores
- **Asistente de Diseño Inteligente**: Genera patrones automáticamente describiendo objetos
- **Plantillas Predefinidas**: Más de 15 plantillas listas para usar (corazones, flores, animales, etc.)
- **Carga de Imágenes**: Importa imágenes de referencia para guiar tu diseño
- **Sistema de Colores**: Selector de colores intuitivo con captura de colores de imágenes
- **Deshacer/Refacer**: Historial completo de acciones
- **Exportación**: Guarda tus diseños para usarlos

## 🚀 Inicio Rápido

### Opción 1: Solo Frontend (Plantillas Locales)

1. Clona el repositorio:

```bash
git clone https://github.com/tu-usuario/puntodecruz.git
cd puntodecruz
```

2. Abre `grid-designer.html` en tu navegador

3. ¡Empieza a diseñar! El asistente funciona con plantillas predefinidas.

### Opción 2: Con Backend AI (Patrones Personalizados)

#### Configuración del Backend

1. Instala Node.js (versión 16 o superior)

2. Instala las dependencias:

```bash
npm install
```

3. Configura las variables de entorno:

```bash
cp .env.example .env
```

4. Edita `.env` y agrega tu API key de Claude:

```
CLAUDE_API_KEY=tu_claude_api_key_real_aqui
```

> **Importante**: Nunca commits el archivo `.env` con claves reales.

5. Inicia el servidor:

```bash
npm start
```

6. Abre `grid-designer.html` en tu navegador

#### Despliegue en Render

1. Crea una cuenta en [Render](https://render.com)

2. Conecta tu repositorio de GitHub

3. Configura las variables de entorno en Render:
   - `CLAUDE_API_KEY`: Tu API key de Claude
   - `NODE_ENV`: `production`

4. Actualiza la URL del backend en `js/design-assistant.js`:

```javascript
const backendUrl = "https://tu-backend-en-render.onrender.com/generate-pattern";
```

## 🎨 Cómo Usar el Asistente de Diseño

### Plantillas Predefinidas

1. Haz clic en el botón ✨ (Asistente de Diseño)
2. Selecciona la pestaña "Plantillas"
3. Elige una categoría (Animales, Naturaleza, Símbolos, etc.)
4. Haz clic en cualquier plantilla para aplicarla a tu rejilla

### Patrones Personalizados con IA

1. Haz clic en el botón ✨ (Asistente de Diseño)
2. Selecciona la pestaña "Personalizado"
3. Describe el objeto que quieres crear:
   - "Un corazón rojo con detalles en rosa"
   - "Una mariposa azul y púrpura"
   - "Un árbol verde con tronco marrón"
4. Haz clic en "Generar Patrón"

## 📁 Estructura del Proyecto

```
puntodecruz/
├── grid-designer.html      # Interfaz principal
├── backend-proxy.js        # Servidor backend (opcional)
├── package.json           # Dependencias Node.js
├── render.yaml           # Configuración Render
├── .env.example          # Variables de entorno (ejemplo)
├── css/
│   └── grid-designer.css  # Estilos
├── js/
│   ├── grid-designer.js   # Lógica principal
│   └── design-assistant.js # Asistente de diseño
└── img/                  # Imágenes de referencia
```

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **IA**: Claude AI (Anthropic)
- **Despliegue**: Render

## 🔧 Configuración Avanzada

### Variables de Entorno

| Variable         | Descripción                 | Requerido          |
| ---------------- | --------------------------- | ------------------ |
| `CLAUDE_API_KEY` | API key de Anthropic Claude | Sí (para IA)       |
| `PORT`           | Puerto del servidor         | No (default: 3000) |
| `NODE_ENV`       | Entorno de ejecución        | No                 |

### Personalización

- **Agregar plantillas**: Edita `DESIGN_TEMPLATES` en `js/design-assistant.js`
- **Colores por defecto**: Modifica la paleta en `extractColorsFromDescription()`
- **Tamaños máximos**: Ajusta límites en las funciones de generación

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙋‍♂️ Soporte

Si tienes problemas:

1. Verifica que todas las dependencias estén instaladas
2. Asegúrate de que tu API key de Claude sea válida
3. Revisa la consola del navegador para errores
4. Crea un issue en GitHub con detalles del problema

---

¡Feliz diseño de punto de cruz! 🧵✨
