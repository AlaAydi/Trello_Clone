import { Component, OnInit, inject } from '@angular/core';
import Swal from 'sweetalert2';
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
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Tâche Approuvée',
          text: 'Le développeur peut maintenant voir sa tâche validée.',
          background: '#1a1a1a',
          color: '#ffffff',
          confirmButtonColor: '#10b981',
          iconColor: '#10b981'
        });
        this.loadPendingTasks();
      },
      error: (err) => console.error("Error approving task", err)
    });
  }

  reject(taskId: number) {
    this.appService.rejectTask(taskId).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'warning',
          title: 'Tâche Refusée',
          text: 'La tâche a été renvoyée au développeur pour corrections.',
          background: '#1a1a1a',
          color: '#ffffff',
          confirmButtonColor: '#f43f5e',
          iconColor: '#f43f5e'
        });
        this.loadPendingTasks();
      },
      error: (err) => console.error("Error rejecting task", err)
    });
  }
}
