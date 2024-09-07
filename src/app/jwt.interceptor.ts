import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from './auth.service';
import { SeasonService } from './season.service';

export const jwtInterceptorFn: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const seasonService = inject(SeasonService);

  const token = authService.getToken();
  const currentSeason = seasonService.getCurrentSeason();

  let clonedReq = req;

  // Add Authorization header if token is available
  if (token) {
    clonedReq = clonedReq.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Add season as a query parameter if available
  if (currentSeason) {
    clonedReq = clonedReq.clone({
      setHeaders: {
        season: currentSeason.toString()
      }
    });
  }

  return next(clonedReq);
};