import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router
} from '@angular/router';
import { AuthService } from './auth.service'; 

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
  ): boolean | UrlTree {
    const token = this.authService.getToken();
    const role = this.authService.getRole();

    const allowedRoles: string[] = route.data['roles'];

    if (token && role && allowedRoles.includes(role)) {
      return true;
    }

    return this.router.parseUrl('/login');
  }
}
