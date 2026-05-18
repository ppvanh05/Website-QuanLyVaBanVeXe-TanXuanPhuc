import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./featured/admin/routes/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'home',
    loadComponent: () => import('./featured/customer/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'tin-tuc',
    loadComponent: () => import('./featured/customer/tintuc/tintuc.component').then(m => m.TintucComponent)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];
