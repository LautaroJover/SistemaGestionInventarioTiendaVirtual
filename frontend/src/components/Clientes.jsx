import { useEffect, useState } from 'react';
import api from '../api';

const vacio = { nombre: '', email: '', telefono: '', direccion: '' };

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState(vacio);

  const cargar = async () => {
    const { data } = await api.get('/clientes');
    setClientes(data);
  };
  useEffect(() => { cargar(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/clientes', form);
    setForm(vacio);
    cargar();
  };

  const eliminar = async (id, nombre) => {
    if (!confirm(`¿Eliminar al cliente "${nombre}"?`)) return;
    try {
      await api.delete(`/clientes/${id}`);
      cargar();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <section className="seccion">
      <h2>Clientes</h2>

      <form onSubmit={submit} className="formulario">
        <div className="form-grid form-grid-4">
          <input className="input" placeholder="Nombre"    value={form.nombre}    onChange={e => setForm({ ...form, nombre: e.target.value })} />
          <input className="input" placeholder="Email"     value={form.email}     onChange={e => setForm({ ...form, email: e.target.value })} />
          <input className="input" placeholder="Teléfono"  value={form.telefono}  onChange={e => setForm({ ...form, telefono: e.target.value })} />
          <input className="input" placeholder="Dirección" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} />
        </div>
        <button type="submit" className="btn btn-primary">+ Crear Cliente</button>
      </form>

      {clientes.length === 0
        ? <p className="vacio">No hay clientes cargados todavía.</p>
        : (
          <div className="grid-cards">
            {clientes.map(c => (
              <div key={c._id} className="card">
                <h3 className="card-titulo">{c.nombre}</h3>
                <p className="card-linea">📧 {c.email}</p>
                <p className="card-linea">📞 {c.telefono || '—'}</p>
                <p className="card-linea">🏠 {c.direccion || '—'}</p>
                <button className="btn btn-danger" onClick={() => eliminar(c._id, c.nombre)}>
                  🗑 Eliminar
                </button>
              </div>
            ))}
          </div>
        )
      }
    </section>
  );
}
