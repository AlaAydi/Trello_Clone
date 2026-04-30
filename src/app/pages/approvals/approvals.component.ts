import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppService } from '../../services/app.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './approvals.component.html',
  styleUrl: './approvals.component.css'
})
export default class ApprovalsComponent implements OnInit {
  appService = inject(AppService);
  authService = inject(AuthService);
  pendingTasks: any[] = [];

  ngOnInit() {
    this.loadPendingTasks();
  }

  loadPendingTasks() {
    this.appService.getPendingTasks().subscribe({
      next: (tasks) => {
        this.pendingTasks = tasks;
      },
      error: (err) => console.error("Error loading pending tasks", err)
    });
  }

  approve(taskId: number) {
    this.appService.approveTask(taskId).subscribe({
      next: () => {
        this.loadPendingTasks();
      },
      error: (err) => console.error("Error approving task", err)
    });
  }

  reject(taskId: number) {
    this.appService.rejectTask(taskId).subscribe({
      next: () => {
        this.loadPendingTasks();
      },
      error: (err) => console.error("Error rejecting task", err)
    });
  }
}
