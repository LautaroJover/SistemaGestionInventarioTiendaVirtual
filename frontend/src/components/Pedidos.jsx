import { useEffect, useState } from 'react';
import api from '../api';

// Estados válidos para un pedido (los mismos que valida el backend)
const ESTADOS = ['pendiente', 'enviado', 'entregado'];

export default function Pedidos() {
  const [pedidos, setPedidos]     = useState([]);
  const [clientes, setClientes]   = useState([]);
  const [productos, setProductos] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [items, setItems] = useState([{ productoId: '', cantidad: 1 }]);

  const cargar = async () => {
    const [p, c, pr] = await Promise.all([
      api.get('/pedidos'),
      api.get('/clientes'),
      api.get('/productos')
    ]);
    setPedidos(p.data);
    setClientes(c.data);
    setProductos(pr.data);
  };
  useEffect(() => { cargar(); }, []);

  const agregarItem = () => setItems([...items, { productoId: '', cantidad: 1 }]);

  const setItem = (i, campo, valor) => {
    const copia = [...items];
    copia[i] = { ...copia[i], [campo]: valor };
    setItems(copia);
  };

  const submit = async (e) => {
    e.preventDefault();
    const itemsLimpios = items
      .filter(it => it.productoId)
      .map(it => ({ productoId: it.productoId, cantidad: Number(it.cantidad) }));

    try {
      await api.post('/pedidos', { clienteId, items: itemsLimpios });
      setClienteId('');
      setItems([{ productoId: '', cantidad: 1 }]);
      cargar();
      alert('Pedido creado y stock descontado ✅');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este pedido?')) return;
    try {
      await api.delete(`/pedidos/${id}`);
      cargar();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  // Cambia el estado de un pedido usando la nueva ruta PUT.
  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await api.put(`/pedidos/${id}/estado`, { estado: nuevoEstado });
      cargar(); // refrescamos la lista
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const fmtFecha = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-AR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const badgeEstado = (estado) => {
    if (estado === 'entregado') return 'badge badge-estado badge-entregado';
    if (estado === 'enviado')   return 'badge badge-estado badge-enviado';
    return 'badge badge-estado badge-pendiente';
  };

  return (
    <section className="seccion">
      <h2>Nuevo Pedido</h2>

      <form onSubmit={submit} className="formulario">
        <label className="label">Cliente</label>
        <select className="input" value={clienteId} onChange={e => setClienteId(e.target.value)} required>
          <option value="">-- Elegir cliente --</option>
          {clientes.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
        </select>

        <label className="label">Productos</label>
        {items.map((it, i) => (
          <div key={i} className="fila-item">
            <select className="input" value={it.productoId} onChange={e => setItem(i, 'productoId', e.target.value)} required>
              <option value="">-- Producto --</option>
              {productos.map(p => <option key={p._id} value={p._id}>{p.nombre} (stock: {p.stock})</option>)}
            </select>
            <input className="input input-cantidad" type="number" min="1" value={it.cantidad}
                   onChange={e => setItem(i, 'cantidad', e.target.value)} placeholder="Cant." />
          </div>
        ))}

        <div className="acciones-form">
          <button type="button" className="btn btn-secondary" onClick={agregarItem}>+ Agregar producto</button>
          <button type="submit" className="btn btn-primary">Crear Pedido</button>
        </div>
      </form>

      <h2 className="mt-grande">Historial de Pedidos</h2>

      {pedidos.length === 0
        ? <p className="vacio">Todavía no hay pedidos registrados.</p>
        : (
          <div className="grid-cards">
            {pedidos.map(p => (
              <div key={p._id} className="card card-pedido">
                <div className="card-pedido-head">
                  <h3 className="card-titulo">
                    {p.cliente?.nombre || 'Cliente eliminado'}
                  </h3>
                  <span className={badgeEstado(p.estado)}>{p.estado}</span>
                </div>

                <p className="card-linea">📅 Fecha: <strong>{fmtFecha(p.fecha)}</strong></p>
                <p className="card-linea">💰 Total: <strong>${p.total}</strong></p>

                <h4 className="subtitulo">Productos:</h4>
                {p.productos && p.productos.length > 0 ? (
                  <ul className="lista-productos">
                    {p.productos.map((it, idx) => (
                      <li key={idx} className="item-producto">
                        <span className="item-nombre">
                          {it.producto?.nombre || 'Producto eliminado'}
                        </span>
                        <span className="item-cantidad">x{it.cantidad}</span>
                        <span className="item-precio">${it.precioUnitario}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="card-linea">Sin productos.</p>
                )}

                {/* Selector de estado (requisito 4) */}
                <div className="estado-cambiar">
                  <label className="label">Cambiar estado:</label>
                  <select
                    className="input"
                    value={p.estado}
                    onChange={(e) => cambiarEstado(p._id, e.target.value)}
                  >
                    {ESTADOS.map(est => (
                      <option key={est} value={est}>{est}</option>
                    ))}
                  </select>
                </div>

                <button className="btn btn-danger" onClick={() => eliminar(p._id)}>
                  🗑 Eliminar Pedido
                </button>
              </div>
            ))}
          </div>
        )
      }
    </section>
  );
}
