import { describe, it, expect, vi } from 'vitest';
import {
  renderBookingForm,
  createBookingFormElement,
} from '../../src/components/BookingForm/BookingForm';
import { ConcertStatus, type Concert } from '../../src/models';

describe('BookingForm Component', () => {
  const mockConcert: Concert = {
    id: 'c1',
    title: 'Fiskales Ad-Hok en Vivo',
    band: 'Fiskales Ad-Hok',
    date: new Date('2026-09-15'),
    status: ConcertStatus.SCHEDULED,
  };

  it('debe generar el HTML del formulario de reserva con renderBookingForm', () => {
    const html = renderBookingForm();
    expect(html).toContain('Reserva de Entradas');
    expect(html).toContain('id="form-reserva"');
    expect(html).toContain('id="email"');
    expect(html).toContain('id="cantidad"');
    expect(html).toContain('id="bloque-error"');
  });

  it('debe incluir la información del concierto cuando se pasa como parámetro en renderBookingForm', () => {
    const html = renderBookingForm(mockConcert);
    expect(html).toContain('Fiskales Ad-Hok en Vivo');
    expect(html).toContain('Fiskales Ad-Hok');
  });

  it('debe instanciar un HTMLElement mediante createBookingFormElement', () => {
    const el = createBookingFormElement(mockConcert);
    expect(el).toBeInstanceOf(HTMLElement);
    expect(el.querySelector('#form-reserva')).not.toBeNull();
  });

  it('debe mostrar error de validación cuando el email está vacío', () => {
    const el = createBookingFormElement();
    const form = el.querySelector('#form-reserva') as HTMLFormElement;
    const errorBlock = el.querySelector('#bloque-error') as HTMLElement;

    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

    expect(errorBlock.classList.contains('hidden')).toBe(false);
    expect(errorBlock.textContent).toContain('El correo electrónico es requerido.');
  });

  it('debe mostrar error de validación cuando el formato del email es inválido', () => {
    const el = createBookingFormElement();
    const form = el.querySelector('#form-reserva') as HTMLFormElement;
    const emailInput = el.querySelector('#email') as HTMLInputElement;
    const errorBlock = el.querySelector('#bloque-error') as HTMLElement;

    emailInput.value = 'correo-invalido';
    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

    expect(errorBlock.classList.contains('hidden')).toBe(false);
    expect(errorBlock.textContent).toContain('Por favor, ingresa un correo electrónico válido.');
  });

  it('debe mostrar error cuando la cantidad es menor a 1 o mayor a 10', () => {
    const el = createBookingFormElement();
    const form = el.querySelector('#form-reserva') as HTMLFormElement;
    const emailInput = el.querySelector('#email') as HTMLInputElement;
    const cantidadInput = el.querySelector('#cantidad') as HTMLInputElement;
    const errorBlock = el.querySelector('#bloque-error') as HTMLElement;

    emailInput.value = 'fan@punkrock.cl';
    cantidadInput.value = '15';
    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

    expect(errorBlock.classList.contains('hidden')).toBe(false);
    expect(errorBlock.textContent).toContain('La cantidad de entradas debe ser entre 1 y 10.');
  });

  it('debe procesar exitosamente la reserva y ejecutar la función de callback', () => {
    const onSubmitSuccess = vi.fn();
    const el = createBookingFormElement(mockConcert, onSubmitSuccess);

    const form = el.querySelector('#form-reserva') as HTMLFormElement;
    const emailInput = el.querySelector('#email') as HTMLInputElement;
    const cantidadInput = el.querySelector('#cantidad') as HTMLInputElement;

    emailInput.value = 'fan@punkrock.cl';
    cantidadInput.value = '3';
    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

    expect(onSubmitSuccess).toHaveBeenCalledTimes(1);
    expect(onSubmitSuccess).toHaveBeenCalledWith({
      email: 'fan@punkrock.cl',
      cantidad: 3,
      concert: mockConcert,
    });
    expect(el.innerHTML).toContain('¡Reserva Confirmada!');
    expect(el.innerHTML).toContain('3 entrada(s)');
  });
});
