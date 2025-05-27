import { Component } from '@angular/core';
import { SeasonService } from '../season.service';
import { MatchService } from '../match.service';
import { LeaguesService } from '../league.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mailing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mailing.component.html',
  styleUrl: './mailing.component.css'
})
export class MailingComponent {
  constructor(private seasonservice: SeasonService,private matchService: MatchService, private leagueService: LeaguesService,private route: ActivatedRoute,private fb: FormBuilder,private authservice: AuthService) {
    
     }
     users:any=[]
     ngOnInit(): void {
  
      this.getPlayersEmail()
     }
     sendpdf(){
        this.leagueService.sendpdf(this.users.map((user: { email: any; }) => user.email)).subscribe(data=>{
  console.log(data)
    })
     }
  downloadpdf(file:string,liga:number) {
  

  this.leagueService.downloadFile(file,liga).subscribe((blob: Blob) => {
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);
    a.href = objectUrl;
    a.download = file;
    a.click();
    URL.revokeObjectURL(objectUrl);
  });
}
     getPlayersEmail(){
          this.leagueService.getEmails().subscribe(data=>{
  console.log(data)
  this.users=data
    })
     }

}
