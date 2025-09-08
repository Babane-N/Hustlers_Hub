// src/app/services/user.service.ts
import { Injectable } from '@angular/core';

export interface UserData {
  userId: string;
  email?: string;
  role?: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userKey = 'user';

  getUser(): UserData | null {
    const userJson = localStorage.getItem(this.userKey);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as UserData;
    } catch {
      return null;
    }
  }

  getUserId(): string | null {
    const user = this.getUser();
    return user?.userId ?? null;
  }

  getUserRole(): string | null {
    const user = this.getUser();
    return user?.role ?? null;
  }

  clearUser() {
    localStorage.removeItem(this.userKey);
  }
}
