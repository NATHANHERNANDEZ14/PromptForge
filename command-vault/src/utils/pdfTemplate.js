// ── Iconos SVG inline (sin emojis, sin librerias) ───────────────────────────
const SVG = {
  calendar: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  folder:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
  link:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
  note:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
  gear:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"></path></svg>`,
  terminal: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>`,
};

export const getPdfTemplate = (folder, folderCommands, title, videoLink, globalDescription) => {
  const dateStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  const commandRows = folderCommands.length > 0
    ? folderCommands.map((c, i) => `
        <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f5f8ff'}; page-break-inside:avoid;">
          <td style="padding:11px 14px; text-align:center; font-weight:700; color:#3b82f6; font-size:13px; border-right:1px solid #e2e8f0; vertical-align:top;">${i + 1}</td>
          <td style="padding:11px 14px; border-right:1px solid #e2e8f0; vertical-align:top;">
            <code style="font-family:'Courier New',Courier,monospace; font-size:12px; color:#1e40af; background:#eff6ff; padding:5px 9px; border-radius:5px; display:block; word-break:break-all; border-left:3px solid #3b82f6; line-height:1.6;">${(c.executable || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>
          </td>
          <td style="padding:11px 14px; font-size:13px; color:#374151; line-height:1.6; vertical-align:top;">${(c.purpose || '<em style="color:#9ca3af;">Sin descripcion</em>').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&lt;em/g, '<em').replace(/&lt;\/em&gt;/g, '</em>').replace(/style=&quot;/g, 'style="').replace(/&quot;&gt;/g, '">')}</td>
        </tr>
      `).join('')
    : `<tr><td colspan="3" style="padding:28px; text-align:center; color:#9ca3af; font-size:13px;">Sin comandos registrados</td></tr>`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #1f2937;
    background: #ffffff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* HEADER */
  .cv-header {
    background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #3b82f6 100%);
    padding: 32px 44px 28px 44px;
    color: white;
  }
  .cv-header-top {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 18px;
  }
  .cv-logo {
    width: 50px; height: 50px;
    background: rgba(255,255,255,0.15);
    border: 2px solid rgba(255,255,255,0.35);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .cv-brand { font-size:26px; font-weight:800; letter-spacing:-0.5px; }
  .cv-subtitle { font-size:12px; opacity:0.8; margin-top:3px; font-weight:400; }
  .cv-badges { display:flex; gap:10px; flex-wrap:wrap; }
  .cv-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,0.16);
    border: 1px solid rgba(255,255,255,0.28);
    border-radius: 20px; padding: 5px 14px;
    font-size: 12px; font-weight: 600;
  }
  .cv-badge.primary {
    background: rgba(255,255,255,0.92);
    color: #1e3a8a;
    border-color: transparent;
  }

  /* CONTENT */
  .cv-body { padding: 32px 44px; }

  /* FLOW TITLE */
  .cv-flow-label {
    font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
    text-transform: uppercase; color: #6b7280; margin-bottom: 5px;
  }
  .cv-flow-title {
    font-size: 22px; font-weight: 800; color: #111827;
    padding-left: 13px;
    border-left: 4px solid #3b82f6;
    margin-bottom: 24px;
    line-height: 1.3;
  }

  /* INFO CARDS ROW */
  .cv-info-row { display:flex; gap:14px; margin-bottom:24px; flex-wrap:wrap; }
  .cv-info-card {
    flex: 1; min-width: 160px;
    background: #f0f7ff;
    border: 1px solid #bfdbfe;
    border-radius: 10px;
    padding: 13px 16px;
  }
  .cv-ic-label {
    display: flex; align-items: center; gap: 5px;
    font-size: 10px; color: #6b7280; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.8px;
    margin-bottom: 5px;
  }
  .cv-ic-value { font-size: 13px; color: #1e3a8a; font-weight: 700; word-break: break-all; }
  .cv-ic-value a { color: #2563eb; }

  /* DESC BOX */
  .cv-desc {
    background: #fafafa;
    border: 1px solid #e5e7eb;
    border-left: 4px solid #3b82f6;
    border-radius: 8px;
    padding: 15px 18px;
    margin-bottom: 26px;
  }
  .cv-desc-label {
    display: flex; align-items: center; gap: 6px;
    font-size: 10px; color: #6b7280; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.8px;
    margin-bottom: 8px;
  }
  .cv-desc p { font-size: 13px; color: #374151; line-height: 1.7; text-align: justify; }

  /* TABLE */
  .cv-table-label {
    display: flex; align-items: center; gap: 6px;
    font-size: 10px; color: #6b7280; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.8px;
    margin-bottom: 10px;
  }
  .cv-table {
    width: 100%; border-collapse: collapse;
    border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;
    font-size: 13px;
  }
  .cv-table thead tr {
    background: linear-gradient(90deg, #1e3a8a, #2563eb);
  }
  .cv-table thead th {
    padding: 11px 14px; text-align: left;
    color: white; font-size: 11px; font-weight: 700;
    letter-spacing: 0.6px; text-transform: uppercase;
  }
  .cv-table tbody tr { border-bottom: 1px solid #e2e8f0; }
  .cv-table tbody tr:last-child { border-bottom: none; }

  /* FOOTER */
  .cv-footer {
    margin-top: 32px;
    padding: 18px 44px;
    background: #f8faff;
    border-top: 2px solid #bfdbfe;
    display: flex; align-items: center; justify-content: space-between;
  }
  .cv-footer-left .cv-fl-brand { font-size:15px; font-weight:800; color:#1e3a8a; margin-bottom:2px; }
  .cv-footer-left .cv-fl-sub   { font-size:11px; color:#9ca3af; font-style:italic; }
  .cv-footer-right { text-align:right; }
  .cv-footer-right .cv-fr-line { border-top:2px solid #3b82f6; width:140px; margin-left:auto; margin-bottom:4px; }
  .cv-footer-right .cv-fr-dept { font-size:11px; font-weight:700; color:#1e3a8a; }
  .cv-footer-right .cv-fr-gen  { font-size:10px; color:#9ca3af; margin-top:2px; }
</style>
</head>
<body>

<!-- HEADER -->
<div class="cv-header">
  <div class="cv-header-top">
    <div class="cv-logo">${SVG.terminal}</div>
    <div>
      <div class="cv-brand">Command Vault</div>
      <div class="cv-subtitle">Documentacion de Flujos del Sistema</div>
    </div>
  </div>
  <div class="cv-badges">
    <span class="cv-badge primary">
      <span style="display:inline-flex;align-items:center;">${SVG.calendar}</span>
      ${dateStr}
    </span>
    <span class="cv-badge">
      <span style="display:inline-flex;align-items:center;">${SVG.folder}</span>
      ${folder.name}
    </span>
    ${folderCommands.length > 0
      ? `<span class="cv-badge"><span style="display:inline-flex;align-items:center;">${SVG.gear}</span> ${folderCommands.length} comando${folderCommands.length !== 1 ? 's' : ''}</span>`
      : ''}
  </div>
</div>

<!-- BODY -->
<div class="cv-body">

  <!-- Titulo del flujo -->
  <div class="cv-flow-label">Flujo documentado</div>
  <div class="cv-flow-title">${title || folder.name}</div>

  <!-- Info row -->
  <div class="cv-info-row">
    <div class="cv-info-card">
      <div class="cv-ic-label">${SVG.folder} Carpeta</div>
      <div class="cv-ic-value">${folder.name}</div>
    </div>
    <div class="cv-info-card">
      <div class="cv-ic-label">${SVG.calendar} Generado</div>
      <div class="cv-ic-value">${dateStr}</div>
    </div>
    ${videoLink ? `
    <div class="cv-info-card">
      <div class="cv-ic-label">${SVG.link} Referencia</div>
      <div class="cv-ic-value"><a href="${videoLink}">${videoLink}</a></div>
    </div>` : ''}
  </div>

  <!-- Descripcion global -->
  ${globalDescription ? `
  <div class="cv-desc">
    <div class="cv-desc-label">${SVG.note} Descripcion general</div>
    <p>${globalDescription}</p>
  </div>` : ''}

  <!-- Tabla de comandos -->
  <div class="cv-table-label">${SVG.gear} Secuencia de comandos</div>
  <table class="cv-table">
    <thead>
      <tr>
        <th style="width:5%;">#</th>
        <th style="width:46%;">Instruccion / Comando</th>
        <th style="width:49%;">Descripcion y Proposito</th>
      </tr>
    </thead>
    <tbody>
      ${commandRows}
    </tbody>
  </table>

</div>

<!-- FOOTER -->
<div class="cv-footer">
  <div class="cv-footer-left">
    <div class="cv-fl-brand">Command Vault</div>
    <div class="cv-fl-sub">Sistema de Documentacion Automatizada</div>
  </div>
  <div class="cv-footer-right">
    <div class="cv-fr-line"></div>
    <div class="cv-fr-dept">Departamento Tecnico</div>
    <div class="cv-fr-gen">Generado automaticamente &bull; ${dateStr}</div>
  </div>
</div>

</body>
</html>`;
};

export const getPdfConfig = (filename) => ({
  margin:      0,
  filename:    filename,
  image:       { type: 'jpeg', quality: 0.98 },
  html2canvas: {
    scale:         2,
    useCORS:       true,
    logging:       false,
    letterRendering: true,
    backgroundColor: '#ffffff',
  },
  jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
  pagebreak:   { mode: ['css', 'legacy'], avoid: 'tr' },
});
