// Esquema de Pedido
// Un pedido embebe los productos comprados (cada item con cantidad y precio al momento).
// Esto refleja la realidad del dominio: "un pedido es un conjunto de productos en una fecha".

const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  producto:      { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  cantidad:      { type: Number, required: true, min: 1 },
  precioUnitario:{ type: Number, required: true, min: 0 }
}, { _id: false }); // no necesitamos un _id para cada item

const pedidoSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },
  productos: [itemSchema],
  fecha:  { type: Date, default: Date.now },
  estado: {
    type: String,
    enum: ['pendiente', 'enviado', 'entregado'],
    default: 'pendiente'
  },
  total: { type: Number, required: true, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Pedido', pedidoSchema);
