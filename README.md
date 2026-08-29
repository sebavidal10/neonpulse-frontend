# ⚡ NeonPulse Frontend (`neonpulse-frontend`)

Aplicación web interactiva para la visualización y reserva de conciertos de Punk Rock, desarrollada con **TypeScript**, **Vite**, **Tailwind CSS v4** y **Vitest**, diseñada como material educativo para enseñar buenas prácticas de arquitectura frontend, tipado fuerte y testing automatizado con **100% de cobertura**.

---

## 🎯 Propósito Educativo

Este repositorio demuestra:
1. **Tipado Estricto con TypeScript**: Interfaces y enums de dominio (`Concert`, `ConcertStatus`) que garantizan integridad de datos.
2. **Component Directory Pattern**: Estructuración modular en componentes desacoplados (`ConcertCard/`, `FeaturedBanner/`, `BookingForm/`, `LoadingSkeleton/`, `StateViews/`).
3. **Consumo Seguro de API REST**: Integración asíncrona mediante `ConcertService` con transformación y resiliencia de datos.
4. **Testing Exhaustivo con Vitest**: Pruebas unitarias y de integración de contrato en JSDOM con **100% de cobertura** en statements, branches, functions y lines.

---

## 🔗 Relación con el Ecosistema NeonPulse

- **Backend API**: Consume el servicio REST de conciertos provisto por [neonpulse-api-springboot](../neonpulse-api-springboot).
- **Endpoint Consumido**: `GET http://localhost:8080/api/v1/concerts`.

---

## 🛠️ Requisitos Previos

- **Node.js 18+**
- **pnpm** (o npm / yarn).

---

## 🚀 Instalación y Ejecución

### 1. Instalar Dependencias
```bash
pnpm install
```

### 2. Ejecutar Servidor de Desarrollo
```bash
pnpm dev
```
La aplicación estará disponible en `http://localhost:5173`.

### 3. Compilar para Producción
```bash
pnpm build
```

---

## 🧪 Pruebas y Cobertura (Vitest)

Para ejecutar la suite de pruebas unitarias e integración:
```bash
pnpm test
```

Para ejecutar el reporte de cobertura y verificar los thresholds del **100%**:
```bash
pnpm coverage
```

El reporte interactivo en HTML se genera en:
`coverage/index.html`
