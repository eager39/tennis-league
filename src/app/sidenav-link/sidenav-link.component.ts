import { Component ,Input} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidenav-link',
  standalone: true,
  imports: [RouterLink,RouterLinkActive],
  templateUrl: './sidenav-link.component.html',
  styleUrl: './sidenav-link.component.css'
})
export class SidenavLinkComponent {
  @Input()
  routerLink?: string;

  @Input()
  routerLinkActiveOptions: { exact: boolean } = { exact: true };
}
