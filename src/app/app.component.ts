import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {MatTableModule} from '@angular/material/table'
import { MatButtonModule } from '@angular/material/button';
import { MatCommonModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SidenavComponent } from './sidenav/sidenav.component';
import { SeasonselectorComponent } from "./seasonselector/seasonselector.component";
import { LoadingIndicatorComponent } from "./loading-indicator/loading-indicator.component";




@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatCommonModule, SidenavComponent, SeasonselectorComponent, MatIconModule, CommonModule, MatExpansionModule, MatListModule, MatButtonModule, MatSidenavModule, MatMenuModule, MatToolbarModule, MatTooltipModule, RouterModule, MatCommonModule, SidenavComponent, SeasonselectorComponent, LoadingIndicatorComponent,RouterModule],

  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'tennis-league';
 
}