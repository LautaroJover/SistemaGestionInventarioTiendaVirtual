// Conexión a MongoDB usando Mongoose
// Esta función se llama una sola vez al iniciar el servidor.

const mongoose = require('mongoose');

async function conectarDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB:', process.env.MONGO_URI);
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    process.exit(1); // si no conecta, salimos
  }
}

module.exports = conectarDB;
