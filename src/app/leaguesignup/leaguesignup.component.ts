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
@Component({
  selector: 'app-leaguesignup',
  standalone: true,
  imports: [MatFormFieldModule,MatSelectModule,CommonModule,MatCardModule,ReactiveFormsModule,MatFormFieldModule,MatCheckboxModule,MatOptionModule],
  templateUrl: './leaguesignup.component.html',
  styleUrl: './leaguesignup.component.css'
})
export class LeaguesignupComponent {
  signUpForm!: FormGroup;

  constructor(private fb: FormBuilder,private dataService: DataService,public auth:AuthService) {}

  ngOnInit(): void {
    this.signUpForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      gender: ['', Validators.required],
      createAccount: [false],
      password: ['']
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
          alert("Uspešno ste se prijavili v ligo")
         }
        },
        error: (error: any) => {
          console.error('Error fetching leagues:', error); // Error callback
        },
      })
      console.log('Form Submitted', this.signUpForm.value);
    } else {
      console.error('Form is invalid');
    }
  }
  register(id:any){
    console.log(id)
    this.dataService.registerForLeagueRegisteredPlayers(id).subscribe({
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
}
