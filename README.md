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

## 🚀 Despliegue en GitHub Pages

El proyecto incluye configuración nativa para desplegarse automáticamente en **GitHub Pages** mediante **GitHub Actions**.

### 🛠️ Configuración Automática (CI/CD)
El archivo `.github/workflows/deploy.yml` se encarga de compilar y publicar la app cada vez que haces `push` a la rama `main`.

**Pasos en GitHub:**
1. Ve a la pestaña **Settings** de tu repositorio en GitHub.
2. En la barra lateral, selecciona **Pages**.
3. En **Build and deployment > Source**, selecciona **GitHub Actions**.
4. ¡Listo! Al hacer `git push origin main`, tu sitio se publicará en `https://<usuario>.github.io/<repositorio>/`.

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

- **Desarrollo Asistido por IA & Despliegue Continuo:**
  - Flujo de trabajo de *pair-programming* con IA.
  - Despliegue continuo (CI/CD) listo para producción con GitHub Actions.

---

## 🚀 Tecnologías Utilizadas

- **Core:** TypeScript + Vite 8
- **Estilos & UI:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **Iconografía:** Lucide Icons (`lucide`)
- **CI/CD:** GitHub Actions (Deploy automático a GitHub Pages)

---

## 📁 Estructura del Proyecto

```text
neonpulse-frontend/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Workflow de integración y despliegue continuo (GitHub Pages)
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
└── vite.config.ts              # Configuración de Vite (base: './') y Tailwind CSS v4
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
