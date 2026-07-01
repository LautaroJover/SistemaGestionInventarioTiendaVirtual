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

      {/*
        VISTA ERP: tabla compacta en lugar de tarjetas. Misma
        estructura que Productos para mantener coherencia visual.
      */}
      <div className="datatable-wrapper">
        <div className="datatable-toolbar">
          <span className="datatable-titulo">
            Listado de clientes
            <span className="datatable-count">({clientes.length})</span>
          </span>
          <div className="datatable-acciones">
            <button className="btn-export" onClick={() => alert('Use el formulario de arriba para dar de alta')}>
              + Nuevo
            </button>
          </div>
        </div>

        <div className="datatable-scroll">
          <table className="datatable">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th className="datatable-acciones-th">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="datatable-vacio">
                    No hay clientes cargados todavía.
                  </td>
                </tr>
              ) : (
                clientes.map(c => (
                  <tr key={c._id}>
                    <td><strong>{c.nombre}</strong></td>
                    <td>{c.email}</td>
                    <td>{c.telefono || '—'}</td>
                    <td title={c.direccion}>{c.direccion || '—'}</td>
                    <td className="datatable-acciones-td">
                      <button
                        className="icon-btn icon-btn-edit"
                        title="Editar"
                        onClick={() => alert('Edición inline: pendiente')}
                      >✏️</button>
                      <button
                        className="icon-btn icon-btn-delete"
                        title="Eliminar"
                        onClick={() => eliminar(c._id, c.nombre)}
                      >🗑</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
