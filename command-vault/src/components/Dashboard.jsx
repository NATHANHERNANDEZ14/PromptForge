import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Search, FolderPlus, MoreVertical, FolderOpen, Clock, Command, Terminal, FileText, Copy, Download, Upload, Loader2} from 'lucide-react';

import { getPdfTemplate, getPdfConfig } from '../utils/pdfTemplate';
import { confirmDialog, showToast, showError, showSuccess } from '../utils/alerts';

// Estilos
import DashboardStyles from '../styles/dashboardStyles';

const S = DashboardStyles;

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
  const {folders, commands, addFolder, updateFolder, deleteFolder, duplicateFolder, saveFolderContent, loading } = useData();

  const [searchTerm,       setSearchTerm]       = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isModalOpen,      setIsModalOpen]      = useState(false);
  const [editingFolder,    setEditingFolder]    = useState(null);
  const [folderForm,       setFolderForm]       = useState({ name: '', category: 'General', tags: '' });
  const [menuOpen,         setMenuOpen]         = useState(null);
  const [isProcessing,     setIsProcessing]     = useState(false);

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

  const openCreateModal = () => {setEditingFolder(null);
    setFolderForm({ name: '', category: 'General', tags: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (folder) => {setEditingFolder(folder);
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
      <div style={S.heroSection}>
        <h1 style={S.heroTitle}>
          COMMAND VAULT
        </h1>
        <p style={S.heroSubtitle}>Gestiona y documenta tus flujos de trabajo, comandos y equipos</p>
      </div>

      {/* Main Bar with Search, Stats & Actions */}
      <div className="glass" style={S.mainBar}>
        <div className="search-bar-container" style={S.searchBarContainer}>
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
            <div style={S.statsContainer}>
              <FolderOpen size={16} className="text-primary" />
              <span>{folders.length} Carpetas</span>
            </div>
            <div style={S.statsContainer}>
              <Command size={16} className="text-accent" />
              <span>{commands.length} Comandos</span>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div style={S.categoryBar}>
          <span style={S.categoryLabel}>Categoría:</span>
          {WORKFLOW_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? 'btn btn-primary' : 'btn btn-ghost'}
              style={S.categoryButton(selectedCategory === cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={S.actionsBar}>
          <div style={S.leftActions}>
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
              style={S.importButton}
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
        <div className="glass" style={S.loadingCard}>
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem', color: 'var(--primary)' }} />
          <p>Cargando flujos de trabajo...</p>
        </div>
      ) : filteredFolders.length === 0 ? (
        <div className="glass" style={S.emptyCard}>
          <FolderOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3 style={S.emptyTitle}>No se encontraron carpetas</h3>
          <p style={S.emptyText}>
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
                <div style={S.folderCardHeader}>
                  <div style={S.folderCardLeft}>
                    <div style={S.folderIconBox}>
                      <Terminal size={22} />
                    </div>
                    {folder.category && (
                      <span style={S.categoryBadge}>
                        {folder.category}
                      </span>
                    )}
                  </div>
                  
                  <div style={S.menuWrapper}>
                    <button 
                      className="btn-ghost" 
                      style={S.menuTrigger}
                      onClick={() => setMenuOpen(menuOpen === folderId ? null : folderId)}
                    >
                      <MoreVertical size={18} />
                    </button>
                    
                    {menuOpen === folderId && (
                      <div className="glass" style={S.contextMenu}>
                        <button className="btn-ghost" style={S.menuItem} onClick={() => openEditModal(folder)}>
                          Editar
                        </button>
                        <button className="btn-ghost" style={S.menuItem} onClick={() => handleDuplicate(folder)}>
                          <Copy size={14} /> Duplicar Flujo
                        </button>
                        <button className="btn-ghost" style={S.menuItem} onClick={() => handleExportJSON(folder, folderCommands)}>
                          <Download size={14} /> Exportar JSON
                        </button>
                        <hr style={S.menuDivider} />
                        <button className="btn-ghost" style={S.menuItemDanger} onClick={() => handleDelete(folder)}>
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div style={S.folderCardBody}>
                  <h3 style={S.folderName}>{folder.name}</h3>
                  {folder.title && <p style={S.folderTitle}>{folder.title}</p>}

                  {/* Tags */}
                  {folder.tags && folder.tags.length > 0 && (
                    <div style={S.tagsRow}>
                      {folder.tags.map((t, idx) => (
                        <span key={idx} style={S.tagChip}>
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div style={S.folderCardFooter}>
                  <div style={S.folderMetaRow}>
                    <span style={S.metaItem}><Command size={14} /> {folderCommands.length} comando(s)</span>
                    <span style={S.metaItem}><Clock size={14} /> {updateDate}</span>
                  </div>
                  
                  <div style={S.folderButtonsRow}>
                    <button 
                      className="btn btn-ghost" 
                      style={S.pdfButton}
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
                      style={S.openButton}
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
            <h2 style={S.modalTitle}>
              {editingFolder ? 'Editar Carpeta de Flujo' : 'Generar Nueva Carpeta'}
            </h2>
            <form onSubmit={handleCreateOrEdit}>
              <div style={S.modalFormBody}>
                <div>
                  <label style={S.fieldLabel}>
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
                  <label style={S.fieldLabel}>
                    Categoría
                  </label>
                  <select 
                    className="input-field"
                    value={folderForm.category}
                    onChange={e => setFolderForm({ ...folderForm, category: e.target.value })}
                  >
                    {WORKFLOW_CATEGORIES.filter(c => c !== 'Todos').map(c => (
                      <option key={c} value={c} style={S.selectOption}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={S.fieldLabel}>
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

              <div style={S.modalFooter}>
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
