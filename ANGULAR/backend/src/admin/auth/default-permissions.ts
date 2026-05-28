export const ADMIN_PERMISSIONS = [
  'ticket',
  'news',
  'dispatch',
  'customer',
  'employee',
  'policy',
  'blacklist',
  'report',
  'log',
];

export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  QuanTriVien: ['news', 'customer', 'employee', 'policy', 'blacklist', 'log'],
  BanQuanLy: ['report'],
  NhanVienDieuPhoi: ['dispatch'],
  NhanVienBanVe: ['ticket', 'customer'],
};
