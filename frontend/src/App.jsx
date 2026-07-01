import { useState } from 'react';
import Productos from './components/Productos';
import Clientes  from './components/Clientes';
import Pedidos   from './components/Pedidos';
import Informes  from './components/Informes';

export default function App() {
  const [tab, setTab] = useState('productos');

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏪 Tienda Electrónica</h1>
        <p>Sistema de Gestión de Inventario y Ventas</p>
      </header>

      <nav className="tabs">
        <button className={`tab ${tab === 'productos' ? 'tab-active' : ''}`} onClick={() => setTab('productos')}>Productos</button>
        <button className={`tab ${tab === 'clientes'  ? 'tab-active' : ''}`} onClick={() => setTab('clientes')}>Clientes</button>
        <button className={`tab ${tab === 'pedidos'   ? 'tab-active' : ''}`} onClick={() => setTab('pedidos')}>Pedidos</button>
        <button className={`tab ${tab === 'informes'  ? 'tab-active' : ''}`} onClick={() => setTab('informes')}>Informes</button>
      </nav>

      <main className="app-main">
        {tab === 'productos' && <Productos />}
        {tab === 'clientes'  && <Clientes />}
        {tab === 'pedidos'   && <Pedidos />}
        {tab === 'informes'  && <Informes />}
      </main>
    </div>
  );
}
