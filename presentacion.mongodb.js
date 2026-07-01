// ============================================================
//   🎓 PLAYGROUND DE PRESENTACIÓN — BD II
//   Archivo: presentacion.mongodb.js
//   Para usar: instalar extensión "MongoDB for VS Code",
//   crear nueva conexión a mongodb://localhost:27017,
//   y ejecutar las consultas línea por línea o por selección.
// ============================================================

// =========================================================
//   PASO 1: Seleccionamos la base de datos
// =========================================================
use("tienda_inventario");


// =========================================================
//   PASO 2: Insertar datos de prueba (idempotente: borra antes)
// =========================================================
db.productos.deleteMany({});
db.clientes.deleteMany({});
db.pedidos.deleteMany({});

db.productos.insertMany([
  { nombre: "Mouse Gamer RGB",   descripcion: "Mouse 16000 DPI",   precio: 15000,  stock: 25, categoria: "Periféricos" },
  { nombre: "Teclado Mecánico",  descripcion: "Switches azules",    precio: 35000,  stock: 15, categoria: "Periféricos" },
  { nombre: "Auriculares BT",    descripcion: "Inalámbricos",       precio: 28000,  stock: 20, categoria: "Audio" },
  { nombre: "Monitor 24 144Hz",  descripcion: "Full HD gamer",      precio: 120000, stock: 8,  categoria: "Pantallas" }
]);

db.clientes.insertMany([
  { nombre: "Lautaro Jover", email: "lautaro@example.com", telefono: "1111", direccion: "Av 1" },
  { nombre: "Ana Pérez",     email: "ana@example.com",     telefono: "2222", direccion: "Calle 2" }
]);

const mouse     = db.productos.findOne({ nombre: "Mouse Gamer RGB" });
const teclado   = db.productos.findOne({ nombre: "Teclado Mecánico" });
const auris     = db.productos.findOne({ nombre: "Auriculares BT" });
const laultaro  = db.clientes.findOne({ email: "lautaro@example.com" });
const ana       = db.clientes.findOne({ email: "ana@example.com" });

db.pedidos.insertMany([
  {
    cliente: laultaro._id,
    productos: [
      { producto: mouse._id,   cantidad: 2, precioUnitario: 15000 },
      { producto: auris._id,   cantidad: 1, precioUnitario: 28000 }
    ],
    total: 2 * 15000 + 1 * 28000,
    estado: "entregado",
    fecha: new Date("2026-04-15")
  },
  {
    cliente: ana._id,
    productos: [
      { producto: teclado._id, cantidad: 1, precioUnitario: 35000 }
    ],
    total: 35000,
    estado: "enviado",
    fecha: new Date("2026-05-20")
  },
  {
    cliente: laultaro._id,
    productos: [
      { producto: mouse._id,   cantidad: 1, precioUnitario: 15000 }
    ],
    total: 15000,
    estado: "pendiente",
    fecha: new Date("2026-06-10")
  }
]);

// Actualizamos stock para reflejar las ventas
db.productos.updateOne({ _id: mouse._id },   { $inc: { stock: -3 } });
db.productos.updateOne({ _id: auris._id },   { $inc: { stock: -1 } });
db.productos.updateOne({ _id: teclado._id }, { $inc: { stock: -1 } });

// =========================================================
//   PASO 3: Mostrar la estructura de las 3 colecciones
// =========================================================
print("=== PRODUCTOS (1 documento de muestra) ===");
db.productos.find().limit(1).forEach(printjson);

print("\n=== CLIENTES (1 documento de muestra) ===");
db.clientes.find().limit(1).forEach(printjson);

print("\n=== PEDIDOS (1 documento de muestra) ===");
db.pedidos.find().limit(1).forEach(printjson);


// =========================================================
//   PASO 4: REQUISITO 4 — Actualización de stock con $inc
// =========================================================
// Mostramos el stock ANTES de una nueva venta
print("\n=== Stock del Mouse ANTES de la nueva venta ===");
printjson(db.productos.findOne({ nombre: "Mouse Gamer RGB" }, { nombre: 1, stock: 1 }));

// Simulamos una nueva venta: 2 unidades de Mouse
//   $inc con número NEGATIVO = decrementar.
db.productos.updateOne(
  { nombre: "Mouse Gamer RGB" },
  { $inc: { stock: -2 } }
);

// Stock DESPUÉS
print("\n=== Stock del Mouse DESPUÉS de la nueva venta ===");
printjson(db.productos.findOne({ nombre: "Mouse Gamer RGB" }, { nombre: 1, stock: 1 }));


// =========================================================
//   PASO 5: REQUISITO 5 — Informes con Aggregation Framework
// =========================================================

// 5.1) Ventas POR PRODUCTO  ($unwind + $group + $lookup + $project + $sort)
print("\n=== INFORME: Ventas por Producto ===");
db.pedidos.aggregate([
  { $unwind: "$productos" },
  {
    $group: {
      _id: "$productos.producto",
      totalVendido:     { $sum: { $multiply: ["$productos.cantidad", "$productos.precioUnitario"] } },
      unidadesVendidas: { $sum: "$productos.cantidad" }
    }
  },
  {
    $lookup: {
      from:         "productos",
      localField:   "_id",
      foreignField: "_id",
      as:           "producto"
    }
  },
  { $unwind: "$producto" },
  {
    $project: {
      _id:              0,
      producto:         "$producto.nombre",
      categoria:        "$producto.categoria",
      unidadesVendidas: 1,
      totalVendido:     1
    }
  },
  { $sort: { totalVendido: -1 } }
]).forEach(printjson);


// 5.2) Ventas POR CATEGORÍA
print("\n=== INFORME: Ventas por Categoría ===");
db.pedidos.aggregate([
  { $unwind: "$productos" },
  {
    $lookup: {
      from:         "productos",
      localField:   "productos.producto",
      foreignField: "_id",
      as:           "producto"
    }
  },
  { $unwind: "$producto" },
  {
    $group: {
      _id:              "$producto.categoria",
      totalVendido:     { $sum: { $multiply: ["$productos.cantidad", "$productos.precioUnitario"] } },
      unidadesVendidas: { $sum: "$productos.cantidad" }
    }
  },
  { $sort: { totalVendido: -1 } },
  {
    $project: {
      _id:              0,
      categoria:        "$_id",
      totalVendido:     1,
      unidadesVendidas: 1
    }
  }
]).forEach(printjson);


// 5.3) Ventas POR MES  ($group + $dateToString)
print("\n=== INFORME: Ventas por Mes ===");
db.pedidos.aggregate([
  {
    $group: {
      _id:             { $dateToString: { format: "%Y-%m", date: "$fecha" } },
      totalVendido:    { $sum: "$total" },
      cantidadPedidos: { $sum: 1 }
    }
  },
  { $sort: { _id: 1 } },
  {
    $project: {
      _id:             0,
      mes:             "$_id",
      totalVendido:    1,
      cantidadPedidos: 1
    }
  }
]).forEach(printjson);
