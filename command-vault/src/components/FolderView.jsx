import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ArrowLeft, ExternalLink, Plus, Copy, Edit2, Save, FileText, Share2, Trash2 } from 'lucide-react';
import { getPdfTemplate, getPdfConfig } from '../utils/pdfTemplate';

export default function FolderView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { folders, getFolderCommands, commands, setCommands, updateFolder, saveFolderContent } = useData();
  
  const folder = folders.find(f => f.id === id);
  const folderCommands = commands.filter(c => c.folderId === id);

  const [title, setTitle] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [globalDescription, setGlobalDescription] = useState('');
  
  // Local state for commands during editing
  const [localCommands, setLocalCommands] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    if (folder) {
      setTitle(folder.title || '');
      setVideoLink(folder.videoLink || '');
      setGlobalDescription(folder.globalDescription || '');
      // If there's no title, it's presumably a new empty folder, so enter edit mode.
      if (!folder.title && folderCommands.length === 0) setIsEditing(true);
    }
    setLocalCommands(folderCommands);
  }, [id]);

  if (!folder) {
    return <div style={{ padding: '2rem' }}>Carpeta no encontrada</div>;
  }

  const handleAddCommand = () => {
    setLocalCommands([...localCommands, {
      id: Date.now().toString(),
      folderId: id,
      executable: '',
      purpose: ''
    }]);
  };

  const updateLocalCommand = (cmdId, field, value) => {
    setLocalCommands(localCommands.map(c => 
      c.id === cmdId ? { ...c, [field]: value } : c
    ));
  };

  const removeLocalCommand = (cmdId) => {
    setLocalCommands(localCommands.filter(c => c.id !== cmdId));
  };

  const handleSave = async () => {
    const details = { title, videoLink, globalDescription, commands: localCommands };
    await saveFolderContent(id, details);
    setIsEditing(false);
  };

  const handleShare = async () => {
    setGeneratingPdf(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const htmlContent = getPdfTemplate(folder, localCommands, title, videoLink, globalDescription);
      const opt = getPdfConfig(`${folder.name.replace(/\s+/g, '_')}.pdf`);
      
      const pdfBlob = await html2pdf().set(opt).from(htmlContent).outputPdf('blob');
      
      const file = new File([pdfBlob], `${folder.name.replace(/\s+/g, '_')}.pdf`, { type: 'application/pdf' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], title: folder.name, text: 'Documentacion de flujo Command Vault' }); } catch (err) {}
      } else {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url; a.download = file.name; a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setGeneratingPdf(false);
    }
  };

  const generatePDF = async () => {
    setGeneratingPdf(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const htmlContent = getPdfTemplate(folder, localCommands, title, videoLink, globalDescription);
      const opt = getPdfConfig(`${folder.name.replace(/\s+/g, '_')}.pdf`);
      
      const pdfBlob = await html2pdf().set(opt).from(htmlContent).outputPdf('blob');
      const url = URL.createObjectURL(pdfBlob);
      setPdfPreviewUrl(url);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Comando copiado!');
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--text-muted)' }}>
        <button className="btn-ghost" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', border: 'none', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <ArrowLeft size={18} />
        </button>
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Volver a carpetas</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{folder.name}</span>
      </div>

      <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Header Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isEditing ? (
            <input 
              type="text" 
              className="input-field" 
              placeholder="Título del comando o flujo" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              style={{ fontSize: '1.5rem', fontWeight: 'bold' }}
            />
          ) : (
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{title || 'Sin Título'}</h1>
          )}

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {isEditing ? (
              <input 
                type="text" 
                className="input-field" 
                placeholder="Link de video/referencia" 
                value={videoLink} 
                onChange={e => setVideoLink(e.target.value)}
                style={{ flex: 1 }}
              />
            ) : (
              <div className="input-field" style={{ flex: 1, color: 'var(--text-muted)', overflowWrap: 'anywhere' }}>
                {videoLink || 'Sin link de referencia'}
              </div>
            )}
            
            <a href={videoLink || '#'} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ opacity: videoLink ? 1 : 0.5, pointerEvents: videoLink ? 'auto' : 'none' }}>
              <ExternalLink size={18} /> Ir al Link
            </a>
          </div>
        </div>

        {/* Commands Section */}
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary)' }}>Secuencia de Comandos</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Define los bloques ejecutables en orden y asigna explicaciones para los operadores del equipo.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {localCommands.map((cmd, index) => (
              <div key={cmd.id} className="glass" style={{ padding: '1rem', borderRadius: '0.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                  {index + 1}
                </div>
                
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Comando Ejecutable</label>
                    {isEditing ? (
                      <textarea 
                        className="input-field code-font" 
                        value={cmd.executable}
                        onChange={e => updateLocalCommand(cmd.id, 'executable', e.target.value)}
                        rows={3}
                        placeholder="npm install..."
                      />
                    ) : (
                      <pre className="input-field code-font" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                        {cmd.executable || 'Vacio'}
                      </pre>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Propósito y Detalle</label>
                    {isEditing ? (
                      <textarea 
                        className="input-field" 
                        value={cmd.purpose}
                        onChange={e => updateLocalCommand(cmd.id, 'purpose', e.target.value)}
                        rows={3}
                        placeholder="Descripción..."
                      />
                    ) : (
                      <div className="input-field" style={{ height: 'auto', minHeight: '80px', color: cmd.purpose ? 'var(--text-main)' : 'var(--text-muted)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {cmd.purpose || 'Sin descripción, haz clic en editar para agregar'}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button className="btn-ghost" style={{ padding: '0.5rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer' }} onClick={() => copyToClipboard(cmd.executable)} title="Copiar Comando">
                    <Copy size={18} />
                  </button>
                  {isEditing && (
                    <button className="btn-ghost" style={{ padding: '0.5rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', color: 'var(--danger)' }} onClick={() => removeLocalCommand(cmd.id)} title="Eliminar">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {isEditing && (
            <button className="btn btn-ghost" style={{ marginTop: '1rem', color: 'var(--primary)', border: '1px dashed var(--primary)' }} onClick={handleAddCommand}>
              <Plus size={18} /> Agregar otro comando
            </button>
          )}
        </div>

        {/* Global Description */}
        <div>
          <label style={{ display: 'block', fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Descripción global de la actividad</label>
          {isEditing ? (
            <textarea 
              className="input-field"
              rows={4}
              value={globalDescription}
              onChange={e => setGlobalDescription(e.target.value)}
              placeholder="Describe el objetivo general de este flujo..."
            />
          ) : (
            <div className="input-field" style={{ minHeight: '100px' }}>
              {globalDescription || 'Sin descripción'}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--card-border)', paddingTop: '1.5rem', marginTop: '1rem' }}>
          {isEditing ? (
            <button className="btn btn-primary" onClick={handleSave}>
              <Save size={18} /> Guardar
            </button>
          ) : (
            <>
              <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                <Edit2 size={18} /> Editar
              </button>
              <button
                className="btn btn-ghost"
                style={{ border: '1px solid var(--card-border)', opacity: generatingPdf ? 0.6 : 1 }}
                onClick={generatePDF}
                disabled={generatingPdf}
              >
                <FileText size={18} /> {generatingPdf ? 'Generando...' : 'Visualizar PDF'}
              </button>
              <button
                className="btn btn-ghost"
                style={{ border: '1px solid var(--card-border)', opacity: generatingPdf ? 0.6 : 1 }}
                onClick={handleShare}
                disabled={generatingPdf}
              >
                <Share2 size={18} /> {generatingPdf ? 'Generando...' : 'Compartir'}
              </button>
            </>
          )}
        </div>

      </div>

      {generatingPdf && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, backdropFilter: 'blur(4px)',
        }}>
          <div className="glass" style={{ padding: '2rem 3rem', borderRadius: '1rem', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: 600, fontSize: '1rem' }}>Generando PDF...</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Por favor espera un momento</p>
          </div>
        </div>
      )}

      {pdfPreviewUrl && (
        <div className="modal-overlay" onClick={() => {
          URL.revokeObjectURL(pdfPreviewUrl);
          setPdfPreviewUrl(null);
        }}>
          <div className="modal-content glass" style={{ width: '90%', height: '90vh', padding: '1rem', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>Vista Previa de PDF</h2>
              <button className="btn btn-ghost" onClick={() => {
                URL.revokeObjectURL(pdfPreviewUrl);
                setPdfPreviewUrl(null);
              }}>Cerrar</button>
            </div>
            <iframe src={pdfPreviewUrl} style={{ width: '100%', flex: 1, border: 'none', borderRadius: '0.5rem', backgroundColor: '#fff' }} title="PDF Preview" />
          </div>
        </div>
      )}
    </div>
  );
}
