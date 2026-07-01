import { useEffect, useState } from 'react';
import api from '../api';

// ============================================================
//  Informes.jsx
//  ------------------------------------------------------------
//  Vista de Informes con estética ERP + exportación CSV / Excel / PDF.
//
//  Las funciones de exportación viven ACÁ MISMO (no creamos
//  archivos nuevos). Usan las librerías: xlsx, jspdf, jspdf-autotable
//  y file-saver.
// ============================================================

import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Definición de los 3 informes: título, endpoint y columnas
// (mismas columnas se usan para mostrar y para exportar).
const INFORMES = [
  {
    key:    'porProducto',
    titulo: 'Ventas por Producto',
    url:    '/informes/ventas-por-producto',
    columnas: [
      { key: 'producto',         label: 'Producto',   align: 'left'  },
      { key: 'categoria',        label: 'Categoría',  align: 'left'  },
      { key: 'unidadesVendidas', label: 'Unidades',   align: 'right' },
      { key: 'totalVendido',     label: 'Total ($)',  align: 'right' }
    ]
  },
  {
    key:    'porCategoria',
    titulo: 'Ventas por Categoría',
    url:    '/informes/ventas-por-categoria',
    columnas: [
      { key: 'categoria',        label: 'Categoría',  align: 'left'  },
      { key: 'unidadesVendidas', label: 'Unidades',   align: 'right' },
      { key: 'totalVendido',     label: 'Total ($)',  align: 'right' }
    ]
  },
  {
    key:    'porMes',
    titulo: 'Ventas por Mes',
    url:    '/informes/ventas-por-mes',
    columnas: [
      { key: 'mes',              label: 'Mes',        align: 'left'  },
      { key: 'cantidadPedidos',  label: 'Pedidos',    align: 'right' },
      { key: 'totalVendido',     label: 'Total ($)',  align: 'right' }
    ]
  }
];

// ---------- Helpers de exportación ----------

// Escapa un valor para que no rompa el CSV
const csvEscape = (v) => {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

// Construye el contenido CSV (con BOM para acentos en Excel)
const buildCSV = (columnas, filas) => {
  const sep = ';';
  const head = columnas.map(c => csvEscape(c.label)).join(sep);
  const body = filas.map(f =>
    columnas.map(c => csvEscape(f[c.key])).join(sep)
  ).join('\n');
  return '﻿' + head + '\n' + body;
};

const exportCSV = (nombre, columnas, filas) => {
  const csv = buildCSV(columnas, filas);
  saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `${nombre}.csv`);
};

const exportExcel = (nombre, columnas, filas) => {
  // Convertimos cada fila a un objeto { Label: valor }
  const data = filas.map(f => {
    const row = {};
    columnas.forEach(c => { row[c.label] = f[c.key]; });
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(data, {
    header: columnas.map(c => c.label)
  });

  // Auto-ajuste de ancho de columna
  ws['!cols'] = columnas.map(c => ({
    wch: Math.max(
      c.label.length,
      ...filas.map(f => String(f[c.key] ?? '').length)
    ) + 2
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, nombre.slice(0, 30));
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), `${nombre}.xlsx`);
};

const exportPDF = (nombre, columnas, filas) => {
  const doc = new jsPDF({ orientation: 'landscape' });

  doc.setFontSize(14);
  doc.text(nombre, 14, 15);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Generado: ${new Date().toLocaleString('es-AR')}`, 14, 22);

  const head = [columnas.map(c => c.label)];
  const body = filas.map(f => columnas.map(c => f[c.key] ?? ''));
  const align = columnas.map(c => c.align === 'right' ? 'right' : 'left');

  autoTable(doc, {
    startY: 28,
    head,
    body,
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [31, 41, 55], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: Object.fromEntries(
      columnas.map((c, i) => [i, { halign: align[i] }])
    ),
    margin: { left: 14, right: 14 }
  });

  doc.save(`${nombre}.pdf`);
};

// ---------- Componente ----------

export default function Informes() {
  const [porProducto,  setPorProducto]  = useState([]);
  const [porCategoria, setPorCategoria] = useState([]);
  const [porMes,       setPorMes]       = useState([]);

  useEffect(() => {
    const cargar = async () => {
      const [p, c, m] = await Promise.all([
        api.get('/informes/ventas-por-producto'),
        api.get('/informes/ventas-por-categoria'),
        api.get('/informes/ventas-por-mes')
      ]);
      setPorProducto(p.data);
      setPorCategoria(c.data);
      setPorMes(m.data);
    };
    cargar();
  }, []);

  // Mapeo key → datos reales
  const datos = { porProducto, porCategoria, porMes };

  return (
    <section className="seccion seccion-grid">
      <h2>📊 Informes de Ventas</h2>

      {INFORMES.map(info => {
        const filas = datos[info.key] || [];

        return (
          <div key={info.key} className="datatable-wrapper">
            <div className="datatable-toolbar">
              <span className="datatable-titulo">
                {info.titulo}
                <span className="datatable-count">({filas.length})</span>
              </span>

              {/*
                BOTONES DE EXPORTACIÓN — arriba a la derecha de la tabla.
                Cada uno dispara una descarga con los datos ACTUALES.
              */}
              <div className="datatable-acciones">
                <button
                  className="btn-export btn-export-csv"
                  onClick={() => exportCSV(info.titulo, info.columnas, filas)}
                >
                  ⬇ CSV
                </button>
                <button
                  className="btn-export btn-export-excel"
                  onClick={() => exportExcel(info.titulo, info.columnas, filas)}
                >
                  ⬇ Excel
                </button>
                <button
                  className="btn-export btn-export-pdf"
                  onClick={() => exportPDF(info.titulo, info.columnas, filas)}
                >
                  ⬇ PDF
                </button>
              </div>
            </div>

            <div className="datatable-scroll">
              <table className="datatable">
                <thead>
                  <tr>
                    {info.columnas.map(c => (
                      <th
                        key={c.key}
                        style={c.align === 'right' ? { textAlign: 'right' } : undefined}
                      >
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filas.length === 0 ? (
                    <tr>
                      <td colSpan={info.columnas.length} className="datatable-vacio">
                        Sin datos para este informe.
                      </td>
                    </tr>
                  ) : (
                    filas.map((fila, i) => (
                      <tr key={i}>
                        {info.columnas.map(c => (
                          <td
                            key={c.key}
                            style={c.align === 'right' ? { textAlign: 'right' } : undefined}
                            className={c.align === 'right' ? 'datatable-mono' : undefined}
                          >
                            {fila[c.key] ?? '—'}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </section>
  );
}
