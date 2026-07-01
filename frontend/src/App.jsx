import { useEffect, useState } from 'react';
import Productos from './components/Productos';
import Clientes  from './components/Clientes';
import Pedidos   from './components/Pedidos';
import Informes  from './components/Informes';

export default function App() {
  // Estado de la pestaña activa
  const [tab, setTab] = useState('productos');

  // Estado del Modo Oscuro. Leemos de localStorage para recordar la
  // preferencia del usuario entre recargas.
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  // Cada vez que cambia "dark", agregamos o quitamos .dark-theme en <body>
  // y guardamos la preferencia.
  useEffect(() => {
    document.body.classList.toggle('dark-theme', dark);
    localStorage.setItem('darkMode', dark);
  }, [dark]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-contenido">
          <div>
            <h1>🏪 Tienda Electrónica</h1>
            <p>Sistema de Gestión de Inventario y Ventas</p>
          </div>

          {/* Botón Dark Mode en la esquina superior derecha (requisito 5) */}
          <button
            className="btn-dark-toggle"
            onClick={() => setDark(!dark)}
            title={dark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          >
            {dark ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
          </button>
        </div>
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
