import { useEffect, useState } from 'react';
import api from '../api';

// Lista de categorías fijas para la tienda
const CATEGORIAS = ['Componentes PC', 'Periféricos', 'Monitores', 'Notebooks', 'Accesorios'];

// Formulario vacío: lo definimos arriba para reiniciarlo al guardar.
const vacio = { nombre: '', descripcion: '', precio: '', stock: '', categoria: '' };

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState(vacio);

  // ----- Estado para la edición inline -----
  // editRowId  -> id del producto en edición (null = ninguno)
  // editData   -> copia editable de esa fila
  const [editRowId, setEditRowId] = useState(null);
  const [editData, setEditData]   = useState({});

  // Carga la lista de productos desde el backend
  const cargar = async () => {
    const { data } = await api.get('/productos');
    setProductos(data);
  };

  useEffect(() => { cargar(); }, []);

  // Envía el formulario (crear producto)
  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      precio: Number(form.precio),
      stock:  Number(form.stock)
    };
    await api.post('/productos', payload);
    setForm(vacio);
    cargar();
  };

  const eliminar = async (id, nombre) => {
    if (!confirm(`¿Eliminar el producto "${nombre}"?`)) return;
    try {
      await api.delete(`/productos/${id}`);
      cargar();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  // ============================================================
  //  Edición inline
  // ============================================================
  // 1) Al hacer click en "Editar", clonamos la fila y activamos
  //    el modo edición guardando su id.
  const empezarEdicion = (p) => {
    setEditRowId(p._id);
    setEditData({
      nombre:      p.nombre,
      descripcion: p.descripcion || '',
      precio:      p.precio,
      stock:       p.stock,
      categoria:   p.categoria
    });
  };

  // 2) "Cancelar" -> limpiamos el estado, sin tocar la BD.
  const cancelarEdicion = () => {
    setEditRowId(null);
    setEditData({});
  };

  // 3) "Guardar" -> PUT al backend con los datos editados.
  const guardarEdicion = async (id) => {
    try {
      await api.put(`/productos/${id}`, {
        ...editData,
        precio: Number(editData.precio),
        stock:  Number(editData.stock)
      });
      cancelarEdicion();
      cargar();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <section className="seccion">
      <h2>Productos</h2>

      <form onSubmit={submit} className="formulario">
        <div className="form-grid">
          <div className="campo">
            <label className="label">Nombre del producto</label>
            <input className="input" placeholder="Ej: Mouse Gamer RGB"
                   value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
          </div>

          <div className="campo">
            <label className="label">Descripción</label>
            <input className="input" placeholder="Detalle breve del producto"
                   value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
          </div>

          <div className="campo">
            <label className="label">Precio (en pesos $)</label>
            <input className="input" type="number" min="0" placeholder="Ej: 15000"
                   value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} />
          </div>

          <div className="campo">
            <label className="label">Stock (unidades disponibles)</label>
            <input className="input" type="number" min="0" placeholder="Ej: 25"
                   value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
          </div>

          <div className="campo">
            <label className="label">Categoría</label>
            <select className="input" value={form.categoria}
                    onChange={e => setForm({ ...form, categoria: e.target.value })} required>
              <option value="">-- Elegir categoría --</option>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">+ Agregar Producto</button>
      </form>

      {/*
        VISTA ERP: tabla compacta (Data Grid). Estilo utilitario,
        ideal para manejar gran cantidad de registros.
        En la última celda, la fila puede estar en modo lectura
        o modo edición según `editRowId`.
      */}
      <div className="datatable-wrapper">
        <div className="datatable-toolbar">
          <span className="datatable-titulo">
            Listado de productos
            <span className="datatable-count">({productos.length})</span>
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
                <th>Categoría</th>
                <th style={{ textAlign: 'right' }}>Precio</th>
                <th style={{ textAlign: 'right' }}>Stock</th>
                <th>Descripción</th>
                <th className="datatable-acciones-th">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="datatable-vacio">
                    No hay productos cargados todavía.
                  </td>
                </tr>
              ) : (
                productos.map(p => {
                  // ¿Esta fila está en modo edición?
                  const enEdicion = editRowId === p._id;

                  return (
                    <tr key={p._id} className={enEdicion ? 'fila-en-edicion' : ''}>
                      {/* ----- Nombre ----- */}
                      <td>
                        {enEdicion
                          ? <input className="input input-inline"
                                   value={editData.nombre}
                                   onChange={e => setEditData({ ...editData, nombre: e.target.value })} />
                          : <strong>{p.nombre}</strong>}
                      </td>

                      {/* ----- Categoría (select) ----- */}
                      <td>
                        {enEdicion
                          ? <select className="input input-inline"
                                    value={editData.categoria}
                                    onChange={e => setEditData({ ...editData, categoria: e.target.value })}>
                              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          : <span className="badge badge-cat">{p.categoria}</span>}
                      </td>

                      {/* ----- Precio ----- */}
                      <td style={{ textAlign: 'right' }} className="datatable-mono">
                        {enEdicion
                          ? <input className="input input-inline input-mono"
                                   type="number" min="0"
                                   value={editData.precio}
                                   onChange={e => setEditData({ ...editData, precio: e.target.value })} />
                          : `$${p.precio}`}
                      </td>

                      {/* ----- Stock ----- */}
                      <td style={{ textAlign: 'right' }} className="datatable-mono">
                        {enEdicion
                          ? <input className="input input-inline input-mono"
                                   type="number" min="0"
                                   value={editData.stock}
                                   onChange={e => setEditData({ ...editData, stock: e.target.value })} />
                          : p.stock}
                      </td>

                      {/* ----- Descripción ----- */}
                      <td title={p.descripcion}>
                        {enEdicion
                          ? <input className="input input-inline"
                                   value={editData.descripcion}
                                   onChange={e => setEditData({ ...editData, descripcion: e.target.value })} />
                          : p.descripcion || '—'}
                      </td>

                      {/* ----- Acciones: Editar / Guardar / Cancelar ----- */}
                      <td className="datatable-acciones-td">
                        {enEdicion ? (
                          <>
                            <button className="icon-btn icon-btn-save"
                                    title="Guardar"
                                    onClick={() => guardarEdicion(p._id)}>💾</button>
                            <button className="icon-btn icon-btn-cancel"
                                    title="Cancelar"
                                    onClick={cancelarEdicion}>✕</button>
                          </>
                        ) : (
                          <>
                            <button className="icon-btn icon-btn-edit"
                                    title="Editar"
                                    onClick={() => empezarEdicion(p)}>✏️</button>
                            <button className="icon-btn icon-btn-delete"
                                    title="Eliminar"
                                    onClick={() => eliminar(p._id, p.nombre)}>🗑</button>
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
