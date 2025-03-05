import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';
import exp from 'constants';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRoles = route.data['roles'] as string[];
   
    if (this.authService.isAuthenticated() && this.authService.getUserRoles()==expectedRoles) {
      
      return true;
    } else {
      this.router.navigate(['/unauthorized']);
      return false;
    }
  }
}