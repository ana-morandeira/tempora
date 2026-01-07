# 🌤️ Tempora App- Weather PWA

**Tempora App** es una Aplicación Web Progresiva (PWA) de clima diseñada para ofrecer una experiencia visual, rápida y funcional tanto en escritorio como en dispositivos móviles. Proporciona datos meteorológicos en tiempo real utilizando la API de Open-Meteo.

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