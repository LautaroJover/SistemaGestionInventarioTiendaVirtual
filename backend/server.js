// Punto de entrada del servidor
// Carga variables de entorno, conecta a MongoDB y levanta Express.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const conectarDB = require('./config/db');

const productoRoutes = require('./routes/productoRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const informeRoutes = require('./routes/informeRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares globales
app.use(cors());              // permite requests desde el frontend
app.use(express.json());      // parsea JSON en el body

// Rutas
app.use('/api/productos', productoRoutes);
app.use('/api/clientes',  clienteRoutes);
app.use('/api/pedidos',   pedidoRoutes);
app.use('/api/informes',  informeRoutes);

// Ruta raíz de prueba
app.get('/', (req, res) => {
  res.send('API de Tienda Electrónica funcionando 🚀');
});

// Conectamos a la BD y levantamos el servidor
conectarDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
});
