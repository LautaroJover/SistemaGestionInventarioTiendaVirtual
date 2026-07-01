// ============================================================
// Controlador de Pedidos
// ============================================================

const Pedido  = require('../models/Pedido');
const Producto = require('../models/Producto');

// GET /api/pedidos
// Devuelve todos los pedidos "populados" con los datos del cliente
// y de CADA producto comprado (nombre y precio).
async function listar(req, res) {
  try {
    const pedidos = await Pedido.find()
      // .populate() reemplaza el ObjectId por el documento relacionado.
      //   'cliente'             -> el documento del cliente
      //   'productos.producto'  -> el documento de CADA producto del array
      .populate('cliente', 'nombre email')
      .populate('productos.producto', 'nombre precio stock')
      .sort({ fecha: -1 });
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/pedidos
// Crea un pedido y descuenta el stock de cada producto con $inc.
async function crear(req, res) {
  try {
    const { clienteId, items } = req.body;

    if (!clienteId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Faltan datos: clienteId e items[] son obligatorios' });
    }

    const itemsPedido = [];
    let total = 0;

    for (const item of items) {
      const producto = await Producto.findById(item.productoId);
      if (!producto) {
        return res.status(404).json({ error: `Producto ${item.productoId} no existe` });
      }
      if (producto.stock < item.cantidad) {
        return res.status(400).json({
          error: `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}`
        });
      }

      itemsPedido.push({
        producto: producto._id,
        cantidad: item.cantidad,
        precioUnitario: producto.precio
      });

      total += producto.precio * item.cantidad;
    }

    // Descontamos stock con $inc (negativo = decrementar). Es atómico.
    for (const item of itemsPedido) {
      await Producto.updateOne(
        { _id: item.producto },
        { $inc: { stock: -item.cantidad } }
      );
    }

    const nuevoPedido = await Pedido.create({
      cliente: clienteId,
      productos: itemsPedido,
      total,
      estado: 'pendiente'
    });

    const pedidoCompleto = await Pedido.findById(nuevoPedido._id)
      .populate('cliente', 'nombre email')
      .populate('productos.producto', 'nombre precio stock');

    res.status(201).json(pedidoCompleto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// DELETE /api/pedidos/:id
// Elimina un pedido por su ID. NO repone el stock automáticamente
// (es un comportamiento conservador; podría agregarse si el profe lo pide).
async function eliminar(req, res) {
  try {
    const eliminado = await Pedido.findByIdAndDelete(req.params.id);
    if (!eliminado) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json({ mensaje: 'Pedido eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { listar, crear, eliminar };
