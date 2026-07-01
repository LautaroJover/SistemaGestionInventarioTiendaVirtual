import { useEffect, useState } from 'react';
import api from '../api';

export default function Informes() {
  const [porProducto,  setPorProducto]  = useState([]);
  const [porCategoria, setPorCategoria] = useState([]);
  const [porMes,       setPorMes]       = useState([]);

  useEffect(() => {
    const cargar = async () => {
      const [p, c, m] = await Promise.all([
        api.get('/informes/ventas-por-producto'),
        api.get('/informes/ventas-por-categoria'),
        api.get('/informes/ventas-por-mes')
      ]);
      setPorProducto(p.data);
      setPorCategoria(c.data);
      setPorMes(m.data);
    };
    cargar();
  }, []);

  return (
    <section className="seccion">
      <h2>📊 Informes de Ventas</h2>

      <h3>Por Producto</h3>
      <Tabla columnas={['Producto', 'Categoría', 'Unidades', 'Total ($)']}>
        {porProducto.map((p, i) => (
          <tr key={i}>
            <td>{p.producto}</td>
            <td>{p.categoria}</td>
            <td>{p.unidadesVendidas}</td>
            <td>${p.totalVendido}</td>
          </tr>
        ))}
      </Tabla>

      <h3>Por Categoría</h3>
      <Tabla columnas={['Categoría', 'Unidades', 'Total ($)']}>
        {porCategoria.map((p, i) => (
          <tr key={i}>
            <td>{p.categoria}</td>
            <td>{p.unidadesVendidas}</td>
            <td>{p.totalVendido}</td>
          </tr>
        ))}
      </Tabla>

      <h3>Por Mes</h3>
      <Tabla columnas={['Mes', 'Pedidos', 'Total ($)']}>
        {porMes.map((p, i) => (
          <tr key={i}>
            <td>{p.mes}</td>
            <td>{p.cantidadPedidos}</td>
            <td>${p.totalVendido}</td>
          </tr>
        ))}
      </Tabla>
    </section>
  );
}

function Tabla({ columnas, children }) {
  return (
    <table className="tabla-informes">
      <thead>
        <tr>
          {columnas.map((c, i) => <th key={i}>{c}</th>)}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}
