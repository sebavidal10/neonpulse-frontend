import { describe, it, expect, beforeEach, vi } from 'vitest';
import { t, setLocale, getLocale, toggleLocale, onLocaleChange } from '../../src/i18n';

describe('i18n module', () => {
  beforeEach(() => {
    setLocale('en');
    vi.restoreAllMocks();
  });

  it('debe resolver claves en inglés por defecto', () => {
    expect(getLocale()).toBe('en');
    expect(t('header.signIn')).toBe('Sign In');
    expect(t('board.title')).toBe('Concert Lineup');
  });

  it('debe cambiar de idioma a español con setLocale y resolver textos en español', () => {
    setLocale('es');
    expect(getLocale()).toBe('es');
    expect(t('header.signIn')).toBe('Iniciar Sesión');
    expect(t('board.title')).toBe('Cartelera de Conciertos');
    expect(t('profile.title')).toBe('Perfil de Miembro y Bóveda de Pases');
  });

  it('debe alternar de idioma con toggleLocale', () => {
    expect(getLocale()).toBe('en');
    const next1 = toggleLocale();
    expect(next1).toBe('es');
    expect(getLocale()).toBe('es');

    const next2 = toggleLocale();
    expect(next2).toBe('en');
    expect(getLocale()).toBe('en');
  });

  it('debe notificar a los listeners registrados cuando cambia el idioma', () => {
    const listener = vi.fn();
    const unsubscribe = onLocaleChange(listener);

    setLocale('es');
    expect(listener).toHaveBeenCalledWith('es');

    unsubscribe();
    setLocale('en');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('debe sustituir parámetros correctamente en ambos idiomas', () => {
    setLocale('en');
    expect(t('header.welcomeUser', { name: 'Alex' })).toBe('Hi, Alex');

    setLocale('es');
    expect(t('cart.confirmedMessage', { quantity: 2, concertName: 'Los Prisioneros' })).toBe(
      'Has comprado exitosamente 2 pase(s) digital(es) para Los Prisioneros.',
    );
  });

  it('debe retornar la clave si no existe en el diccionario o si apunta a un objeto', () => {
    expect(t('non.existent.key')).toBe('non.existent.key');
    expect(t('header')).toBe('header');
  });
});
