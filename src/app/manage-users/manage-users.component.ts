import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DataService } from '../data.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [MatButtonModule,MatCardModule,MatTableModule,MatSelectModule,ReactiveFormsModule,MatFormFieldModule,CommonModule,MatInputModule],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.css'
})
export class ManageUsersComponent {
  users: any[] = []; // This should be fetched from a service
  players: any[] = []; // This should also be fetched from a service
  dataSourceUsers = new MatTableDataSource(this.users);
  displayedColumns: string[] = ['username', 'email', 'player', 'actions'];

  userForm: FormGroup;
  editingUser: any = null;

  constructor(private fb: FormBuilder,private dataService:DataService) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      playerId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.getPlayers();
  }

  loadUsers(): void {
   
     this.dataService.getUsers().subscribe(users => {
       this.users = users;
       this.dataSourceUsers.data = this.users;
       console.log(this.users)
     });
  }

  getPlayers(): void {
    
     this.dataService.getPlayers().subscribe(players => {
       this.players = players;
      console.log(this.players)
     });
  }

  onPlayerLink(user: any): void {
  console.log(user)
     this.dataService.linkPlayer(user.id, user.playerId).subscribe();
  }

  editUser(user: any): void {
    this.editingUser = user;
    this.userForm.patchValue(user);
  }

  deleteUser(user: any): void {
    // Delete user logic
    // Example:
    // this.userService.deleteUser(user.id).subscribe(() => {
    //   this.loadUsers();
    // });
  }

  onSubmit(): void {
    if (this.editingUser) {
      // Update user logic
      // Example:
      // this.userService.updateUser(this.editingUser.id, this.userForm.value).subscribe(() => {
      //   this.loadUsers();
      //   this.resetForm();
      // });
    } else {
      // Add user logic
      // Example:
      // this.userService.addUser(this.userForm.value).subscribe(() => {
      //   this.loadUsers();
      //   this.resetForm();
      // });
    }
  }

  resetForm(): void {
    this.userForm.reset();
    this.editingUser = null;
  }
}
