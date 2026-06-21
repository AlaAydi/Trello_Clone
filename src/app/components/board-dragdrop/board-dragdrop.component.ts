import { Component, Input, inject } from '@angular/core';
import { TaskCardListComponent } from "../task-card-list/task-card-list.component";
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDragPlaceholder, CdkDragPreview, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { BoardService } from '../../services/board.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ListOptionsComponent } from "../list-options/list-options.component";
import { TaskModalComponent } from "../task-modal/task-modal.component";
import { PencilIconComponent } from "../../icons/pencil-icon/pencil-icon.component";
import { AppService } from '../../services/app.service';
import { CdkMenu, CdkMenuItem } from '@angular/cdk/menu';
import { TextIconComponent } from "../../icons/text-icon/text-icon.component";
import { TicketRoadmapModalComponent } from "../ticket-roadmap-modal/ticket-roadmap-modal.component";
import { CodeAnalyzerModalComponent } from "../code-analyzer-modal/code-analyzer-modal.component";
import { AuthService } from '../../services/auth.service';
import { AiIconComponent } from "../../icons/ai-icon/ai-icon.component";

@Component({
  selector: 'app-board-dragdrop',
  standalone: true,
  templateUrl: './board-dragdrop.component.html',
  styleUrl: './board-dragdrop.component.css',
  host: { 'class': 'h-full' },
  imports: [
    ReactiveFormsModule,
    FormsModule,
    TaskCardListComponent,
    CdkDrag,
    CdkDropList,
    CdkDropListGroup,
    CdkDragHandle,
    CdkDragPlaceholder,
    CdkDragPreview,
    ListOptionsComponent,
    TaskModalComponent,
    PencilIconComponent,
    CdkMenu,
    CdkMenuItem,
    TextIconComponent,
    TicketRoadmapModalComponent,
    CodeAnalyzerModalComponent,
    AiIconComponent
  ]
})
export class BoardDragdropComponent {

  @Input()
  set board(value: any) {
    if (value && value.lists) {
      value.lists.forEach((list: any) => {
        const isDone = this.isDoneList(list);
        list.cards?.forEach((card: any) => {
          const status = card.approvalStatus?.toString().trim().toUpperCase();
          if (isDone) {
            if (status === 'APPROVED') {
              card.cardColor = 'bg-green-500 text-white border-none';
              card.statusText = 'Acceptée';
              card.statusIcon = 'check';
              card.message = 'Tâche validée.';
            } else if (status === 'REJECTED') {
              card.cardColor = 'bg-red-500 text-white border-none';
              card.statusText = 'Refusée';
              card.statusIcon = 'x';
              card.message = 'Tâche à corriger.';
            } else {
              card.cardColor = 'bg-orange-500 text-white border-none';
              card.statusText = 'En vérification';
              card.statusIcon = 'clock';
              card.message = 'Attente de validation.';
            }
          } else {
            card.cardColor = 'bg-cc-task-card';
          }
        });
      });
    }
    this._board = value;
    console.log(">>> BoardDragdrop: Données traitées avec couleurs:", value);
  }
  get board() { return this._board; }
  private _board: any;
  appService = inject(AppService);
  boardService = inject(BoardService);
  authService = inject(AuthService);
  listTitleEdit: number = -1;
  isList: boolean = false;
  isTask: boolean = false;
  task: any;
  taskList: any;
  taskIndex: any;

  showRoadmapModal = false;
  showCodeReviewModal = false;
  selectedTicketForAi: any = null;

  openRoadmap(event: MouseEvent, card: any) {
    event.stopPropagation();
    this.selectedTicketForAi = {
      title: card.title,
      description: card.description || 'No description provided.',
      priority: 'MEDIUM',
      labels: [],
      assignee: card.assignedToName,
      estimatedHours: 0
    };
    this.showRoadmapModal = true;
  }

  onRoadmapRequested(card: any) {
    this.selectedTicketForAi = {
      title: card.title,
      description: card.description || 'No description provided.',
      priority: 'MEDIUM',
      labels: [],
      assignee: card.assignedToName,
      estimatedHours: 0
    };
    this.showRoadmapModal = true;
  }

  openCodeReview(event: MouseEvent, card: any) {
    event.stopPropagation();
    this.selectedTicketForAi = card;
    this.showCodeReviewModal = true;
  }

  closeRoadmap() {
    this.showRoadmapModal = false;
    this.selectedTicketForAi = null;
  }

  closeCodeReview() {
    this.showCodeReviewModal = false;
    this.selectedTicketForAi = null;
  }

  updateListTitleForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]),
  });

  showTitleInput(listIndex: number, listTitle: string) {
    this.updateListTitleForm.patchValue({
      title: listTitle
    })
    this.listTitleEdit = listIndex;
    setTimeout(() => {
      let input = document.getElementById(`${listIndex}-title-input`) as HTMLInputElement;
      input?.focus();
      input?.select();
    });
  }

  submitTitle(list: any) {
    this.listTitleEdit = -1;
    let newTitle = this.updateListTitleForm.getRawValue().title;
    if (newTitle) {
      let isValid = newTitle.trim().length > 0;
      if (isValid) {
        const oldTitle = list.title;
        list.title = newTitle.trim();
        this.appService.updateList(list.id, {
          title: list.title,
          boardId: list.boardId || this.board.id,
          position: list.position || 0
        }).subscribe({
          error: (err) => {
            console.error("Error updating list title", err);
            list.title = oldTitle;
          }
        });
      }
    }
  }

  isDoneList(list: any): boolean {
    const title = list.title?.toLowerCase().trim() || '';
    return title === 'terminé' || title === 'termine' || title === 'teminé' || title === 'teminée' || title === 'done' || title === 'fini' || title.includes('termin');
  }

  moveTask(event: CdkDragDrop<any>) {
    const { previousContainer, container, previousIndex, currentIndex } = event;
    const isSameContainer = previousContainer == container;

    if (isSameContainer && previousIndex == currentIndex) {
      return;
    }

    if (!this.authService.isTechLead && this.isDoneList(previousContainer.data)) {
      return;
    }

    if (isSameContainer) {
      this.boardService.reorderTask(container.data, previousIndex, currentIndex);
    } else {
      this.boardService.transferTask({ fromList: previousContainer.data, toList: container.data, fromIndex: previousIndex, toIndex: currentIndex });
    }

    const movedTask = container.data.cards[currentIndex];

    if (this.authService.user?.role === 'DEVELOPER' && this.isDoneList(container.data)) {
      if (movedTask.approvalStatus !== 'APPROVED' && movedTask.approvalStatus !== 'REJECTED') {
        movedTask.approvalStatus = 'PENDING';
        movedTask.assignedToEmail = this.authService.user?.email;
        movedTask.assignedToName = this.authService.user?.fullName;
      }
    }

    this.appService.updateCard(movedTask.id, {
      title: movedTask.title,
      description: movedTask.description,
      listId: container.data.id,
      position: currentIndex,
      assignedToEmail: movedTask.assignedToEmail
    }).subscribe({
      next: () => this.appService.refreshData(),
      error: (err) => console.error("Error persisting task move", err)
    });
  }

  moveList(event: CdkDragDrop<any>) {
    const { previousIndex, currentIndex } = event;
    if (previousIndex == currentIndex) {
      return;
    }
    this.boardService.moveList(this.board, previousIndex, currentIndex);

    // Persist to backend
    const movedList = this.board.lists[currentIndex];
    this.appService.updateList(movedList.id, {
      title: movedList.title,
      boardId: this.board.id,
      position: currentIndex
    }).subscribe({
      error: (err) => console.error("Error persisting list move", err)
    });
  }

  setOpenedTask(task: any, taskList: any, taskIndex: any) {
    this.taskList = taskList;
    this.taskIndex = taskIndex;
    this.appService.setOpenedTask(task);
    let modal = document.getElementById('task-modal');
    // @ts-ignore
    modal?.showModal();
  }

  approveTask(event: MouseEvent, card: any) {
    event.stopPropagation();
    this.appService.approveTask(card.id).subscribe({
      next: () => this.appService.refreshData(),
      error: (err) => console.error("Error approving task", err)
    });
  }

  rejectTask(event: MouseEvent, card: any) {
    event.stopPropagation();
    this.appService.rejectTask(card.id).subscribe({
      next: () => this.appService.refreshData(),
      error: (err) => console.error("Error rejecting task", err)
    });
  }

}
