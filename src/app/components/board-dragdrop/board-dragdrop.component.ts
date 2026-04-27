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
        CodeAnalyzerModalComponent
    ]
})
export class BoardDragdropComponent {

  @Input({required: true}) board: any;
  appService = inject(AppService);
  boardService = inject(BoardService);
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
      priority: 'MEDIUM', // Default
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
      let input = document.getElementById(`${listIndex}-title-input`);
      input?.focus();
      // @ts-ignore
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
            list.title = oldTitle; // Rollback on error
          }
        });
      }
    }    
  }

  moveTask(event: CdkDragDrop<any>) {
    const { previousContainer, container, previousIndex, currentIndex } = event;
    const isSameContainer = previousContainer == container;

    if (isSameContainer && previousIndex == currentIndex) {
      return;
    }

    if (isSameContainer) {
      this.boardService.reorderTask(container.data, previousIndex, currentIndex);
    } else {
      this.boardService.transferTask({ fromList: previousContainer.data, toList: container.data, fromIndex: previousIndex, toIndex: currentIndex });
    }

    // Persist to backend
    const movedTask = container.data.cards[currentIndex];
    this.appService.updateCard(movedTask.id, {
      title: movedTask.title,
      description: movedTask.description,
      listId: container.data.id,
      position: currentIndex,
      assignedToEmail: movedTask.assignedToEmail
    }).subscribe({
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

}
