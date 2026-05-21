import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../bo-cuc/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: 'trang-chu',
        loadComponent: () => import('../trang-chu/trang-chu.component').then(m => m.TrangChuComponent)
      },
      {
        path: 'quan-ly-ve',
        children: [
          { path: 'dat-ve-moi', loadComponent: () => import('../trang-chu/trang-chu.component').then(m => m.TrangChuComponent) },
          { path: 'danh-sach-ve', loadComponent: () => import('../QuanLyVe/DanhSachVe/danh-sach-ve.component').then(m => m.DanhSachVeComponent) },
          { path: 'hoan-tien', loadComponent: () => import('../trang-chu/trang-chu.component').then(m => m.TrangChuComponent) }
        ]
      },
      {
        path: 'quan-ly-dieu-hanh',
        children: [
          { 
            path: 'quan-ly-tuyen-xe', 
            loadComponent: () => import('../QuanLyDieuHanh/QuanLyTuyenXe/quan-ly-tuyen-xe.component').then(m => m.QuanLyTuyenXeComponent) 
          },
          { 
            path: 'quan-ly-lich-trinh', 
            loadComponent: () => import('../QuanLyDieuHanh/QuanLyLichTrinh/quan-ly-lich-trinh.component').then(m => m.QuanLyLichTrinhComponent) 
          },
          { 
            path: 'quan-ly-phuong-tien', 
            loadComponent: () => import('../QuanLyDieuHanh/QuanLyPhuongTien/quan-ly-phuong-tien.component').then(m => m.QuanLyPhuongTienComponent) 
          },
          { 
            path: 'quan-ly-tai-xe-phu-xe', 
            loadComponent: () => import('../QuanLyDieuHanh/QuanLyTaiXePhuXe/quan-ly-tai-xe.component').then(m => m.QuanLyTaiXeComponent) 
          },
          { 
            path: 'quan-ly-diem-don-tra-dung', 
            loadComponent: () => import('../QuanLyDieuHanh/QuanLyDiemDonTraDung/quan-ly-diem-don-tra-dung.component').then(m => m.QuanLyDiemDonTraDungComponent) 
          }
        ]
      },
      { path: 'quan-ly-tin-tuc', loadComponent: () => import('../trang-chu/trang-chu.component').then(m => m.TrangChuComponent) },
      { path: 'quan-ly-khach-hang', loadComponent: () => import('../trang-chu/trang-chu.component').then(m => m.TrangChuComponent) },
      { path: 'quan-ly-nhan-vien', loadComponent: () => import('../trang-chu/trang-chu.component').then(m => m.TrangChuComponent) },
      { path: 'quan-ly-chinh-sach', loadComponent: () => import('../trang-chu/trang-chu.component').then(m => m.TrangChuComponent) },
      { path: '', redirectTo: 'trang-chu', pathMatch: 'full' }
    ]
  }
];
