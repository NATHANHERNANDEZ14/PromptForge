import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { 
  Search, FolderPlus, MoreVertical, FolderOpen, Clock, Command, 
  Terminal, FileText, Copy, Download, Upload, Loader2
} from 'lucide-react';

import { getPdfTemplate, getPdfConfig } from '../utils/pdfTemplate';
import { confirmDialog, showToast, showError, showSuccess } from '../utils/alerts';

const WORKFLOW_CATEGORIES = [
  'Todos',
  'General',
  'DevOps & Infra',
  'Desarrollo',
  'Bases de Datos',
  'Redes & Seguridad',
  'Soporte Técnico'
];

export default function Dashboard() {
  const { 
    folders, 
    commands, 
    addFolder, 
    updateFolder, 
    deleteFolder, 
    duplicateFolder,
    saveFolderContent,
    loading 
  } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [folderForm, setFolderForm] = useState({ name: '', category: 'General', tags: '' });
  const [menuOpen, setMenuOpen] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleCreateOrEdit = async (e) => {
    e.preventDefault();
    if (!folderForm.name.trim()) return;

    const tagsArray = folderForm.tags
      ? folderForm.tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const payload = {
      name: folderForm.name.trim(),
      category: folderForm.category,
      tags: tagsArray
    };

    try {
      if (editingFolder) {
        const folderId = editingFolder.id || editingFolder._id;
        await updateFolder(folderId, payload);
        showToast('Carpeta actualizada correctamente');
      } else {
        await addFolder(payload);
        showToast('Carpeta creada con éxito');
      }
      closeModal();
    } catch (err) {
      showError('Error', err.message);
    }
  };

  const openCreateModal = () => {
    setEditingFolder(null);
    setFolderForm({ name: '', category: 'General', tags: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (folder) => {
    setEditingFolder(folder);
    setFolderForm({
      name: folder.name || '',
      category: folder.category || 'General',
      tags: (folder.tags || []).join(', ')
    });
    setIsModalOpen(true);
    setMenuOpen(null);
  };

  const handleDuplicate = async (folder) => {
    const folderId = folder.id || folder._id;
    setMenuOpen(null);
    try {
      showToast('Duplicando flujo...', 'info');
      await duplicateFolder(folderId);
      showToast('Flujo duplicado con éxito');
    } catch (err) {
      showError('Error al duplicar', err.message);
    }
  };

  const handleDelete = async (folder) => {
    const folderId = folder.id || folder._id;
    setMenuOpen(null);
    const confirmed = await confirmDialog({
      title: '¿Eliminar carpeta?',
      text: `Se borrará la carpeta "${folder.name}" y todos sus comandos asociados.`,
      confirmButtonText: 'Sí, eliminar',
      icon: 'warning'
    });

    if (confirmed) {
      try {
        await deleteFolder(folderId);
        showToast('Carpeta eliminada');
      } catch (err) {
        showError('Error al eliminar', err.message);
      }
    }
  };

  const generateDashboardPDF = async (folder, folderCommands) => {
    try {
      showToast('Generando PDF...', 'info');
      const html2pdf = (await import('html2pdf.js')).default;
      const htmlContent = getPdfTemplate(folder, folderCommands, folder.title, folder.videoLink, folder.globalDescription);
      const opt = getPdfConfig(`${folder.name.replace(/\s+/g, '_')}.pdf`);
      await html2pdf().set(opt).from(htmlContent).save();
      showToast('PDF descargado');
    } catch (_err) {
      showError('Error en PDF', 'No se pudo generar el documento.');
    }
  };

  // Export workflow to JSON
  const handleExportJSON = (folder, folderCommands) => {
    setMenuOpen(null);
    const exportData = {
      version: '1.0',
      type: 'command-vault-flow',
      exportedAt: new Date().toISOString(),
      folder: {
        name: folder.name,
        title: folder.title,
        videoLink: folder.videoLink,
        globalDescription: folder.globalDescription,
        category: folder.category,
        tags: folder.tags
      },
      commands: folderCommands.map(c => ({
        executable: c.executable,
        purpose: c.purpose,
        category: c.category,
        tags: c.tags
      }))
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${folder.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_workflow.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Flujo exportado a JSON');
  };

  // Import workflow from JSON
  const handleImportJSON = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.folder || !data.folder.name) {
        throw new Error('El archivo JSON no tiene un formato válido de flujo de Command Vault.');
      }

      // Create new folder
      const folderId = await addFolder({
        name: `${data.folder.name} (Importado)`,
        category: data.folder.category || 'General',
        tags: data.folder.tags || []
      });

      // Save content and commands
      if (data.folder || data.commands) {
        await saveFolderContent(folderId, {
          title: data.folder.title || '',
          videoLink: data.folder.videoLink || '',
          globalDescription: data.folder.globalDescription || '',
          commands: data.commands || []
        });
      }

      showSuccess('Flujo Importado', `El flujo "${data.folder.name}" fue importado con éxito.`);
    } catch (err) {
      showError('Error al importar', err.message);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFolderForm({ name: '', category: 'General', tags: '' });
    setEditingFolder(null);
  };

  const filteredFolders = folders.filter(f => {
    const matchesSearch = 
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (f.title && f.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (f.tags && f.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesCategory = 
      selectedCategory === 'Todos' || 
      (f.category || 'General') === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', background: 'var(--primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>
          COMMAND VAULT
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Gestiona y documenta tus flujos de trabajo, comandos y equipos</p>
      </div>

      {/* Main Bar with Search, Stats & Actions */}
      <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', marginBottom: '1.5rem' }}>
        <div className="search-bar-container" style={{ marginBottom: '1.25rem' }}>
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Buscar por flujos, títulos, comandos, etiquetas..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="stats-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FolderOpen size={16} className="text-primary" />
              <span>{folders.length} Carpetas</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Command size={16} className="text-accent" />
              <span>{commands.length} Comandos</span>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '0.25rem' }}>Categoría:</span>
          {WORKFLOW_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? 'btn btn-primary' : 'btn btn-ghost'}
              style={{
                fontSize: '0.8rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '1rem',
                border: selectedCategory === cat ? 'none' : '1px solid rgba(255,255,255,0.08)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--card-border)' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".json"
              onChange={handleImportJSON}
            />
            <button 
              className="btn btn-ghost" 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isProcessing}
              title="Importar un archivo de flujo .JSON"
              style={{ fontSize: '0.85rem' }}
            >
              <Upload size={16} /> Importar Flujo JSON
            </button>
          </div>

          <button className="btn btn-primary" onClick={openCreateModal}>
            <FolderPlus size={18} />
            Generar Carpeta
          </button>
        </div>
      </div>

      {/* Grid of Folders */}
      {loading ? (
        <div className="glass" style={{ padding: '4rem', textAlign: 'center', borderRadius: '1rem', color: 'var(--text-muted)' }}>
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem', color: 'var(--primary)' }} />
          <p>Cargando flujos de trabajo...</p>
        </div>
      ) : filteredFolders.length === 0 ? (
        <div className="glass" style={{ padding: '3.5rem', textAlign: 'center', borderRadius: '1rem', color: 'var(--text-muted)' }}>
          <FolderOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>No se encontraron carpetas</h3>
          <p style={{ maxWidth: '400px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
            {searchTerm || selectedCategory !== 'Todos'
              ? 'Prueba modificando los filtros de búsqueda o categoría.'
              : 'Comienza creando tu primera carpeta para organizar flujos técnicos de comandos.'}
          </p>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <FolderPlus size={16} /> Crear Flujo
          </button>
        </div>
      ) : (
        <div className="folder-grid">
          {filteredFolders.map(folder => {
            const folderId = folder.id || folder._id;
            const folderCommands = commands.filter(c => c.folderId === folderId);
            const updateDate = folder.updatedAt ? new Date(folder.updatedAt).toLocaleDateString() : 'Reciente';
            
            return (
              <div key={folderId} className="folder-card glass">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 42, height: 42, borderRadius: '0.75rem', background: 'rgba(59, 130, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                      <Terminal size={22} />
                    </div>
                    {folder.category && (
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {folder.category}
                      </span>
                    )}
                  </div>
                  
                  <div style={{ position: 'relative' }}>
                    <button 
                      className="btn-ghost" 
                      style={{ padding: '0.35rem', borderRadius: '50%', border: 'none', cursor: 'pointer' }} 
                      onClick={() => setMenuOpen(menuOpen === folderId ? null : folderId)}
                    >
                      <MoreVertical size={18} />
                    </button>
                    
                    {menuOpen === folderId && (
                      <div className="glass" style={{ position: 'absolute', right: 0, top: '100%', zIndex: 20, borderRadius: '0.5rem', padding: '0.5rem', minWidth: '160px', display: 'flex', flexDirection: 'column', gap: '0.25rem', boxShadow: 'var(--shadow-lg)' }}>
                        <button className="btn-ghost" style={{ textAlign: 'left', padding: '0.5rem', border: 'none', cursor: 'pointer', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => openEditModal(folder)}>
                          Editar
                        </button>
                        <button className="btn-ghost" style={{ textAlign: 'left', padding: '0.5rem', border: 'none', cursor: 'pointer', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => handleDuplicate(folder)}>
                          <Copy size={14} /> Duplicar Flujo
                        </button>
                        <button className="btn-ghost" style={{ textAlign: 'left', padding: '0.5rem', border: 'none', cursor: 'pointer', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => handleExportJSON(folder, folderCommands)}>
                          <Download size={14} /> Exportar JSON
                        </button>
                        <hr style={{ borderColor: 'var(--card-border)', margin: '0.25rem 0' }} />
                        <button className="btn-ghost" style={{ textAlign: 'left', padding: '0.5rem', border: 'none', cursor: 'pointer', color: 'var(--danger)', borderRadius: '0.25rem' }} onClick={() => handleDelete(folder)}>
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div style={{ flex: 1, marginTop: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>{folder.name}</h3>
                  {folder.title && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{folder.title}</p>}

                  {/* Tags */}
                  {folder.tags && folder.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                      {folder.tags.map((t, idx) => (
                        <span key={idx} style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem', borderRadius: '0.4rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Command size={14} /> {folderCommands.length} comando(s)</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> {updateDate}</span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn btn-ghost" 
                      style={{ flex: 1, padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }} 
                      onClick={(e) => {
                        e.stopPropagation();
                        generateDashboardPDF(folder, folderCommands);
                      }} 
                      title="Descargar Ficha en PDF"
                    >
                      <FileText size={16} /> PDF
                    </button>
                    <button 
                      className="btn btn-primary" 
                      style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }} 
                      onClick={() => navigate(`/folder/${folderId}`)}
                    >
                      <FolderOpen size={16} /> Abrir carpeta
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Creación / Edición */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content glass" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700 }}>
              {editingFolder ? 'Editar Carpeta de Flujo' : 'Generar Nueva Carpeta'}
            </h2>
            <form onSubmit={handleCreateOrEdit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Nombre de la carpeta *
                  </label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={folderForm.name} 
                    onChange={e => setFolderForm({ ...folderForm, name: e.target.value })}
                    placeholder="Ej. Despliegue en Servidores Linux"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Categoría
                  </label>
                  <select 
                    className="input-field"
                    value={folderForm.category}
                    onChange={e => setFolderForm({ ...folderForm, category: e.target.value })}
                  >
                    {WORKFLOW_CATEGORIES.filter(c => c !== 'Todos').map(c => (
                      <option key={c} value={c} style={{ background: '#1e293b', color: 'white' }}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Etiquetas (separadas por coma)
                  </label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={folderForm.tags} 
                    onChange={e => setFolderForm({ ...folderForm, tags: e.target.value })}
                    placeholder="ej. docker, kubernetes, nginx, produccion"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary">
                  {editingFolder ? 'Guardar Cambios' : 'Crear Carpeta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
