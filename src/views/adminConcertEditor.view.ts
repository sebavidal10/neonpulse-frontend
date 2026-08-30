import { ConcertService, COVER_IMAGE_PRESETS, type CityDto } from '../services/concert.service';
import { AuthService } from '../services/auth.service';
import { renderIcon } from '../utils/icon.utils';
import { formatDate } from '../utils/date.utils';
import { t } from '../i18n';
import type { Concert, Venue } from '../models';
import {
  ArrowLeft,
  Sparkles,
  MapPin,
  Calendar,
  Ticket,
  Upload,
  Plus,
  CheckCircle2,
  AlertCircle,
  Building,
} from 'lucide';

export class AdminConcertEditorView {
  private container: HTMLElement;
  private onNavigateBack: () => void;
  private editingConcert: Concert | null = null;
  private cities: CityDto[] = [];
  private venues: Venue[] = [];
  private selectedCityId: number = 1;
  private selectedVenueId: number | null = null;
  private selectedCoverUrl: string = COVER_IMAGE_PRESETS[0];
  private isCreatingVenueInline: boolean = false;
  private isSaving: boolean = false;
  private errorMessage: string | null = null;

  constructor(container: HTMLElement, onNavigateBack: () => void) {
    this.container = container;
    this.onNavigateBack = onNavigateBack;
  }

  async render(concert: Concert | null = null): Promise<void> {
    this.editingConcert = concert;
    this.errorMessage = null;
    this.isCreatingVenueInline = false;

    const user = AuthService.getCurrentUser();
    if (!user || user.role !== 'ROLE_ADMIN') {
      this.container.innerHTML = `
        <div class="max-w-md mx-auto my-16 bg-zinc-950 border border-red-900 rounded-2xl p-8 text-center text-zinc-300">
          <h3 class="text-xl font-black text-white uppercase mb-2">${t('editor.accessDeniedTitle')}</h3>
          <p class="text-xs text-zinc-400 mb-4">${t('editor.accessDeniedMsg')}</p>
          <button id="btn-editor-unauth-back" class="px-4 py-2 bg-zinc-900 text-xs font-bold rounded-lg border border-zinc-700 hover:bg-zinc-800 cursor-pointer">
            ${t('editor.backToLineup')}
          </button>
        </div>
      `;
      this.container.querySelector('#btn-editor-unauth-back')?.addEventListener('click', () => this.onNavigateBack());
      return;
    }

    this.renderLoading();

    try {
      this.cities = await ConcertService.getCities();
      
      if (this.editingConcert) {
        this.selectedCityId = this.editingConcert.cityId || (this.cities.length > 0 ? this.cities[0].id : 1);
        this.selectedVenueId = this.editingConcert.venueId || null;
        this.selectedCoverUrl = this.editingConcert.imageUrl || COVER_IMAGE_PRESETS[0];
      } else {
        this.selectedCityId = this.cities.length > 0 ? this.cities[0].id : 1;
        this.selectedVenueId = null;
        this.selectedCoverUrl = COVER_IMAGE_PRESETS[0];
      }

      await this.loadVenuesForCity(this.selectedCityId);
      this.renderForm();
    } catch (err: any) {
      console.error('[NeonPulse] Error initializing editor:', err);
      this.container.innerHTML = `
        <div class="p-8 text-center bg-zinc-950 border border-red-900 rounded-2xl">
          <p class="text-red-400 text-sm font-bold">${err.message || 'Failed to initialize editor'}</p>
          <button id="btn-editor-retry" class="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold">${t('board.retryButton')}</button>
        </div>
      `;
      this.container.querySelector('#btn-editor-retry')?.addEventListener('click', () => this.render(concert));
    }
  }

  private renderLoading(): void {
    this.container.innerHTML = `
      <div class="max-w-6xl mx-auto py-8 animate-pulse space-y-6">
        <div class="h-10 w-48 bg-zinc-900 rounded-lg"></div>
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div class="lg:col-span-7 h-96 bg-zinc-950 rounded-2xl border border-zinc-800"></div>
          <div class="lg:col-span-5 h-96 bg-zinc-950 rounded-2xl border border-zinc-800"></div>
        </div>
      </div>
    `;
  }

  private async loadVenuesForCity(cityId: number): Promise<void> {
    try {
      this.venues = await ConcertService.getVenuesByCity(cityId);
      if (this.selectedVenueId && !this.venues.some((v) => v.id === this.selectedVenueId)) {
        this.selectedVenueId = this.venues.length > 0 ? this.venues[0].id : null;
      } else if (!this.selectedVenueId && this.venues.length > 0) {
        this.selectedVenueId = this.venues[0].id;
      }
    } catch (err) {
      console.error('[NeonPulse] Failed to load venues for city:', cityId, err);
      this.venues = [];
      this.selectedVenueId = null;
    }
  }

  private renderForm(): void {
    const isEdit = this.editingConcert !== null;
    const pageTitle = isEdit
      ? t('editor.editTitle', { band: this.editingConcert?.band || '' })
      : t('editor.createTitle');
    const pageSubtitle = isEdit
      ? t('editor.editSubtitle', { code: this.editingConcert?.code || '#' + this.editingConcert?.id })
      : t('editor.createSubtitle');

    const currentBand = this.editingConcert?.band || '';
    const currentCode = this.editingConcert?.code || `PUNK-${Math.floor(100 + Math.random() * 900)}`;
    const currentDate = this.editingConcert?.date
      ? new Date(this.editingConcert.date).toISOString().substring(0, 10)
      : '2026-11-20';
    const currentPrice = this.editingConcert?.ticketPrice || 35000;
    const currentCapacity = this.editingConcert?.totalTickets || 120;
    const currentStatus = String(this.editingConcert?.status || 'OPEN');

    const errorHtml = this.errorMessage
      ? `
      <div class="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs font-bold flex items-center gap-3 animate-shake">
        ${renderIcon(AlertCircle, 'w-5 h-5 shrink-0 text-red-400')}
        <span>${this.errorMessage}</span>
      </div>
    `
      : '';

    this.container.innerHTML = `
      <div class="max-w-6xl mx-auto py-4 sm:py-8 space-y-8 animate-fadeIn pb-24">
        
        <!-- Navigation Breadcrumb Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
          <div class="flex items-center gap-4">
            <button 
              type="button" 
              id="btn-editor-back" 
              class="p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors flex items-center gap-2 cursor-pointer text-xs font-bold uppercase tracking-wider"
            >
              ${renderIcon(ArrowLeft, 'w-4 h-4')}
              <span>${t('editor.backToLineup')}</span>
            </button>
            <div>
              <h1 class="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                ${pageTitle}
              </h1>
              <p class="text-xs text-zinc-400 font-medium">${pageSubtitle}</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <span class="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[11px] font-mono text-zinc-400">
              ${t('editor.adminMode')}
            </span>
          </div>
        </div>

        ${errorHtml}

        <!-- 2-Column Responsive Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Left Column: Form Controls (7 cols) -->
          <div class="lg:col-span-7 bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <form id="form-concert-editor" class="space-y-6">
              
              <!-- Section 1: Gig Core Details -->
              <div>
                <h3 class="text-xs font-black uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2">
                  ${renderIcon(Sparkles, 'w-3.5 h-3.5')}
                  ${t('editor.section1')}
                </h3>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div class="sm:col-span-2">
                    <label class="block font-black uppercase text-zinc-300 mb-1">${t('editor.bandLabel')}</label>
                    <input 
                      type="text" 
                      id="editor-input-band" 
                      required 
                      value="${currentBand}" 
                      placeholder="${t('editor.bandPlaceholder')}"
                      class="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                    />
                  </div>

                  <div>
                    <label class="block font-black uppercase text-zinc-300 mb-1">${t('editor.codeLabel')}</label>
                    <input 
                      type="text" 
                      id="editor-input-code" 
                      required 
                      value="${currentCode}" 
                      placeholder="${t('editor.codePlaceholder')}"
                      class="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-mono uppercase focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                    />
                  </div>

                  <div>
                    <label class="block font-black uppercase text-zinc-300 mb-1">${t('editor.dateLabel')}</label>
                    <div class="relative">
                      <input 
                        type="date" 
                        id="editor-input-date" 
                        required 
                        value="${currentDate}"
                        class="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section 2: Cascading Location (City -> Venue) -->
              <div class="pt-4 border-t border-zinc-900">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                    ${renderIcon(MapPin, 'w-3.5 h-3.5')}
                    ${t('editor.section2')}
                  </h3>
                  
                  <button 
                    type="button" 
                    id="btn-toggle-inline-venue"
                    class="text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                  >
                    ${renderIcon(Plus, 'w-3 h-3')}
                    <span>${t('editor.newVenueBtn')}</span>
                  </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <!-- City Picker -->
                  <div>
                    <label class="block font-black uppercase text-zinc-300 mb-1">${t('editor.cityLabel')}</label>
                    <select 
                      id="editor-select-city" 
                      class="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all cursor-pointer font-medium"
                    >
                      ${this.cities
                        .map(
                          (c) =>
                            `<option value="${c.id}" ${c.id === this.selectedCityId ? 'selected' : ''}>${c.name} (${c.code})</option>`,
                        )
                        .join('')}
                    </select>
                  </div>

                  <!-- Venue Picker -->
                  <div>
                    <label class="block font-black uppercase text-zinc-300 mb-1">${t('editor.venueLabel')}</label>
                    <select 
                      id="editor-select-venue" 
                      class="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all cursor-pointer font-medium"
                    >
                      ${
                        this.venues.length > 0
                          ? this.venues
                              .map(
                                (v) =>
                                  `<option value="${v.id}" ${v.id === this.selectedVenueId ? 'selected' : ''}>${v.name}${v.address ? ' — ' + v.address : ''}</option>`,
                              )
                              .join('')
                          : `<option value="">${t('editor.noVenues')}</option>`
                      }
                    </select>
                  </div>
                </div>

                <!-- Inline Venue Creation Drawer/Box -->
                <div id="inline-venue-drawer" class="${this.isCreatingVenueInline ? 'block' : 'hidden'} mt-4 p-4 bg-zinc-900/80 border border-red-900/50 rounded-xl space-y-3 animate-fadeIn">
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-black uppercase text-white flex items-center gap-1.5">
                      ${renderIcon(Building, 'w-3.5 h-3.5 text-red-400')}
                      ${t('editor.addVenueTitle')}
                    </span>
                    <button type="button" id="btn-cancel-inline-venue" class="text-zinc-400 hover:text-white font-bold text-[11px] cursor-pointer">${t('editor.cancelBtn')}</button>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div class="sm:col-span-2">
                      <input 
                        type="text" 
                        id="inline-venue-name" 
                        placeholder="${t('editor.venueNamePlaceholder')}"
                        class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <input 
                        type="number" 
                        id="inline-venue-capacity" 
                        placeholder="${t('editor.capacityPlaceholder')}"
                        class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div class="sm:col-span-3 flex gap-2">
                      <input 
                        type="text" 
                        id="inline-venue-address" 
                        placeholder="${t('editor.addressPlaceholder')}"
                        class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                      />
                      <button 
                        type="button" 
                        id="btn-save-inline-venue"
                        class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-[11px] rounded-lg shrink-0 cursor-pointer transition-colors"
                      >
                        ${t('editor.savePlaceBtn')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section 3: Ticketing & Economics -->
              <div class="pt-4 border-t border-zinc-900">
                <h3 class="text-xs font-black uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2">
                  ${renderIcon(Ticket, 'w-3.5 h-3.5')}
                  ${t('editor.section3')}
                </h3>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label class="block font-black uppercase text-zinc-300 mb-1">${t('editor.priceLabel')}</label>
                    <div class="relative">
                      <input 
                        type="number" 
                        id="editor-input-price" 
                        required 
                        min="5000" 
                        step="1000"
                        value="${currentPrice}"
                        class="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl px-4 py-2.5 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block font-black uppercase text-zinc-300 mb-1">${t('editor.capacityLabel')}</label>
                    <input 
                      type="number" 
                      id="editor-input-capacity" 
                      required 
                      min="10" 
                      max="50000"
                      value="${currentCapacity}"
                      class="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                    />
                  </div>

                  <div>
                    <label class="block font-black uppercase text-zinc-300 mb-1">${t('editor.statusLabel')}</label>
                    <select 
                      id="editor-select-status" 
                      class="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all cursor-pointer font-bold"
                    >
                      <option value="OPEN" ${currentStatus === 'OPEN' ? 'selected' : ''}>OPEN</option>
                      <option value="SOLD_OUT" ${currentStatus === 'SOLD_OUT' ? 'selected' : ''}>SOLD_OUT</option>
                      <option value="LIVE" ${currentStatus === 'LIVE' ? 'selected' : ''}>LIVE</option>
                      <option value="CLOSED" ${currentStatus === 'CLOSED' ? 'selected' : ''}>CLOSED</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Section 4: Artwork & Cover Selection -->
              <div class="pt-4 border-t border-zinc-900">
                <h3 class="text-xs font-black uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2">
                  ${renderIcon(Upload, 'w-3.5 h-3.5')}
                  ${t('editor.section4')}
                </h3>

                <!-- Custom Upload Box -->
                <div class="mb-4">
                  <label class="block font-black uppercase text-zinc-300 mb-1.5 text-xs">${t('editor.uploadArtworkLabel')}</label>
                  <div class="flex items-center gap-3">
                    <label class="flex-1 border-2 border-dashed border-zinc-800 hover:border-red-600/80 rounded-xl p-4 text-center cursor-pointer transition-all bg-zinc-900/40 group">
                      <input type="file" id="editor-file-upload" accept="image/*" class="hidden" />
                      <div class="flex items-center justify-center gap-2 text-zinc-400 group-hover:text-red-400 text-xs font-medium">
                        ${renderIcon(Upload, 'w-4 h-4')}
                        <span>${t('editor.uploadArtworkHint')}</span>
                      </div>
                    </label>
                  </div>
                </div>

                <!-- Presets Grid -->
                <div>
                  <label class="block font-black uppercase text-zinc-300 mb-2 text-xs">${t('editor.pickPresetLabel')}</label>
                  <div class="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                    ${COVER_IMAGE_PRESETS.map((preset) => {
                      const isSelected = preset === this.selectedCoverUrl;
                      return `
                        <label class="relative cursor-pointer group">
                          <input type="radio" name="editor-cover-preset" value="${preset}" ${isSelected ? 'checked' : ''} class="hidden peer" />
                          <img 
                            src="${preset}" 
                            alt="Preset artwork"
                            class="w-full h-14 object-cover rounded-xl border-2 ${
                              isSelected ? 'border-red-500 ring-2 ring-red-500/40 scale-105' : 'border-zinc-800 hover:border-zinc-600'
                            } transition-all shadow-md"
                            onerror="this.src='/images/punk1.png'"
                          />
                        </label>
                      `;
                    }).join('')}
                  </div>
                </div>
              </div>

              <!-- Form Submit Actions -->
              <div class="pt-6 border-t border-zinc-900 flex items-center justify-end gap-4">
                <button 
                  type="button" 
                  id="btn-editor-cancel"
                  class="px-5 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-black uppercase tracking-wider rounded-xl border border-zinc-800 transition-colors cursor-pointer"
                >
                  ${t('editor.cancelBtn')}
                </button>
                <button 
                  type="submit" 
                  id="btn-editor-submit"
                  ${this.isSaving ? 'disabled' : ''}
                  class="px-7 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all cursor-pointer flex items-center gap-2"
                >
                  ${this.isSaving ? '<span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>' : renderIcon(CheckCircle2, 'w-4 h-4')}
                  <span>${isEdit ? t('editor.saveChangesBtn') : t('editor.publishGigBtn')}</span>
                </button>
              </div>

            </form>
          </div>

          <!-- Right Column: Real-Time Live Cyber Preview (5 cols) -->
          <div class="lg:col-span-5 sticky top-24 space-y-4">
            <div class="flex items-center justify-between px-1">
              <span class="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                ${t('editor.livePreviewTitle')}
              </span>
              <span class="text-[10px] text-zinc-500 font-mono">${t('editor.livePreviewSubtitle')}</span>
            </div>

            <!-- Preview Card -->
            <div class="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl group transition-all">
              <div class="relative aspect-[16/10] overflow-hidden bg-zinc-900">
                <img 
                  id="preview-card-image"
                  src="${this.selectedCoverUrl}" 
                  alt="Gig cover preview" 
                  class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  onerror="this.src='/images/punk1.png'"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
                
                <div class="absolute top-3 left-3 flex items-center gap-2">
                  <span id="preview-card-status" class="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800">
                    ${currentStatus}
                  </span>
                  <span id="preview-card-code" class="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-black/70 text-zinc-300 border border-zinc-800 backdrop-blur-sm">
                    ${currentCode}
                  </span>
                </div>

                <div class="absolute bottom-3 left-4 right-4">
                  <h4 id="preview-card-band" class="text-xl font-black text-white uppercase tracking-tight drop-shadow-md">
                    ${currentBand || 'Band Name Preview'}
                  </h4>
                </div>
              </div>

              <div class="p-5 space-y-4 text-xs">
                <div class="space-y-2 text-zinc-400">
                  <div class="flex items-center gap-2">
                    ${renderIcon(MapPin, 'w-3.5 h-3.5 text-red-500 shrink-0')}
                    <span id="preview-card-location" class="truncate font-medium text-zinc-200">
                      ${this.getSelectedVenueDisplay()}
                    </span>
                  </div>

                  <div class="flex items-center gap-2">
                    ${renderIcon(Calendar, 'w-3.5 h-3.5 text-zinc-500 shrink-0')}
                    <span id="preview-card-date" class="font-medium text-zinc-300">
                      ${formatDate(new Date(currentDate))} • 20:00 EST
                    </span>
                  </div>
                </div>

                <div class="pt-3 border-t border-zinc-900 flex items-center justify-between">
                  <div>
                    <span class="text-[10px] text-zinc-500 uppercase font-black block">${t('editor.standardPass')}</span>
                    <span id="preview-card-price" class="text-lg font-black text-emerald-400">
                      $${Number(currentPrice).toLocaleString()}
                    </span>
                  </div>

                  <div class="text-right">
                    <span class="text-[10px] text-zinc-500 uppercase font-black block">${t('admin.tableHeaders.capacity')}</span>
                    <span id="preview-card-capacity" class="text-xs font-bold text-zinc-300 font-mono">
                      ${t('editor.passesCount', { count: currentCapacity })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    `;

    this.attachEventListeners();
  }

  private getSelectedVenueDisplay(): string {
    const selectedCity = this.cities.find((c) => c.id === this.selectedCityId);
    const selectedVenue = this.venues.find((v) => v.id === this.selectedVenueId);

    if (selectedVenue) {
      return `${selectedVenue.name} (${selectedCity?.name || ''})`;
    }
    return selectedCity ? selectedCity.name : t('editor.undergroundVenueFallback');
  }

  private attachEventListeners(): void {
    // Back navigation
    this.container.querySelector('#btn-editor-back')?.addEventListener('click', () => this.onNavigateBack());
    this.container.querySelector('#btn-editor-cancel')?.addEventListener('click', () => this.onNavigateBack());

    // Live update inputs for preview
    const bandInput = this.container.querySelector<HTMLInputElement>('#editor-input-band');
    const codeInput = this.container.querySelector<HTMLInputElement>('#editor-input-code');
    const dateInput = this.container.querySelector<HTMLInputElement>('#editor-input-date');
    const priceInput = this.container.querySelector<HTMLInputElement>('#editor-input-price');
    const capacityInput = this.container.querySelector<HTMLInputElement>('#editor-input-capacity');
    const statusSelect = this.container.querySelector<HTMLSelectElement>('#editor-select-status');
    const citySelect = this.container.querySelector<HTMLSelectElement>('#editor-select-city');
    const venueSelect = this.container.querySelector<HTMLSelectElement>('#editor-select-venue');

    bandInput?.addEventListener('input', () => {
      const el = this.container.querySelector('#preview-card-band');
      if (el) el.textContent = bandInput.value.trim() || 'Band Name Preview';
    });

    codeInput?.addEventListener('input', () => {
      const el = this.container.querySelector('#preview-card-code');
      if (el) el.textContent = codeInput.value.trim().toUpperCase() || 'PUNK-000';
    });

    dateInput?.addEventListener('change', () => {
      const el = this.container.querySelector('#preview-card-date');
      if (el && dateInput.value) {
        el.textContent = `${formatDate(new Date(dateInput.value))} • 20:00 EST`;
      }
    });

    priceInput?.addEventListener('input', () => {
      const el = this.container.querySelector('#preview-card-price');
      if (el) el.textContent = `$${Number(priceInput.value || 0).toLocaleString()}`;
    });

    capacityInput?.addEventListener('input', () => {
      const el = this.container.querySelector('#preview-card-capacity');
      if (el) el.textContent = t('editor.passesCount', { count: Number(capacityInput.value || 0) });
    });

    statusSelect?.addEventListener('change', () => {
      const el = this.container.querySelector('#preview-card-status');
      if (el) el.textContent = statusSelect.value;
    });

    // Cascading City change
    citySelect?.addEventListener('change', async () => {
      const newCityId = parseInt(citySelect.value, 10);
      this.selectedCityId = newCityId;
      await this.loadVenuesForCity(newCityId);
      this.updateVenueSelectOptions();
      this.updateLiveLocationPreview();
    });

    // Venue change
    venueSelect?.addEventListener('change', () => {
      this.selectedVenueId = venueSelect.value ? parseInt(venueSelect.value, 10) : null;
      this.updateLiveLocationPreview();
    });

    // Toggle inline venue creation drawer
    this.container.querySelector('#btn-toggle-inline-venue')?.addEventListener('click', () => {
      this.isCreatingVenueInline = !this.isCreatingVenueInline;
      const drawer = this.container.querySelector('#inline-venue-drawer');
      if (drawer) drawer.classList.toggle('hidden', !this.isCreatingVenueInline);
    });

    this.container.querySelector('#btn-cancel-inline-venue')?.addEventListener('click', () => {
      this.isCreatingVenueInline = false;
      const drawer = this.container.querySelector('#inline-venue-drawer');
      if (drawer) drawer.classList.add('hidden');
    });

    // Save inline venue
    this.container.querySelector('#btn-save-inline-venue')?.addEventListener('click', async () => {
      const nameInput = this.container.querySelector<HTMLInputElement>('#inline-venue-name');
      const addressInput = this.container.querySelector<HTMLInputElement>('#inline-venue-address');
      const capInput = this.container.querySelector<HTMLInputElement>('#inline-venue-capacity');

      const name = nameInput?.value.trim();
      if (!name) {
        alert('Please provide a venue name');
        return;
      }

      const address = addressInput?.value.trim() || undefined;
      const capacity = capInput?.value ? parseInt(capInput.value, 10) : undefined;

      try {
        const createdVenue = await ConcertService.createVenue({
          cityId: this.selectedCityId,
          name,
          address,
          capacity,
        });

        await this.loadVenuesForCity(this.selectedCityId);
        this.selectedVenueId = createdVenue.id;
        this.isCreatingVenueInline = false;
        this.updateVenueSelectOptions();
        this.updateLiveLocationPreview();

        const drawer = this.container.querySelector('#inline-venue-drawer');
        if (drawer) drawer.classList.add('hidden');
      } catch (err: any) {
        alert(err.message || 'Failed to create venue');
      }
    });

    // Cover preset radios
    this.container.querySelectorAll('input[name="editor-cover-preset"]').forEach((radio) => {
      radio.addEventListener('change', (e) => {
        const val = (e.target as HTMLInputElement).value;
        this.selectedCoverUrl = val;
        const img = this.container.querySelector<HTMLImageElement>('#preview-card-image');
        if (img) img.src = val;
      });
    });

    // File upload
    const fileUpload = this.container.querySelector<HTMLInputElement>('#editor-file-upload');
    fileUpload?.addEventListener('change', async () => {
      if (fileUpload.files && fileUpload.files[0]) {
        const file = fileUpload.files[0];
        try {
          const uploadedUrl = await ConcertService.uploadCoverImage(file);
          this.selectedCoverUrl = uploadedUrl;
          const img = this.container.querySelector<HTMLImageElement>('#preview-card-image');
          if (img) img.src = uploadedUrl;
        } catch (err: any) {
          alert('Failed to upload image: ' + (err.message || 'Unknown error'));
        }
      }
    });

    // Form submit
    const form = this.container.querySelector<HTMLFormElement>('#form-concert-editor');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      this.isSaving = true;
      this.errorMessage = null;
      this.updateSubmitButtonState();

      const band = (this.container.querySelector('#editor-input-band') as HTMLInputElement).value.trim();
      const code = (this.container.querySelector('#editor-input-code') as HTMLInputElement).value.trim().toUpperCase();
      const date = (this.container.querySelector('#editor-input-date') as HTMLInputElement).value;
      const price = parseInt((this.container.querySelector('#editor-input-price') as HTMLInputElement).value, 10);
      const capacity = parseInt((this.container.querySelector('#editor-input-capacity') as HTMLInputElement).value, 10);
      const status = (this.container.querySelector('#editor-select-status') as HTMLSelectElement).value;
      const cityId = parseInt((this.container.querySelector('#editor-select-city') as HTMLSelectElement).value, 10);
      const venueId = this.selectedVenueId || undefined;

      try {
        if (this.editingConcert) {
          await ConcertService.updateConcert(this.editingConcert.id, {
            band,
            code,
            date,
            ticketPrice: price,
            totalTickets: capacity,
            status,
            cityId,
            venueId,
            imageUrl: this.selectedCoverUrl,
          });
        } else {
          await ConcertService.createConcert({
            band,
            code,
            date,
            ticketPrice: price,
            totalTickets: capacity,
            status,
            cityId,
            venueId,
            imageUrl: this.selectedCoverUrl,
          });
        }

        this.onNavigateBack();
      } catch (err: any) {
        console.error('[NeonPulse] Failed to save gig:', err);
        this.errorMessage = err.message || 'Failed to save concert gig';
        this.isSaving = false;
        this.renderForm();
      }
    });
  }

  private updateVenueSelectOptions(): void {
    const venueSelect = this.container.querySelector<HTMLSelectElement>('#editor-select-venue');
    if (!venueSelect) return;

    if (this.venues.length > 0) {
      venueSelect.innerHTML = this.venues
        .map(
          (v) =>
            `<option value="${v.id}" ${v.id === this.selectedVenueId ? 'selected' : ''}>${v.name}${v.address ? ' — ' + v.address : ''}</option>`,
        )
        .join('');
      if (!this.selectedVenueId) {
        this.selectedVenueId = this.venues[0].id;
      }
    } else {
      venueSelect.innerHTML = `<option value="">${t('editor.noVenues')}</option>`;
      this.selectedVenueId = null;
    }
  }

  private updateLiveLocationPreview(): void {
    const locationEl = this.container.querySelector('#preview-card-location');
    if (locationEl) {
      locationEl.textContent = this.getSelectedVenueDisplay();
    }
  }

  private updateSubmitButtonState(): void {
    const btn = this.container.querySelector<HTMLButtonElement>('#btn-editor-submit');
    if (btn) {
      btn.disabled = this.isSaving;
      btn.innerHTML = this.isSaving
        ? `<span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span><span>${t('editor.savingText')}</span>`
        : `<span>${this.editingConcert ? t('editor.saveChangesBtn') : t('editor.publishGigBtn')}</span>`;
    }
  }
}
