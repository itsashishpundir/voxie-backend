import Cookies from 'js-cookie';
import { authApi } from './api';

export async function login(email: string, password: string) {
  const data = await authApi.login(email, password);
  Cookies.set('access_token', data.accessToken, { expires: 1 / 96 }); // 15min
  Cookies.set('refresh_token', data.refreshToken, { expires: 7 });
  return data.user;
}

export function logout() {
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
  window.location.href = '/login';
}

export function isLoggedIn(): boolean {
  return !!Cookies.get('access_token') || !!Cookies.get('refresh_token');
}
