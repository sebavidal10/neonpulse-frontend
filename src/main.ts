// document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
// <div>hola</div>
// `;

const appContainer = document.getElementById('app');

if (appContainer) {
  appContainer.innerHTML = `
    <h1>NeonPulse</h1>
    <p>Entorno de desarrollo incializado con Vite y VanillaJS</p>
  `;
}
