const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/clienteController');

router.get('/',       ctrl.listar);
router.get('/:id',    ctrl.obtener);
router.post('/',      ctrl.crear);
router.delete('/:id', ctrl.eliminar);   // ← NUEVO

module.exports = router;
