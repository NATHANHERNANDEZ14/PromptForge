export const getPdfTemplate = (folder, folderCommands, title, videoLink, globalDescription) => {
  const dateStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; position: relative; padding: 10px; min-height: 1000px;">
      
      <!-- Top Right Decorative Element -->
      <div style="position: absolute; top: -25px; right: -25px; width: 150px; height: 120px; background-color: #2196f3; border-bottom-left-radius: 80px; z-index: 1;">
         <div style="position: absolute; bottom: 20px; left: 20px; font-size: 40px; color: rgba(255,255,255,0.2);">✦</div>
      </div>
      
      <!-- Left Decorative Element (only on first page for html2pdf simplicity, but looks cool) -->
      <div style="position: absolute; top: -25px; left: -25px; bottom: 0; width: 60px; background-color: #2196f3; border-top-right-radius: 20px; border-bottom-right-radius: 20px; z-index: 1;">
         <div style="margin-top: 150px; text-align: center; color: white; font-size: 24px;">⚡</div>
         <div style="margin-top: 100px; text-align: center; color: white; font-size: 24px;">★</div>
         <div style="margin-top: 200px; text-align: center; color: white; font-size: 24px;">⚡</div>
      </div>

      <!-- Main Content Container with Left Offset -->
      <div style="position: relative; z-index: 2; margin-left: 60px;">
        
        <!-- Header -->
        <div style="display: flex; align-items: center; margin-bottom: 25px; padding-top: 10px;">
          <div style="width: 50px; height: 50px; border: 2px solid #2196f3; border-radius: 8px; display: flex; justify-content: center; align-items: center; margin-right: 15px; background: white;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2196f3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
          </div>
          <div>
            <h1 style="color: #2196f3; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Command Vault</h1>
            <p style="color: #666; margin: 2px 0 0 0; font-size: 14px; font-weight: 500;">Directorio de Flujos del Sistema</p>
          </div>
        </div>

        <!-- Date & Location Badges -->
        <div style="margin-bottom: 35px;">
          <div style="background-color: #2196f3; color: white; display: inline-block; padding: 6px 20px; border-radius: 20px; font-size: 13px; margin-bottom: 8px; font-weight: bold; box-shadow: 0 2px 4px rgba(33,150,243,0.3);">
            ${dateStr}
          </div>
          <br/>
          <div style="border: 1px solid #2196f3; color: #2196f3; display: inline-block; padding: 6px 20px; border-radius: 20px; font-size: 13px; background-color: #f0f8ff;">
            <strong>Referencia:</strong> ${folder.name}
          </div>
        </div>

        <!-- Body Text -->
        <div style="margin-bottom: 40px; padding-right: 40px;">
          <p style="font-weight: bold; font-style: italic; font-size: 15px; margin-bottom: 20px; color: #222;">
            Detalle Técnico:
          </p>
          
          ${title ? `<p style="font-size: 14px; line-height: 1.6; text-align: justify; margin-bottom: 15px; color: #444;"><strong>Asunto:</strong> ${title}</p>` : ''}
          ${videoLink ? `<p style="font-size: 14px; line-height: 1.6; text-align: justify; margin-bottom: 15px; color: #444;"><strong>Enlace Adjunto:</strong> <a href="${videoLink}" style="color: #f50057;">${videoLink}</a></p>` : ''}
          
          <p style="font-size: 14px; line-height: 1.6; text-align: justify; color: #444; margin-bottom: 30px;">
            ${globalDescription || 'El presente documento detalla de manera formal la secuencia de comandos y procedimientos técnicos asociados al flujo mencionado. Esta información ha sido extraída de Command Vault para su validación y uso operativo.'}
          </p>

          <!-- Commands Table -->
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr>
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #2196f3; color: #2196f3; width: 5%;">#</th>
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #2196f3; color: #2196f3; width: 45%;">Instrucción / Comando</th>
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #2196f3; color: #2196f3; width: 50%;">Descripción</th>
              </tr>
            </thead>
            <tbody>
              ${folderCommands.length > 0 ? folderCommands.map((c, i) => `
                <tr style="border-bottom: 1px solid #eee; page-break-inside: avoid;">
                  <td style="padding: 12px 10px; color: #888; font-weight: bold;">${i+1}</td>
                  <td style="padding: 12px 10px;">
                    <span style="font-family: monospace; color: #f50057; font-weight: 600; background: #fff0f4; padding: 4px 8px; border-radius: 4px;">${c.executable}</span>
                  </td>
                  <td style="padding: 12px 10px; color: #555; text-align: justify;">${c.purpose || '-'}</td>
                </tr>
              `).join('') : `
                <tr><td colspan="3" style="padding: 20px; text-align: center; color: #999;">Sin comandos</td></tr>
              `}
            </tbody>
          </table>
          
          <p style="margin-top: 30px; font-size: 14px; color: #444;">
            Atentamente,
          </p>
        </div>

        <!-- Signature Area -->
        <div style="margin-top: 40px; text-align: right; padding-right: 40px; padding-bottom: 60px; page-break-inside: avoid;">
           <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: bold; font-size: 20px; color: #1c2541; margin-bottom: 5px;">
              Command Vault Systems
           </div>
           <div style="border-top: 2px solid #3a86ff; width: 250px; margin-left: auto;"></div>
           <p style="color: #3a86ff; font-weight: bold; margin: 8px 0 0 0; font-size: 14px;">Departamento Técnico</p>
           <p style="color: #888; margin: 0; font-size: 12px; font-style: italic;">Sistema de Documentación Automatizada</p>
        </div>

      </div>

      <!-- Footer -->
      <div style="position: absolute; bottom: -20px; left: 60px; right: 0; border-top: 1px solid #eee; padding-top: 15px; display: flex; justify-content: center; gap: 30px; font-size: 11px; color: #777;">
         <span style="display: flex; align-items: center; gap: 5px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3a86ff" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> (+00) 123-456-7890</span>
         <span style="display: flex; align-items: center; gap: 5px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3a86ff" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> admin@commandvault.com</span>
         <span style="display: flex; align-items: center; gap: 5px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3a86ff" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg> @commandvault</span>
      </div>
      
    </div>
  `;
};

export const getPdfConfig = (filename) => ({
  margin: [10, 10, 20, 10], // top, left, bottom, right. (Left handles itself mostly via HTML offset)
  filename: filename,
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 2, useCORS: true },
  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  pagebreak: { mode: ['css', 'avoid-all', 'legacy'] }
});
