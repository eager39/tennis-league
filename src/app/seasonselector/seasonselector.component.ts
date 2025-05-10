import { Component } from '@angular/core';
import { SeasonService } from '../season.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-seasonselector',
  standalone: true,
  imports: [MatFormFieldModule,MatSelectModule,CommonModule],
  templateUrl: './seasonselector.component.html',
  styleUrl: './seasonselector.component.css'
})
export class SeasonselectorComponent {
  // Example seasons
  currentSeason: number=1;
seasons :any[]=[]
  constructor(private seasonService: SeasonService,private router: Router) {
    this.seasonService.currentSeason$.subscribe(season => this.currentSeason = season);
  }
  ngOnInit(): void {
    this.seasonService.getSeasons().subscribe(data=>{
      this.seasons=data
     
    })
    
}


  onSeasonChange(season: number) {
    const currentUrl = this.router.url;
    this.router.navigateByUrl('', { skipLocationChange: false }).then(() => {
      this.router.navigate([""]);
    })
    this.seasonService.setSeason(season);
  }
}
