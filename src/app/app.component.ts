import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from "./components/nav-bar/nav-bar.component";
import { ThemeService } from './services/theme.service';
import { CreateBoardModalComponent } from "./components/create-board-modal/create-board-modal.component";
import { CreateWorkspaceModalComponent } from "./components/create-workspace-modal/create-workspace-modal.component";
import { ChatroomComponent } from "./components/chatroom/chatroom.component";
import { AuthService } from './services/auth.service';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    imports: [CommonModule, RouterOutlet, NavBarComponent, CreateBoardModalComponent, CreateWorkspaceModalComponent, ChatroomComponent]
})
export class AppComponent implements OnInit {

  themeService = inject(ThemeService);
  authService = inject(AuthService);

  ngOnInit(): void {
    this.themeService.getSavedTheme();
  }

}
