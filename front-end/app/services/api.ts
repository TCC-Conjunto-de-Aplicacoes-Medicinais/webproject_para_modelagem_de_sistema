const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8080/api/v1'
  : '/api/v1';

export class ApiError extends Error {
  constructor(public message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithConfig(endpoint: string, config: RequestInit = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...config,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new ApiError(data?.error || 'Erro inesperado na API', response.status);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Erro de conexão com o servidor');
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

  // --- Projects ---
  createProject: async (token: string, data: any) => {
    return fetchWithConfig('/projects', {
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
};
