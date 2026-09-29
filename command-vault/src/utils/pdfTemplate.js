/* ─────────────────────────────────────────────────────────
   pdfTemplate.js
   Template con ESTILOS 100% INLINE para html2pdf.
   IMPORTANTE: No usar bloques <style> ni <head> porque
   se pierden al hacer element.innerHTML = htmlString.
   ───────────────────────────────────────────────────────── */

// ── SVG Icons inline (stroke-based, sin dependencias) ──────────────────────
const IC = {
  terminal: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>`,
  calendar: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:5px;"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  folder:   `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:5px;"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
  link:     `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:5px;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
  note:     `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:5px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`,
  gear:     `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:5px;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
};

// ── Helpers ─────────────────────────────────────────────────────────────────
const esc = (str) =>
  String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Colores inline (sin CSS vars, sin clases)
const BLUE_DARK  = '#1e3a8a';
const BLUE_MID   = '#1d4ed8';
const BLUE_LIGHT = '#3b82f6';
const BLUE_BG    = '#eff6ff';
const BLUE_BORDER= '#bfdbfe';
const GRAY_TEXT  = '#374151';
const GRAY_MUTED = '#6b7280';
const GRAY_LIGHT = '#f8faff';
const GRAY_BORDER= '#e2e8f0';
const WHITE      = '#ffffff';

export const getPdfTemplate = (folder, folderCommands, title, videoLink, globalDescription) => {
  const dateStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  // ── Filas de la tabla ──────────────────────────────────────────────────────
  const rows = folderCommands.length > 0
    ? folderCommands.map((c, i) => `
      <tr>
        <td style="padding:11px 14px;text-align:center;font-weight:700;color:${BLUE_LIGHT};font-size:13px;border-right:1px solid ${GRAY_BORDER};border-bottom:1px solid ${GRAY_BORDER};vertical-align:top;background:${i % 2 === 0 ? WHITE : GRAY_LIGHT};">${i + 1}</td>
        <td style="padding:11px 14px;border-right:1px solid ${GRAY_BORDER};border-bottom:1px solid ${GRAY_BORDER};vertical-align:top;background:${i % 2 === 0 ? WHITE : GRAY_LIGHT};">
          <span style="display:block;font-family:'Courier New',Courier,monospace;font-size:12px;color:${BLUE_DARK};background:${BLUE_BG};padding:6px 10px;border-radius:5px;border-left:3px solid ${BLUE_LIGHT};word-break:break-all;line-height:1.55;">${esc(c.executable)}</span>
        </td>
        <td style="padding:11px 14px;border-bottom:1px solid ${GRAY_BORDER};font-size:13px;color:${GRAY_TEXT};line-height:1.6;vertical-align:top;background:${i % 2 === 0 ? WHITE : GRAY_LIGHT};">${esc(c.purpose) || '<em style="color:#9ca3af;">Sin descripcion</em>'}</td>
      </tr>`)
    .join('')
    : `<tr><td colspan="3" style="padding:28px;text-align:center;color:#9ca3af;font-size:13px;">Sin comandos registrados</td></tr>`;

  // ── Construccion del HTML (todo inline) ────────────────────────────────────
  return `
<div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:${GRAY_TEXT};background:${WHITE};width:100%;margin:0;padding:0;">

  <!-- HEADER -->
  <div style="background:linear-gradient(135deg,${BLUE_DARK} 0%,${BLUE_MID} 55%,${BLUE_LIGHT} 100%);padding:32px 44px 26px 44px;color:${WHITE};">

    <!-- Logo + Brand -->
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:18px;">
      <div style="width:50px;height:50px;background:rgba(255,255,255,0.15);border:2px solid rgba(255,255,255,0.35);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        ${IC.terminal}
      </div>
      <div>
        <div style="font-size:26px;font-weight:800;letter-spacing:-0.5px;color:${WHITE};">Command Vault</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.8);margin-top:3px;">Documentacion de Flujos del Sistema</div>
      </div>
    </div>

    <!-- Badges -->
    <div style="display:flex;gap:10px;flex-wrap:wrap;">
      <span style="display:inline-flex;align-items:center;background:rgba(255,255,255,0.92);color:${BLUE_DARK};border-radius:20px;padding:5px 14px;font-size:12px;font-weight:700;">
        ${IC.calendar}${dateStr}
      </span>
      <span style="display:inline-flex;align-items:center;background:rgba(255,255,255,0.16);border:1px solid rgba(255,255,255,0.3);color:${WHITE};border-radius:20px;padding:5px 14px;font-size:12px;font-weight:600;">
        ${IC.folder}${esc(folder.name)}
      </span>
      ${folderCommands.length > 0 ? `
      <span style="display:inline-flex;align-items:center;background:rgba(255,255,255,0.16);border:1px solid rgba(255,255,255,0.3);color:${WHITE};border-radius:20px;padding:5px 14px;font-size:12px;font-weight:600;">
        ${IC.gear}${folderCommands.length} comando${folderCommands.length !== 1 ? 's' : ''}
      </span>` : ''}
    </div>
  </div>

  <!-- BODY -->
  <div style="padding:32px 44px;">

    <!-- Etiqueta + Titulo del flujo -->
    <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${GRAY_MUTED};margin-bottom:6px;">Flujo documentado</div>
    <div style="font-size:22px;font-weight:800;color:#111827;padding-left:13px;border-left:4px solid ${BLUE_LIGHT};margin-bottom:24px;line-height:1.3;">${esc(title || folder.name)}</div>

    <!-- Info cards -->
    <div style="display:flex;gap:14px;margin-bottom:24px;flex-wrap:wrap;">
      <div style="flex:1;min-width:160px;background:${BLUE_BG};border:1px solid ${BLUE_BORDER};border-radius:10px;padding:13px 16px;">
        <div style="font-size:10px;color:${GRAY_MUTED};font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:5px;">${IC.folder}Carpeta</div>
        <div style="font-size:13px;color:${BLUE_DARK};font-weight:700;">${esc(folder.name)}</div>
      </div>
      <div style="flex:1;min-width:160px;background:${BLUE_BG};border:1px solid ${BLUE_BORDER};border-radius:10px;padding:13px 16px;">
        <div style="font-size:10px;color:${GRAY_MUTED};font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:5px;">${IC.calendar}Generado</div>
        <div style="font-size:13px;color:${BLUE_DARK};font-weight:700;">${dateStr}</div>
      </div>
      ${videoLink ? `
      <div style="flex:1;min-width:160px;background:${BLUE_BG};border:1px solid ${BLUE_BORDER};border-radius:10px;padding:13px 16px;">
        <div style="font-size:10px;color:${GRAY_MUTED};font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:5px;">${IC.link}Referencia</div>
        <div style="font-size:12px;color:${BLUE_MID};font-weight:600;word-break:break-all;">${esc(videoLink)}</div>
      </div>` : ''}
    </div>

    <!-- Descripcion global -->
    ${globalDescription ? `
    <div style="background:#fafafa;border:1px solid ${GRAY_BORDER};border-left:4px solid ${BLUE_LIGHT};border-radius:8px;padding:15px 18px;margin-bottom:26px;">
      <div style="font-size:10px;color:${GRAY_MUTED};font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px;">${IC.note}Descripcion general</div>
      <p style="font-size:13px;color:${GRAY_TEXT};line-height:1.7;text-align:justify;">${esc(globalDescription)}</p>
    </div>` : ''}

    <!-- Etiqueta tabla -->
    <div style="font-size:10px;color:${GRAY_MUTED};font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:10px;">${IC.gear}Secuencia de comandos</div>

    <!-- Tabla -->
    <table style="width:100%;border-collapse:collapse;border:1px solid ${GRAY_BORDER};font-size:13px;border-radius:10px;overflow:hidden;">
      <thead>
        <tr style="background:linear-gradient(90deg,${BLUE_DARK},${BLUE_MID});">
          <th style="padding:11px 14px;text-align:left;color:${WHITE};font-size:11px;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;width:5%;border-right:1px solid rgba(255,255,255,0.15);">#</th>
          <th style="padding:11px 14px;text-align:left;color:${WHITE};font-size:11px;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;width:46%;border-right:1px solid rgba(255,255,255,0.15);">Instruccion / Comando</th>
          <th style="padding:11px 14px;text-align:left;color:${WHITE};font-size:11px;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;width:49%;">Descripcion y Proposito</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

  </div>

  <!-- FOOTER -->
  <div style="margin-top:28px;padding:18px 44px;background:${GRAY_LIGHT};border-top:2px solid ${BLUE_BORDER};display:flex;align-items:center;justify-content:space-between;">
    <div>
      <div style="font-size:15px;font-weight:800;color:${BLUE_DARK};margin-bottom:2px;">Command Vault</div>
      <div style="font-size:11px;color:#9ca3af;font-style:italic;">Sistema de Documentacion Automatizada</div>
    </div>
    <div style="text-align:right;">
      <div style="border-top:2px solid ${BLUE_LIGHT};width:140px;margin-left:auto;margin-bottom:4px;"></div>
      <div style="font-size:11px;font-weight:700;color:${BLUE_DARK};">Departamento Tecnico</div>
      <div style="font-size:10px;color:#9ca3af;margin-top:2px;">Generado automaticamente &bull; ${dateStr}</div>
    </div>
  </div>

</div>`;
};

// ── Configuracion de html2pdf ────────────────────────────────────────────────
export const getPdfConfig = (filename) => ({
  margin:      0,                           // número, no array
  filename,
  image:       { type: 'jpeg', quality: 0.98 },
  html2canvas: {
    scale:           2,
    useCORS:         true,
    logging:         false,
    letterRendering: true,
    backgroundColor: '#ffffff',
    // Sin windowWidth: usar el ancho real del contenedor (794px set en el div)
  },
  jsPDF:      { unit: 'mm', format: 'a4', orientation: 'portrait' },
  pagebreak:  { mode: ['css', 'legacy'], avoid: 'tr' },
});
