import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { 
  ArrowLeft, ExternalLink, Plus, Copy, Edit2, Save, 
  FileText, Share2, Trash2, Loader2, Check 
} from 'lucide-react';
import { getPdfTemplate, getPdfConfig } from '../utils/pdfTemplate';
import { showToast, showError } from '../utils/alerts';

export default function FolderView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    folders, 
    commands, 
    saveFolderContent, 
    recordCommandCopy 
  } = useData();
  
  const folder = folders.find(f => f.id === id || f._id === id);
  const folderCommands = commands.filter(c => c.folderId === id);

  const [title, setTitle] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [globalDescription, setGlobalDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState('');
  
  const [localCommands, setLocalCommands] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (folder) {
      setTitle(folder.title || '');
      setVideoLink(folder.videoLink || '');
      setGlobalDescription(folder.globalDescription || '');
      setCategory(folder.category || 'General');
      setTags((folder.tags || []).join(', '));

      if (!folder.title && folderCommands.length === 0) {
        setIsEditing(true);
      }
    }
    setLocalCommands(folderCommands);
  }, [id, folder]);

  if (!folder) {
    return (
      <div className="glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: '1rem', marginTop: '2rem' }}>
        <h2>Carpeta no encontrada</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          Es posible que la carpeta haya sido eliminada o no tengas acceso.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Volver a mis flujos
        </button>
      </div>
    );
  }

  const handleAddCommand = () => {
    setLocalCommands([...localCommands, {
      id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      folderId: id,
      executable: '',
      purpose: ''
    }]);
  };

  const updateLocalCommand = (cmdId, field, value) => {
    setLocalCommands(localCommands.map(c => 
      (c.id === cmdId || c._id === cmdId) ? { ...c, [field]: value } : c
    ));
  };

  const removeLocalCommand = (cmdId) => {
    setLocalCommands(localCommands.filter(c => c.id !== cmdId && c._id !== cmdId));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const tagsArray = tags
        ? tags.split(',').map(t => t.trim()).filter(Boolean)
        : [];

      const details = { 
        title, 
        videoLink, 
        globalDescription, 
        category,
        tags: tagsArray,
        commands: localCommands 
      };

      await saveFolderContent(id, details);
      setIsEditing(false);
      showToast('Flujo guardado con éxito');
    } catch (err) {
      showError('Error al guardar', err.message);
    } finally {
      setIsSaving(false);
    }
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
        try { 
          await navigator.share({ files: [file], title: folder.name, text: 'Documentación de flujo Command Vault' }); 
        } catch (_err) {}
      } else {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url; 
        a.download = file.name; 
        a.click();
        URL.revokeObjectURL(url);
        showToast('PDF descargado para compartir');
      }
    } catch (_err) {
      showError('Error', 'No se pudo generar el documento PDF para compartir.');
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
    } catch (_err) {
      showError('Error', 'No se pudo generar la vista previa del PDF.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const copyToClipboard = (cmd) => {
    if (!cmd.executable) return;
    navigator.clipboard.writeText(cmd.executable);
    const cmdId = cmd.id || cmd._id;
    setCopiedId(cmdId);
    setTimeout(() => setCopiedId(null), 1800);
    showToast('¡Comando copiado al portapapeles!');
    if (cmdId && !String(cmdId).startsWith('temp_')) {
      recordCommandCopy(cmdId);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
        <button className="btn-ghost" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', border: 'none', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <ArrowLeft size={18} />
        </button>
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Volver a mis flujos</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{folder.name}</span>
      </div>

      <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Header Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--primary)' }}>
              Carpeta: {folder.name}
            </span>
            {folder.category && (
              <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem', borderRadius: '1rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                {category}
              </span>
            )}
          </div>

          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Título del flujo</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Título descriptivo del flujo..." 
                value={title} 
                onChange={e => setTitle(e.target.value)}
                style={{ fontSize: '1.4rem', fontWeight: 'bold' }}
              />
            </div>
          ) : (
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>{title || folder.name}</h1>
          )}

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {isEditing ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Link de video / tutorial / documentación</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="https://..." 
                  value={videoLink} 
                  onChange={e => setVideoLink(e.target.value)}
                />
              </div>
            ) : (
              <div className="input-field" style={{ flex: 1, color: videoLink ? 'var(--text-main)' : 'var(--text-muted)', overflowWrap: 'anywhere' }}>
                {videoLink || 'Sin link de referencia'}
              </div>
            )}
            
            <a 
              href={videoLink || '#'} 
              target="_blank" 
              rel="noreferrer" 
              className="btn btn-primary" 
              style={{ 
                opacity: videoLink ? 1 : 0.4, 
                pointerEvents: videoLink ? 'auto' : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                height: '42px',
                marginTop: isEditing ? '1.5rem' : 0
              }}
            >
              <ExternalLink size={16} /> Abrir Enlace
            </a>
          </div>

          {isEditing && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Categoría</label>
                <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="General" style={{ background: '#1e293b' }}>General</option>
                  <option value="DevOps & Infra" style={{ background: '#1e293b' }}>DevOps & Infra</option>
                  <option value="Desarrollo" style={{ background: '#1e293b' }}>Desarrollo</option>
                  <option value="Bases de Datos" style={{ background: '#1e293b' }}>Bases de Datos</option>
                  <option value="Redes & Seguridad" style={{ background: '#1e293b' }}>Redes & Seguridad</option>
                  <option value="Soporte Técnico" style={{ background: '#1e293b' }}>Soporte Técnico</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Etiquetas (separadas por coma)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={tags} 
                  onChange={e => setTags(e.target.value)} 
                  placeholder="ej. produccion, docker, scripts" 
                />
              </div>
            </div>
          )}
        </div>

        {/* Commands Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>Secuencia de Comandos</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{localCommands.length} comando(s)</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Define los bloques ejecutables en orden y asigna explicaciones para los operadores del equipo.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {localCommands.length === 0 ? (
              <div className="glass" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '0.5rem' }}>
                No hay comandos en esta secuencia. Haz clic en el botón inferior para agregar uno.
              </div>
            ) : (
              localCommands.map((cmd, index) => {
                const cmdId = cmd.id || cmd._id;
                const isCopied = copiedId === cmdId;

                return (
                  <div key={cmdId} className="glass" style={{ padding: '1.25rem', borderRadius: '0.75rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                      {index + 1}
                    </div>
                    
                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>Comando Ejecutable</label>
                        {isEditing ? (
                          <textarea 
                            className="input-field code-font" 
                            value={cmd.executable}
                            onChange={e => updateLocalCommand(cmdId, 'executable', e.target.value)}
                            rows={3}
                            placeholder="npm run start..."
                          />
                        ) : (
                          <pre className="input-field code-font" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0 }}>
                            {cmd.executable || <span style={{ color: 'var(--text-muted)' }}>(vacío)</span>}
                          </pre>
                        )}
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>Propósito y Detalle</label>
                        {isEditing ? (
                          <textarea 
                            className="input-field" 
                            value={cmd.purpose}
                            onChange={e => updateLocalCommand(cmdId, 'purpose', e.target.value)}
                            rows={3}
                            placeholder="Descripción o parámetro clave..."
                          />
                        ) : (
                          <div className="input-field" style={{ height: 'auto', minHeight: '75px', color: cmd.purpose ? 'var(--text-main)' : 'var(--text-muted)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {cmd.purpose || 'Sin descripción'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button 
                        className="btn-ghost" 
                        style={{ padding: '0.5rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', color: isCopied ? 'var(--success)' : 'inherit' }} 
                        onClick={() => copyToClipboard(cmd)} 
                        title="Copiar Comando"
                      >
                        {isCopied ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                      {isEditing && (
                        <button 
                          className="btn-ghost" 
                          style={{ padding: '0.5rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', color: 'var(--danger)' }} 
                          onClick={() => removeLocalCommand(cmdId)} 
                          title="Eliminar comando"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {isEditing && (
            <button 
              className="btn btn-ghost" 
              style={{ marginTop: '1rem', color: 'var(--primary)', border: '1px dashed var(--primary)', width: '100%', padding: '0.75rem', justifyContent: 'center' }} 
              onClick={handleAddCommand}
            >
              <Plus size={18} /> Agregar otro comando a la secuencia
            </button>
          )}
        </div>

        {/* Global Description */}
        <div>
          <label style={{ display: 'block', fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Descripción global del flujo
          </label>
          {isEditing ? (
            <textarea 
              className="input-field"
              rows={4}
              value={globalDescription}
              onChange={e => setGlobalDescription(e.target.value)}
              placeholder="Describe el objetivo general, prerrequisitos o contexto de este flujo..."
            />
          ) : (
            <div className="input-field" style={{ minHeight: '100px', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
              {globalDescription || 'Sin descripción registrada.'}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--card-border)', paddingTop: '1.5rem', flexWrap: 'wrap' }}>
          {isEditing ? (
            <>
              <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button className="btn btn-ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>
                Cancelar Edición
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                <Edit2 size={18} /> Editar Flujo
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
                <Share2 size={18} /> {generatingPdf ? 'Generando...' : 'Compartir PDF'}
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
            <Loader2 size={42} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: 600, fontSize: '1rem' }}>Generando PDF del flujo...</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Por favor espera un momento</p>
          </div>
        </div>
      )}

      {pdfPreviewUrl && (
        <div className="modal-overlay" onClick={() => {
          URL.revokeObjectURL(pdfPreviewUrl);
          setPdfPreviewUrl(null);
        }}>
          <div className="modal-content glass" style={{ width: '90%', height: '90vh', padding: '1.25rem', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 700 }}>Vista Previa de Ficha Técnica (PDF)</h2>
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
