// Esquema de Producto
// Representa cada artículo que se vende en la tienda.

const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre:      { type: String, required: true },
  descripcion: { type: String, default: '' },
  precio:      { type: Number, required: true, min: 0 },
  stock:       { type: Number, required: true, min: 0 },
  categoria:   { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Producto', productoSchema);
