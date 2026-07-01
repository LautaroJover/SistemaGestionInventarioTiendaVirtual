// Controlador de Productos
// Operaciones CRUD básicas.

const Producto = require('../models/Producto');

// GET /api/productos
async function listar(req, res) {
  try {
    const productos = await Producto.find().sort({ nombre: 1 });
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/productos/:id
async function obtener(req, res) {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/productos
async function crear(req, res) {
  try {
    const nuevo = await Producto.create(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// PUT /api/productos/:id
async function actualizar(req, res) {
  try {
    const actualizado = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!actualizado) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(actualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// DELETE /api/productos/:id
async function eliminar(req, res) {
  try {
    const eliminado = await Producto.findByIdAndDelete(req.params.id);
    if (!eliminado) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ mensaje: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
