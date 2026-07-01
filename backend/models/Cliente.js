// Esquema de Cliente
// Personas registradas que pueden realizar pedidos.

const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nombre:    { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  telefono:  { type: String, default: '' },
  direccion: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Cliente', clienteSchema);
