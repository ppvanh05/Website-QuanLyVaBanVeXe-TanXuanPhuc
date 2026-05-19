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
    path: 'login',
    loadComponent: () => import('./featured/customer/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'tin-tuc',
    loadComponent: () => import('./featured/customer/tintuc/tintuc.component').then(m => m.TintucComponent)
  },
  {
    path: 'tin-tuc/chi-tiet',
    loadComponent: () => import('./featured/customer/tintuc/tintuc-detail/tintuc-detail.component').then(m => m.TintucDetailComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./featured/customer/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'gioi-thieu/ve-chung-toi',
    loadComponent: () => import('./featured/customer/gioi-thieu/ve-chung-toi/ve-chung-toi.component').then(m => m.VeChungToiComponent)
  },
  {
    path: 'gioi-thieu/chinh-sach',
    loadComponent: () => import('./featured/customer/gioi-thieu/chinh-sach/chinh-sach.component').then(m => m.ChinhSachComponent)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];
