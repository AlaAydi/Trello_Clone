import { Component, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { WorkspacesDropdownComponent } from "./workspaces-dropdown/workspaces-dropdown.component";
import { RecentDropdownComponent } from "./recent-dropdown/recent-dropdown.component";
import { CreateDropdownComponent } from "./create-dropdown/create-dropdown.component";
import { ThemeDropdownComponent } from "./theme-dropdown/theme-dropdown.component";
import { AppService } from '../../services/app.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css',
  imports: [
    RouterModule,
    WorkspacesDropdownComponent,
    RecentDropdownComponent,
    CreateDropdownComponent,
    ThemeDropdownComponent,
    CommonModule
  ]
})
export class NavBarComponent implements OnInit {

  router = inject(Router);
  appService = inject(AppService);
  authService = inject(AuthService);
  boardPage: boolean = false;
  board: any;

  ngOnInit() {
    this.appService.getBoard().subscribe({
      next: (res) => this.board = res
    });
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentRoute = this.router.url.split('?')[0].split('/').filter(segment => segment !== '');
        if (currentRoute[0] == 'board') {
          this.boardPage = true;
        } else {
          this.boardPage = false;
        }
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

