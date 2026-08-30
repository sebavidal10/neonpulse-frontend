import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthModal } from '../../src/components/AuthModal/AuthModal';
import { AuthService } from '../../src/services/auth.service';

describe('AuthModal Component', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('debe abrir y renderizar el modal en modo signin por defecto', () => {
    AuthModal.open('signin');

    const modalRoot = document.getElementById('auth-modal-root');
    expect(modalRoot).not.toBeNull();
    expect(modalRoot?.innerHTML).toContain('Sign In to NeonPulse');
    expect(modalRoot?.querySelector('#auth-email')).not.toBeNull();
    expect(modalRoot?.querySelector('#auth-password')).not.toBeNull();
    expect(modalRoot?.querySelector('#auth-fullname')).toBeNull();
  });

  it('debe abrir y renderizar el modal en modo signup', () => {
    AuthModal.open('signup');

    const modalRoot = document.getElementById('auth-modal-root');
    expect(modalRoot?.innerHTML).toContain('Create an Account');
    expect(modalRoot?.querySelector('#auth-fullname')).not.toBeNull();
  });

  it('debe alternar entre pestañas signin y signup con botones y switch', () => {
    AuthModal.open('signin');
    const tabSignUp = document.getElementById('tab-signup');
    tabSignUp?.click();
    expect(document.getElementById('auth-modal-root')?.innerHTML).toContain('Create an Account');

    const tabSignIn = document.getElementById('tab-signin');
    tabSignIn?.click();
    expect(document.getElementById('auth-modal-root')?.innerHTML).toContain('Sign In to NeonPulse');

    const switchBtn = document.getElementById('btn-switch-auth-mode');
    switchBtn?.click();
    expect(document.getElementById('auth-modal-root')?.innerHTML).toContain('Create an Account');
  });

  it('debe cerrar el modal al hacer click en el botón de cerrar o en el backdrop', () => {
    AuthModal.open('signin');
    const closeBtn = document.getElementById('btn-close-auth-modal');
    closeBtn?.click();
    expect(document.getElementById('auth-modal-root')?.innerHTML).toBe('');

    AuthModal.open('signin');
    const backdrop = document.querySelector('.fixed') as HTMLElement;
    backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(document.getElementById('auth-modal-root')?.innerHTML).toBe('');
  });

  it('debe mostrar alerta de validación cuando faltan campos', () => {
    AuthModal.open('signup');
    const form = document.getElementById('auth-form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

    const alertBox = document.getElementById('auth-alert-box');
    expect(alertBox?.classList.contains('hidden')).toBe(false);
  });

  it('debe manejar error al registrarse o iniciar sesión', async () => {
    vi.spyOn(AuthService, 'login').mockRejectedValue(new Error('Invalid password provided'));

    AuthModal.open('signin');
    const emailInput = document.getElementById('auth-email') as HTMLInputElement;
    const passInput = document.getElementById('auth-password') as HTMLInputElement;
    const form = document.getElementById('auth-form') as HTMLFormElement;

    emailInput.value = 'rocker@neonpulse.io';
    passInput.value = 'WrongPassword';
    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

    await vi.waitFor(() => {
      const alertBox = document.getElementById('auth-alert-box');
      expect(alertBox?.textContent).toContain('Invalid password provided');
    });
  });

  it('debe autenticar con AuthService.register al enviar el formulario signup', async () => {
    const registerSpy = vi.spyOn(AuthService, 'register').mockResolvedValue({
      id: 1,
      email: 'rocker@neonpulse.io',
      fullName: 'Johnny Silverhand',
      role: 'ROLE_USER',
    });

    const onSuccess = vi.fn();
    AuthModal.open('signup', onSuccess);

    const nameInput = document.getElementById('auth-fullname') as HTMLInputElement;
    const emailInput = document.getElementById('auth-email') as HTMLInputElement;
    const passInput = document.getElementById('auth-password') as HTMLInputElement;
    const form = document.getElementById('auth-form') as HTMLFormElement;

    nameInput.value = 'Johnny Silverhand';
    emailInput.value = 'rocker@neonpulse.io';
    passInput.value = 'Password123!';

    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

    expect(registerSpy).toHaveBeenCalledWith('rocker@neonpulse.io', 'Password123!', 'Johnny Silverhand');
  });
});
