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
    <div>
      <h2>📊 Informes de Ventas</h2>

      <h3>Por Producto</h3>
      <Tabla columnas={['Producto', 'Categoría', 'Unidades', 'Total ($)']}>
        {porProducto.map((p, i) => (
          <tr key={i}>
            <td style={td}>{p.producto}</td>
            <td style={td}>{p.categoria}</td>
            <td style={td}>{p.unidadesVendidas}</td>
            <td style={td}>${p.totalVendido}</td>
          </tr>
        ))}
      </Tabla>

      <h3>Por Categoría</h3>
      <Tabla columnas={['Categoría', 'Unidades', 'Total ($)']}>
        {porCategoria.map((p, i) => (
          <tr key={i}>
            <td style={td}>{p.categoria}</td>
            <td style={td}>{p.unidadesVendidas}</td>
            <td style={td}>${p.totalVendido}</td>
          </tr>
        ))}
      </Tabla>

      <h3>Por Mes</h3>
      <Tabla columnas={['Mes', 'Pedidos', 'Total ($)']}>
        {porMes.map((p, i) => (
          <tr key={i}>
            <td style={td}>{p.mes}</td>
            <td style={td}>{p.cantidadPedidos}</td>
            <td style={td}>${p.totalVendido}</td>
          </tr>
        ))}
      </Tabla>
    </div>
  );
}

function Tabla({ columnas, children }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
      <thead>
        <tr style={{ background: '#f3f4f6' }}>
          {columnas.map((c, i) => <th key={i} style={th}>{c}</th>)}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

const th = { padding: 8, border: '1px solid #ddd', textAlign: 'left' };
const td = { padding: 8, border: '1px solid #ddd' };
