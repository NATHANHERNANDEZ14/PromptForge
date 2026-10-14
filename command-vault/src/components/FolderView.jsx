import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { 
  ArrowLeft, ExternalLink, Plus, Copy, Edit2, Save, 
  FileText, Share2, Trash2, Loader2, Check 
} from 'lucide-react';
import { getPdfTemplate, getPdfConfig } from '../utils/pdfTemplate';
import { showToast, showError } from '../utils/alerts';
import { FolderStyles } from '../styles/folderStyles';

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
      <div className="glass" style={FolderStyles.notFoundCard}>
        <h2>Carpeta no encontrada</h2>
        <p style={FolderStyles.notFoundText}>
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
      <div style={FolderStyles.breadcrumb}>
        <button className="btn-ghost" style={FolderStyles.backButton} onClick={() => navigate('/')}>
          <ArrowLeft size={18} />
        </button>
        <Link to="/" style={FolderStyles.breadcrumbLink}>Volver a mis flujos</Link>
        <span>/</span>
        <span style={FolderStyles.breadcrumbCurrent}>{folder.name}</span>
      </div>

      <div className="glass" style={FolderStyles.card}>
        
        {/* Header Info */}
        <div style={FolderStyles.headerInfo}>
          <div style={FolderStyles.headerTop}>
            <span style={FolderStyles.folderBadge}>
              Carpeta: {folder.name}
            </span>
            {folder.category && (
              <span style={FolderStyles.categoryBadge}>
                {category}
              </span>
            )}
          </div>

          {isEditing ? (
            <div style={FolderStyles.titleGroup}>
              <label style={FolderStyles.titleLabel}>Título del flujo</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Título descriptivo del flujo..." 
                value={title} 
                onChange={e => setTitle(e.target.value)}
                style={FolderStyles.titleInput}
              />
            </div>
          ) : (
            <h1 style={FolderStyles.titleView}>{title || folder.name}</h1>
          )}

          <div style={FolderStyles.videoRow}>
            {isEditing ? (
              <div style={FolderStyles.videoInputContainer}>
                <label style={FolderStyles.titleLabel}>Link de video / tutorial / documentación</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="https://..." 
                  value={videoLink} 
                  onChange={e => setVideoLink(e.target.value)}
                />
              </div>
            ) : (
              <div className="input-field" style={FolderStyles.videoLinkDisplay(Boolean(videoLink))}>
                {videoLink || 'Sin link de referencia'}
              </div>
            )}
            
            <a 
              href={videoLink || '#'} 
              target="_blank" 
              rel="noreferrer" 
              className="btn btn-primary" 
              style={FolderStyles.openLinkButton(Boolean(videoLink), isEditing)}
            >
              <ExternalLink size={16} /> Abrir Enlace
            </a>
          </div>

          {isEditing && (
            <div style={FolderStyles.categoryGrid}>
              <div>
                <label style={FolderStyles.fieldLabel}>Categoría</label>
                <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="General" style={FolderStyles.selectOption}>General</option>
                  <option value="DevOps & Infra" style={FolderStyles.selectOption}>DevOps & Infra</option>
                  <option value="Desarrollo" style={FolderStyles.selectOption}>Desarrollo</option>
                  <option value="Bases de Datos" style={FolderStyles.selectOption}>Bases de Datos</option>
                  <option value="Redes & Seguridad" style={FolderStyles.selectOption}>Redes & Seguridad</option>
                  <option value="Soporte Técnico" style={FolderStyles.selectOption}>Soporte Técnico</option>
                </select>
              </div>
              <div>
                <label style={FolderStyles.fieldLabel}>Etiquetas (separadas por coma)</label>
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
          <div style={FolderStyles.sectionHeader}>
            <h2 style={FolderStyles.sectionTitle}>Secuencia de Comandos</h2>
            <span style={FolderStyles.commandCount}>{localCommands.length} comando(s)</span>
          </div>
          <p style={FolderStyles.sectionSubtitle}>
            Define los bloques ejecutables en orden y asigna explicaciones para los operadores del equipo.
          </p>

          <div style={FolderStyles.commandsList}>
            {localCommands.length === 0 ? (
              <div className="glass" style={FolderStyles.emptyCommands}>
                No hay comandos en esta secuencia. Haz clic en el botón inferior para agregar uno.
              </div>
            ) : (
              localCommands.map((cmd, index) => {
                const cmdId = cmd.id || cmd._id;
                const isCopied = copiedId === cmdId;

                return (
                  <div key={cmdId} className="glass" style={FolderStyles.commandCard}>
                    <div style={FolderStyles.commandBadge}>
                      {index + 1}
                    </div>
                    
                    <div style={FolderStyles.commandFieldsGrid}>
                      <div>
                        <label style={FolderStyles.commandLabel}>Comando Ejecutable</label>
                        {isEditing ? (
                          <textarea 
                            className="input-field code-font" 
                            value={cmd.executable}
                            onChange={e => updateLocalCommand(cmdId, 'executable', e.target.value)}
                            rows={3}
                            placeholder="npm run start..."
                          />
                        ) : (
                          <pre className="input-field code-font" style={FolderStyles.commandPre}>
                            {cmd.executable || <span style={{ color: 'var(--text-muted)' }}>(vacío)</span>}
                          </pre>
                        )}
                      </div>
                      <div>
                        <label style={FolderStyles.commandLabel}>Propósito y Detalle</label>
                        {isEditing ? (
                          <textarea 
                            className="input-field" 
                            value={cmd.purpose}
                            onChange={e => updateLocalCommand(cmdId, 'purpose', e.target.value)}
                            rows={3}
                            placeholder="Descripción o parámetro clave..."
                          />
                        ) : (
                          <div className="input-field" style={FolderStyles.commandPurpose(Boolean(cmd.purpose))}>
                            {cmd.purpose || 'Sin descripción'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={FolderStyles.commandActions}>
                      <button 
                        className="btn-ghost" 
                        style={FolderStyles.copyButton(isCopied)} 
                        onClick={() => copyToClipboard(cmd)} 
                        title="Copiar Comando"
                      >
                        {isCopied ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                      {isEditing && (
                        <button 
                          className="btn-ghost" 
                          style={FolderStyles.deleteButton} 
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
              style={FolderStyles.addCommandButton} 
              onClick={handleAddCommand}
            >
              <Plus size={18} /> Agregar otro comando a la secuencia
            </button>
          )}
        </div>

        {/* Global Description */}
        <div>
          <label style={FolderStyles.globalDescriptionLabel}>
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
            <div className="input-field" style={FolderStyles.globalDescriptionView}>
              {globalDescription || 'Sin descripción registrada.'}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={FolderStyles.actionFooter}>
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
                style={FolderStyles.pdfActionButton(generatingPdf)}
                onClick={generatePDF}
                disabled={generatingPdf}
              >
                <FileText size={18} /> {generatingPdf ? 'Generando...' : 'Visualizar PDF'}
              </button>
              <button
                className="btn btn-ghost"
                style={FolderStyles.pdfActionButton(generatingPdf)}
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
        <div style={FolderStyles.loadingOverlay}>
          <div className="glass" style={FolderStyles.loadingCard}>
            <Loader2 size={42} className="animate-spin" style={FolderStyles.loadingSpinner} />
            <p style={FolderStyles.loadingTitle}>Generando PDF del flujo...</p>
            <p style={FolderStyles.loadingSubtitle}>Por favor espera un momento</p>
          </div>
        </div>
      )}

      {pdfPreviewUrl && (
        <div className="modal-overlay" onClick={() => {
          URL.revokeObjectURL(pdfPreviewUrl);
          setPdfPreviewUrl(null);
        }}>
          <div className="modal-content glass" style={FolderStyles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={FolderStyles.modalHeader}>
              <h2 style={FolderStyles.modalTitle}>Vista Previa de Ficha Técnica (PDF)</h2>
              <button className="btn btn-ghost" onClick={() => {
                URL.revokeObjectURL(pdfPreviewUrl);
                setPdfPreviewUrl(null);
              }}>Cerrar</button>
            </div>
            <iframe src={pdfPreviewUrl} style={FolderStyles.pdfIframe} title="PDF Preview" />
          </div>
        </div>
      )}
    </div>
  );
}
