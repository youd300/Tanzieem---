/**
 * TANZIEEM Production API Client
 * Secure communication with authenticated backend routes.
 */

const TOKEN_KEY = 'tanzieem_auth_token_v1';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error || `API Error: ${response.status} ${response.statusText}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  auth: {
    register: (body: { name: string; username: string; email: string; password: string }) =>
      request<{ token: string; user: any; profile: any }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    login: (body: { emailOrUsername: string; password: string }) =>
      request<{ token: string; user: any; profile: any }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    logout: () =>
      request<{ success: boolean }>('/api/auth/logout', {
        method: 'POST',
      }),

    me: () =>
      request<{ user: any; profile: any }>('/api/auth/me'),
  },

  profile: {
    get: () => request<any>('/api/profile'),
    update: (updates: any) =>
      request<any>('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
  },

  coins: {
    getTransactions: () => request<any[]>('/api/coins/transactions'),
    spend: (amount: number, reason: string) =>
      request<{ success: boolean; balanceBefore: number; balanceAfter: number; spent: number }>('/api/coins/spend', {
        method: 'POST',
        body: JSON.stringify({ amount, reason }),
      }),
  },

  timer: {
    getSessions: () => request<any[]>('/api/timer/sessions'),
    finish: (payload: { actualSeconds: number; taskId?: string; taskTitle?: string; plannedMinutes?: number }) =>
      request<{ success: boolean; sessionId: string; actualSeconds: number; actualMinutes: number; xpEarned: number; coinsEarned: number; profile: any }>('/api/timer/finish', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  tasks: {
    list: () => request<any[]>('/api/tasks'),
    create: (task: any) =>
      request<any>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(task),
      }),
    update: (id: string, updates: any) =>
      request<any>(`/api/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/tasks/${id}`, {
        method: 'DELETE',
      }),
    complete: (id: string) =>
      request<any>(`/api/tasks/${id}/complete`, {
        method: 'POST',
      }),
    reopen: (id: string) =>
      request<any>(`/api/tasks/${id}/reopen`, {
        method: 'POST',
      }),
  },

  dailyPlan: {
    get: (date: string) => request<{ id?: string; date: string; timeBlocks: any[]; notes: string }>(`/api/daily-plan?date=${encodeURIComponent(date)}`),
    save: (payload: { date: string; timeBlocks: any[]; notes: string }) =>
      request<{ success: boolean; date: string; timeBlocks: any[]; notes: string }>('/api/daily-plan', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  goals: {
    list: () => request<any[]>('/api/goals'),
    create: (goal: any) =>
      request<any>('/api/goals', {
        method: 'POST',
        body: JSON.stringify(goal),
      }),
    update: (id: string, updates: any) =>
      request<any>(`/api/goals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/goals/${id}`, {
        method: 'DELETE',
      }),
  },

  habits: {
    list: () => request<any[]>('/api/habits'),
    create: (habit: any) =>
      request<any>('/api/habits', {
        method: 'POST',
        body: JSON.stringify(habit),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/habits/${id}`, {
        method: 'DELETE',
      }),
    toggleToday: (id: string) =>
      request<any>(`/api/habits/${id}/toggle-today`, {
        method: 'POST',
      }),
  },

  calendar: {
    get: (month: string) => request<any>(`/api/calendar?month=${encodeURIComponent(month)}`),
  },

  analytics: {
    get: () => request<any>('/api/analytics'),
  },

  achievements: {
    get: () => request<any[]>('/api/achievements'),
  },

  quran: {
    getBookmarks: () => request<any[]>('/api/quran/bookmarks'),
    addBookmark: (bookmark: any) =>
      request<any>('/api/quran/bookmarks', {
        method: 'POST',
        body: JSON.stringify(bookmark),
      }),
    removeBookmark: (id: string) =>
      request<any>(`/api/quran/bookmarks/${id}`, {
        method: 'DELETE',
      }),
    getHistory: () => request<any[]>('/api/quran/history'),
    saveHistory: (history: any) =>
      request<any>('/api/quran/history', {
        method: 'POST',
        body: JSON.stringify(history),
      }),
  },

  podcasts: {
    getFavorites: () => request<any[]>('/api/podcasts/favorites'),
    toggleFavorite: (data: any) =>
      request<{ favorited: boolean }>('/api/podcasts/favorites/toggle', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getHistory: () => request<any[]>('/api/podcasts/history'),
    saveHistory: (data: any) =>
      request<any>('/api/podcasts/history', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  aiCoach: {
    ask: (prompt: string, userContext: any) =>
      request<{ reply: string }>('/api/ai-coach', {
        method: 'POST',
        body: JSON.stringify({ prompt, userContext }),
      }),
  },
};
