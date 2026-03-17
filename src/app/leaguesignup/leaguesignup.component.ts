import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { DataService } from '../data.service';
import { AuthService } from '../auth.service';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { LeaguesService } from '../league.service';

@Component({
  selector: 'app-leaguesignup',
  standalone: true,
  imports: [MatButtonModule,MatFormFieldModule,MatSelectModule,CommonModule,MatCardModule,ReactiveFormsModule,MatFormFieldModule,MatCheckboxModule,MatOptionModule],
  templateUrl: './leaguesignup.component.html',
  styleUrl: './leaguesignup.component.css'
})
export class LeaguesignupComponent {
  signUpForm!: FormGroup;
showform=true
onlyphone=false
dropdownOpen: any=false;
success: any=false;
fail: any;
  constructor(private fb: FormBuilder,private dataService: DataService,public auth:AuthService,private leagueService: LeaguesService) {}

  ngOnInit(): void {
    if(this.auth.isAuthenticated()){
      this.ifalreadyinleague();
    }else{
      this.showform=true
    }

    this.signUpForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      gender: ['', Validators.required],
      createAccount: [false],
      password: [''],
      privacyAccepted:['',Validators.required]
    });

    // Toggle password field validation based on the checkbox
    this.signUpForm.get('createAccount')?.valueChanges.subscribe((checked) => {
      if (checked) {
        this.signUpForm.get('password')?.setValidators([Validators.required]);
      } else {
        this.signUpForm.get('password')?.clearValidators();
      }
      this.signUpForm.get('password')?.updateValueAndValidity();
    });
  }

  onSubmit(): void {
    if (this.signUpForm.valid) {
      this.dataService.registerForLeague(this.signUpForm.value).subscribe({
        next: (data: any) => {
         if(data){
          this.success=true
          this.showform=false
          //alert("Uspešno ste se prijavili v ligo")
         }
         
        },
        error: (error: any) => {
          this.success=false
          this.fail=true
          this.showform=false
          console.error('Error fetching leagues:', error); // Error callback
        },
      })
     
    } else {
      console.error('Form is invalid');
    }
  }
  click:any=false
  clicked(){
this.click=true
  }
  register(id:any){
    
    this.dataService.registerForLeagueRegisteredPlayers(id,this.signUpForm.value).subscribe({
      next: (data: any) => {
       if(data){
        alert("Uspešno ste se prijavili v ligo")
       }
      },
      error: (error: any) => {
        console.error('Error fetching leagues:', error); // Error callback
      },
    })
  }
  ifalreadyinleague(){
   
    this.leagueService.ifalreadyinleague(this.auth.getUserId()).subscribe({
      next: (data: any) => {
       if(data.message=="true" ){
        this.showform=false
        this.onlyphone=false
       }else if(data.message=="false" && data.message1=="true"){
        this.showform=true
        this.onlyphone=true 
        this.signUpForm.get('fullName')?.clearValidators();
      this.signUpForm.get('fullName')?.updateValueAndValidity();
      this.signUpForm.get('email')?.clearValidators();
      this.signUpForm.get('email')?.updateValueAndValidity();
      this.signUpForm.get('gender')?.clearValidators();
      this.signUpForm.get('gender')?.updateValueAndValidity();
       }else{
        this.showform=true
        this.onlyphone=false
       }
      
      },
      error: (error: any) => {
        console.error('Error fetching leagues:', error); // Error callback
      },
    })
  }



toggleDropdown(){
  this.dropdownOpen = !this.dropdownOpen;
  this.signUpForm.get('gender')?.markAsTouched();
   this.signUpForm.get('gender')?.invalid;
 
}

closeDropdown(){
  setTimeout(() => this.dropdownOpen = false, 100);
}

selectGender(value: string){
  this.signUpForm.get('gender')?.setValue(value);
  this.signUpForm.get('gender')?.markAsTouched();
    this.signUpForm.get('gender')?.valid;
  this.dropdownOpen = false;
}

getGenderLabel(){

  const value = this.signUpForm.get('gender')?.value;

  if(value === 'm') return 'Moški';
  if(value === 'ž') return 'Ženski';
  if(value === 'n') return 'Ne želim povedati';

  return '';
}
resetForm(){
  this.signUpForm.reset
  this.showform=true
  this.success=false
}


}
