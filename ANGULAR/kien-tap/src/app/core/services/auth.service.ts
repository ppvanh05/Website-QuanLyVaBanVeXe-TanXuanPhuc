import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserProfile {
  MaKhachHang?: string;
  HoTenKhachHang: string;
  SoDienThoai?: string;
  Email?: string;
  AnhDaiDien?: string;
  GioiTinh?: string;
  NgaySinh?: string;
  TrangThaiTaiKhoan?: string;
  NgayDangKy?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _currentUser = new BehaviorSubject<UserProfile | null>(null);
  currentUser$: Observable<UserProfile | null> = this._currentUser.asObservable();

  private _isLoggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$: Observable<boolean> = this._isLoggedIn.asObservable();

  constructor() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const user: UserProfile = JSON.parse(storedUser);
        this._currentUser.next(user);
        this._isLoggedIn.next(true);
      }
    }
  }

  setCurrentUser(user: UserProfile) {
    this._currentUser.next(user);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    this._isLoggedIn.next(true);
  }

  getCurrentUser(): UserProfile | null {
    return this._currentUser.getValue();
  }

  // Accept either a UserProfile object or a simple display name string
  login(userOrName: UserProfile | string, ...rest: any[]) {
    if (typeof userOrName === 'string') {
      const user: UserProfile = { HoTenKhachHang: userOrName };
      this.setCurrentUser(user);
      return;
    }

    if (userOrName && typeof userOrName === 'object') {
      this.setCurrentUser(userOrName as UserProfile);
      return;
    }

    // Fallback: if old signature with many args used
    if (rest && rest.length >= 8 && typeof userOrName === 'string') {
      const MaKhachHang = userOrName as unknown as string;
      const HoTenKhachHang = rest[0];
      const SoDienThoai = rest[1];
      const Email = rest[2];
      const AnhDaiDien = rest[3];
      const GioiTinh = rest[4];
      const NgaySinh = rest[5];
      const TrangThaiTaiKhoan = rest[6];
      const NgayDangKy = rest[7];
      const user: UserProfile = { MaKhachHang, HoTenKhachHang, SoDienThoai, Email, AnhDaiDien, GioiTinh, NgaySinh, TrangThaiTaiKhoan, NgayDangKy };
      this.setCurrentUser(user);
    }
  }

  logout() {
    this._currentUser.next(null);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('access_token');
      localStorage.removeItem('customer_info');
      localStorage.removeItem('currentUserId');
    }
    this._isLoggedIn.next(false);
  }
}

  