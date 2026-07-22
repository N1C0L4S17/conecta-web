'use client';
import { useEffect, useState } from 'react';
import { Users, Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Nav } from '@/components/Nav';
import { useAuth } from '@/lib/auth';

const ROLES = ['ADMIN', 'ANALISTA', 'CONSULTA'];

export default function AdminPage() {
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
  nombre: '',
  email: '',
  password: '',
  confirmarPassword: '',
  rol: 'CONSULTA'
  });
  const [creando, setCreando] = useState(false);

  const cargar = () => api.usuarios().then(setUsuarios).catch((e) => setError(e.message));
  useEffect(() => { cargar(); }, []);

  const crear = async () => {
    setError(''); setCreando(true);
    try {
      await api.crearUsuario(form);
      setForm({
                nombre: '',
                email: '',
                password: '',
                confirmarPassword: '',
                rol: 'CONSULTA'
              });
      cargar();
    } catch (e: any) { setError(e.message); }
    finally { setCreando(false); }
  };

  const cambiarRol = async (id: number, rol: string) => {
    try { await api.actualizarUsuario(id, { rol }); cargar(); }
    catch (e: any) { setError(e.message); }
  };
  const toggleActivo = async (id: number, activo: boolean) => {
    try { await api.actualizarUsuario(id, { activo }); cargar(); }
    catch (e: any) { setError(e.message); }
  };
  const eliminar = async (id: number) => {
  if (id === currentUser?.id) {
    setError('No puedes eliminar tu propio usuario');
    return;
  }

  if (!confirm('¿Eliminar este usuario?')) return;

  try {
    await api.eliminarUsuario(id);
    cargar();
  } catch (e: any) {
    setError(e.message);
  }
};

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="md:pl-[280px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <h1 className="text-xl font-semibold text-ink flex items-center gap-2">
          <Users size={20} className="text-brand" /> Usuarios
        </h1>
        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Alta */}
        <div className="card p-4 flex flex-wrap gap-3 items-end">
          <input placeholder="Nombre" value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="border rounded-md px-3 py-2 text-sm" />
          <input placeholder="Correo" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border rounded-md px-3 py-2 text-sm" />
          <input placeholder="Contraseña" type="password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="border rounded-md px-3 py-2 text-sm" />
          <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}
            className="border rounded-md px-3 py-2 text-sm bg-white">
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <button onClick={crear} disabled={creando}
            className="flex items-center gap-1 bg-brand hover:bg-brand-dark text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50">
            <Plus size={15} /> Crear
          </button>
        </div>

        {/* Tabla */}
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-muted">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Nombre</th>
                <th className="text-left px-4 py-2 font-medium">Correo</th>
                <th className="text-left px-4 py-2 font-medium">Rol</th>
                <th className="text-left px-4 py-2 font-medium">Activo</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-2">{u.nombre}</td>
                  <td className="px-4 py-2 text-muted">{u.email}</td>
                  <td className="px-4 py-2">
                    <select value={u.rol} onChange={(e) => cambiarRol(u.id, e.target.value)}
                      className="border rounded-md px-2 py-1 text-sm bg-white">
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input type="checkbox" checked={u.activo}
                      onChange={(e) => toggleActivo(u.id, e.target.checked)} />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => eliminar(u.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </main>
    </div>
  );
}
