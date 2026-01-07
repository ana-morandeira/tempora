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
videos backg
La interfaz de Tempora utiliza un sistema de renderizado condicional que selecciona entre 10 atmósferas únicas basándose en la combinación de weather_code y la hora local.

¡Excelente! Con 10 fondos el catálogo es todavía más impresionante. Para mantener el orden y la simetría en el README.md, lo mejor es pasar de una tabla de 4x2 a una de 5 columnas por 2 filas.

Esto permitirá que cada estado de día tenga su pareja de noche justo debajo, lo que visualmente explica de maravilla cómo funciona tu lógica de "Estado del tiempo + Fase horaria".

Aquí tienes el código de la tabla actualizado con los 10 archivos:

🎭 Galería de Atmósferas Dinámicas (10 Escenarios)
La interfaz de Tempora utiliza un sistema de renderizado condicional que selecciona entre 10 atmósferas únicas basándose en la combinación de weather_code y la hora local.

<table>
  <tr>
    <td align="center"><b>Día Despejado</b><br><video src="https://raw.githubusercontent.com/ana-morandeira/tempora/main/images/backgrounds/sunDay.webm" width="150" muted loop autoplay></video></td>
    <td align="center"><b>Día Nublado</b><br><img src="https://raw.githubusercontent.com/ana-morandeira/tempora/main/images/backgrounds/cloudyDay.webp" width="150"></td>
    <td align="center"><b>Lluvia Diurna</b><br><video src="https://raw.githubusercontent.com/ana-morandeira/tempora/main/images/backgrounds/rainDay.webm" width="150" muted loop autoplay></video></td>
    <td align="center"><b>Nieve Diurna</b><br><video src="https://raw.githubusercontent.com/ana-morandeira/tempora/main/images/backgrounds/snowDay.webm" width="150" muted loop autoplay></video></td>
    <td align="center"><b>Tormenta</b><br><video src="https://raw.githubusercontent.com/ana-morandeira/tempora/main/images/backgrounds/stormDay.webm" width="150" muted loop autoplay></video></td>
  </tr>
  <tr>
    <td align="center"><b>Noche Estrellada</b><br><video src="https://raw.githubusercontent.com/ana-morandeira/tempora/main/images/backgrounds/starsNight.webm" width="150" muted loop autoplay></video></td>
    <td align="center"><b>Noche Nublada</b><br><video src="https://raw.githubusercontent.com/ana-morandeira/tempora/main/images/backgrounds/cloudyNight.webm" width="150" muted loop autoplay></video></td>
    <td align="center"><b>Lluvia Nocturna</b><br><video src="https://raw.githubusercontent.com/ana-morandeira/tempora/main/images/backgrounds/rainNight.webm" width="150" muted loop autoplay></video></td>
    <td align="center"><b>Nieve Nocturna</b><br><video src="https://raw.githubusercontent.com/ana-morandeira/tempora/main/images/backgrounds/snowNight.webm" width="150" muted loop autoplay></video></td>
    <td align="center"><b>Tormenta Nocturna</b><br><video src="https://raw.githubusercontent.com/ana-morandeira/tempora/main/images/backgrounds/stormNight.webm" width="150" muted loop autoplay></video></td>
  </tr>
</table>

📝 Último detalle para el README: La descripción de la lógica
Para que los reclutadores o usuarios entiendan que esto no es aleatorio, añade este párrafo justo debajo de la tabla:

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

¡Claro que sí! Un buen README.md es la cara de tu proyecto. He preparado uno que no solo explica qué hace la App, sino que también documenta esos "dolores de cabeza" técnicos que resolvimos (como la minificación de las librerías y la gestión de la caché), lo cual es súper valioso para tu portafolio.

Aquí tienes una estructura profesional lista para copiar y pegar:

Markdown

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

## 🔧 Instalación y Uso

1.  **Clonar el repositorio**: Descarga una copia local del proyecto.
2.  **Servidor Local**: Abre el proyecto utilizando un servidor local (se recomienda **Live Server** en VS Code) para evitar problemas de CORS.
3.  **Protocolo Seguro**: Para probar las funciones de PWA en dispositivos móviles, asegúrate de servir la aplicación bajo el protocolo **HTTPS**.

---
*Desarrollado con ❤️ para amantes de la meteorología.*
