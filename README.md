# ⚡ NeonPulse - Cartelera Punk Rock & Live Sessions

> 🎓 **Proyecto Educativo:** Este repositorio forma parte del material práctico del curso **"Frontend Dinámico con TypeScript y Vite"**, enfocado en el aprendizaje de TypeScript, desarrollo web Vanilla y buenas prácticas de arquitectura frontend asistidas por Inteligencia Artificial.

---

## 📌 Sobre el Proyecto

**NeonPulse** es una aplicación web interactiva para la gestión y visualización de carteleras de conciertos y tocatas *underground* de Punk Rock. 

El proyecto demuestra cómo construir aplicaciones **Vanilla mantenibles y escalables sin depender de frameworks pesados**, poniendo especial énfasis en:

1. **El valor del tipado fuerte (*Strong Typing*):** Demostrar cómo TypeScript previene errores en tiempo de compilación, garantiza la integridad del dominio (`Concert`, `ConcertStatus`) y permite refactorizaciones seguras.
2. **Organización por Componentes (*Component Directory Pattern*):** Estructurar el código modularmente en carpetas dedicadas por componente (`ConcertCard/`, `FeaturedBanner/`), encapsulando su lógica, HTML declarativo y exportaciones limpias mediante archivos `index.ts`.
3. **Buenas Prácticas de Arquitectura Frontend:** Separación estricta de responsabilidades, desarrollo asistido por **IA**, renderizado resiliente y tooling moderno de alto rendimiento.

---

## 🎯 Objetivos del Curso y Aprendizaje

- **El Valor del Tipado Fuerte (Strong Typing):**
  - Autocompletado preciso e intelisense durante el desarrollo.
  - Prevención de fallas en runtime al consumir contratos de datos estructurados.
  - Uso correcto de `interfaces`, `enums` y tipos exportados estrictos.

- **Organización y Estructura por Componentes:**
  - Patrón de directorios dedicados por componente (`src/components/NombreComponente/`).
  - Uso de puntos de entrada `index.ts` para exportaciones limpias e independientes del consumidor.
  - Cohesión y bajo acoplamiento en aplicaciones web Vanilla.

- **Desarrollo Vanilla Moderno & Resiliencia:**
  - Manipulación eficiente del DOM con `DocumentFragment`.
  - Manejo de excepciones por componente para evitar caídas globales en la UI.
  - Renderizado declarativo mediante funciones de plantilla TS.

- **Desarrollo Asistido por IA:**
  - Flujo de trabajo de *pair-programming* con IA para acelerar el maquetado, diseño UI y resolución de problemas.

- **Tooling de Vanguardia:**
  - Configuración y bundling ultrarrápido con **Vite 8** e integración con **Tailwind CSS v4** (`@tailwindcss/vite`).

---

## 🚀 Tecnologías Utilizadas

- **Core:** TypeScript + Vite 8
- **Estilos & UI:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **Iconografía:** Lucide Icons (`lucide`)
- **Arquitectura:** Componentes modulares Vanilla con TypeScript estricto.

---

## 🔥 Características Principales

- **Banner de Evento Destacado (Headliner):** Componente a ancho completo para promocionar la tocata principal del mes (*The Clash, London Calling 50th Anniversary*).
- **Tarjetas de Concierto Homogéneas (`h-full`):** Grid responsivo alineado donde todas las tarjetas comparten exactamente la misma altura horizontal.
- **Portadas Fotográficas de Rock:** Imágenes de alta calidad por cada evento con zoom dinámico al hacer hover y fallbacks elegantes ante errores de carga.
- **Botones Rockeros de Alto Contraste:** Estilo metálico y crimson de alto impacto visual sin gradientes neón suaves.
- **Resiliencia & Manejo de Errores:** Manejo de excepciones a nivel de componente para evitar fallas globales si un evento individual presenta inconsistencias en datos o imágenes.

---

## 📁 Estructura del Proyecto

```text
neonpulse-frontend/
├── public/
│   └── images/                 # Portadas e imágenes de conciertos
├── src/
│   ├── components/             # Patrón de directorios organizados por componente
│   │   ├── ConcertCard/        # Lógica de tarjeta (ConcertCard.ts, index.ts)
│   │   └── FeaturedBanner/     # Componente de marquesina para evento destacado
│   ├── models/                 # Modelos de dominio y tipos fuertemente tipados
│   ├── styles/
│   │   └── global.css          # Importación de Tailwind CSS v4 y tema de fuentes/colores
│   └── main.ts                 # Punto de entrada principal y renderizado del DOM
├── index.html                  # Plantilla HTML semántica principal
├── package.json                # Dependencias y scripts del proyecto
├── tsconfig.json               # Configuración del compilador TypeScript
└── vite.config.ts              # Configuración de Vite con plugin de Tailwind CSS v4
```

---

## 🛠️ Instalación y Ejecución Local

### 1. Clonar el repositorio e instalar dependencias:
```bash
npm install
```

### 2. Ejecutar servidor de desarrollo:
```bash
npm run dev
```

### 3. Compilar para producción y verificar tipos TypeScript:
```bash
npm run build
```

---

## 📄 Licencia

Este proyecto está licenciado bajo la licencia MIT.
