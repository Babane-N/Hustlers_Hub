import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ActiveService {
  id: string;
  businessName?: string;
  isPremium?: boolean;
  businessType?: string;
  isApproved?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ActiveServiceContextService {

  private readonly STORAGE_KEY = 'activeService';

  private serviceSubject = new BehaviorSubject<ActiveService | null>(null);
  service$ = this.serviceSubject.asObservable();

  constructor() {
    this.restoreFromStorage();
  }

  // ============================
  // SET ACTIVE BUSINESS
  // ============================
  setActiveBusiness(service: ActiveService): void {
    this.serviceSubject.next(service);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(service));
  }

  // ============================
  // GET CURRENT VALUE
  // ============================
  getActiveBusiness(): ActiveService | null {
    return this.serviceSubject.value;
  }

  getActiveBusinessId(): string | null {
    return this.serviceSubject.value?.id ?? null;
  }

  isPremium(): boolean {
    return this.serviceSubject.value?.isPremium ?? false;
  }

  // ============================
  // CLEAR CONTEXT
  // ============================
  clear(): void {
    this.serviceSubject.next(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // ============================
  // RESTORE SAFELY
  // ============================
  private restoreFromStorage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);

    if (!stored) return;

    try {
      const parsed: ActiveService = JSON.parse(stored);

      // ensure proper async hydration (prevents Angular race issues)
      setTimeout(() => {
        this.serviceSubject.next(parsed);
      });

    } catch (err) {
      console.error('Failed to restore active business context', err);
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }
}
