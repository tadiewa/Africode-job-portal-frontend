import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/home/home').then(m => m.HomeComponent),
      },
      {
        path: 'explore-developers',
        loadComponent: () =>
          import('./pages/explore-developers/explore-developers').then(
            m => m.ExploreDevelopersComponent
          ),
      },
      {
        path: 'join-network',
        loadComponent: () =>
          import('./pages/join-network/join-network').then(
            m => m.JoinNetworkComponent
          ),
      },
      {
        path: 'inquire-developers/:id',
        loadComponent: () =>
          import('./pages/Inquiries/inquire-developers/inquire-developers').then(
            m => m.InquireDevelopers
          ),
      }
      ,
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/login/login').then(m => m.LoginComponent),
      },

      {
        path: 'admin/register',
        loadComponent: () =>
          import('./pages/admin/admin-register/admin-register').then(
            m => m.AdminRegister
          ),
      },
      {
        path: 'admin/super-dashboard',
        loadComponent: () =>
          import('./pages/dashboards/super-admin-dashboard/super-admin-dashboard').then(
            m => m.SuperAdminDashboard
          ),
        canActivate: [authGuard], // ensure only authorized users access it
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboards/developer-dashboard/developer-dashboard').then(
            m => m.DeveloperDashboard
          ),
        canActivate: [authGuard],
      },
      {
        path: 'admin/users',
        loadComponent: () =>
          import('./pages/users/all-users-list/users').then(m => m.Users),
        canActivate: [authGuard],
      },
      {
        path: 'admin/inquiries',
        loadComponent: () =>
          import('./pages/Inquiries/inquiries-list/inquiries-list').then(
            m => m.InquiriesList
          ),
        canActivate: [authGuard],
      },
      {
        path: 'uploadDocs',
        loadComponent: () =>
          import('./pages/documents/document-upload/document-upload').then(
            m => m.DocumentUpload
          ),
      },
      {
        path: 'admin/developers',
        loadComponent: () =>
          import('./pages/users/developers-list/developers-list').then(
            m => m.DevelopersList

          ),
      },
      {
        path: 'admin/admins',
        loadComponent: () =>
          import('./pages/users/admin-list/admin-list').then(
            m => m.AdminList

          ),
      },
    ],
  },
];
