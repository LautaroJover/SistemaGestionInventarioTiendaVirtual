const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/clienteController');

router.get('/',       ctrl.listar);
router.get('/:id',    ctrl.obtener);
router.post('/',      ctrl.crear);
router.put('/:id',    ctrl.actualizar);   // edición inline
router.delete('/:id', ctrl.eliminar);

module.exports = router;
