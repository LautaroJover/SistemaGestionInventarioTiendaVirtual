import { useEffect, useState } from 'react';
import api from '../api';

// Lista de categorías fijas para la tienda
const CATEGORIAS = ['Componentes PC', 'Periféricos', 'Monitores', 'Notebooks', 'Accesorios'];

// Formulario vacío: lo definimos arriba para reiniciarlo al guardar.
const vacio = { nombre: '', descripcion: '', precio: '', stock: '', categoria: '' };

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState(vacio);

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
        VISTA ERP: en lugar de tarjetas, mostramos los productos
        en una tabla compacta (Data Grid). Estilo utilitario,
        ideal para manejar gran cantidad de registros.
      */}
      <div className="datatable-wrapper">
        <div className="datatable-toolbar">
          <span className="datatable-titulo">
            Listado de productos
            <span className="datatable-count">({productos.length})</span>
          </span>
          <div className="datatable-acciones">
            <button className="btn-export" onClick={() => alert('Use Informes para exportar productos')}>
              + Nuevo
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
                productos.map(p => (
                  <tr key={p._id}>
                    <td><strong>{p.nombre}</strong></td>
                    <td><span className="badge badge-cat">{p.categoria}</span></td>
                    <td style={{ textAlign: 'right' }} className="datatable-mono">${p.precio}</td>
                    <td style={{ textAlign: 'right' }} className="datatable-mono">{p.stock}</td>
                    <td title={p.descripcion}>{p.descripcion || '—'}</td>
                    <td className="datatable-acciones-td">
                      <button
                        className="icon-btn icon-btn-edit"
                        title="Editar"
                        onClick={() => alert('Edición inline: pendiente')}
                      >✏️</button>
                      <button
                        className="icon-btn icon-btn-delete"
                        title="Eliminar"
                        onClick={() => eliminar(p._id, p.nombre)}
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
