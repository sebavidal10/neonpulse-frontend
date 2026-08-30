import { APP_CONFIG } from '../config/app.config';
import type { AuthResponse, User } from '../models';

type AuthListener = (user: User | null) => void;

class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  key(index: number) {
    return Array.from(this.store.keys())[index] || null;
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }
}

const memoryStorageInstance = new MemoryStorage();

export class AuthService {
  private static readonly TOKEN_KEY = 'neonpulse_jwt_token';
  private static readonly USER_KEY = 'neonpulse_user_info';
  private static listeners: Set<AuthListener> = new Set();

  private static getStorage(): Storage {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage;
      }
      if (typeof localStorage !== 'undefined') {
        return localStorage;
      }
    } catch {
      // ignore
    }
    return memoryStorageInstance;
  }

  /**
   * Returns current JWT token from storage.
   */
  static getToken(): string | null {
    return this.getStorage().getItem(this.TOKEN_KEY);
  }

  /**
   * Returns current authenticated user profile if stored.
   */
  static getCurrentUser(): User | null {
    const raw = this.getStorage().getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  /**
   * Checks if a valid user session exists.
   */
  static isAuthenticated(): boolean {
    return Boolean(this.getToken() && this.getCurrentUser());
  }

  /**
   * Registers a subscriber for auth state changes.
   */
  static onAuthStateChange(listener: AuthListener): () => void {
    this.listeners.add(listener);
    try {
      listener(this.getCurrentUser());
    } catch (err) {
      console.error('[AuthService] Error in initial auth listener:', err);
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notifyListeners(user: User | null): void {
    this.listeners.forEach((listener) => {
      try {
        listener(user);
      } catch (err) {
        console.error('[AuthService] Error in auth listener:', err);
      }
    });
  }

  /**
   * Logs in with email and password.
   */
  static async login(email: string, password: string): Promise<User> {
    const response = await fetch(`${APP_CONFIG.AUTH_API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Invalid email or password');
    }

    const data = (await response.json()) as AuthResponse;
    const user: User = {
      id: data.id,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
    };

    const storage = this.getStorage();
    storage.setItem(this.TOKEN_KEY, data.token);
    storage.setItem(this.USER_KEY, JSON.stringify(user));
    this.notifyListeners(user);

    return user;
  }

  /**
   * Registers a new user account.
   */
  static async register(email: string, password: string, fullName: string): Promise<User> {
    const response = await fetch(`${APP_CONFIG.AUTH_API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, fullName }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Registration failed');
    }

    const data = (await response.json()) as AuthResponse;
    const user: User = {
      id: data.id,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
    };

    const storage = this.getStorage();
    storage.setItem(this.TOKEN_KEY, data.token);
    storage.setItem(this.USER_KEY, JSON.stringify(user));
    this.notifyListeners(user);

    return user;
  }

  /**
   * Logs out the current user.
   */
  static logout(): void {
    const storage = this.getStorage();
    storage.removeItem(this.TOKEN_KEY);
    storage.removeItem(this.USER_KEY);
    this.notifyListeners(null);
  }

  /**
   * Helper for authorized fetch requests.
   */
  static async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();
    const headers = new Headers(options.headers || {});

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return fetch(url, {
      ...options,
      headers,
    });
  }
}
