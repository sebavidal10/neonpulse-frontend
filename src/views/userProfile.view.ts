import { AuthService } from '../services/auth.service';
import { TicketService } from '../services/ticket.service';
import { AuthModal } from '../components/AuthModal';
import { renderIcon } from '../utils/icon.utils';
import { t } from '../i18n';
import type { Ticket, User } from '../models';
import {
  Mail,
  ShieldCheck,
  Ticket as TicketIcon,
  QrCode,
  Printer,
  ArrowLeft,
  AlertCircle,
  LogIn,
} from 'lucide';

export class UserProfileView {
  private container: HTMLElement;
  private onNavigateToLineup?: () => void;

  constructor(container: HTMLElement, onNavigateToLineup?: () => void) {
    this.container = container;
    this.onNavigateToLineup = onNavigateToLineup;
  }

  /**
   * Renders the complete profile view or authentication gate.
   */
  async render(): Promise<void> {
    if (!AuthService.isAuthenticated()) {
      this.renderUnauthenticatedGate();
      return;
    }

    const currentUser = AuthService.getCurrentUser();
    this.renderSkeleton(currentUser);

    try {
      const tickets = await TicketService.getMyTickets();
      this.renderProfileWithTickets(currentUser, tickets);
    } catch (err: any) {
      console.error('[NeonPulse] Failed to load profile tickets:', err);
      if (!AuthService.isAuthenticated()) {
        this.renderUnauthenticatedGate();
        return;
      }
      this.renderError(currentUser, err.message || t('profile.loadError'));
    }
  }

  private renderUnauthenticatedGate(): void {
    const lockIcon = renderIcon(ShieldCheck, 'w-12 h-12 text-red-500 mb-2');
    const loginIcon = renderIcon(LogIn, 'w-4 h-4');

    this.container.innerHTML = `
      <section class="max-w-xl mx-auto my-12 bg-zinc-950 border border-zinc-800/90 rounded-2xl p-8 text-center flex flex-col items-center gap-4 shadow-2xl animate-fadeIn">
        <div class="p-4 bg-zinc-900 border border-zinc-800 rounded-full">
          ${lockIcon}
        </div>
        <h2 class="text-2xl font-black uppercase tracking-tight text-white">
          ${t('profile.title')}
        </h2>
        <p class="text-xs text-zinc-400 max-w-md">
          Please sign in or register to access your account credentials and view your reserved digital passes.
        </p>
        <div class="flex items-center gap-3 mt-2">
          <button 
            type="button" 
            id="btn-gate-signin"
            class="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all flex items-center gap-2 cursor-pointer"
          >
            ${loginIcon}
            <span>${t('auth.signInButton')}</span>
          </button>
          <button 
            type="button" 
            id="btn-gate-lineup"
            class="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider rounded-lg border border-zinc-700 transition-colors cursor-pointer"
          >
            ${t('profile.backToLineup')}
          </button>
        </div>
      </section>
    `;

    this.container.querySelector('#btn-gate-signin')?.addEventListener('click', () => {
      AuthModal.open('signin', () => {
        this.render();
      });
    });

    this.container.querySelector('#btn-gate-lineup')?.addEventListener('click', () => {
      if (this.onNavigateToLineup) {
        this.onNavigateToLineup();
      }
    });
  }

  private renderSkeleton(user: User | null): void {
    const initials = user?.fullName
      ? user.fullName.substring(0, 2).toUpperCase()
      : 'NP';

    this.container.innerHTML = `
      <div class="space-y-6 animate-fadeIn">
        <!-- Profile Header Skeleton -->
        <div class="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-700 to-zinc-800 flex items-center justify-center text-xl font-black text-white shadow-lg shrink-0">
              ${initials}
            </div>
            <div>
              <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-950 text-red-400 border border-red-800 mb-1">
                ${renderIcon(ShieldCheck, 'w-3 h-3')}
                ${t('profile.membershipBadge')}
              </div>
              <h2 class="text-xl md:text-2xl font-black uppercase tracking-tight text-white">
                ${user?.fullName || 'Punk Member'}
              </h2>
              <p class="text-xs text-zinc-400">${user?.email || 'member@neonpulse.io'}</p>
            </div>
          </div>
        </div>

        <!-- Skeleton Grid -->
        <div class="space-y-3">
          <div class="h-6 w-48 bg-zinc-900 rounded animate-pulse"></div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="h-44 bg-zinc-950 border border-zinc-800 rounded-xl animate-pulse"></div>
            <div class="h-44 bg-zinc-950 border border-zinc-800 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    `;
  }

  private renderError(user: User | null, message: string): void {
    const alertIcon = renderIcon(AlertCircle, 'w-10 h-10 text-red-500 mb-2');

    this.container.innerHTML = `
      <div class="space-y-6 animate-fadeIn">
        ${this.renderHeaderHtml(user, 0)}
        <div class="bg-zinc-950 border border-red-900/60 rounded-2xl p-8 text-center flex flex-col items-center gap-3">
          ${alertIcon}
          <h3 class="text-lg font-black text-white uppercase tracking-tight">Could Not Load Passes</h3>
          <p class="text-xs text-zinc-400 max-w-sm">${message}</p>
          <button 
            type="button" 
            id="btn-profile-retry"
            class="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-lg shadow transition-all cursor-pointer"
          >
            ${t('profile.retry')}
          </button>
        </div>
      </div>
    `;

    this.container.querySelector('#btn-profile-retry')?.addEventListener('click', () => {
      this.render();
    });

    this.attachHeaderListeners();
  }

  private renderProfileWithTickets(user: User | null, tickets: Ticket[]): void {
    const passVaultContent =
      tickets.length === 0
        ? `
        <div class="bg-zinc-950 border border-dashed border-zinc-800 rounded-2xl p-10 text-center flex flex-col items-center gap-3">
          <div class="p-4 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-600">
            ${renderIcon(TicketIcon, 'w-10 h-10')}
          </div>
          <h4 class="text-base font-black text-white uppercase tracking-wider">${t('profile.noPassesTitle')}</h4>
          <p class="text-xs text-zinc-400 max-w-sm">${t('profile.noPassesSubtitle')}</p>
          <button 
            type="button" 
            id="btn-empty-explore-lineup" 
            class="mt-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all cursor-pointer"
          >
            ${t('profile.exploreGigs')}
          </button>
        </div>
      `
        : `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${tickets
            .map((ticket) => {
              const formattedDate = ticket.purchaseDate
                ? ticket.purchaseDate.replace('T', ' ').substring(0, 16)
                : 'Confirmed';
              const priceDisplay = ticket.unitPrice
                ? `$${ticket.unitPrice.toLocaleString()}`
                : '$35.00';
              return `
                <div class="bg-zinc-950 border border-zinc-800/90 hover:border-red-600/70 transition-all rounded-xl p-5 flex flex-col justify-between relative overflow-hidden shadow-xl group">
                  <!-- Top Gradient Strip -->
                  <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-red-600"></div>

                  <div class="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-950 text-red-400 border border-red-800">
                        ${renderIcon(ShieldCheck, 'w-3 h-3')}
                        ${t('profile.validPass')}
                      </span>
                      <h4 class="text-lg font-black text-white uppercase tracking-tight mt-1.5 line-clamp-1">
                        ${ticket.band || 'NeonPulse Live Session'}
                      </h4>
                      <p class="text-xs font-bold text-red-500 tracking-wider">
                        ${t('profile.gigRef')}: ${ticket.concertCode || '#' + ticket.concertId}
                      </p>
                    </div>
                    <div class="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg shrink-0 text-white shadow-inner">
                      ${renderIcon(QrCode, 'w-8 h-8 text-zinc-300')}
                    </div>
                  </div>

                  <div class="space-y-2 text-xs text-zinc-300 py-3 border-y border-zinc-900 my-2">
                    <div class="flex justify-between items-center text-xs">
                      <span class="text-zinc-500 font-extrabold uppercase">${t('myTickets.ticketCode')}:</span>
                      <span class="font-mono font-black text-white bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-xs tracking-wider">${ticket.code}</span>
                    </div>
                    <div class="flex justify-between items-center text-xs">
                      <span class="text-zinc-500 font-extrabold uppercase">${t('profile.passHolder')}:</span>
                      <span class="font-semibold text-zinc-200">${ticket.customerName || user?.fullName || t('profile.memberRole')}</span>
                    </div>
                    <div class="flex justify-between items-center text-xs">
                      <span class="text-zinc-500 font-extrabold uppercase">${t('myTickets.pricePaid')}:</span>
                      <span class="font-extrabold text-emerald-400">${priceDisplay}</span>
                    </div>
                  </div>

                  <div class="flex items-center justify-between text-xs text-zinc-500 font-medium pt-1">
                    <span>${formattedDate}</span>
                    <button type="button" class="btn-print-ticket text-zinc-400 hover:text-white inline-flex items-center gap-1.5 font-bold cursor-pointer transition-colors" title="Print Pass">
                      ${renderIcon(Printer, 'w-3.5 h-3.5')}
                      <span>${t('profile.printPass')}</span>
                    </button>
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>
      `;

    this.container.innerHTML = `
      <div class="space-y-6 animate-fadeIn pb-12">
        <!-- Profile Account Card -->
        ${this.renderHeaderHtml(user, tickets.length)}

        <!-- Digital Pass Vault Header -->
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-zinc-900 pb-3">
          <div>
            <div class="flex items-center gap-2 mb-1">
              ${renderIcon(TicketIcon, 'w-5 h-5 text-red-500')}
              <h3 class="text-lg md:text-xl font-black uppercase tracking-tight text-white">
                ${t('profile.vaultTitle')}
              </h3>
            </div>
            <p class="text-xs text-zinc-400">
              ${t('profile.vaultSubtitle')}
            </p>
          </div>
          <div class="text-xs font-extrabold text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 self-start sm:self-auto">
            ${t('profile.totalPasses')}: <strong class="text-white font-black">${tickets.length}</strong>
          </div>
        </div>

        <!-- Passes Content -->
        ${passVaultContent}
      </div>
    `;

    this.attachHeaderListeners();

    this.container.querySelector('#btn-empty-explore-lineup')?.addEventListener('click', () => {
      if (this.onNavigateToLineup) {
        this.onNavigateToLineup();
      }
    });

    this.container.querySelectorAll('.btn-print-ticket').forEach((btn) => {
      btn.addEventListener('click', () => {
        window.print();
      });
    });
  }

  private renderHeaderHtml(user: User | null, passCount: number): string {
    const displayName =
      user?.email === 'admin@mail.com' ||
      user?.fullName === 'System Administrator' ||
      user?.fullName === 'Administrador del Sistema'
        ? t('header.adminUserDisplayName')
        : user?.fullName || 'Anonymous Member';

    const initials = displayName
      ? displayName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : 'NP';
    const backIcon = renderIcon(ArrowLeft, 'w-4 h-4');
    const mailIcon = renderIcon(Mail, 'w-3.5 h-3.5 text-zinc-400');

    const roleDisplay =
      user?.role === 'ROLE_ADMIN'
        ? t('profile.adminRole')
        : t('profile.memberRole');

    return `
      <div class="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 md:p-7 shadow-2xl relative overflow-hidden">
        <!-- Ambient Glow -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-tr from-red-600 via-red-700 to-zinc-900 border border-red-500/40 flex items-center justify-center text-2xl font-black text-white shadow-xl shrink-0">
              ${initials}
            </div>
            <div>
              <div class="flex flex-wrap items-center gap-2 mb-1">
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-950 text-red-400 border border-red-800">
                  ${renderIcon(ShieldCheck, 'w-3 h-3')}
                  ${t('profile.membershipBadge')}
                </span>
                <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-zinc-900 text-zinc-300 border border-zinc-800 font-mono">
                  ${roleDisplay}
                </span>
              </div>
              <h2 class="text-xl md:text-2xl font-black uppercase tracking-tight text-white">
                ${displayName}
              </h2>
              <div class="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-1">
                <span class="flex items-center gap-1">
                  ${mailIcon}
                  ${user?.email || 'no-email@neonpulse.io'}
                </span>
                <span class="text-zinc-600">•</span>
                <span class="font-bold text-zinc-300">
                  ${t('profile.totalPassesSummary', { count: passCount })}
                </span>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3 self-start md:self-auto">
            <button 
              type="button" 
              id="btn-profile-back-lineup"
              class="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-black uppercase tracking-wider rounded-lg border border-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              ${backIcon}
              <span>${t('profile.backToLineup')}</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private attachHeaderListeners(): void {
    this.container.querySelector('#btn-profile-back-lineup')?.addEventListener('click', () => {
      if (this.onNavigateToLineup) {
        this.onNavigateToLineup();
      }
    });
  }
}
