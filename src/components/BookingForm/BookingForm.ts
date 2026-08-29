import type { Concert } from '../../models';
import { renderIcon } from '../../utils/icon.utils';
import { Ticket, Mail, User, CheckCircle2, AlertCircle } from 'lucide';

/**
 * Genera la estructura HTML declarativa del formulario de reserva de entradas.
 * @param concert Concierto opcional preseleccionado para la reserva.
 */
export function renderBookingForm(concert?: Concert): string {
  const concertBadge = concert
    ? `
      <div class="mb-4 p-3 bg-zinc-900/90 border border-zinc-800 rounded-lg flex items-center justify-between gap-3">
        <div class="flex items-center gap-2 overflow-hidden">
          <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-950 text-red-400 border border-red-800 shrink-0">
            SELECCIONADO
          </span>
          <span class="text-xs font-bold text-white truncate">${concert.title}</span>
        </div>
        <span class="text-xs font-semibold text-zinc-400 shrink-0">${concert.band}</span>
      </div>
    `
    : '';

  const ticketIcon = renderIcon(Ticket, 'w-5 h-5 text-red-500');
  const mailIcon = renderIcon(Mail, 'w-3.5 h-3.5 text-zinc-400');
  const userIcon = renderIcon(User, 'w-3.5 h-3.5 text-zinc-400');

  return `
    <section class="w-full bg-zinc-950 border border-zinc-800/90 rounded-xl p-5 md:p-6 shadow-xl relative overflow-hidden">
      <div class="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-2xl pointer-events-none"></div>

      <header class="mb-4">
        <div class="flex items-center gap-2 mb-1">
          ${ticketIcon}
          <h2 class="text-lg md:text-xl font-black uppercase tracking-tight text-white">
            Reserva de Entradas
          </h2>
        </div>
        <p class="text-xs text-zinc-400">
          Asegura tu lugar en las mejores tocatas punk rock underground.
        </p>
      </header>

      ${concertBadge}

      <form id="form-reserva" class="space-y-4" novalidate>
        <div class="space-y-1.5">
          <label for="email" class="block text-xs font-extrabold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            ${mailIcon}
            <span>Email</span>
          </label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all duration-150" 
            placeholder="ejemplo@correo.com" 
            required
          />
        </div>

        <div class="space-y-1.5">
          <label for="cantidad" class="block text-xs font-extrabold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            ${userIcon}
            <span>Cantidad de entradas</span>
          </label>
          <input 
            type="number" 
            id="cantidad" 
            name="cantidad" 
            class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all duration-150" 
            min="1" 
            max="10" 
            placeholder="1" 
            required
          />
        </div>

        <div id="bloque-error" class="hidden text-xs font-bold text-red-400 bg-red-950/70 border border-red-800/80 rounded-lg p-3 flex items-center gap-2"></div>

        <button 
          type="submit" 
          class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black text-xs md:text-sm uppercase tracking-wider border border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all duration-150 cursor-pointer"
        >
          ${renderIcon(Ticket, 'w-4 h-4')}
          <span>Reservar</span>
        </button>
      </form>
    </section>
  `;
}

/**
 * Muestra el estado de éxito tras completar la reserva.
 */
function renderSuccessState(
  sectionElement: HTMLElement,
  email: string,
  cantidad: number,
  concert?: Concert,
): void {
  const checkIcon = renderIcon(CheckCircle2, 'w-8 h-8 text-red-500 mb-1');
  const concertName = concert ? concert.title : 'Evento NeonPulse';

  sectionElement.innerHTML = `
    <div class="text-center py-6 px-4 flex flex-col items-center gap-2">
      ${checkIcon}
      <h3 class="text-lg font-black text-white uppercase tracking-tight">
        ¡Reserva Confirmada!
      </h3>
      <p class="text-xs text-zinc-300 max-w-md">
        Se han reservado <strong class="text-white font-extrabold">${cantidad} entrada(s)</strong> para 
        <strong class="text-red-500 font-bold">${concertName}</strong>.
      </p>
      <p class="text-[11px] text-zinc-400 mt-1">
        Enviamos un correo de confirmación a <span class="text-zinc-200 font-semibold">${email}</span>.
      </p>
      <button 
        type="button" 
        id="btn-nueva-reserva" 
        class="mt-4 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-extrabold uppercase tracking-wider rounded-lg border border-zinc-700 transition-colors cursor-pointer"
      >
        Realizar Otra Reserva
      </button>
    </div>
  `;

  const btnNuevaReserva = sectionElement.querySelector('#btn-nueva-reserva');
  btnNuevaReserva?.addEventListener('click', () => {
    const freshElement = createBookingFormElement(concert);
    sectionElement.replaceWith(freshElement);
  });
}

/**
 * Crea e instancia un elemento HTMLElement interactivo con validación de formulario.
 */
export function createBookingFormElement(
  concert?: Concert,
  onSubmitSuccess?: (data: {
    email: string;
    cantidad: number;
    concert?: Concert;
  }) => void,
): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = renderBookingForm(concert).trim();
  const sectionElement = container.firstElementChild as HTMLElement;

  const form = sectionElement.querySelector<HTMLFormElement>('#form-reserva');
  const emailInput = sectionElement.querySelector<HTMLInputElement>('#email');
  const cantidadInput =
    sectionElement.querySelector<HTMLInputElement>('#cantidad');
  const errorBlock = sectionElement.querySelector<HTMLElement>('#bloque-error');

  const showError = (msg: string) => {
    const warningIcon = renderIcon(
      AlertCircle,
      'w-4 h-4 shrink-0 text-red-400',
    );
    errorBlock!.innerHTML = `${warningIcon}<span>${msg}</span>`;
    errorBlock!.classList.remove('hidden');
  };

  if (form && emailInput && cantidadInput && errorBlock) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      errorBlock.classList.add('hidden');
      errorBlock.innerHTML = '';

      const email = emailInput.value.trim();
      const cantidadVal = cantidadInput.value.trim();
      const cantidad = parseInt(cantidadVal, 10);

      if (!email) {
        showError('El correo electrónico es requerido.');
        emailInput.focus();
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showError('Por favor, ingresa un correo electrónico válido.');
        emailInput.focus();
        return;
      }

      if (!cantidadVal || isNaN(cantidad)) {
        showError('Por favor, ingresa la cantidad de entradas.');
        cantidadInput.focus();
        return;
      }

      if (cantidad < 1 || cantidad > 10) {
        showError('La cantidad de entradas debe ser entre 1 y 10.');
        cantidadInput.focus();
        return;
      }

      renderSuccessState(sectionElement, email, cantidad, concert);
      if (onSubmitSuccess) {
        onSubmitSuccess({ email, cantidad, concert });
      }
    });
  }

  return sectionElement;
}
