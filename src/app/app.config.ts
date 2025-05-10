import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';
import { jwtInterceptorFn } from './jwt.interceptor';
import { loadingInterceptorFn } from './loadingincerceptor.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(
      withInterceptors([jwtInterceptorFn, loadingInterceptorFn]),withFetch() // Merging interceptors
    ),
    provideAnimationsAsync(),
    { provide: JWT_OPTIONS, useValue: {} }, // Optional: If JwtModule is needed
    JwtHelperService, // Optional: Only if you're using JwtHelperService explicitly
  ],
};
