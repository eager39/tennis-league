import { AsyncPipe, NgIf, NgTemplateOutlet } from '@angular/common';
import { Component, ContentChild, Input, OnInit, TemplateRef } from '@angular/core';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { RouteConfigLoadStart, RouteConfigLoadEnd, RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoadingService } from '../loadingservice.service';

@Component({
  selector: "loading-indicator",
  templateUrl: "./loading-indicator.component.html",
  styleUrls: ["./loading-indicator.component.scss"],
  imports: [MatProgressSpinnerModule, AsyncPipe, NgIf, NgTemplateOutlet,RouterModule],
  standalone: true,
})
export class LoadingIndicatorComponent implements OnInit {

  loading$: Observable<boolean>;

  @Input()
  detectRouteTransitions = false;

  @ContentChild("loading")
  customLoadingIndicator: TemplateRef<any> | null = null;

  constructor(
  private loadingService: LoadingService, 
  private router: Router) {
    this.loading$ = this.loadingService.loading$;
  }

  ngOnInit() {
    if (this.detectRouteTransitions) {
      this.router.events
        .pipe(
          tap((event) => {
            if (event instanceof RouteConfigLoadStart) {
              this.loadingService.loadingOn();
            } else if (event instanceof RouteConfigLoadEnd) {
              this.loadingService.loadingOff();
            }
          })
        )
        .subscribe();
    }
  }
}