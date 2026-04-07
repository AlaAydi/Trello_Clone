import { Component, Input, OnInit, inject } from '@angular/core';
import { AppService } from '../../services/app.service';
import { CommonModule } from '@angular/common';
import { XmarkIconComponent } from "../../icons/xmark-icon/xmark-icon.component";
import { TaskIconComponent } from "../../icons/task-icon/task-icon.component";
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TextIconComponent } from "../../icons/text-icon/text-icon.component";
import { TrashIconComponent } from "../../icons/trash-icon/trash-icon.component";
import { BoardService } from '../../services/board.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-task-modal',
    standalone: true,
    templateUrl: './task-modal.component.html',
    styleUrl: './task-modal.component.css',
    imports: [
        CommonModule,
        XmarkIconComponent,
        TaskIconComponent,
        FormsModule,
        ReactiveFormsModule,
        TextIconComponent,
        TrashIconComponent
    ]
})
export class TaskModalComponent implements OnInit {

  @Input({required: true}) taskList: any;
  @Input({ required: true }) taskIndex: any;
  task: any;
  developers: any[] = [];
  appService = inject(AppService);
  boardService = inject(BoardService);
  authService = inject(AuthService);

  updateTaskForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]),
    description: new FormControl('', Validators.pattern(/^(\s*\S+\s*)*(?!\s).*$/m)),
    assignedToEmail: new FormControl('')
  });

  ngOnInit(): void {
    this.appService.getOpenedTask().subscribe({
      next: (res) => {
        this.task = res;
        if (res) { 
          this.updateTaskForm.patchValue({
            title: this.task.title,
            description: this.task.description,
            assignedToEmail: this.task.assignedToEmail || ''
          });
          
          if (this.authService.user?.role === 'DEVELOPER') {
            this.updateTaskForm.disable();
          }
        }
      }
    });

    if (this.authService.user?.role === 'TECH_LEAD') {
      this.loadDevelopers();
    }
  }

  loadDevelopers() {
    this.appService.getDevelopers().subscribe(devs => {
      this.developers = devs;
    });
  }

  updateTask() {
    if (this.authService.user?.role === 'DEVELOPER') return;

    let formValue = this.updateTaskForm.getRawValue();
    let newTitle = formValue.title;
    let newDesc = formValue.description;
    let newAssigned = formValue.assignedToEmail;
    
    let updatedCard = { 
      ...this.task,
      title: newTitle,
      description: newDesc,
      assignedToEmail: newAssigned
    };
    
    this.appService.updateCard(this.task.id, updatedCard).subscribe(() => {
    });
  }

  deleteTask() {
    this.appService.deleteTask(this.taskList, this.taskIndex).subscribe(() => {
      this.closeModal();
    });
  }

  closeModal() {
    let modal = document.getElementById('task-modal');
    // @ts-ignore
    modal?.close();
  }

  setScroll() {
    this.boardService.setScroll(false);
  }

}
