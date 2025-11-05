import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router
} from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, of } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    const allowedRoles: string[] = route.data['roles'];

    // Try to get the role from memory first
    const role = this.authService.getRole();

    if (role) {
      return of(allowedRoles.includes(role) ? true : this.router.parseUrl('/login'));
    }

    // If role is not yet loaded (e.g., page refresh), fetch from backend
    return this.authService.loadUserInfo().pipe(
      map(user => {
        if (user && allowedRoles.includes(user.userType)) {
          return true;
        }
        return this.router.parseUrl('/login');
      }),
      catchError(() => of(this.router.parseUrl('/login')))
    );
  }
}
