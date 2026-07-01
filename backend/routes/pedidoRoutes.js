const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pedidoController');

router.get('/',                   ctrl.listar);
router.post('/',                  ctrl.crear);
router.put('/:id',                ctrl.actualizar);         // edición inline (cliente, estado, total)
router.put('/:id/estado',         ctrl.actualizarEstado);   // atajo para cambiar solo estado
router.delete('/:id',             ctrl.eliminar);

module.exports = router;
