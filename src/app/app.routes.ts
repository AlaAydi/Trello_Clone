import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component'),
    children: [

      {
        path: 'login',
        loadComponent: () =>
          import('./pages/auth/login/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'registre',
        loadComponent: () =>
          import('./pages/auth/sign-up/sign-up.component').then(m => m.SignUpComponent),
      },
      {
        path: '',
        redirectTo: 'boards',
        pathMatch: 'full'
      },
      {
        path: 'boards',
        loadComponent: () => import('./pages/boards/boards.component'),
        title: 'Boards | Trello',
        canActivate: [authGuard]
      },
      {
        path: 'workspace/:id',
        loadComponent: () => import('./pages/workspace/workspace.component'),
      },



    ]
  },
  {
    path: 'board/:workspace-id/:board-id',
    loadComponent: () => import('./pages/board/board.component'),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

