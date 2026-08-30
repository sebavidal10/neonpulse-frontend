# ⚡ NeonPulse Frontend (`neonpulse-frontend`)

Aplicación web interactiva SPA para la cartelera, reserva de entradas y gestión integral de conciertos underground, desarrollada con **TypeScript**, **Vite**, **Tailwind CSS v4** y **Vitest**.

---

## 🎯 Características y Funcionalidades

1. **🎸 Cartelera Oficial de Conciertos**:
   - Banner interactivo de evento destacado (*Headliner Live*).
   - Grilla reactiva de 15 conciertos con precio, estado (`SCHEDULED`, `LIVE`, `SOLD_OUT`, `FINISHED`, `CANCELLED`) e información de ciudad y recinto.
2. **🏙️ Jerarquía Ciudad ➔ Recinto**:
   - Soporte para visualización de recintos asociados (*Teatro Cariola, Club Blondie, Muelle Barón, Bodega 44, etc.*) tanto en las tarjetas como en la vista de detalle y de edición.
3. **🛒 Carrito Flotante y Checkout Drawer**:
   - Botón flotante animado con subtotal y contador de pases en tiempo real.
   - Drawer lateral (*slide-over*) con selector de cantidad (1 a 10), autocompletado y pasarela de pago simulada.
4. **🛠️ Editor de Conciertos en Pantalla Completa (`AdminConcertEditorView`)**:
   - Vista dedicada para administradores (`admin@mail.com` / `1q2w3e4r`).
   - **Selectores en cascada Ciudad ➔ Recinto** que filtran en tiempo real los lugares disponibles.
   - **Creación de recintos inline** con el botón `+ New Venue` sin abandonar el formulario.
   - **Subida de portadas personalizadas** (archivos de imagen vía `multipart/form-data`) y galería de 8 presets neón.
   - **Previsualización en tiempo real** de la tarjeta de concierto mientras se escribe.
5. **👤 Perfil de Miembro y Bóveda de Pases**:
   - Bóveda de pases digitales con código único de entrada, fecha de compra y estado verificado.
6. **🌐 Internacionalización Completa (i18n EN / ES)**:
   - Alternancia fluida e instantánea entre español e inglés en cabecera, cartelera, detalle, modales y checkout.
7. **🧪 Testing Automatizado**:
   - **115 tests automatizados** en 20 suites con **Vitest** y tipado estricto con `tsc`.

---

## 🛠️ Requisitos Previos

- **Node.js 18+**
- **pnpm** (recomendado), `npm` o `yarn`.

---

## 🚀 Instalación y Ejecución

### 1. Instalar Dependencias
```bash
pnpm install
```

### 2. Iniciar en Desarrollo
```bash
pnpm dev
```
La aplicación se levantará en: `http://localhost:5173`.

### 3. Compilar para Producción
```bash
pnpm build
```

---

## 🧪 Pruebas Automatizadas

```bash
# Ejecutar todas las pruebas una vez:
pnpm test

# Ejecutar con watcher interactivo:
pnpm test:watch
```
