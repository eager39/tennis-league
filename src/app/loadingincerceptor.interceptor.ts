import { HttpInterceptorFn, HttpContextToken } from "@angular/common/http";
import { inject } from "@angular/core";
import { LoadingService } from "./loadingservice.service";
import { finalize } from "rxjs";

export const SkipLoading = new HttpContextToken<boolean>(() => false);

export const loadingInterceptorFn: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  if (req.context.get(SkipLoading)) {
    return next(req); // Skip loading
  }

  loadingService.loadingOn();
  return next(req).pipe(finalize(() => loadingService.loadingOff()));
};
