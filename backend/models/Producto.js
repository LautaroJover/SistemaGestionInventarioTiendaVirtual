// Esquema de Producto
// Representa cada artículo que se vende en la tienda.
// Se agrega el campo "imagen" (URL) para mostrar una foto en la tarjeta.

const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre:      { type: String, required: true },
  descripcion: { type: String, default: '' },
  precio:      { type: Number, required: true, min: 0 },
  stock:       { type: Number, required: true, min: 0 },
  categoria:   { type: String, required: true },
  // URL pública de una imagen (jpg/png/webp). La guardamos como string
  // para mantener el backend súper simple: no hay uploads, no hay storage.
  imagen:      { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Producto', productoSchema);
