import * as XLSX from 'xlsx';

// Agrupar dispositivos por Área
export function groupDevicesByArea(devices) {
  const groups = {};

  devices.forEach(device => {
    const area = (device.area || device.department || 'GENERAL / SIN ASIGNAR').trim();
    if (!groups[area]) {
      groups[area] = [];
    }
    groups[area].push(device);
  });

  return groups;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTACIÓN A EXCEL (.xlsx)
// Formato con encabezado de Área verde y columnas en azul (idéntico a Imagen 3)
// ─────────────────────────────────────────────────────────────────────────────
export function exportDevicesToExcel(devices, filterLabel = 'Todos') {
  const grouped = groupDevicesByArea(devices);
  const aoa = [];

  const headers = [
    'Nombre',
    'Tipo',
    'Estado',
    'No. Nómina',
    'Usuario',
    'IP Wi-Fi',
    'IP ETH',
    'MAC Wi-Fi',
    'MAC ETH',
    'No. Serie',
    'Rustdesk',
    'Contraseña'
  ];

  Object.keys(grouped).sort().forEach(area => {
    // Fila 1: Banner de Área
    aoa.push([`=== ÁREA: ${area.toUpperCase()} ===`, '', '', '', '', '', '', '', '', '', '', '']);
    // Fila 2: Encabezados
    aoa.push([...headers]);

    // Filas de dispositivos de esta área
    grouped[area].forEach(d => {
      aoa.push([
        d.name || '',
        d.type || '',
        d.status || 'Operativo',
        d.noNomina || '',
        d.username || '',
        d.ipWifi || d.ip || '',
        d.ipEth || '',
        d.macWifi || d.mac || '',
        d.macEth || '',
        d.serialNumber || '',
        d.rustdeskId || '',
        d.password || ''
      ]);
    });

    // Fila vacía de separación
    aoa.push([]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(aoa);

  // Aplicar estilos a celdas
  for (const cell in worksheet) {
    if (cell[0] === '!') continue;
    const cellRef = worksheet[cell];
    
    if (cellRef && cellRef.v && typeof cellRef.v === 'string') {
      if (cellRef.v.startsWith('=== ÁREA:')) {
        cellRef.s = { 
          fill: { fgColor: { rgb: 'C6F6D5' } }, 
          font: { bold: true, color: { rgb: '166534' } }, 
          alignment: { horizontal: 'center' } 
        };
      } else if (headers.includes(cellRef.v)) {
        cellRef.s = { 
          fill: { fgColor: { rgb: '2563EB' } }, 
          font: { bold: true, color: { rgb: 'FFFFFF' } }, 
          alignment: { horizontal: 'center' } 
        };
      }
    }
  }

  // Ajustar ancho de columnas
  worksheet['!cols'] = [
    { wch: 24 }, // Nombre
    { wch: 14 }, // Tipo
    { wch: 16 }, // Estado
    { wch: 14 }, // No. Nómina
    { wch: 22 }, // Usuario
    { wch: 16 }, // IP Wi-Fi
    { wch: 16 }, // IP ETH
    { wch: 20 }, // MAC Wi-Fi
    { wch: 20 }, // MAC ETH
    { wch: 18 }, // No. Serie
    { wch: 16 }, // Rustdesk
    { wch: 16 }  // Contraseña
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario');

  const typeSuffix = filterLabel === 'Todos' ? '' : `_${filterLabel}`;
  const fileName = `Inventario_Equipos${typeSuffix}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName, { cellStyles: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTACIÓN A PDF
// Formato visual idéntico a Imagen 3:
// - Banner superior verde claro con el nombre del Área en verde oscuro
// - Cabeceras de columnas azul con texto blanco
// - Tabla estructurada con todas las IPs, MACs, RustDesk y Contraseñas
// ─────────────────────────────────────────────────────────────────────────────
export async function exportDevicesToPDF(devices) {
  const html2pdf = (await import('html2pdf.js')).default;
  const grouped = groupDevicesByArea(devices);
  const dateStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  let tablesHtml = '';

  const esc = (str) => String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  Object.keys(grouped).sort().forEach(area => {
    const areaDevices = grouped[area];

    tablesHtml += `
      <div style="margin-bottom: 24px; page-break-inside: avoid;">
        <table style="width: 100%; border-collapse: collapse; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px;">
          <!-- BANNER SUPERIOR DE ÁREA (VERDE CLARO) -->
          <thead>
            <tr>
              <th colspan="10" style="background-color: #c6f6d5; color: #166534; padding: 10px 14px; font-size: 13px; font-weight: 800; text-align: center; letter-spacing: 1.5px; text-transform: uppercase; border: 1px solid #9ae6b4;">
                ${esc(area)}
              </th>
            </tr>
            <!-- ENCABEZADO DE COLUMNAS (AZUL INTENSO) -->
            <tr style="background-color: #2563eb; color: #ffffff; font-weight: 700; text-align: center;">
              <th style="padding: 9px 8px; border: 1px solid #1d4ed8; width: 14%;">Nombre</th>
              <th style="padding: 9px 8px; border: 1px solid #1d4ed8; width: 11%;">IP Wi-Fi / ETH</th>
              <th style="padding: 9px 8px; border: 1px solid #1d4ed8; width: 13%;">Dirección MAC</th>
              <th style="padding: 9px 8px; border: 1px solid #1d4ed8; width: 9%;">Tipo</th>
              <th style="padding: 9px 8px; border: 1px solid #1d4ed8; width: 10%;">No. Serie</th>
              <th style="padding: 9px 8px; border: 1px solid #1d4ed8; width: 8%;">Nómina</th>
              <th style="padding: 9px 8px; border: 1px solid #1d4ed8; width: 13%;">Usuario</th>
              <th style="padding: 9px 8px; border: 1px solid #1d4ed8; width: 8%;">Estado</th>
              <th style="padding: 9px 8px; border: 1px solid #1d4ed8; width: 9%;">Rustdesk</th>
              <th style="padding: 9px 8px; border: 1px solid #1d4ed8; width: 9%;">Contraseña</th>
            </tr>
          </thead>
          <tbody>
            ${areaDevices.map((d, idx) => {
              const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
              const ipDisplay = [d.ipWifi && `WF: ${d.ipWifi}`, d.ipEth && `ET: ${d.ipEth}`].filter(Boolean).join('<br>') || d.ip || '-';
              const macDisplay = [d.macWifi && `WF: ${d.macWifi}`, d.macEth && `ET: ${d.macEth}`].filter(Boolean).join('<br>') || d.mac || '-';

              return `
                <tr style="background-color: ${bg}; border-bottom: 1px solid #e2e8f0; text-align: center; color: #1e293b;">
                  <td style="padding: 8px 6px; border: 1px solid #e2e8f0; font-weight: 700; text-align: left;">${esc(d.name)}</td>
                  <td style="padding: 8px 6px; border: 1px solid #e2e8f0; font-family: monospace; font-size: 10px;">${ipDisplay}</td>
                  <td style="padding: 8px 6px; border: 1px solid #e2e8f0; font-family: monospace; font-size: 10px;">${macDisplay}</td>
                  <td style="padding: 8px 6px; border: 1px solid #e2e8f0;">${esc(d.type)}</td>
                  <td style="padding: 8px 6px; border: 1px solid #e2e8f0; font-family: monospace; font-size: 10px;">${esc(d.serialNumber) || '-'}</td>
                  <td style="padding: 8px 6px; border: 1px solid #e2e8f0;">${esc(d.noNomina) || '-'}</td>
                  <td style="padding: 8px 6px; border: 1px solid #e2e8f0; font-weight: 600;">${esc(d.username) || '<span style="color:#94a3b8;font-style:italic;">Disponible</span>'}</td>
                  <td style="padding: 8px 6px; border: 1px solid #e2e8f0; font-size: 10px;">${esc(d.status || 'Operativo')}</td>
                  <td style="padding: 8px 6px; border: 1px solid #e2e8f0; font-family: monospace; font-weight: 700; color: #2563eb;">${esc(d.rustdeskId) || '-'}</td>
                  <td style="padding: 8px 6px; border: 1px solid #e2e8f0; font-family: monospace; font-weight: 700; color: #0f172a; background: #f1f5f9;">${esc(d.password) || '-'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  });

  const fullHtml = `
    <div style="padding: 16px 20px; font-family: 'Segoe UI', Arial, sans-serif; background: #ffffff; color: #1e293b;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 18px;">
        <div>
          <h1 style="font-size: 20px; font-weight: 800; color: #1e3a8a; margin: 0;">COMMAND VAULT — INVENTARIO DE EQUIPOS</h1>
          <p style="font-size: 11px; color: #64748b; margin: 3px 0 0 0;">Reporte de Infraestructura, Conectividad y Soporte Remoto</p>
        </div>
        <div style="text-align: right; font-size: 11px; color: #475569;">
          <div><strong>Fecha:</strong> ${dateStr}</div>
          <div><strong>Total Equipos:</strong> ${devices.length}</div>
        </div>
      </div>

      ${tablesHtml}
    </div>
  `;

  const opt = {
    margin: [8, 8, 8, 8],
    filename: `Inventario_Equipos_${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
  };

  await html2pdf().set(opt).from(fullHtml).save();
}
