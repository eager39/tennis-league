import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-resetpassword',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,MatFormFieldModule,MatFormFieldModule,MatOptionModule,MatSelectModule,MatInputModule],
  templateUrl: './resetpassword.component.html',
  styleUrl: './resetpassword.component.css'
})
export class ResetpasswordComponent {
 requestForm: FormGroup;
  resetForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService,private route: ActivatedRoute) {

        this.resetForm = this.fb.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
    this.requestForm = this.fb.group({
      email: ['', Validators.required],
      
    });
  }
       
  

  validToken = false;
  checkingToken = true;
  token: string = '';
  email: string = '';
  ngOnInit(): void {
  this.route.queryParamMap.subscribe(params => {
      this.token = params.get('token') || '';
      if (this.token) {
        this.authService.checktoken(this.token).subscribe({
          next: (res) => {
            console.log(res)
            this.validToken = true;
           // this.email = res; // server should return email if token is valid
            this.checkingToken = false;
          },
          error: () => {
            this.validToken = false;
            this.checkingToken = false;
          }
        });
      } else {
        this.checkingToken = false;
      }
    });
  }
   
   

  onSubmit(): void {
    if (this.requestForm.valid) {
      this.authService.sendResetLink(this.requestForm.value.email).subscribe({
        next: () => alert('Reset link sent if the email exists.'),
        error: err => alert('Failed to send reset link.')
      });
    }
  }
    onSubmit2() {
    if (this.resetForm.valid && this.token) {
      const { password, confirmPassword } = this.resetForm.value;
      if (password === confirmPassword) {
        this.authService.resetpassword(this.token, password ).subscribe({
          next: () => alert('Password reset successful'),
          error: () => alert('Password reset failed')
        });
      } else {
        alert('Passwords do not match');
      }
    }
  }
}
