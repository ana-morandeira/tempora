# 🌤️ Tempora App - Weather PWA

**Tempora App** es una Aplicación Web Progresiva (PWA) de clima diseñada para ofrecer una experiencia visual, rápida y funcional tanto en escritorio como en dispositivos móviles. Proporciona datos meteorológicos en tiempo real utilizando la API de Open-Meteo.

---

## 🚀 Características Principales

* **Datos en Tiempo Real**: Visualización de temperatura, sensación térmica, humedad, viento, visibilidad, presión atmosférica y probabilidad de lluvia.
* **Gráficas Avanzadas**: Gráficas horarias y diarias interactivas con iconos meteorológicos integrados.
* **Reloj Inteligente**: Ajuste automático de la hora local basado en la zona horaria de la ciudad buscada.
* **Fondos Dinámicos**: Cambios de fondo (video/imagen) según el estado del tiempo y el ciclo día/noche.
* **Modo PWA**: Instalable en Android e iOS, con soporte offline mediante Service Workers.

## 📊 Detalle de las Gráficas

El núcleo visual de Tempora se basa en dos paneles de datos diseñados para una lectura rápida y precisa:

### 1. Panel Horario (Próximas 24 horas)
Este gráfico combina diferentes tipos de visualización para ofrecer una perspectiva completa del día:
* **Línea de Temperatura**: Una curva suave (tensionada al 0.4) que muestra la evolución térmica. Incluye **iconos meteorológicos inteligentes** sobre los puntos clave.
* **Barras de Precipitación**: Representación en azul semitransparente de los mm de lluvia previstos por hora.
* **Línea de Viento**: Una línea discontinua (dash) que permite diferenciar la velocidad del viento sin saturar visualmente el gráfico.
* **Interactividad**: Tooltips personalizados que muestran la unidad exacta (ºC, km/h, mm).

### 2. Panel Diario (Previsión Semanal)
Enfocado en la planificación a medio plazo:
* **Comparativa Máx/Mín**: Barras verticales que muestran el rango de temperatura de cada día.
* **Etiquetado Dinámico**: Uso del plugin `datalabels` para proyectar el icono del tiempo predominante directamente sobre la barra de temperatura máxima.

### 🛠️ Configuración Técnica de las Gráficas
Para lograr una visualización clara de tres variables distintas en un mismo lienzo, se implementó una configuración de **Ejes Y Duales**:
* **Escala Principal (y)**: Dedicada a la temperatura (°C) y la velocidad del viento (km/h).
* **Escala Secundaria (y1)**: Eje independiente ubicado a la derecha para la precipitación (mm). Esto evita que una lluvia ligera desaparezca visualmente frente a una temperatura de 25°C.

## 🎭 Galería de Atmósferas Dinámicas (10 Escenarios)

La interfaz utiliza un sistema de renderizado condicional que selecciona entre 10 escenarios basándose en la combinación de `weather_code` y la hora local.

![Texto alternativo](URL_DEL_GIF)


**Lógica de Renderizado Contextual:**
1. **Filtro Meteorológico**: Mapea el código de la API (WMO Code) a una categoría (Despejado, Nubes, Lluvia, Nieve, Tormenta).
2. **Filtro Horario**: Determina si la ubicación se encuentra entre el *sunrise* y el *sunset* calculado por la API para aplicar la variante Day o Night.

Esto garantiza que si buscas el tiempo en Tokio siendo de noche allí, la App mostrará la atmósfera nocturna aunque en tu ubicación actual sea de día.

## 🛠️ Tecnologías Utilizadas

* **HTML5 / CSS3 / JavaScript (ES6+)**
* **Chart.js v4**: Para la visualización de datos climáticos.
* **Chartjs-plugin-datalabels**: Para mostrar valores e iconos sobre las gráficas.
* **Open-Meteo API**: Fuente de datos meteorológicos gratuita y precisa.
* **Service Workers**: Para la gestión de caché y funcionamiento sin conexión.

## 📦 Estructura del Proyecto

```text
├── images/
│   ├── backgrounds/          # Fondos dinámicos (WebM/WebP)
│   ├── favicon_io/           # Favicons y site.webmanifest
│   └── logos/                # Logotipos de la PWA (192px/512px)
├── services/
│   ├── chart.min.js          # Librería Chart.js
│   ├── datalabels.min.js     # Plugin para etiquetas de datos
│   ├── manifest.json         # Configuración principal PWA
│   └── script.js             # Lógica principal y APIs
├── styles/
│   └── index.css             # Estilos y diseño responsive
├── index.html                # Estructura principal
├── sw.js                     # Service Worker (Caché y Offline)
└── README.md                 # Documentación


⚠️ Notas de Desarrollo (Lecciones Aprendidas)
Gestión de Librerías Locales: Para asegurar la disponibilidad offline, se optó por servir las librerías de forma local, asegurando el registro global del plugin antes de la inicialización.

Ciclo de Vida del Service Worker: Se identificó que para refrescar cambios en dispositivos reales es imperativo actualizar la versión de la caché (STATIC_CACHE) en sw.js.

Precisión del Reloj: Implementación basada en utcOffset para mostrar la hora real de la ciudad consultada, independientemente de la zona horaria del dispositivo del usuario.


🚀 Despliegue y PWA
Versión en vivo: https://ana-morandeira.github.io/tempora/

Instalación: * Android: Banner de instalación desde Chrome.

iOS (Safari): Botón "Compartir" > "Añadir a la pantalla de inicio".

Modo Offline: Implementado mediante Service Worker v10.