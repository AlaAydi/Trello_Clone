import { Component, OnInit, inject } from '@angular/core';
import { AppService } from '../../services/app.service';
import { AuthService } from '../../services/auth.service';
import { BoardsCardsGridComponent } from "../../components/boards-cards-grid/boards-cards-grid.component";
import { ClockIconComponent } from "../../icons/clock-icon/clock-icon.component";
import { BoardPreviewCardComponent } from "../../components/board-preview-card/board-preview-card.component";
import { WorkspaceIconComponent } from "../../components/workspace-icon/workspace-icon.component";
import { BoardDataPipe } from "../../pipes/board-data.pipe";
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-boards',
    standalone: true,
    templateUrl: './boards.component.html',
    styleUrl: './boards.component.css',
    host: { 'class': 'flex flex-grow' },
    imports: [
        BoardsCardsGridComponent,
        ClockIconComponent,
        BoardPreviewCardComponent,
        WorkspaceIconComponent,
        BoardDataPipe,
        CommonModule
    ]
})
export default class BoardsComponent implements OnInit {

  appService = inject(AppService);
  authService = inject(AuthService);
  
  data: any;
  leaderboard: any[] = [];
  
  get isTechLead() {
    return this.authService.isTechLead;
  }

  ngOnInit(): void {
    this.appService.getData().subscribe({
      next: (res) => this.data = res
    });

    if (this.authService.isTechLead) {
      this.appService.getLeaderboard().subscribe({
        next: (res) => {
          this.leaderboard = res;
        },
        error: (err) => console.error("Error fetching leaderboard", err)
      });
    }
  }

  showCreateWorkspaceModal() {
    let modal = document.getElementById('create-workspace-modal');
    if (modal) {
      // @ts-ignore
      modal.showModal();
    }
  }

}
