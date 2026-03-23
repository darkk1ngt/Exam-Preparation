const API_BASE = '/api';

async function request(path, options = {}) {
  const config = {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  };

  if (options.body === undefined) {
    delete config.body;
  }

  const response = await fetch(`${API_BASE}${path}`, config);

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  if (!response.ok) {
    const error = new Error(data?.error || data?.message || `Request failed: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: (path, body) => request(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

export default api;
