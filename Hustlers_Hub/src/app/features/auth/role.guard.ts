import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router
} from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');

    const allowedRoles: string[] = route.data['roles'];

    if (token && allowedRoles.includes(role!)) {
      return true;
    }

    // Redirect to login if not allowed
    return this.router.parseUrl('/login');
  }
}
