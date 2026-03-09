import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = Cookies.get('refresh_token');
      if (!refreshToken) {
        window.location.href = '/login';
        return Promise.reject(err);
      }
      try {
        const { data } = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
        Cookies.set('access_token', data.data.accessToken, { expires: 1 / 96 }); // 15min
        Cookies.set('refresh_token', data.data.refreshToken, { expires: 7 });
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// ── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then((r) => r.data.data),
  me: () => api.get('/auth/me').then((r) => r.data.data),
};

// ── Courses ────────────────────────────────────────────────────────────────
export const coursesApi = {
  list: () => api.get('/courses').then((r) => r.data.data),
  get: (id: string) => api.get(`/courses/${id}`).then((r) => r.data.data),
  create: (data: any) => api.post('/courses', data).then((r) => r.data.data),
  update: (id: string, data: any) => api.patch(`/courses/${id}`, data).then((r) => r.data.data),
  delete: (id: string) => api.delete(`/courses/${id}`),
  publish: (id: string) => api.post(`/courses/${id}/publish`),
  unpublish: (id: string) => api.post(`/courses/${id}/unpublish`),
};

// ── Units ──────────────────────────────────────────────────────────────────
export const unitsApi = {
  list: (courseId: string) => api.get(`/courses/${courseId}/units`).then((r) => r.data.data),
  create: (courseId: string, data: any) => api.post(`/courses/${courseId}/units`, data).then((r) => r.data.data),
  update: (id: string, data: any) => api.patch(`/units/${id}`, data).then((r) => r.data.data),
  delete: (id: string) => api.delete(`/units/${id}`),
  reorder: (courseId: string, ids: string[]) => api.post(`/courses/${courseId}/units/reorder`, { ids }),
};

// ── Lessons ────────────────────────────────────────────────────────────────
export const lessonsApi = {
  list: (unitId: string) => api.get(`/units/${unitId}/lessons`).then((r) => r.data.data),
  get: (id: string) => api.get(`/lessons/${id}`).then((r) => r.data.data),
  create: (unitId: string, data: any) => api.post(`/units/${unitId}/lessons`, data).then((r) => r.data.data),
  update: (id: string, data: any) => api.patch(`/lessons/${id}`, data).then((r) => r.data.data),
  delete: (id: string) => api.delete(`/lessons/${id}`),
  reorder: (unitId: string, ids: string[]) => api.post(`/units/${unitId}/lessons/reorder`, { ids }),
};

// ── Exercises ──────────────────────────────────────────────────────────────
export const exercisesApi = {
  list: (lessonId: string) => api.get(`/lessons/${lessonId}/exercises`).then((r) => r.data.data),
  create: (lessonId: string, data: any) => api.post(`/lessons/${lessonId}/exercises`, data).then((r) => r.data.data),
  update: (id: string, data: any) => api.patch(`/exercises/${id}`, data).then((r) => r.data.data),
  delete: (id: string) => api.delete(`/exercises/${id}`),
  reorder: (lessonId: string, ids: string[]) => api.post(`/lessons/${lessonId}/exercises/reorder`, { ids }),
};

// ── Vocabulary ─────────────────────────────────────────────────────────────
export const vocabApi = {
  list: (courseId: string, params?: any) => api.get(`/courses/${courseId}/vocabulary`, { params }).then((r) => r.data.data),
  create: (courseId: string, data: any) => api.post(`/courses/${courseId}/vocabulary`, data).then((r) => r.data.data),
  update: (id: string, data: any) => api.patch(`/vocabulary/${id}`, data).then((r) => r.data.data),
  delete: (id: string) => api.delete(`/vocabulary/${id}`),
};

// ── Admin ──────────────────────────────────────────────────────────────────
export const adminApi = {
  stats: () => api.get('/admin/stats').then((r) => r.data.data),
  users: (params?: any) => api.get('/admin/users', { params }).then((r) => r.data.data),
  updateUser: (id: string, data: any) => api.patch(`/admin/users/${id}`, data).then((r) => r.data.data),
  exerciseAnalytics: () => api.get('/admin/analytics/exercises').then((r) => r.data.data),
  getConfig: () => api.get('/admin/config').then((r) => r.data.data),
  setConfig: (key: string, value: any) => api.post('/admin/config', { key, value }),
};

// ── Exercise Types ─────────────────────────────────────────────────────────
export const exerciseTypesApi = {
  list: (onlyActive = false) => api.get('/exercise-types', { params: onlyActive ? { active: 'true' } : undefined }).then((r) => r.data.data),
  get: (slug: string) => api.get(`/exercise-types/${slug}`).then((r) => r.data.data),
  create: (data: any) => api.post('/exercise-types', data).then((r) => r.data.data),
  update: (slug: string, data: any) => api.patch(`/exercise-types/${slug}`, data).then((r) => r.data.data),
  delete: (slug: string) => api.delete(`/exercise-types/${slug}`),
  reorder: (slugs: string[]) => api.patch('/exercise-types/reorder', { slugs }),
};

// ── Media ──────────────────────────────────────────────────────────────────
export const mediaApi = {
  list: (type?: string) => api.get('/media', { params: { type } }).then((r) => r.data.data),
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/media/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data.data);
  },
  delete: (id: string) => api.delete(`/media/${id}`),
};
