import { useEffect, useState } from 'react';
import api from '../api';

// Lista de categorías fijas para la tienda (requisito 1)
const CATEGORIAS = ['Componentes PC', 'Periféricos', 'Monitores', 'Notebooks', 'Accesorios'];

const vacio = { nombre: '', descripcion: '', precio: '', stock: '', categoria: '', imagen: '' };

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
    // Convertimos precio y stock a número antes de mandar al backend
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

          <div className="campo campo-full">
            <label className="label">URL de la imagen del producto</label>
            <input className="input" type="url" placeholder="https://ejemplo.com/mi-imagen.jpg"
                   value={form.imagen} onChange={e => setForm({ ...form, imagen: e.target.value })} />
            <small className="ayuda">Pegá cualquier URL pública de imagen. Si la dejás vacía, se mostrará una imagen por defecto.</small>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">+ Agregar Producto</button>
      </form>

      {productos.length === 0
        ? <p className="vacio">No hay productos cargados todavía.</p>
        : (
          <div className="grid-cards">
            {productos.map(p => (
              <div key={p._id} className="card">
                {/* Imagen del producto. Si no hay, mostramos un placeholder. */}
                <img
                  className="card-imagen"
                  src={p.imagen || 'https://placehold.co/400x300?text=Sin+imagen'}
                  alt={p.nombre}
                  onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=Sin+imagen'; }}
                />

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
