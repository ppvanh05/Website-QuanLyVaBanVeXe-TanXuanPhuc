export class CreateChinhSachDto {
  MaChinhSach_ND: string;
  TieuDe: string;
  LoaiChinhSach: string; // 'insurance' | 'payment' | 'other'
  NoiDung: string;
  NgayApDung: string; // 'yyyy-MM-dd'
  TrangThai: string; // 'DangApDung' | 'VoHieuHoa'
  MaQuanTriVien: string;
}
