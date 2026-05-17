import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./featured/admin/routes/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'home',
    loadComponent: () => import('./features/customer/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];
