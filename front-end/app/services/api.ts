const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8080/api/v1'
  : '/api/v1';

export class ApiError extends Error {
  constructor(public message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null, error?: any) => void> = [];

function subscribeTokenRefresh(cb: (token: string | null, error?: any) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string | null, error?: any) {
  refreshSubscribers.forEach((cb) => cb(token, error));
  refreshSubscribers = [];
}

async function fetchWithConfig(endpoint: string, config: RequestInit = {}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...config,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });

    const data = await response.json().catch(() => null);

    // If 401 Unauthorized and not an auth route, attempt auto-refresh and retry
    if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
      const savedRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('openhealth_refresh_token') : null;
      if (savedRefreshToken) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh_token: savedRefreshToken }),
            });
            const refreshData = await refreshRes.json().catch(() => null);
            if (refreshRes.ok && refreshData?.access_token) {
              const newAccessToken = refreshData.access_token;
              localStorage.setItem('openhealth_token', newAccessToken);
              if (refreshData.refresh_token) {
                localStorage.setItem('openhealth_refresh_token', refreshData.refresh_token);
              }
              isRefreshing = false;
              onRefreshed(newAccessToken);

              // Retry current request
              const newHeaders = {
                ...config.headers,
                'Content-Type': 'application/json',
                Authorization: `Bearer ${newAccessToken}`,
              };
              return fetchWithConfig(endpoint, { ...config, headers: newHeaders });
            } else {
              // Token expirou ou foi revogado no Keycloak
              if (typeof window !== 'undefined') {
                localStorage.removeItem('openhealth_token');
                localStorage.removeItem('openhealth_refresh_token');
                window.dispatchEvent(new Event('openhealth_session_expired'));
              }
              isRefreshing = false;
              onRefreshed(null, new ApiError('Sessão expirada. Faça login novamente.', 401));
            }
          } catch (refreshErr) {
            isRefreshing = false;
            onRefreshed(null, refreshErr);
          }
          isRefreshing = false;
        } else {
          // Wait for the active refresh to finish then retry
          return new Promise((resolve, reject) => {
            subscribeTokenRefresh((newToken, err) => {
              if (err || !newToken) {
                resolve({ projects: [] }); // Soft fallback for query subscribers
                return;
              }
              const newHeaders = {
                ...config.headers,
                'Content-Type': 'application/json',
                Authorization: `Bearer ${newToken}`,
              };
              fetchWithConfig(endpoint, { ...config, headers: newHeaders })
                .then(resolve)
                .catch(reject);
            });
          });
        }
      } else {
        // Sem refresh token disponível, limpa a sessão
        if (typeof window !== 'undefined') {
          localStorage.removeItem('openhealth_token');
          window.dispatchEvent(new Event('openhealth_session_expired'));
        }
      }
    }

    if (!response.ok) {
      const errorMsg = data?.error || data?.message || `Erro inesperado na API (${response.status})`;
      throw new ApiError(errorMsg, response.status);
    }

    return data;
  } catch (error: any) {
    if (error instanceof ApiError || error?.name === 'ApiError') throw error;
    throw new ApiError(error?.message || 'Erro de conexão com o servidor');
  }
}

export const api = {
  // --- Auth ---
  register: async (payload: any) => {
    return fetchWithConfig('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  login: async (credentials: any) => {
    // Mapeando do frontend (password) para o backend (senha)
    const payload = {
      email: credentials.email,
      senha: credentials.password,
    };
    return fetchWithConfig('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  refresh: async (refreshToken: string) => {
    return fetchWithConfig('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },

  verifyCode: async (email: string, code: string) => {
    return fetchWithConfig('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },

  forgotPassword: async (email: string) => {
    return fetchWithConfig('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (payload: { email: string; code: string; new_password: string }) => {
    return fetchWithConfig('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // --- Projects ---
  createProject: async (token: string, data: any, mode: 'aws' | 'local' = 'aws') => {
    return fetchWithConfig(`/projects?mode=${mode}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  listProjects: async (token: string) => {
    return fetchWithConfig('/projects', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  deleteProject: async (token: string, id: string) => {
    return fetchWithConfig(`/projects/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  getProjectStatus: async (token: string, id: string) => {
    return fetchWithConfig(`/projects/${id}/status`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

// --- Sistema e painel de administração ---
export const systemApi = {
  // Público: diz se o servidor libera a geração local (só o notebook do administrador).
  capabilities: async (): Promise<{ localGenerationEnabled: boolean }> => {
    try {
      return await fetchWithConfig('/system/capabilities', { method: 'GET' });
    } catch {
      return { localGenerationEnabled: false };
    }
  },

  adminStatus: async (token: string) =>
    fetchWithConfig('/admin/status', { method: 'GET', headers: { Authorization: `Bearer ${token}` } }),

  adminClinics: async (token: string) =>
    fetchWithConfig('/admin/clinics', { method: 'GET', headers: { Authorization: `Bearer ${token}` } }),

  destroyClinic: async (token: string, id: string) =>
    fetchWithConfig(`/admin/clinics/${encodeURIComponent(id)}/destroy`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }),
};
