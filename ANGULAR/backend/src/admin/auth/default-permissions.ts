export const ADMIN_PERMISSIONS = ['admin'];

export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  QuanTriVien: ['admin'],
  BanQuanLy: ['report'],
  NhanVienDieuPhoi: ['dispatch'],
  NhanVienBanVe: ['ticket'],
};
