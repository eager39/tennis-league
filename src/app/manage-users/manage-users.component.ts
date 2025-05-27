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
import { ElementRef, ViewChild} from '@angular/core';
import {FormControl, FormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [MatAutocompleteModule,MatButtonModule,MatCardModule,MatTableModule,MatSelectModule,ReactiveFormsModule,MatFormFieldModule,CommonModule,MatInputModule],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.css'
})
export class ManageUsersComponent {
    @ViewChild('input')
  input!: ElementRef<HTMLInputElement>;
  users: any[] = []; // This should be fetched from a service
  players: any[] = []; // This should also be fetched from a service
  dataSourceUsers = new MatTableDataSource(this.users);
  displayedColumns: string[] = ['username', 'email', 'player', 'actions'];
 filteredOptions:any []=[];
  userForm: FormGroup;
  editingUser: any = null;
  myControl = new FormControl('');
  constructor(private fb: FormBuilder,private dataService:DataService) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      playerId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
 //   this.loadUsers();
   // this.getPlayers();
    this.getPlayersAndUsers()
   
  }

getPlayersAndUsers(): void {
  this.dataService.getPlayers().subscribe(players => {
    this.players = players;

    this.dataService.getUsers().subscribe(users => {
      this.users = users.map(user => {
        user.playerControl = new FormControl();

        // Set default selected value if playerId exists
        if (user.playerId) {
          const linkedPlayer = this.players.find(p => p.id == user.playerId);
          user.playerControl.setValue(linkedPlayer || null);
        }

        // Set up filtered options and subscription
        user.filteredOptions = this.players;

        user.playerControl.valueChanges.subscribe((value: any) => {
          this.filterPlayers(user, value);
        });

        return user;
      });

      this.dataSourceUsers.data = this.users;
    });
  });
}
  getPlayers(): void {
    
     this.dataService.getPlayers().subscribe(players => {
       this.players = players;
      this.filteredOptions=this.players
      console.log(this.filteredOptions.slice())
     });
  }
 
  filterPlayers(user: any, value: any = ''): void {
  const filterValue = typeof value === 'string' ? value.toLowerCase() : value?.name?.toLowerCase() || '';
  user.filteredOptions = this.players.filter(p => p.name.toLowerCase().includes(filterValue));
}

displayFn(option: any): string {
  return option?.name || '';
}

  onPlayerLink(user: any): void {
 
     this.dataService.linkPlayer(user.id, user.playerId).subscribe();
  }
  optionSelected(event: any, user: any, selectedOption: any) {
  if (event.isUserInput) {
    user.playerId = selectedOption.id;
    this.onPlayerLink(user); // Save immediately if desired
  }
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
