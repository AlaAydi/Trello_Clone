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
    console.log(">>> Frontend: Envoi de la demande d'APPROBATION pour la tâche ID:", taskId);
    this.appService.approveTask(taskId).subscribe({
      next: (res) => {
        console.log(">>> Frontend: APPROBATION RÉUSSIE pour l'ID:", taskId, "Réponse du serveur:", res);
        this.loadPendingTasks();
      },
      error: (err) => console.error(">>> Frontend: ÉCHEC de l'approbation pour l'ID:", taskId, err)
    });
  }

  reject(taskId: number) {
    console.log(">>> Frontend: Envoi de la demande de REFUS pour la tâche ID:", taskId);
    this.appService.rejectTask(taskId).subscribe({
      next: (res) => {
        console.log(">>> Frontend: REFUS RÉUSSI pour l'ID:", taskId, "Réponse du serveur:", res);
        this.loadPendingTasks();
      },
      error: (err) => console.error(">>> Frontend: ÉCHEC du refus pour l'ID:", taskId, err)
    });
  }
}
