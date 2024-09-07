import { Component, NgModule } from '@angular/core';
import { MatCommonModule } from '@angular/material/core';
import { SidenavLinkComponent } from "../sidenav-link/sidenav-link.component";


import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterModule, Routes }   from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service'; // Assume AuthService is created to handle auth logic
import { MatFormField } from '@angular/material/form-field';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [MatFormField,MatCommonModule, SidenavLinkComponent,MatIconModule,CommonModule,MatExpansionModule,MatListModule,MatButtonModule,MatSidenavModule,MatMenuModule,MatToolbarModule,MatTooltipModule,RouterModule,MatCommonModule],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css'
})
export class SidenavComponent {
  constructor(public authService: AuthService) { }
  
}
