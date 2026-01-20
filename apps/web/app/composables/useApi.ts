export const useApi = () => {
  const config = useRuntimeConfig();
  const { accessToken, refreshTokens, logout } = useAuth();

  const request = async <T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (accessToken.value) {
      headers['Authorization'] = `Bearer ${accessToken.value}`;
    }

    let response = await fetch(`${config.public.apiBase}${path}`, {
      ...options,
      headers,
    });

    // Try to refresh token if unauthorized
    if (response.status === 401 && accessToken.value) {
      try {
        await refreshTokens();
        headers['Authorization'] = `Bearer ${accessToken.value}`;
        response = await fetch(`${config.public.apiBase}${path}`, {
          ...options,
          headers,
        });
      } catch {
        await logout();
        throw new Error('Session expired');
      }
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data.data;
  };

  const get = <T>(path: string) => request<T>(path);

  const post = <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });

  const patch = <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });

  const del = <T>(path: string) =>
    request<T>(path, {
      method: 'DELETE',
    });

  return { request, get, post, patch, del };
};
