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

  // ----- Estado para la edición inline (cliente y estado del pedido) -----
  const [editRowId, setEditRowId] = useState(null);
  const [editData, setEditData]   = useState({});

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

  // Cambia el estado de un pedido usando la ruta PUT dedicada.
  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await api.put(`/pedidos/${id}/estado`, { estado: nuevoEstado });
      cargar(); // refrescamos la lista
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  // ============================================================
  //  Edición inline (re-asignar cliente o corregir estado)
  // ============================================================
  //  Por qué NO editamos los items en línea:
  //  modificar cantidad o producto rompe el stock que ya fue
  //  descontado al crear el pedido. Lo correcto sería revertir
  //  el stock y volver a descontar, lo cual escapa al "inline".
  const empezarEdicion = (p) => {
    setEditRowId(p._id);
    setEditData({
      cliente: p.cliente?._id || '',
      estado:  p.estado
    });
  };

  const cancelarEdicion = () => {
    setEditRowId(null);
    setEditData({});
  };

  const guardarEdicion = async (id) => {
    try {
      await api.put(`/pedidos/${id}`, {
        cliente: editData.cliente,
        estado:  editData.estado
      });
      cancelarEdicion();
      cargar();
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

      {/*
        VISTA ERP: tabla compacta con toolbar.
        Cada fila puede estar en modo lectura o en modo edición
        (cliente + estado). Los items NO se editan inline.
      */}
      <div className="datatable-wrapper">
        <div className="datatable-toolbar">
          <span className="datatable-titulo">
            Listado de pedidos
            <span className="datatable-count">({pedidos.length})</span>
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
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Productos</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th>Estado</th>
                <th className="datatable-acciones-th">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="datatable-vacio">
                    Todavía no hay pedidos registrados.
                  </td>
                </tr>
              ) : (
                pedidos.map(p => {
                  const enEdicion = editRowId === p._id;
                  return (
                    <tr key={p._id} className={enEdicion ? 'fila-en-edicion' : ''}>
                      {/* ----- Cliente ----- */}
                      <td>
                        {enEdicion
                          ? <select className="input input-inline"
                                    value={editData.cliente}
                                    onChange={e => setEditData({ ...editData, cliente: e.target.value })}>
                              {clientes.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
                            </select>
                          : <strong>{p.cliente?.nombre || 'Cliente eliminado'}</strong>}
                      </td>

                      {/* ----- Fecha (no se edita) ----- */}
                      <td className="datatable-mono">{fmtFecha(p.fecha)}</td>

                      {/* ----- Productos (no se edita inline) ----- */}
                      <td>
                        {(p.productos || []).map((it, idx) => (
                          <div key={idx} className="pedido-item">
                            {it.producto?.nombre || '?'} <span className="datatable-mono">x{it.cantidad}</span>
                          </div>
                        ))}
                      </td>

                      {/* ----- Total (no se edita inline) ----- */}
                      <td style={{ textAlign: 'right' }} className="datatable-mono"><strong>${p.total}</strong></td>

                      {/* ----- Estado ----- */}
                      <td>
                        {enEdicion
                          ? <select className="input input-inline"
                                    value={editData.estado}
                                    onChange={e => setEditData({ ...editData, estado: e.target.value })}>
                              {ESTADOS.map(est => <option key={est} value={est}>{est}</option>)}
                            </select>
                          : <span className={`badge-estado-inline badge-${p.estado}`}>{p.estado}</span>}
                      </td>

                      {/* ----- Acciones ----- */}
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
                                    onClick={() => eliminar(p._id)}>🗑</button>
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
