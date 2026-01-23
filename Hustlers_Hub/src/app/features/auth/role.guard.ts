import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot,RouterStateSnapshot,Router} from '@angular/router';
import { AuthService } from './auth.service';
import { ActiveServiceContextService } from '../../core/active-service-context.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService,
    private activeServiceContext: ActiveServiceContextService
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {

    // 1️⃣ Must be logged in
    const token = this.authService.getToken();
    const role = this.authService.getRole();

    if (!token || !role) {
      this.router.navigate(['/login']);
      return false;
    }

    // 2️⃣ Must have correct role
    const allowedRoles: string[] = route.data['roles'] ?? [];

    if (allowedRoles.length && !allowedRoles.includes(role)) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    // 3️⃣ Service-based routes require active service
    const requiresService = route.data['requiresService'] === true;

    if (requiresService && !this.activeServiceContext.getActiveBusinessId()) {
      this.router.navigate(['/switch-service']);
      return false;
    }

    return true;
  }
}
