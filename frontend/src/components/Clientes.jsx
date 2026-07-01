import { useEffect, useState } from 'react';
import api from '../api';

const vacio = { nombre: '', email: '', telefono: '', direccion: '' };

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState(vacio);

  // ----- Estado para la edición inline -----
  const [editRowId, setEditRowId] = useState(null);
  const [editData, setEditData]   = useState({});

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

  // ============================================================
  //  Edición inline
  // ============================================================
  const empezarEdicion = (c) => {
    setEditRowId(c._id);
    setEditData({
      nombre:    c.nombre,
      email:     c.email,
      telefono:  c.telefono || '',
      direccion: c.direccion || ''
    });
  };

  const cancelarEdicion = () => {
    setEditRowId(null);
    setEditData({});
  };

  const guardarEdicion = async (id) => {
    try {
      await api.put(`/clientes/${id}`, editData);
      cancelarEdicion();
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
        VISTA ERP: tabla compacta. Misma estructura que Productos.
        La última celda alterna entre Editar/Eliminar (lectura)
        y Guardar/Cancelar (edición).
      */}
      <div className="datatable-wrapper">
        <div className="datatable-toolbar">
          <span className="datatable-titulo">
            Listado de clientes
            <span className="datatable-count">({clientes.length})</span>
          </span>
          <div className="datatable-acciones">
            <button className="btn-export" onClick={() => cargar()}>
              ⟳ Refrescar
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
                clientes.map(c => {
                  const enEdicion = editRowId === c._id;
                  return (
                    <tr key={c._id} className={enEdicion ? 'fila-en-edicion' : ''}>
                      {/* Nombre */}
                      <td>
                        {enEdicion
                          ? <input className="input input-inline"
                                   value={editData.nombre}
                                   onChange={e => setEditData({ ...editData, nombre: e.target.value })} />
                          : <strong>{c.nombre}</strong>}
                      </td>

                      {/* Email */}
                      <td>
                        {enEdicion
                          ? <input className="input input-inline"
                                   type="email"
                                   value={editData.email}
                                   onChange={e => setEditData({ ...editData, email: e.target.value })} />
                          : c.email}
                      </td>

                      {/* Teléfono */}
                      <td>
                        {enEdicion
                          ? <input className="input input-inline"
                                   value={editData.telefono}
                                   onChange={e => setEditData({ ...editData, telefono: e.target.value })} />
                          : c.telefono || '—'}
                      </td>

                      {/* Dirección */}
                      <td title={c.direccion}>
                        {enEdicion
                          ? <input className="input input-inline"
                                   value={editData.direccion}
                                   onChange={e => setEditData({ ...editData, direccion: e.target.value })} />
                          : c.direccion || '—'}
                      </td>

                      {/* Acciones */}
                      <td className="datatable-acciones-td">
                        {enEdicion ? (
                          <>
                            <button className="icon-btn icon-btn-save"
                                    title="Guardar"
                                    onClick={() => guardarEdicion(c._id)}>💾</button>
                            <button className="icon-btn icon-btn-cancel"
                                    title="Cancelar"
                                    onClick={cancelarEdicion}>✕</button>
                          </>
                        ) : (
                          <>
                            <button className="icon-btn icon-btn-edit"
                                    title="Editar"
                                    onClick={() => empezarEdicion(c)}>✏️</button>
                            <button className="icon-btn icon-btn-delete"
                                    title="Eliminar"
                                    onClick={() => eliminar(c._id, c.nombre)}>🗑</button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
