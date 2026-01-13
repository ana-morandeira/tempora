# 🌤️ Tempora App- Weather PWA

**Tempora App** es una Aplicación Web Progresiva (PWA) de clima diseñada para ofrecer una experiencia visual, rápida y funcional tanto en escritorio como en dispositivos móviles. Proporciona datos meteorológicos en tiempo real utilizando la API de Open-Meteo.

## 🚀 Características Principales

* **Datos en Tiempo Real**: Visualización de temperatura,sensación térmica, humedad, viento, visivilidad, presión atmosférica y probabilidad de lluvia.
* **Gráficas Avanzadas**: Gráficas horarias y diarias interactivas con iconos meteorológicos integrados.
* **Reloj Inteligente**: Ajuste automático de la hora local basado en la zona horaria de la ciudad buscada.
* **Fondos Dinámicos**: Cambios de fondo (video/imagen) según el estado del tiempo y el ciclo día/noche.
* **Modo PWA**: Instalable en Android e iOS, con soporte offline mediante Service Workers.

## 📊 Detalle de las Gráficas

El núcleo visual de Tempora se basa en dos paneles de datos diseñados para una lectura rápida y precisa:

### 1. Panel Horario (Próximas 24 horas)
Este gráfico combina diferentes tipos de visualización para ofrecer una perspectiva completa del día:
* **Línea de Temperatura**: Una curva suave (tensionada al 0.4) que muestra la evolución térmica. Incluye **iconos meteorológicos inteligentes** sobre los puntos clave para identificar el estado del cielo de un vistazo.
* **Barras de Precipitación**: Representación en azul semitransparente de los mm de lluvia previstos por hora.
* **Línea de Viento**: Una línea discontinua (dash) que permite diferenciar la velocidad del viento sin saturar visualmente el gráfico.
* **Interactividad**: Tooltips personalizados que muestran la unidad exacta (ºC, km/h, mm) al pasar el dedo o el ratón.

### 2. Panel Diario (Previsión Semanal)
Enfocado en la planificación a medio plazo:
* **Comparativa Máx/Mín**: Barras verticales que muestran el rango de temperatura de cada día.
* **Etiquetado Dinámico**: Uso del plugin `datalabels` para proyectar el icono del tiempo predominante directamente sobre la barra de temperatura máxima, facilitando la interpretación sin necesidad de leer textos.
* **Interactividad**: Tooltips personalizados que muestran día y temperatura.

### 🛠️ Configuración Técnica de las Gráficas

Para lograr una visualización clara de tres variables distintas (Temperatura, Viento y Lluvia) en un mismo lienzo, se implementó una configuración de **Ejes Y Duales**:

* **Escala Principal (y)**: Dedicada a la temperatura (°C) y la velocidad del viento (km/h). Se configuró con un rango dinámico para asegurar que las curvas sean las protagonistas visuales.
* **Escala Secundaria (y1)**: Eje independiente ubicado a la derecha para la precipitación (mm). Esto evita que una lluvia ligera (ej. 2mm) desaparezca visualmente frente a una temperatura de 25°C, permitiendo que las barras de lluvia siempre tengan una escala representativa.
* **Optimización de Datos (Datalabels)**: Se programó una lógica de filtrado para los iconos climáticos, asegurando que solo se rendericen en intervalos que no saturen la interfaz, manteniendo la legibilidad en pantallas móviles pequeñas.

### 🎭 Galería de Atmósferas Dinámicas (10 Escenarios)

La interfaz de Tempora utiliza un sistema de renderizado condicional que selecciona entre 10 atmósferas únicas basándose en la combinación de weather_code y la hora local.

<




Lógica de Renderizado Contextual: El motor visual de la App realiza una consulta binaria en cada actualización:

Filtro Meteorológico: Mapea el código de la API (WMO Code) a una categoría (Despejado, Nubes, Lluvia, Nieve, Tormenta).

Filtro Horario: Determina si la ubicación consultada se encuentra entre el sunrise y el sunset calculado por la API para aplicar la variante Day o Night.

Esto garantiza que si buscas el tiempo en Tokio siendo de noche allí, la App te mostrará la atmósfera nocturna correspondiente aunque en tu ubicación actual sea de día.
## 🛠️ Tecnologías Utilizadas

* **HTML5 / CSS3 / JavaScript (ES6+)**
* **Chart.js v4**: Para la visualización de datos climáticos.
* **Chartjs-plugin-datalabels**: Para mostrar valores e iconos sobre las gráficas.
* **Open-Meteo API**: Fuente de datos meteorológicos gratuita y precisa.
* **Service Workers**: Para la gestión de caché y funcionamiento sin conexión.

## 📦 Estructura del Proyecto

## 📂 Estructura del Proyecto


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
└── README.md                 # Documentación del proyecto



# 🌤️ Tempora - Weather PWA

**Tempora** es una Aplicación Web Progresiva (PWA) de clima diseñada para ofrecer una experiencia visual, rápida y funcional tanto en escritorio como en dispositivos móviles. Proporciona datos meteorológicos en tiempo real utilizando la API de Open-Meteo.

## 🚀 Características Principales

* **Datos en Tiempo Real**: Visualización de temperatura, humedad, viento y probabilidad de lluvia.
* **Gráficas Avanzadas**: Gráficas horarias y diarias interactivas con iconos meteorológicos integrados.
* **Reloj Inteligente**: Ajuste automático de la hora local basado en la zona horaria de la ciudad buscada.
* **Fondos Dinámicos**: Cambios de fondo (video/imagen) según el estado del tiempo y el ciclo día/noche.
* **Modo PWA**: Instalable en Android e iOS, con soporte offline mediante Service Workers.

## 🛠️ Tecnologías Utilizadas

* **HTML5 / CSS3 / JavaScript (ES6+)**
* **Chart.js v4**: Para la visualización de datos climáticos.
* **Chartjs-plugin-datalabels**: Para mostrar valores e iconos sobre las gráficas.
* **Open-Meteo API**: Fuente de datos meteorológicos gratuita y precisa.
* **Service Workers**: Para la gestión de caché y funcionamiento sin conexión.

## 📦 Estructura del Proyecto

```text
/
├── index.html          # Interfaz principal
├── styles/
│   └── index.css       # Estilos y diseño responsivo
├── services/
│   ├── script.js       # Lógica de la aplicación
│   ├── chart.min.js    # Librería base de gráficas
│   └── datalabels.min.js # Plugin para etiquetas de datos
└── sw.js               # Service Worker y gestión de caché (PWA)

## ⚠️ Notas de Desarrollo (Lecciones Aprendidas)

Durante el desarrollo de **Tempora**, se resolvieron varios desafíos técnicos críticos que son fundamentales para el mantenimiento y la estabilidad del proyecto:

* **Gestión de Librerías Locales**: Debido a las restricciones de funcionamiento de las PWA y para asegurar la disponibilidad offline, se optó por servir `Chart.js` y el plugin de `datalabels` de forma local. Un aprendizaje clave fue asegurar que los archivos no se corrompan durante la descarga y que el registro del plugin se realice de forma global antes de la inicialización de cualquier gráfica.
* **Ciclo de Vida del Service Worker**: Se identificó que, para ver cambios de diseño o lógica reflejados en dispositivos reales (Android/iOS), es imperativo actualizar la versión de la caché (`STATIC_CACHE`) en el archivo `sw.js`. Esto fuerza al navegador a invalidar la caché antigua y descargar los recursos actualizados.
* **Precisión del Reloj**: Para ofrecer una experiencia global, se implementó una lógica basada en `utcOffset`. Esto permite que el reloj de la App muestre la hora real de la ubicación consultada, independientemente de la zona horaria configurada en el teléfono del usuario.

## 🚀 Despliegue y PWA

La aplicación está totalmente optimizada como **Progressive Web App (PWA)** y puede utilizarse en cualquier dispositivo móvil:

* **Versión en vivo:** [https://ana-morandeira.github.io/tempora/](https://ana-morandeira.github.io/tempora/)
* **Instalación:** * En **Android**, pulsa en el banner de instalación o en "Instalar aplicación" desde el menú de Chrome.
    * En **iOS (Safari)**, pulsa el botón **Compartir** y selecciona **"Añadir a la pantalla de inicio"**.
* **Modo Offline:** Gracias a la implementación del Service Worker v10, la aplicación permite la consulta de datos previamente cargados y mantiene la experiencia visual sin conexión a internet.

## 🔧 Instalación y Uso Local

Para ejecutar el proyecto en un entorno de desarrollo:

1.  **Clonar el repositorio:** Descarga una copia local mediante `git clone`.
2.  **Servidor Local:** Es imprescindible abrir el proyecto con un servidor (como **Live Server** en VS Code). Esto garantiza el correcto funcionamiento del Service Worker y evita bloqueos de políticas de seguridad (CORS).
3.  **Depuración de PWA:** Para testear las funciones de instalación y caché en local, se recomienda usar el protocolo **HTTPS** (proporcionado automáticamente al desplegar en GitHub Pages) o configurar un túnel seguro.
---
*Desarrollado con ❤️ para amantes de la meteorología.*
