// Controlador de Clientes
// Operaciones básicas + eliminación.

const Cliente = require('../models/Cliente');

async function listar(req, res) {
  try {
    const clientes = await Cliente.find().sort({ nombre: 1 });
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function obtener(req, res) {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function crear(req, res) {
  try {
    const nuevo = await Cliente.create(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// DELETE /api/clientes/:id
// Eliminamos un cliente por su ID.
async function eliminar(req, res) {
  try {
    const eliminado = await Cliente.findByIdAndDelete(req.params.id);
    if (!eliminado) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ mensaje: 'Cliente eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { listar, obtener, crear, eliminar };
