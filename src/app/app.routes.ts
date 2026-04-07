import { Routes, Router } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';

export const routes: Routes = [

  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent),
    canActivate: [() => !inject(AuthService).isLoggedIn ? true : inject(Router).parseUrl('/boards')],
    pathMatch: 'full'
  },
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
    loadComponent: () => import('./pages/home/home.component'),
    canActivate: [authGuard],
    children: [
      {
        path: 'boards',
        loadComponent: () => import('./pages/boards/boards.component'),
        title: 'Boards | Trello',
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
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];


