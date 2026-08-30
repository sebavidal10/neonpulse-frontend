import { AuthService } from '../../services/auth.service';
import { renderIcon } from '../../utils/icon.utils';
import { t } from '../../i18n';
import {
  Lock,
  Mail,
  User as UserIcon,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide';

export class AuthModal {
  private static modalElement: HTMLElement | null = null;
  private static activeTab: 'signin' | 'signup' = 'signin';
  private static onSuccessCallback?: () => void;

  /**
   * Initializes and opens the Auth Modal.
   */
  static open(initialTab: 'signin' | 'signup' = 'signin', onSuccess?: () => void): void {
    this.activeTab = initialTab;
    this.onSuccessCallback = onSuccess;

    if (!this.modalElement || !document.body.contains(this.modalElement)) {
      let existing = document.getElementById('auth-modal-root');
      if (!existing) {
        existing = document.createElement('div');
        existing.id = 'auth-modal-root';
        document.body.appendChild(existing);
      }
      this.modalElement = existing;
    }

    this.render();
    document.body.style.overflow = 'hidden';
  }

  /**
   * Closes the Auth Modal.
   */
  static close(): void {
    if (this.modalElement) {
      this.modalElement.innerHTML = '';
    }
    document.body.style.overflow = '';
  }

  private static render(): void {
    if (!this.modalElement) return;

    const isSignIn = this.activeTab === 'signin';
    const closeIcon = renderIcon(X, 'w-5 h-5 text-zinc-400 hover:text-white transition-colors');
    const mailIcon = renderIcon(Mail, 'w-4 h-4 text-zinc-500');
    const lockIcon = renderIcon(Lock, 'w-4 h-4 text-zinc-500');
    const userIcon = renderIcon(UserIcon, 'w-4 h-4 text-zinc-500');
    const sparklesIcon = renderIcon(Sparkles, 'w-4 h-4 text-red-500');
    const arrowIcon = renderIcon(ArrowRight, 'w-4 h-4');

    this.modalElement.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
        <div class="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl overflow-hidden">
          <!-- Background Ambient Glow -->
          <div class="absolute top-0 right-0 w-40 h-40 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <!-- Close button -->
          <button 
            type="button" 
            id="btn-close-auth-modal" 
            class="absolute top-4 right-4 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="${t('auth.close')}"
          >
            ${closeIcon}
          </button>

          <!-- Header -->
          <div class="mb-6">
            <div class="flex items-center gap-2 mb-1.5">
              ${sparklesIcon}
              <span class="text-xs font-black uppercase tracking-widest text-red-500">
                ${isSignIn ? 'AUTHENTICATION' : 'MEMBERSHIP'}
              </span>
            </div>
            <h3 class="text-xl md:text-2xl font-black uppercase tracking-tight text-white">
              ${isSignIn ? t('auth.signInTitle') : t('auth.signUpTitle')}
            </h3>
            <p class="text-xs text-zinc-400 mt-1">
              ${isSignIn ? t('auth.signInSubtitle') : t('auth.signUpSubtitle')}
            </p>
          </div>

          <!-- Tabs Switcher -->
          <div class="flex rounded-lg bg-zinc-900 p-1 mb-6 border border-zinc-800">
            <button 
              type="button" 
              id="tab-signin" 
              class="flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                isSignIn ? 'bg-red-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
              }"
            >
              ${t('auth.signInTab')}
            </button>
            <button 
              type="button" 
              id="tab-signup" 
              class="flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                !isSignIn ? 'bg-red-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
              }"
            >
              ${t('auth.signUpTab')}
            </button>
          </div>

          <!-- Form Alert Box -->
          <div id="auth-alert-box" class="hidden mb-4 p-3 rounded-lg text-xs font-bold flex items-center gap-2"></div>

          <!-- Auth Form -->
          <form id="auth-form" class="space-y-4" novalidate>
            ${
              !isSignIn
                ? `
              <div class="space-y-1.5">
                <label for="auth-fullname" class="block text-xs font-extrabold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  ${userIcon}
                  <span>${t('auth.fullNameLabel')}</span>
                </label>
                <input 
                  type="text" 
                  id="auth-fullname" 
                  name="fullname" 
                  class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all duration-150" 
                  placeholder="Johnny Silverhand" 
                  required
                />
              </div>
            `
                : ''
            }

            <div class="space-y-1.5">
              <label for="auth-email" class="block text-xs font-extrabold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                ${mailIcon}
                <span>${t('auth.emailLabel')}</span>
              </label>
              <input 
                type="email" 
                id="auth-email" 
                name="email" 
                class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all duration-150" 
                placeholder="rocker@neonpulse.io" 
                required
              />
            </div>

            <div class="space-y-1.5">
              <label for="auth-password" class="block text-xs font-extrabold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                ${lockIcon}
                <span>${t('auth.passwordLabel')}</span>
              </label>
              <input 
                type="password" 
                id="auth-password" 
                name="password" 
                class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all duration-150" 
                placeholder="••••••••" 
                required
              />
            </div>

            <button 
              type="submit" 
              id="btn-auth-submit" 
              class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black text-xs md:text-sm uppercase tracking-wider border border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all duration-150 cursor-pointer"
            >
              <span>${isSignIn ? t('auth.signInButton') : t('auth.signUpButton')}</span>
              ${arrowIcon}
            </button>
          </form>

          <!-- Footer Switcher -->
          <div class="mt-6 pt-4 border-t border-zinc-900 text-center text-xs text-zinc-400">
            <span>${isSignIn ? t('auth.dontHaveAccount') : t('auth.alreadyHaveAccount')}</span>
            <button 
              type="button" 
              id="btn-switch-auth-mode" 
              class="ml-1 text-red-500 hover:text-red-400 font-extrabold underline cursor-pointer"
            >
              ${isSignIn ? t('auth.switchSignUp') : t('auth.switchSignIn')}
            </button>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private static attachEvents(): void {
    if (!this.modalElement) return;

    // Close button
    const closeBtn = this.modalElement.querySelector('#btn-close-auth-modal');
    closeBtn?.addEventListener('click', () => this.close());

    // Backdrop click to close
    const backdrop = this.modalElement.querySelector('.fixed');
    backdrop?.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        this.close();
      }
    });

    // Tab buttons
    const tabSignIn = this.modalElement.querySelector('#tab-signin');
    const tabSignUp = this.modalElement.querySelector('#tab-signup');
    const switchBtn = this.modalElement.querySelector('#btn-switch-auth-mode');

    tabSignIn?.addEventListener('click', () => {
      this.activeTab = 'signin';
      this.render();
    });

    tabSignUp?.addEventListener('click', () => {
      this.activeTab = 'signup';
      this.render();
    });

    switchBtn?.addEventListener('click', () => {
      this.activeTab = this.activeTab === 'signin' ? 'signup' : 'signin';
      this.render();
    });

    // Form submit
    const form = this.modalElement.querySelector<HTMLFormElement>('#auth-form');
    const alertBox = this.modalElement.querySelector<HTMLElement>('#auth-alert-box');
    const submitBtn = this.modalElement.querySelector<HTMLButtonElement>('#btn-auth-submit');

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!alertBox || !submitBtn) return;

      alertBox.classList.add('hidden');
      alertBox.className = 'hidden mb-4 p-3 rounded-lg text-xs font-bold flex items-center gap-2';

      const email = (form.querySelector('#auth-email') as HTMLInputElement)?.value.trim();
      const password = (form.querySelector('#auth-password') as HTMLInputElement)?.value;
      const fullName = (form.querySelector('#auth-fullname') as HTMLInputElement)?.value?.trim();

      if (!email || !password || (this.activeTab === 'signup' && !fullName)) {
        this.showAlert(t('auth.errors.validationError'), 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.classList.add('opacity-75', 'cursor-wait');

      try {
        if (this.activeTab === 'signin') {
          await AuthService.login(email, password);
        } else {
          await AuthService.register(email, password, fullName);
        }

        this.showAlert(
          this.activeTab === 'signin' ? t('auth.success.loggedIn') : t('auth.success.registered'),
          'success',
        );

        setTimeout(() => {
          this.close();
          if (this.onSuccessCallback) {
            this.onSuccessCallback();
          }
        }, 500);
      } catch (err: any) {
        this.showAlert(err.message || t('auth.errors.genericError'), 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-75', 'cursor-wait');
      }
    });
  }

  private static showAlert(msg: string, type: 'error' | 'success'): void {
    if (!this.modalElement) return;
    const alertBox = this.modalElement.querySelector<HTMLElement>('#auth-alert-box');
    if (!alertBox) return;

    if (type === 'error') {
      alertBox.className =
        'mb-4 p-3 rounded-lg text-xs font-bold bg-red-950/80 border border-red-800 text-red-400 flex items-center gap-2';
      alertBox.innerHTML = `${renderIcon(AlertCircle, 'w-4 h-4 shrink-0 text-red-400')}<span>${msg}</span>`;
    } else {
      alertBox.className =
        'mb-4 p-3 rounded-lg text-xs font-bold bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center gap-2';
      alertBox.innerHTML = `${renderIcon(CheckCircle2, 'w-4 h-4 shrink-0 text-emerald-400')}<span>${msg}</span>`;
    }

    alertBox.classList.remove('hidden');
  }
}
