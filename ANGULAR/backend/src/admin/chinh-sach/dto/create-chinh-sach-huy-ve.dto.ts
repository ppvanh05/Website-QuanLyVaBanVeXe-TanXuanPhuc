export class CreateChinhSachHuyVeDto {
  MaChinhSach: string;
  TenChinhSach: string;
  GioiHanGioTruocKhoiHanh: number;
  TyLePhiHuy: number;
  MoTa?: string;
  TrangThai: string; // 'DangApDung' | 'VoHieuHoa'
  NgayApDung: string; // 'yyyy-MM-dd'
}
