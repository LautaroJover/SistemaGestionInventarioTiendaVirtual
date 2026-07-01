// Seed: inserta datos de prueba en la BD
// Ejecutar con: npm run seed

require('dotenv').config();
const mongoose = require('mongoose');
const Producto = require('./models/Producto');
const Cliente  = require('./models/Cliente');
const Pedido   = require('./models/Pedido');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Conectado a MongoDB');

  // Limpiamos las colecciones
  await Producto.deleteMany({});
  await Cliente.deleteMany({});
  await Pedido.deleteMany({});

  // Productos
  const productos = await Producto.insertMany([
    { nombre: 'Mouse Gamer RGB',   descripcion: 'Mouse óptico 16000 DPI',       precio: 15000,  stock: 25, categoria: 'Periféricos',   imagen: 'https://placehold.co/400x300/2563eb/ffffff?text=Mouse' },
    { nombre: 'Teclado Mecánico',  descripcion: 'Teclado switches azules',       precio: 35000,  stock: 15, categoria: 'Periféricos',   imagen: 'https://placehold.co/400x300/1e40af/ffffff?text=Teclado' },
    { nombre: 'Auriculares BT',    descripcion: 'Auriculares inalámbricos',      precio: 28000,  stock: 20, categoria: 'Accesorios',    imagen: 'https://placehold.co/400x300/059669/ffffff?text=Auriculares' },
    { nombre: 'Monitor 24 144Hz',  descripcion: 'Monitor gamer Full HD',         precio: 120000, stock: 8,  categoria: 'Monitores',     imagen: 'https://placehold.co/400x300/dc2626/ffffff?text=Monitor' },
    { nombre: 'Notebook Gamer',    descripcion: 'Notebook i7 16GB RAM RTX 3060', precio: 850000, stock: 5,  categoria: 'Notebooks',     imagen: 'https://placehold.co/400x300/7c3aed/ffffff?text=Notebook' },
    { nombre: 'Webcam Full HD',    descripcion: 'Cámara web con micrófono',      precio: 22000,  stock: 30, categoria: 'Accesorios',    imagen: 'https://placehold.co/400x300/ea580c/ffffff?text=Webcam' }
  ]);
  console.log('Productos insertados:', productos.length);

  // Clientes
  const clientes = await Cliente.insertMany([
    { nombre: 'Lautaro Jover', email: 'lautaro@example.com', telefono: '+54 11 5555-5555', direccion: 'Av. Siempre Viva 742' },
    { nombre: 'Ana Pérez',      email: 'ana@example.com',     telefono: '+54 11 4444-4444', direccion: 'Calle Falsa 123' },
    { nombre: 'Luis Gómez',     email: 'luis@example.com',    telefono: '+54 11 3333-3333', direccion: 'Belgrano 456' }
  ]);
  console.log('Clientes insertados:', clientes.length);

  // Pedidos
  const pedidos = await Pedido.insertMany([
    {
      cliente: clientes[0]._id,
      productos: [
        { producto: productos[0]._id, cantidad: 2, precioUnitario: productos[0].precio },
        { producto: productos[2]._id, cantidad: 1, precioUnitario: productos[2].precio }
      ],
      total: productos[0].precio * 2 + productos[2].precio * 1,
      estado: 'entregado',
      fecha: new Date('2026-04-15')
    },
    {
      cliente: clientes[1]._id,
      productos: [
        { producto: productos[1]._id, cantidad: 1, precioUnitario: productos[1].precio },
        { producto: productos[3]._id, cantidad: 1, precioUnitario: productos[3].precio }
      ],
      total: productos[1].precio + productos[3].precio,
      estado: 'enviado',
      fecha: new Date('2026-05-20')
    },
    {
      cliente: clientes[2]._id,
      productos: [
        { producto: productos[0]._id, cantidad: 1, precioUnitario: productos[0].precio },
        { producto: productos[4]._id, cantidad: 1, precioUnitario: productos[4].precio }
      ],
      total: productos[0].precio + productos[4].precio,
      estado: 'pendiente',
      fecha: new Date('2026-06-10')
    },
    {
      cliente: clientes[0]._id,
      productos: [
        { producto: productos[2]._id, cantidad: 3, precioUnitario: productos[2].precio }
      ],
      total: productos[2].precio * 3,
      estado: 'entregado',
      fecha: new Date('2026-06-25')
    }
  ]);
  console.log('Pedidos insertados:', pedidos.length);

  // Descontamos stock como si se hubieran hecho las ventas
  // (en producción esto se hace en pedidoController.crear con $inc)
  for (const pedido of pedidos) {
    for (const item of pedido.productos) {
      await Producto.updateOne({ _id: item.producto }, { $inc: { stock: -item.cantidad } });
    }
  }
  console.log('Stock actualizado para reflejar las ventas');

  await mongoose.disconnect();
  console.log('✅ Seed completado. Datos listos.');
}

seed().catch(err => {
  console.error('Error en seed:', err);
  process.exit(1);
});
