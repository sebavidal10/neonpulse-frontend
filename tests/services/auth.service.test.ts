import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthService } from '../../src/services/auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    AuthService.logout();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('debe registrar un usuario y almacenar token en localStorage', async () => {
    const mockAuthResponse = {
      token: 'jwt-mock-token-123',
      type: 'Bearer',
      id: 1,
      email: 'rocker@neonpulse.io',
      fullName: 'Johnny Silverhand',
      role: 'ROLE_USER',
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockAuthResponse,
      }),
    );

    const user = await AuthService.register('rocker@neonpulse.io', 'pass123', 'Johnny Silverhand');

    expect(user.id).toBe(1);
    expect(user.email).toBe('rocker@neonpulse.io');
    expect(AuthService.getToken()).toBe('jwt-mock-token-123');
    expect(AuthService.getCurrentUser()?.fullName).toBe('Johnny Silverhand');
    expect(AuthService.isAuthenticated()).toBe(true);
  });

  it('debe lanzar error cuando el registro falla', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Email already exists' }),
      }),
    );

    await expect(
      AuthService.register('existing@neonpulse.io', 'pass123', 'Johnny'),
    ).rejects.toThrow('Email already exists');
  });

  it('debe iniciar sesión con login', async () => {
    const mockAuthResponse = {
      token: 'jwt-login-token',
      type: 'Bearer',
      id: 2,
      email: 'rocker@neonpulse.io',
      fullName: 'Johnny Silverhand',
      role: 'ROLE_USER',
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockAuthResponse,
      }),
    );

    const user = await AuthService.login('rocker@neonpulse.io', 'pass123');
    expect(user.id).toBe(2);
    expect(AuthService.getToken()).toBe('jwt-login-token');
  });

  it('debe cerrar sesión con logout limpiando almacenamiento y notificando suscriptores', async () => {
    const mockAuthResponse = {
      token: 'jwt-sample-token',
      type: 'Bearer',
      id: 3,
      email: 'rocker@neonpulse.io',
      fullName: 'Johnny Silverhand',
      role: 'ROLE_USER',
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockAuthResponse,
      }),
    );

    await AuthService.login('rocker@neonpulse.io', 'pass123');

    let observedUser: any = 'initial';
    const unsubscribe = AuthService.onAuthStateChange((user) => {
      observedUser = user;
    });

    AuthService.logout();

    expect(AuthService.getToken()).toBeNull();
    expect(AuthService.getCurrentUser()).toBeNull();
    expect(observedUser).toBeNull();
    unsubscribe();
  });

  it('debe tolerar errores en los listeners suscritos', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const faultyListener = vi.fn().mockImplementation(() => {
      throw new Error('Listener crash');
    });

    const unsubscribe = AuthService.onAuthStateChange(faultyListener);

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ token: 't', type: 'Bearer', id: 5, email: 'e', fullName: 'f', role: 'r' }),
      }),
    );

    await AuthService.login('e', 'p');
    expect(consoleSpy).toHaveBeenCalled();

    unsubscribe();
    consoleSpy.mockRestore();
  });

  it('debe adjuntar Authorization header en fetchWithAuth si existe token', async () => {
    const mockAuthResponse = {
      token: 'my-secret-token',
      type: 'Bearer',
      id: 4,
      email: 'rocker@neonpulse.io',
      fullName: 'Johnny Silverhand',
      role: 'ROLE_USER',
    };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAuthResponse,
      })
      .mockResolvedValueOnce({ ok: true });

    vi.stubGlobal('fetch', fetchMock);

    await AuthService.login('rocker@neonpulse.io', 'pass123');
    await AuthService.fetchWithAuth('http://localhost:8080/api/v1/test');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const headers = fetchMock.mock.calls[1][1]?.headers;
    expect(headers.get('Authorization')).toBe('Bearer my-secret-token');
  });
});
