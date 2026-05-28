import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    
    // Attach token if access_token exists and the request URL targets the profile endpoints
    const url = req.url;
    if (token && (url.includes('/customer/profile') || url.includes('/customer/profile/history'))) {
      const clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next(clonedReq);
    }
  }
  return next(req);
};
