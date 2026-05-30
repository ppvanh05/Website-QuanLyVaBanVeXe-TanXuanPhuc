export const ADMIN_PERMISSIONS = [
  'news',
  'customer',
  'employee',
  'policy',
  'review',
  'blacklist',
  'log',
  'role',
];

export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  QuanTriVien: ADMIN_PERMISSIONS,
  BanQuanLy: ['report'],
  NhanVienDieuPhoi: ['dispatch'],
  NhanVienBanVe: ['ticket', 'customer'],
};
