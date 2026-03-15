import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, map, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  data: BehaviorSubject<any> = new BehaviorSubject<any>({ workspaces: [], recent: [] });
  selectedBoard: BehaviorSubject<any> = new BehaviorSubject(undefined);
  openedTask: BehaviorSubject<any> = new BehaviorSubject(undefined);
  createBoardWorkspace: BehaviorSubject<any> = new BehaviorSubject(undefined);

  constructor() {
    this.refreshData();
  }

  private getHeaders() {
    const token = this.authService.user?.token;
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  refreshData() {
    this.http.get<any[]>(`${this.apiUrl}/workspaces`, { headers: this.getHeaders() }).subscribe({
      next: (workspaces) => {
        const mappedWorkspaces = workspaces.map(w => this.mapWorkspace(w));
        const currentData = this.data.value;
        this.data.next({ workspaces: mappedWorkspaces, recent: currentData.recent || [] });
        
        // Refresh selectedBoard if one is active
        const currentBoard = this.selectedBoard.value;
        if (currentBoard) {
          for (const ws of mappedWorkspaces) {
            const updatedBoard = ws.boards.find((b: any) => b.id === currentBoard.id);
            if (updatedBoard) {
              this.selectedBoard.next(updatedBoard);
              break;
            }
          }
        }

        if (!this.createBoardWorkspace.value && mappedWorkspaces.length > 0) {
          this.createBoardWorkspace.next(mappedWorkspaces[0].id);
        }
      },
      error: (err) => console.error("Error refreshing data", err)
    });
  }

  private mapWorkspace(w: any): any {
    return {
      id: w.id,
      title: w.name,
      description: w.description,
      iconBg: 'workspace-bg-1',
      boards: (w.boards || []).map((b: any) => ({
        id: b.id,
        title: b.name,
        background: 'board-bg-new',
        lists: (b.lists || []).map((l: any) => ({
          id: l.id,
          title: l.name,
          cards: (l.cards || []).map((c: any) => ({
            id: c.id,
            title: c.name,
            description: c.description,
            listId: l.id,
            position: c.position
          }))
        }))
      }))
    };
  }

  getData() {
    return this.data.asObservable();
  }

  getWorkspace(id: string) {
    return this.data.pipe(map(d => d.workspaces.find((w: any) => w.id == id)));
  }

  setBoard(workspaceId: string, boardId: string) {
    const data = this.data.value;
    const workspace = data.workspaces.find((workspace: any) => workspace.id == workspaceId);
    if (workspace) {
      const board = workspace.boards.find((board: any) => board.id == boardId);
      this.selectedBoard.next(board);
    }
  }

  getBoard() {
    return this.selectedBoard.asObservable();
  }

  getBoardById(workspaceId: number, boardId: number) {
    let boardSubject: BehaviorSubject<any> = new BehaviorSubject(undefined);
    const data = this.data.value;
    const workspace = data.workspaces.find((workspace: any) => workspace.id == workspaceId);
    if (workspace) {
      const board = workspace.boards?.find((board: any) => board.id == boardId);
      if (board) {
        boardSubject.next(board);
      }
    }
    return boardSubject.asObservable();
  }

  createNewWorkspace(newWorkspace: any) {
    return this.http.post<any>(`${this.apiUrl}/workspaces`, {
      name: newWorkspace.title,
      description: newWorkspace.description
    }, { headers: this.getHeaders() }).pipe(tap(() => this.refreshData()));
  }

  setCreateBoardWorkspace(workspaceId?: number) {
    if (workspaceId) {
      this.createBoardWorkspace.next(workspaceId);
    } else {
      const workspaces = this.data.value.workspaces;
      if (workspaces && workspaces.length > 0) {
        this.createBoardWorkspace.next(workspaces[0].id);
      }
    }
  }
  
  getCreateBoardWorkspace() {
    return this.createBoardWorkspace.asObservable();
  }

  createNewBoard(workspaceId: number, newBoard: any) {
    return this.http.post<any>(`${this.apiUrl}/boards`, {
      name: newBoard.title,
      workspaceId: workspaceId
    }, { headers: this.getHeaders() }).pipe(tap(() => this.refreshData()));
  }

  createList(workspaceId: number, boardId: number, list: any) {
    // Determine position based on current board lists length
    let position = 0;
    const workspaces = this.data.value.workspaces;
    const workspace = workspaces.find((w: any) => w.id == workspaceId);
    if (workspace) {
      const board = workspace.boards.find((b: any) => b.id == boardId);
      if (board && board.lists) {
        position = board.lists.length;
      }
    }

    return this.http.post<any>(`${this.apiUrl}/lists`, {
      name: list.title,
      boardId: boardId,
      position: position
    }, { headers: this.getHeaders() }).pipe(tap(() => this.refreshData()));
  }

  checkRecentBoards(workspaceId: number, boardId: number) {
    let recentBoard: any = this.data.value.recent.find((board: any) => board.workspaceId == workspaceId && board.boardId == boardId);
    let index = this.data.value.recent.indexOf(recentBoard);

    let board: any;
    this.getBoardById(workspaceId, boardId).subscribe({
      next: (res) => board = res
    });

    let actBoard = {
      workspaceId: workspaceId,
      boardId: boardId
    }

    if (board) {
      if (index !== -1) {
        this.data.value.recent.unshift(this.data.value.recent.splice(index, 1)[0]);
      } else {
        this.data.value.recent.unshift(actBoard);
        if (this.data.value.recent.length > 4) {
          this.data.value.recent.pop();
        }
      }
      this.data.next({ ...this.data.value });
    }
  }

  deleteWorkspace(workspaceId: number) {
    return this.http.delete(`${this.apiUrl}/workspaces/${workspaceId}`, { headers: this.getHeaders() })
      .pipe(tap(() => this.refreshData()));
  }

  editWorkspaceInfo(title: string, description: string, workspaceId: number) {
    return this.http.put(`${this.apiUrl}/workspaces/${workspaceId}`, {
      name: title,
      description: description
    }, { headers: this.getHeaders() }).pipe(tap(() => this.refreshData()));
  }

  editBoardTitle(workspaceId: number, boardId: number, boardTitle: string) {
    return this.http.put(`${this.apiUrl}/boards/${boardId}`, {
      name: boardTitle,
      workspaceId: workspaceId
    }, { headers: this.getHeaders() }).pipe(tap(() => this.refreshData()));
  }

  closeBoard(workspaceId: number, boardId: number) {
    return this.http.delete(`${this.apiUrl}/boards/${boardId}`, { headers: this.getHeaders() })
      .pipe(tap(() => this.refreshData()));
  }

  setOpenedTask(task: any) {
    this.openedTask.next(task);
  }

  getOpenedTask() {
    return this.openedTask.asObservable();
  }

  createCard(listId: number, card: any) {
    // Determine position (simplified, might need better logic if board isn't selectedBoard)
    let position = 0;
    const currentBoard = this.selectedBoard.value;
    if (currentBoard && currentBoard.lists) {
      const list = currentBoard.lists.find((l: any) => l.id == listId);
      if (list && list.cards) {
        position = list.cards.length;
      }
    }

    return this.http.post<any>(`${this.apiUrl}/cards`, {
      title: card.title,
      description: card.description || '',
      listId: listId,
      position: position
    }, { headers: this.getHeaders() }).pipe(tap(() => this.refreshData()));
  }

  updateCard(cardId: number, card: any) {
    return this.http.put<any>(`${this.apiUrl}/cards/${cardId}`, {
      title: card.title,
      description: card.description,
      taskListId: card.listId,
      position: card.position || 0
    }, { headers: this.getHeaders() }).pipe(tap(() => this.refreshData()));
  }

  deleteTask(taskList: any, taskIndex: number) {
    // Assuming taskIndex isn't an ID but the position in array
    const cardId = taskList.cards[taskIndex].id;
    return this.http.delete(`${this.apiUrl}/cards/${cardId}`, { headers: this.getHeaders() })
      .pipe(tap(() => this.refreshData()));
  }

}
