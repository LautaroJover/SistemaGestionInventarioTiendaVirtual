import { useEffect, useState } from 'react';
import api from '../api';

const vacio = { nombre: '', descripcion: '', precio: 0, stock: 0, categoria: '' };

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState(vacio);

  const cargar = async () => {
    const { data } = await api.get('/productos');
    setProductos(data);
  };

  useEffect(() => { cargar(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/productos', form);
    setForm(vacio);
    cargar();
  };

  // Eliminar producto con confirmación (buena práctica de UX)
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

      {/* Formulario de alta */}
      <form onSubmit={submit} className="formulario">
        <div className="form-grid">
          <input className="input" placeholder="Nombre"      value={form.nombre}      onChange={e => setForm({ ...form, nombre: e.target.value })} />
          <input className="input" placeholder="Descripción" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
          <input className="input" placeholder="Precio" type="number" value={form.precio} onChange={e => setForm({ ...form, precio: Number(e.target.value) })} />
          <input className="input" placeholder="Stock"  type="number" value={form.stock}  onChange={e => setForm({ ...form, stock: Number(e.target.value) })} />
          <input className="input" placeholder="Categoría" value={form.categoria}  onChange={e => setForm({ ...form, categoria: e.target.value })} />
        </div>
        <button type="submit" className="btn btn-primary">+ Agregar Producto</button>
      </form>

      {/* Listado en tarjetas */}
      {productos.length === 0
        ? <p className="vacio">No hay productos cargados todavía.</p>
        : (
          <div className="grid-cards">
            {productos.map(p => (
              <div key={p._id} className="card">
                <h3 className="card-titulo">{p.nombre}</h3>
                <p className="card-desc">{p.descripcion || 'Sin descripción'}</p>
                <div className="card-meta">
                  <span className="badge badge-cat">{p.categoria}</span>
                  <span className="card-precio">${p.precio}</span>
                </div>
                <p className="card-stock">Stock disponible: <strong>{p.stock}</strong></p>
                <button className="btn btn-danger" onClick={() => eliminar(p._id, p.nombre)}>
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
