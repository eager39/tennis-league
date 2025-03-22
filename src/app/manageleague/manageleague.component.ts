import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { AuthService } from '../auth.service';
import { DataService } from '../data.service';
import { SeasonService } from '../season.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-manageleague',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
    ReactiveFormsModule,  // ✅ FIX: Import ReactiveFormsModule
  ],
  templateUrl: './manageleague.component.html',
  providers: [provideNativeDateAdapter()],
  styleUrls: ['./manageleague.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageleagueComponent implements OnInit {
  seasonData: any;
  season!: FormGroup;
  newseason=false;
  editseason=false
  currseasondata:any

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private seasonService: SeasonService,
    public auth: AuthService,
    private dateAdapter: DateAdapter<Date>,
    private _snackBar: MatSnackBar
  ) {
    this.dateAdapter.setLocale('en-GB'); //dd/MM/yyyy
  }

  ngOnInit(): void {

    this.getSeasons()
   

  }
  openSnackBar(message: string, type: string) { 
    this._snackBar.open(message, 'X', {
      duration: 3000
    })
  }
  getSeasons(){
    this.seasonService.getSeasons().subscribe((data) => {
      this.seasonData = data;
      console.log(this.seasonData);
      this.currseasondata = this.seasonData.filter((season: { id: any; }) => season.id == this.seasonService.getCurrentSeason());
      
   

    });
  }

  onSubmit(): void {
    console.log(this.season.value)
    if (this.season.valid && !this.season.untouched) {
    if(this.newseason){
          this.seasonService.createSeason(this.season.value).subscribe(
        (response) => {
          console.log('Season created:', response);
          this.openSnackBar("Sezona uspešno vnešena!", 'X');
         
        },
        (error) => {
          console.error('Error creating season:', error);
        }
      );
    }else{
      this.seasonService.updateSeason(this.season.value).subscribe(
        (response) => {
          console.log('Sezona urejena!:', response);
      
          this.getSeasons()
          this.openSnackBar("Sezona uspešno urejena!", 'X');
          // setTimeout(() => {   this.resultstext=false}, 3000); return this.resultstext;
        },
        (error) => {
          console.error('Error creating season:', error.name);
          this.openSnackBar("Napaka!"+error.name, 'X');
        }
      );
    }
  
    } else {
      console.log('Invalid form');
    }
  }
  newseasonfn(temp:string){
    if(temp=="new"){
      this.season = this.fb.group({
        year: ['', Validators.required],
        start_date: ['', Validators.required],
        end_date: ['', Validators.required],
        status:[]
      });
       this.newseason=true
       this.editseason=false
    }else{
      this.editseason=true
      this.newseason=false
      this.season = this.fb.group({
        year: [this.currseasondata[0].year, Validators.required],
        start_date: [new Date(this.currseasondata[0].start_date*1000) , Validators.required],
        end_date: [new Date(this.currseasondata[0].end_date*1000), Validators.required],
        status:[this.currseasondata[0].status],
        standings_status:[this.currseasondata[0].standings_status],
        promotion:[this.currseasondata[0].promotion_demotion_status]
  
      });
    }
   

  }
}
