export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('nexastream_token') : null;
  let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (refreshResponse.ok) {
      const refreshed = await refreshResponse.json();
      localStorage.setItem('nexastream_token', refreshed.accessToken);
      response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshed.accessToken}`,
          ...(options.headers || {}),
        },
      });
    }
  }

  return response;
}
