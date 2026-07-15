const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

function token(): string | null {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem('conecta_token');
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
      ...init.headers,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const msg = await res.json().catch(() => ({}));
    throw new Error(msg.message ?? `Error ${res.status}`);
  }
  return res.json();
}

const qs = (f: Record<string, any>) =>
  Object.entries(f)
    .filter(([, v]) => v !== undefined && v !== '' && v !== null && !(Array.isArray(v) && v.length === 0))
    .map(([k, v]) => `${k}=${encodeURIComponent(Array.isArray(v) ? v.join(',') : v)}`)
    .join('&');

export const api = {
  login: (email: string, password: string) =>
    request<{ accessToken: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  kpis: (f: Record<string, any>) => request<any>(`/dashboard/kpis?${qs(f)}`),
  rubro: (f: Record<string, any>) => request<any[]>(`/dashboard/rubro?${qs(f)}`),
  cargo: (f: Record<string, any>) => request<any[]>(`/dashboard/cargo?${qs(f)}`),
  empleoPorAnio: (f: Record<string, any>) => request<any[]>(`/dashboard/empleo-por-anio?${qs(f)}`),
  filtros: () => request<any>('/dashboard/filtros'),
  respuestas: (f: Record<string, any>) => request<any>(`/respuestas?${qs(f)}`),

  // Descarga autenticada (blob) para reportes
  descargar: async (formato: 'csv' | 'excel' | 'pdf', f: Record<string, any>) => {
    const res = await fetch(`${BASE}/reports/${formato}?${qs(f)}`, {
      headers: token() ? { Authorization: `Bearer ${token()}` } : {},
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conecta.${formato === 'excel' ? 'xlsx' : formato}`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Administración de usuarios
  usuarios: () => request<any[]>('/admin/usuarios'),
  crearUsuario: (d: any) => request<any>('/admin/usuarios', { method: 'POST', body: JSON.stringify(d) }),
  actualizarUsuario: (id: number, d: any) => request<any>(`/admin/usuarios/${id}`, { method: 'PATCH', body: JSON.stringify(d) }),
  eliminarUsuario: (id: number) => request<any>(`/admin/usuarios/${id}`, { method: 'DELETE' }),

  // Importación de Excel
  importarExcel: async (file: File, dryRun: boolean) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${BASE}/import/excel?dryRun=${dryRun}`, {
      method: 'POST',
      headers: token() ? { Authorization: `Bearer ${token()}` } : {},
      body: fd,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message ?? `Error ${res.status}`);
    return json;
  },
};
