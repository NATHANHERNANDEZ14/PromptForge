export const getPdfTemplate = (folder, folderCommands, title, videoLink, globalDescription) => {
  const dateStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  const commandRows = folderCommands.length > 0
    ? folderCommands.map((c, i) => `
        <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8faff'};">
          <td style="padding:12px 14px; text-align:center; font-weight:700; color:#3b82f6; font-size:13px; border-right:1px solid #e5e7eb;">${i + 1}</td>
          <td style="padding:12px 14px; border-right:1px solid #e5e7eb;">
            <code style="font-family:monospace; font-size:12px; color:#1e40af; background:#eff6ff; padding:4px 8px; border-radius:5px; display:block; word-break:break-all; border-left:3px solid #3b82f6;">${c.executable || ''}</code>
          </td>
          <td style="padding:12px 14px; font-size:13px; color:#374151; line-height:1.55;">${c.purpose || '<em style="color:#9ca3af;">Sin descripcion</em>'}</td>
        </tr>
      `).join('')
    : `<tr><td colspan="3" style="padding:28px; text-align:center; color:#9ca3af; font-size:13px;">Sin comandos registrados</td></tr>`;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; color:#1f2937; background:#fff; }
    .page { width:100%; padding:0; }

    /* ── HEADER ─────────────────────────────────── */
    .header {
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 60%, #60a5fa 100%);
      padding: 36px 48px 28px 48px;
      color: white;
    }
    .header-top {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
    }
    .logo-box {
      width: 52px; height: 52px;
      background: rgba(255,255,255,0.15);
      border: 2px solid rgba(255,255,255,0.4);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .brand-title  { font-size:26px; font-weight:800; letter-spacing:-0.5px; }
    .brand-sub    { font-size:13px; opacity:0.8; margin-top:2px; }
    .header-meta  { display:flex; gap:12px; flex-wrap:wrap; }
    .badge {
      display:inline-flex; align-items:center; gap:6px;
      background:rgba(255,255,255,0.18);
      border:1px solid rgba(255,255,255,0.3);
      border-radius:20px;
      padding:5px 14px;
      font-size:12px; font-weight:600;
    }
    .badge.accent { background:rgba(255,255,255,0.9); color:#1e40af; border-color:transparent; }

    /* ── CONTENT AREA ────────────────────────────── */
    .content { padding: 36px 48px; }

    /* ── SECTION TITLE ───────────────────────────── */
    .section-label {
      font-size:11px; font-weight:700; letter-spacing:1.2px;
      text-transform:uppercase; color:#6b7280;
      margin-bottom:6px;
    }
    .section-title {
      font-size:22px; font-weight:800; color:#111827;
      border-left:4px solid #3b82f6;
      padding-left:12px;
      margin-bottom:20px;
    }

    /* ── INFO GRID ───────────────────────────────── */
    .info-grid { display:flex; gap:16px; margin-bottom:28px; flex-wrap:wrap; }
    .info-card {
      flex:1; min-width:180px;
      background:#f8faff;
      border:1px solid #dbeafe;
      border-radius:10px;
      padding:14px 18px;
    }
    .info-card .ic-label { font-size:11px; color:#6b7280; font-weight:600; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:4px; }
    .info-card .ic-value { font-size:14px; color:#1f2937; font-weight:600; word-break:break-all; }
    .info-card .ic-value a { color:#3b82f6; }

    /* ── DESCRIPTION BOX ─────────────────────────── */
    .desc-box {
      background:#f9fafb;
      border:1px solid #e5e7eb;
      border-left:4px solid #3b82f6;
      border-radius:8px;
      padding:16px 20px;
      margin-bottom:28px;
    }
    .desc-box .db-label { font-size:11px; color:#6b7280; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:8px; }
    .desc-box p { font-size:13px; color:#374151; line-height:1.65; text-align:justify; }

    /* ── COMMANDS TABLE ──────────────────────────── */
    .commands-label { font-size:11px; color:#6b7280; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:10px; }
    table { width:100%; border-collapse:collapse; border-radius:10px; overflow:hidden; border:1px solid #e5e7eb; }
    thead tr { background:linear-gradient(90deg, #1e40af, #3b82f6); }
    thead th {
      padding:12px 14px;
      text-align:left;
      color:white;
      font-size:12px;
      font-weight:700;
      letter-spacing:0.5px;
      text-transform:uppercase;
    }
    tbody tr { border-bottom:1px solid #e5e7eb; }
    tbody tr:last-child { border-bottom:none; }

    /* ── FOOTER ──────────────────────────────────── */
    .footer {
      margin-top:36px;
      padding:20px 48px;
      background:#f8faff;
      border-top:2px solid #dbeafe;
      display:flex;
      align-items:center;
      justify-content:space-between;
    }
    .footer-brand { font-size:14px; font-weight:800; color:#1e40af; }
    .footer-dept  { font-size:11px; color:#6b7280; }
    .footer-line  { border-top:2px solid #3b82f6; width:160px; margin-bottom:4px; }
    .footer-right { text-align:right; }
    .gen-info     { font-size:11px; color:#9ca3af; font-style:italic; }
  </style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="header">
    <div class="header-top">
      <div class="logo-box">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="4 17 10 11 4 5"></polyline>
          <line x1="12" y1="19" x2="20" y2="19"></line>
        </svg>
      </div>
      <div>
        <div class="brand-title">Command Vault</div>
        <div class="brand-sub">Documentacion de Flujos del Sistema</div>
      </div>
    </div>
    <div class="header-meta">
      <span class="badge accent">&#128197; ${dateStr}</span>
      <span class="badge">&#128193; Carpeta: ${folder.name}</span>
      ${folderCommands.length > 0 ? `<span class="badge">&#9881; ${folderCommands.length} comando${folderCommands.length !== 1 ? 's' : ''}</span>` : ''}
    </div>
  </div>

  <!-- CONTENT -->
  <div class="content">

    <!-- Titulo del flujo -->
    <div class="section-label">Flujo documentado</div>
    <div class="section-title">${title || folder.name}</div>

    <!-- Info cards -->
    <div class="info-grid">
      <div class="info-card">
        <div class="ic-label">&#128193; Carpeta</div>
        <div class="ic-value">${folder.name}</div>
      </div>
      <div class="info-card">
        <div class="ic-label">&#128197; Fecha de generacion</div>
        <div class="ic-value">${dateStr}</div>
      </div>
      ${videoLink ? `
      <div class="info-card">
        <div class="ic-label">&#128279; Enlace de referencia</div>
        <div class="ic-value"><a href="${videoLink}">${videoLink}</a></div>
      </div>` : ''}
    </div>

    <!-- Descripcion global -->
    ${globalDescription ? `
    <div class="desc-box">
      <div class="db-label">&#128221; Descripcion general</div>
      <p>${globalDescription}</p>
    </div>` : ''}

    <!-- Tabla de comandos -->
    <div class="commands-label">&#9881; Secuencia de comandos</div>
    <table>
      <thead>
        <tr>
          <th style="width:5%;">#</th>
          <th style="width:47%;">Instruccion / Comando</th>
          <th style="width:48%;">Descripcion y Proposito</th>
        </tr>
      </thead>
      <tbody>
        ${commandRows}
      </tbody>
    </table>

  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div>
      <div class="footer-brand">Command Vault</div>
      <div class="gen-info">Sistema de Documentacion Automatizada</div>
    </div>
    <div class="footer-right">
      <div class="footer-line"></div>
      <div class="footer-dept" style="color:#1e40af; font-weight:700;">Departamento Tecnico</div>
      <div class="gen-info">Generado automaticamente &bull; ${dateStr}</div>
    </div>
  </div>

</div>
</body>
</html>
  `;
};

export const getPdfConfig = (filename) => ({
  margin:     0,
  filename:   filename,
  image:      { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 2, useCORS: true, logging: false, letterRendering: true },
  jsPDF:      { unit: 'mm', format: 'a4', orientation: 'portrait' },
  pagebreak:  { mode: ['css', 'legacy'] },
});
