import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AppService } from '../../services/app.service';
import { TrelloIconComponent } from "../../icons/trello-icon/trello-icon.component";
import { WorkspaceIconComponent } from "../../components/workspace-icon/workspace-icon.component";
import { PlusIconComponent } from "../../icons/plus-icon/plus-icon.component";

import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  host: { 'class': 'flex flex-grow flex-col overflow-auto h-screen' },
  imports: [
    RouterModule,
    TrelloIconComponent,
    WorkspaceIconComponent,
    PlusIconComponent,
    NavBarComponent
  ]
})

export default class HomeComponent implements OnInit {

  appService = inject(AppService);
  authService = inject(AuthService);
  data: any;

  ngOnInit(): void {
    this.appService.getData().subscribe({
      next: (res) => this.data = res
    });
  }

  showCreateWorkspaceModal() {
    let modal = document.getElementById('create-workspace-modal');
    if (modal) {
      // @ts-ignore
      modal.showModal();
    }
  }

}
