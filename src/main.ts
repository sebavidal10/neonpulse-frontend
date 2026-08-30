import './styles/global.css';
import { ConcertService } from './services/concert.service';
import { AuthService } from './services/auth.service';
import { ConcertBoardView } from './views/concertBoard.view';
import { ConcertDetailView } from './views/concertDetail.view';
import { UserProfileView } from './views/userProfile.view';
import { AdminConcertsView } from './views/adminConcerts.view';
import { AdminConcertEditorView } from './views/adminConcertEditor.view';
import { AuthModal } from './components/AuthModal';
import { CartDrawer } from './components/CartDrawer';
import { renderIcon } from './utils/icon.utils';
import { t, getLocale, toggleLocale, onLocaleChange } from './i18n';
import type { Concert, User } from './models';
import {
  LogOut,
  UserPlus,
  Languages,
  Sliders,
} from 'lucide';

export type ViewMode = 'lineup' | 'detail' | 'profile' | 'admin' | 'admin-editor';
let currentActiveView: ViewMode = 'lineup';
let cachedConcerts: Concert[] = [];
let selectedDetailConcert: Concert | null = null;
let editingConcert: Concert | null = null;
let boardViewInstance: ConcertBoardView | null = null;

/**
 * Switches the active page view between Concert Lineup, Concert Detail, User Profile, Admin Gigs, and Admin Concert Editor.
 */
export function switchView(view: ViewMode, concert?: Concert): void {
  currentActiveView = view;
  const lineupContainer = document.getElementById('view-lineup');
  const detailContainer = document.getElementById('view-detail');
  const profileContainer = document.getElementById('view-profile');
  const adminContainer = document.getElementById('view-admin');
  const adminEditorContainer = document.getElementById('view-admin-editor');

  // Hide all view containers first
  if (lineupContainer) lineupContainer.classList.add('hidden');
  if (detailContainer) detailContainer.classList.add('hidden');
  if (profileContainer) profileContainer.classList.add('hidden');
  if (adminContainer) adminContainer.classList.add('hidden');
  if (adminEditorContainer) adminEditorContainer.classList.add('hidden');

  if (view === 'detail') {
    if (concert) {
      selectedDetailConcert = concert;
    }
    const targetConcert = selectedDetailConcert || cachedConcerts[0];

    if (detailContainer) {
      detailContainer.classList.remove('hidden');
      if (targetConcert) {
        const detailView = new ConcertDetailView(detailContainer, () => {
          switchView('lineup');
        });
        detailView.render(targetConcert);
      }
    }
  } else if (view === 'profile') {
    if (!AuthService.isAuthenticated()) {
      AuthModal.open('signin', () => {
        switchView('profile');
      });
      return;
    }

    if (profileContainer) {
      profileContainer.classList.remove('hidden');
      const profileView = new UserProfileView(profileContainer, () => {
        switchView('lineup');
      });
      profileView.render();
    }
  } else if (view === 'admin') {
    if (!AuthService.isAuthenticated() || AuthService.getCurrentUser()?.role !== 'ROLE_ADMIN') {
      switchView('lineup');
      return;
    }

    if (adminContainer) {
      adminContainer.classList.remove('hidden');
      const adminView = new AdminConcertsView(
        adminContainer,
        () => switchView('lineup'),
        (editGig) => {
          editingConcert = editGig || null;
          switchView('admin-editor', editGig);
        },
      );
      adminView.render();
    }
  } else if (view === 'admin-editor') {
    if (!AuthService.isAuthenticated() || AuthService.getCurrentUser()?.role !== 'ROLE_ADMIN') {
      switchView('lineup');
      return;
    }

    if (adminEditorContainer) {
      adminEditorContainer.classList.remove('hidden');
      const targetGig = concert || editingConcert;
      const editorView = new AdminConcertEditorView(adminEditorContainer, () => {
        switchView('admin');
      });
      editorView.render(targetGig);
    }
  } else {
    // Default 'lineup' view
    if (lineupContainer) {
      lineupContainer.classList.remove('hidden');
      if (boardViewInstance && cachedConcerts.length > 0) {
        boardViewInstance.renderConcerts(cachedConcerts);
      }
    }
  }

  // Refresh header navigation active states
  renderHeaderAuth(AuthService.getCurrentUser());
}

/**
 * Renders the top navigation header auth, language, and view controls.
 */
function renderHeaderAuth(user: User | null): void {
  const container = document.getElementById('contenedor-auth-header');
  if (!container) return;

  const currentLang = getLocale().toUpperCase();
  const nextLang = currentLang === 'EN' ? 'ES' : 'EN';
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const profileActiveClasses =
    currentActiveView === 'profile'
      ? 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)] ring-1 ring-red-500'
      : 'bg-zinc-900/90 text-zinc-300 hover:text-white border-zinc-800 hover:border-zinc-700';

  const adminActiveClasses =
    currentActiveView === 'admin' || currentActiveView === 'admin-editor'
      ? 'bg-amber-600 text-white border-amber-500 shadow-[0_0_12px_rgba(217,119,6,0.4)]'
      : 'bg-zinc-900/90 text-zinc-300 hover:text-white border-zinc-800 hover:border-zinc-700';

  const langButtonHtml = `
    <button 
      type="button" 
      id="btn-lang-toggle" 
      class="h-9 px-3 inline-flex items-center gap-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
      title="Switch Language (${nextLang})"
      aria-label="Switch Language"
    >
      ${renderIcon(Languages, 'w-3.5 h-3.5 text-red-500')}
      <span class="font-mono text-[11px]">${currentLang}</span>
    </button>
  `;

  if (user) {
    const displayName =
      user.email === 'admin@mail.com' ||
      user.fullName === 'System Administrator' ||
      user.fullName === 'Administrador del Sistema'
        ? t('header.adminUserDisplayName')
        : user.fullName || 'Anonymous Member';

    const initials = displayName
      ? displayName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : 'U';

    const adminNavButtonHtml = isAdmin
      ? `
      <button 
        type="button" 
        id="nav-btn-admin" 
        class="h-9 px-3.5 inline-flex items-center gap-2 rounded-xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm ${adminActiveClasses}"
      >
        ${renderIcon(Sliders, 'w-3.5 h-3.5 text-amber-400')}
        <span>${t('header.adminNav')}</span>
      </button>
    `
      : '';

    container.innerHTML = `
      <div class="flex items-center gap-2.5">
        ${adminNavButtonHtml}

        <!-- Language Switcher Button -->
        ${langButtonHtml}

        <div class="h-5 w-px bg-zinc-800/80 mx-0.5"></div>

        <!-- User Badge (Click to open profile & passes) -->
        <button 
          type="button" 
          id="btn-header-user-badge" 
          class="h-9 pl-2 pr-3.5 inline-flex items-center gap-2.5 rounded-xl border transition-all cursor-pointer group shadow-sm ${profileActiveClasses}"
          title="${t('header.profileNav')}"
          aria-label="${t('header.profileNav')}"
        >
          <div class="w-5.5 h-5.5 rounded-lg ${
            isAdmin
              ? 'bg-gradient-to-tr from-amber-600 to-red-600'
              : 'bg-gradient-to-tr from-red-600 to-rose-500'
          } flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow group-hover:scale-105 transition-transform">
            ${initials}
          </div>
          <span class="text-xs font-bold text-zinc-200 group-hover:text-white truncate max-w-[170px] transition-colors">
            ${displayName}
          </span>
        </button>

        <!-- Sign Out Button -->
        <button 
          type="button" 
          id="btn-header-signout" 
          class="h-9 w-9 inline-flex items-center justify-center rounded-xl bg-zinc-900/90 hover:bg-red-950/60 border border-zinc-800 hover:border-red-900/80 text-zinc-400 hover:text-red-400 transition-all cursor-pointer shadow-sm"
          title="${t('header.signOut')}"
          aria-label="${t('header.signOut')}"
        >
          ${renderIcon(LogOut, 'w-4 h-4')}
        </button>
      </div>
    `;

    container.querySelector('#nav-btn-admin')?.addEventListener('click', () => {
      switchView('admin');
    });

    container.querySelector('#btn-lang-toggle')?.addEventListener('click', () => {
      toggleLocale();
    });

    container.querySelector('#btn-header-user-badge')?.addEventListener('click', () => {
      switchView('profile');
    });

    container.querySelector('#btn-header-signout')?.addEventListener('click', () => {
      AuthService.logout();
      switchView('lineup');
    });
  } else {
    container.innerHTML = `
      <div class="flex items-center gap-2.5">
        <!-- Language Switcher Button -->
        ${langButtonHtml}

        <div class="h-5 w-px bg-zinc-800/80 mx-0.5"></div>

        <!-- Sign In Ghost Button -->
        <button 
          type="button" 
          id="btn-header-signin" 
          class="h-9 px-3.5 inline-flex items-center justify-center text-xs font-black uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors cursor-pointer"
        >
          ${t('header.signIn')}
        </button>

        <!-- Sign Up Neon Action Button -->
        <button 
          type="button" 
          id="btn-header-signup" 
          class="h-9 px-4 inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:shadow-[0_0_22px_rgba(220,38,38,0.6)] hover:scale-105 transition-all cursor-pointer"
        >
          ${renderIcon(UserPlus, 'w-3.5 h-3.5')}
          <span>${t('header.signUp')}</span>
        </button>
      </div>
    `;

    container.querySelector('#btn-lang-toggle')?.addEventListener('click', () => {
      toggleLocale();
    });

    container.querySelector('#btn-header-signin')?.addEventListener('click', () => {
      AuthModal.open('signin');
    });

    container.querySelector('#btn-header-signup')?.addEventListener('click', () => {
      AuthModal.open('signup');
    });
  }
}

/**
 * Initializes and orchestrates the full NeonPulse application.
 */
async function bootstrap(): Promise<void> {
  boardViewInstance = new ConcertBoardView();

  // 1. Initialize Floating Cart Drawer
  CartDrawer.init();

  // Attach brand logo click to navigate Home
  document.getElementById('brand-home-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchView('lineup');
  });

  // 2. Listen for custom SPA navigation events
  window.addEventListener('neonpulse:navigate', (event: any) => {
    const targetView = event.detail?.view;
    const concert = event.detail?.concert;
    if (
      targetView === 'profile' ||
      targetView === 'lineup' ||
      targetView === 'detail' ||
      targetView === 'admin' ||
      targetView === 'admin-editor'
    ) {
      switchView(targetView, concert);
    }
  });

  function applyStaticTranslations(): void {
    const categoryEl = document.getElementById('header-category-text');
    if (categoryEl) categoryEl.textContent = t('header.category');

    const taglineEl = document.getElementById('header-tagline-text');
    if (taglineEl) taglineEl.textContent = t('header.tagline');

    const lineupTitleEl = document.getElementById('lineup-title-text');
    if (lineupTitleEl) lineupTitleEl.textContent = t('board.title');
  }

  // 3. Re-render when language changes
  onLocaleChange(() => {
    applyStaticTranslations();
    switchView(currentActiveView);
  });

  // Apply initial translations
  applyStaticTranslations();

  // 4. Subscribe to auth state changes
  AuthService.onAuthStateChange((user) => {
    renderHeaderAuth(user);
  });

  try {
    // Display initial loading skeletons
    boardViewInstance.showLoading();

    // Fetch gigs from API
    cachedConcerts = await ConcertService.getAllConcerts();

    // Handle empty state
    if (cachedConcerts.length === 0) {
      boardViewInstance.showEmpty();
      return;
    }

    // Render lineup
    boardViewInstance.renderConcerts(cachedConcerts);
  } catch (error) {
    console.error('[NeonPulse] Critical error during initialization:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Error loading gig lineup.';
    boardViewInstance.showError(errorMessage, () => bootstrap());
  }
}

// Start application
await bootstrap();
