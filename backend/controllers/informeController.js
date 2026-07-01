// ============================================================
// Controlador de Informes — REQUISITO 5 DE LA MATERIA
// ============================================================
// Aquí usamos el FRAMEWORK DE AGREGACIÓN de MongoDB para
// generar informes con $unwind, $group, $lookup, $project, $sort.
// ============================================================

const Pedido = require('../models/Pedido');

// GET /api/informes/ventas-por-producto
// ----------------------------------------
// Devuelve cuánto se vendió de cada producto: total en $
// y unidades acumuladas.
async function ventasPorProducto(req, res) {
  try {
    const resultado = await Pedido.aggregate([
      // 1) $unwind: "abre" el array productos. Si un pedido tiene
      //    3 productos, este paso genera 3 documentos (uno por item).
      { $unwind: '$productos' },

      // 2) $group: agrupa por producto y suma (cantidad * precio)
      //    y también las unidades vendidas.
      {
        $group: {
          _id: '$productos.producto',
          totalVendido:     { $sum: { $multiply: ['$productos.cantidad', '$productos.precioUnitario'] } },
          unidadesVendidas: { $sum: '$productos.cantidad' }
        }
      },

      // 3) $lookup: "JOIN" con la colección productos para
      //    traer nombre y categoría del producto.
      {
        $lookup: {
          from:         'productos',
          localField:   '_id',
          foreignField: '_id',
          as:           'producto'
        }
      },

      // 4) $unwind: el lookup devuelve un array; lo "aplanamos"
      //    para que $producto sea un objeto, no un array.
      { $unwind: '$producto' },

      // 5) $project: limpiamos el resultado y dejamos solo los
      //    campos que nos interesan mostrar.
      {
        $project: {
          _id:              0,
          producto:         '$producto.nombre',
          categoria:        '$producto.categoria',
          unidadesVendidas: 1,
          totalVendido:     1
        }
      },

      // 6) $sort: ordenamos de mayor a menor venta.
      { $sort: { totalVendido: -1 } }
    ]);

    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/informes/ventas-por-categoria
// ----------------------------------------
// Devuelve cuánto se vendió por CATEGORÍA (Audio, Periféricos, etc).
async function ventasPorCategoria(req, res) {
  try {
    const resultado = await Pedido.aggregate([
      // Abrimos el array de productos
      { $unwind: '$productos' },

      // Hacemos un lookup para traer la categoría del producto
      {
        $lookup: {
          from:         'productos',
          localField:   'productos.producto',
          foreignField: '_id',
          as:           'producto'
        }
      },
      { $unwind: '$producto' },

      // Agrupamos por categoría
      {
        $group: {
          _id:              '$producto.categoria',
          totalVendido:     { $sum: { $multiply: ['$productos.cantidad', '$productos.precioUnitario'] } },
          unidadesVendidas: { $sum: '$productos.cantidad' }
        }
      },

      // Ordenamos de mayor a menor
      { $sort: { totalVendido: -1 } },

      // Renombramos campos para que se vean prolijos
      {
        $project: {
          _id:              0,
          categoria:        '$_id',
          totalVendido:     1,
          unidadesVendidas: 1
        }
      }
    ]);

    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/informes/ventas-por-mes
// ----------------------------------------
// Devuelve el total vendido agrupado por mes (formato "YYYY-MM").
async function ventasPorMes(req, res) {
  try {
    const resultado = await Pedido.aggregate([
      // Agrupamos por mes-año, sumando el TOTAL del pedido (ya guardado).
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$fecha' } },
          totalVendido: { $sum: '$total' },
          cantidadPedidos: { $sum: 1 }
        }
      },

      // Ordenamos cronológicamente
      { $sort: { _id: 1 } },

      // Limpiamos
      {
        $project: {
          _id:             0,
          mes:             '$_id',
          totalVendido:    1,
          cantidadPedidos: 1
        }
      }
    ]);

    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { ventasPorProducto, ventasPorCategoria, ventasPorMes };
