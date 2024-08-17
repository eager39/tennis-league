import { NgModule } from '@angular/core';
import { JwtHelperService, JwtModule } from '@auth0/angular-jwt';
import { AuthService } from './auth.service';
import { RoleGuard } from './auth.guard';

export function tokenGetter() {
  return localStorage.getItem('access_token');
}

@NgModule({
  imports: [
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: ['localhost:3000'], // Your backend API domain
        disallowedRoutes: ['localhost:3000/api/login', 'localhost:3000/api/register']
      }
    }),
  ],
  providers: [AuthService, RoleGuard,JwtHelperService],
})
export class AuthModule { }