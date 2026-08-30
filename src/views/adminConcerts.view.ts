import { ConcertService } from '../services/concert.service';
import { AuthService } from '../services/auth.service';
import { renderIcon } from '../utils/icon.utils';
import { formatDate } from '../utils/date.utils';
import { t } from '../i18n';
import type { Concert } from '../models';
import {
  ShieldAlert,
  Plus,
  ArrowLeft,
  Edit2,
  Trash2,
  AlertCircle,
  X,
} from 'lucide';

export class AdminConcertsView {
  private container: HTMLElement;
  private onNavigateToLineup?: () => void;
  private onNavigateToEditor?: (concert?: Concert) => void;
  private concerts: Concert[] = [];
  private noticeMessage: { text: string; isError: boolean } | null = null;

  constructor(
    container: HTMLElement,
    onNavigateToLineup?: () => void,
    onNavigateToEditor?: (concert?: Concert) => void,
  ) {
    this.container = container;
    this.onNavigateToLineup = onNavigateToLineup;
    this.onNavigateToEditor = onNavigateToEditor;
  }

  async render(): Promise<void> {
    const user = AuthService.getCurrentUser();
    if (!user || user.role !== 'ROLE_ADMIN') {
      this.renderUnauthorized();
      return;
    }

    this.renderLoading();

    try {
      this.concerts = await ConcertService.getAllConcerts(0);
      this.renderTable();
    } catch (err: any) {
      console.error('[NeonPulse] Failed to load admin gigs:', err);
      this.renderError(err.message || t('admin.loadError'));
    }
  }

  private renderUnauthorized(): void {
    this.container.innerHTML = `
      <section class="max-w-md mx-auto my-16 bg-zinc-950 border border-red-900/80 rounded-2xl p-8 text-center flex flex-col items-center gap-4 shadow-2xl animate-fadeIn">
        <div class="p-4 bg-red-950/60 border border-red-800 rounded-full text-red-500">
          ${renderIcon(ShieldAlert, 'w-10 h-10')}
        </div>
        <h2 class="text-xl font-black uppercase text-white tracking-tight">Access Restricted</h2>
        <p class="text-xs text-zinc-400">
          Administrator privileges are required to access this section. Please sign in as an administrator.
        </p>
        <button 
          type="button" 
          id="btn-admin-unauth-back"
          class="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-black uppercase tracking-wider rounded-lg border border-zinc-700 transition-colors cursor-pointer"
        >
          ${t('admin.backToLineup')}
        </button>
      </section>
    `;

    this.container.querySelector('#btn-admin-unauth-back')?.addEventListener('click', () => {
      if (this.onNavigateToLineup) this.onNavigateToLineup();
    });
  }

  private renderLoading(): void {
    this.container.innerHTML = `
      <div class="space-y-4 animate-pulse pb-10">
        <div class="h-10 w-64 bg-zinc-900 rounded-lg"></div>
        <div class="h-64 bg-zinc-950 border border-zinc-800 rounded-2xl"></div>
      </div>
    `;
  }

  private renderError(message: string): void {
    this.container.innerHTML = `
      <section class="bg-zinc-950 border border-red-900 rounded-2xl p-8 text-center flex flex-col items-center gap-3">
        ${renderIcon(AlertCircle, 'w-10 h-10 text-red-500')}
        <h3 class="text-lg font-black text-white uppercase">${t('admin.loadError')}</h3>
        <p class="text-xs text-zinc-400 max-w-md">${message}</p>
        <button 
          type="button" 
          id="btn-admin-retry"
          class="mt-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
        >
          ${t('board.retryButton')}
        </button>
      </section>
    `;

    this.container.querySelector('#btn-admin-retry')?.addEventListener('click', () => this.render());
  }

  private renderTable(): void {
    const noticeHtml = this.noticeMessage
      ? `
      <div class="p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
        this.noticeMessage.isError
          ? 'bg-red-950/80 border-red-800 text-red-300'
          : 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
      }">
        <span>${this.noticeMessage.text}</span>
        <button type="button" id="btn-admin-dismiss-notice" class="text-zinc-400 hover:text-white cursor-pointer">
          ${renderIcon(X, 'w-3.5 h-3.5')}
        </button>
      </div>
    `
      : '';

    this.container.innerHTML = `
      <section class="space-y-6 animate-fadeIn pb-16">
        <!-- Top Controls -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              <h2 class="text-2xl font-black uppercase tracking-tight text-white">${t('admin.title')}</h2>
            </div>
            <p class="text-xs text-zinc-400">${t('admin.subtitle')}</p>
          </div>

          <div class="flex items-center gap-3">
            <button 
              type="button" 
              id="btn-admin-create-gig"
              class="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black uppercase tracking-wider rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              ${renderIcon(Plus, 'w-4 h-4')}
              <span>${t('admin.createNewGig')}</span>
            </button>

            <button 
              type="button" 
              id="btn-admin-back-lineup"
              class="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-black uppercase tracking-wider rounded-lg border border-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              ${renderIcon(ArrowLeft, 'w-3.5 h-3.5')}
              <span>${t('admin.backToLineup')}</span>
            </button>
          </div>
        </div>

        ${noticeHtml}

        <!-- Concerts Table -->
        <div class="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-zinc-300">
              <thead class="bg-zinc-900 text-[10px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th class="py-3 px-4">${t('admin.tableHeaders.cover')}</th>
                  <th class="py-3 px-4">${t('admin.tableHeaders.gigInfo')}</th>
                  <th class="py-3 px-4">${t('admin.tableHeaders.city')}</th>
                  <th class="py-3 px-4">${t('admin.tableHeaders.date')}</th>
                  <th class="py-3 px-4">${t('admin.tableHeaders.price')}</th>
                  <th class="py-3 px-4">${t('admin.tableHeaders.capacity')}</th>
                  <th class="py-3 px-4">${t('admin.tableHeaders.status')}</th>
                  <th class="py-3 px-4 text-right">${t('admin.tableHeaders.actions')}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-900">
                ${this.concerts
                  .map((c) => {
                    const formattedDate = formatDate(c.date);
                    const cover = c.imageUrl || '/images/punk1.png';
                    const isSoldOut = c.availableTickets === 0 || c.status === 'SOLD_OUT';
                    const statusClass = isSoldOut
                      ? 'bg-zinc-900 text-zinc-400 border-zinc-700'
                      : c.status === 'LIVE'
                      ? 'bg-red-950 text-red-400 border-red-800 animate-pulse'
                      : 'bg-emerald-950 text-emerald-400 border-emerald-800';

                    const locationText = c.venueName
                      ? `<div class="font-bold text-zinc-200">${c.venueName}</div><div class="text-[10px] text-zinc-500">${c.cityName || ''}</div>`
                      : `<div class="text-zinc-400">${c.cityName || t('editor.undergroundVenueFallback')}</div>`;

                    return `
                      <tr class="hover:bg-zinc-900/50 transition-colors">
                        <td class="py-3 px-4">
                          <img 
                            src="${cover}" 
                            alt="${c.band}" 
                            class="w-12 h-12 rounded-lg object-cover border border-zinc-800 shrink-0 shadow"
                            onerror="this.src='/images/punk1.png'"
                          />
                        </td>
                        <td class="py-3 px-4 font-bold text-white">
                          <div class="font-black">${c.band}</div>
                          <div class="text-[10px] text-red-500 font-mono">${c.code || '#' + c.id}</div>
                        </td>
                        <td class="py-3 px-4">${locationText}</td>
                        <td class="py-3 px-4 text-zinc-400">${formattedDate}</td>
                        <td class="py-3 px-4 font-black text-emerald-400">$${c.ticketPrice?.toLocaleString()}</td>
                        <td class="py-3 px-4">
                          <span class="font-bold text-zinc-200">${c.availableTickets}</span>
                          <span class="text-zinc-500">/ ${c.totalTickets}</span>
                        </td>
                        <td class="py-3 px-4">
                          <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${statusClass}">
                            ${c.status}
                          </span>
                        </td>
                        <td class="py-3 px-4 text-right">
                          <div class="inline-flex items-center gap-1.5">
                            <button 
                              type="button" 
                              class="btn-admin-edit p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg border border-zinc-800 transition-colors cursor-pointer"
                              data-id="${c.id}"
                              title="${t('admin.editGig')}"
                            >
                              ${renderIcon(Edit2, 'w-3.5 h-3.5')}
                            </button>
                            <button 
                              type="button" 
                              class="btn-admin-delete p-2 bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-400 rounded-lg border border-zinc-800 hover:border-red-800 transition-colors cursor-pointer"
                              data-id="${c.id}"
                              title="${t('admin.deleteGig')}"
                            >
                              ${renderIcon(Trash2, 'w-3.5 h-3.5')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    `;
                  })
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    `;

    this.attachTableListeners();
  }

  private attachTableListeners(): void {
    this.container.querySelector('#btn-admin-create-gig')?.addEventListener('click', () => {
      if (this.onNavigateToEditor) {
        this.onNavigateToEditor();
      }
    });

    this.container.querySelector('#btn-admin-back-lineup')?.addEventListener('click', () => {
      if (this.onNavigateToLineup) this.onNavigateToLineup();
    });

    this.container.querySelector('#btn-admin-dismiss-notice')?.addEventListener('click', () => {
      this.noticeMessage = null;
      this.renderTable();
    });

    // Edit action -> Navigates to full-page editor
    this.container.querySelectorAll('.btn-admin-edit').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const found = this.concerts.find((c) => c.id === id);
        if (found && this.onNavigateToEditor) {
          this.onNavigateToEditor(found);
        }
      });
    });

    // Delete action
    this.container.querySelectorAll('.btn-admin-delete').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const found = this.concerts.find((c) => c.id === id);
        if (!found) return;

        const confirmMsg = t('admin.deleteConfirm', { band: found.band, code: found.code || '#' + found.id });
        if (window.confirm(confirmMsg)) {
          try {
            await ConcertService.deleteConcert(found.id);
            this.noticeMessage = { text: t('admin.deleteSuccess'), isError: false };
            await this.render();
          } catch (err: any) {
            console.error('[NeonPulse] Failed to delete gig:', err);
            this.noticeMessage = { text: err.message || t('admin.actionError'), isError: true };
            this.renderTable();
          }
        }
      });
    });
  }
}
