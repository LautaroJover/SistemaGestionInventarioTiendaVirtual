const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pedidoController');

router.get('/',                   ctrl.listar);
router.post('/',                  ctrl.crear);
router.put('/:id/estado',         ctrl.actualizarEstado); // ← NUEVA
router.delete('/:id',             ctrl.eliminar);

module.exports = router;
