import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {MatTableModule} from '@angular/material/table'


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule,CommonModule,MatTableModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'tennis-league';
}
