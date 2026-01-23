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
  // SET ACTIVE SERVICE
  // ============================

  setActiveBusiness(service: ActiveService): void {
    this.serviceSubject.next(service);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(service));
  }

  // ============================
  // GETTERS (SYNC)
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
  // RESTORE ON REFRESH
  // ============================

  private restoreFromStorage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        this.serviceSubject.next(JSON.parse(stored));
      } catch {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
  }
}
