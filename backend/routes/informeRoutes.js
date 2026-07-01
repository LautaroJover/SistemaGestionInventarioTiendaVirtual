const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/informeController');

router.get('/ventas-por-producto',  ctrl.ventasPorProducto);
router.get('/ventas-por-categoria', ctrl.ventasPorCategoria);
router.get('/ventas-por-mes',       ctrl.ventasPorMes);

module.exports = router;
