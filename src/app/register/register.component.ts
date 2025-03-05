import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service'; // Assume AuthService is created to handle auth logic
import { Router } from '@angular/router';
import { MustMatch } from '../must-match.validator'; // Custom validator for password matching
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'], // Create CSS file for styling if necessary
  imports:[ReactiveFormsModule,CommonModule,MatFormFieldModule,MatFormFieldModule,MatOptionModule,MatSelectModule]
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      country: ['slovenija',Validators.required],
      phonePrefix: ['+386',Validators.required]
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });
  }

  onRegister(): void {
    console.log(this.registerForm.value)
    if (this.registerForm.valid) {

      const { confirmPassword, ...registrationData } = this.registerForm.value;
      this.authService.register(registrationData).subscribe(
        (response) => {
          console.log(response)
          if(response.affectedRows>0){
            alert("Uspešna registracija. Email: "+ this.registerForm.value.email +"tel številka: "+this.registerForm.value.phone)
            this.router.navigate(['/login']);
          }
           // Redirect to login page after registration
        },
        (error) => {
          console.error('Registration error', error);
        }
      );
    }
  }
}