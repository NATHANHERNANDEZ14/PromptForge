import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Search, FolderPlus, MoreVertical, FolderOpen, Clock, Command, Terminal, FileText } from 'lucide-react';

import { getPdfTemplate, getPdfConfig } from '../utils/pdfTemplate';

export default function Dashboard() {
  const { folders, commands, addFolder, updateFolder, deleteFolder } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [folderName, setFolderName] = useState('');
  const [menuOpen, setMenuOpen] = useState(null);
  
  const navigate = useNavigate();

  const handleCreateOrEdit = (e) => {
    e.preventDefault();
    if (editingFolder) {
      updateFolder(editingFolder.id, folderName);
    } else {
      addFolder(folderName);
    }
    closeModal();
  };

  const openCreateModal = () => {
    setEditingFolder(null);
    setFolderName('');
    setIsModalOpen(true);
  };

  const openEditModal = (folder) => {
    setEditingFolder(folder);
    setFolderName(folder.name);
    setIsModalOpen(true);
    setMenuOpen(null);
  };
  
  const handleDelete = (id) => {
    if(confirm('¿Estás seguro de eliminar esta carpeta?')) {
      deleteFolder(id);
    }
    setMenuOpen(null);
  };

  const generateDashboardPDF = async (folder, folderCommands) => {
    const html2pdf = (await import('html2pdf.js')).default;
    const htmlContent = getPdfTemplate(folder, folderCommands, folder.title, folder.videoLink, folder.globalDescription);
    const opt = getPdfConfig(`${folder.name.replace(/\s+/g, '_')}.pdf`);

    // Pasar el string HTML directamente. html2pdf maneja el renderizado internamente.
    await html2pdf().set(opt).from(htmlContent).save();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFolderName('');
    setEditingFolder(null);
  };

  const filteredFolders = folders.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (f.title && f.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', background: 'var(--primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>
          COMMAND VAULT
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Gestiona tus flujos de trabajo y comandos</p>
      </div>

      <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem' }}>
        <div className="search-bar-container" style={{ marginBottom: '1rem' }}>
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Buscar por títulos, flujos..." 
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
        
        <button className="btn btn-primary" onClick={openCreateModal}>
          <FolderPlus size={18} />
          Generar carpeta
        </button>
      </div>

      <div className="folder-grid">
        {filteredFolders.map(folder => {
          const folderCommands = commands.filter(c => c.folderId === folder.id);
          const updateDate = new Date(folder.updatedAt).toLocaleDateString();
          
          return (
            <div key={folder.id} className="folder-card glass">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <Terminal size={20} />
                </div>
                
                <div style={{ position: 'relative' }}>
                  <button className="btn-ghost" style={{ padding: '0.25rem', borderRadius: '50%', border: 'none', cursor: 'pointer' }} onClick={() => setMenuOpen(menuOpen === folder.id ? null : folder.id)}>
                    <MoreVertical size={18} />
                  </button>
                  
                  {menuOpen === folder.id && (
                    <div className="glass" style={{ position: 'absolute', right: 0, top: '100%', zIndex: 10, borderRadius: '0.5rem', padding: '0.5rem', minWidth: '120px', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <button className="btn-ghost" style={{ textAlign: 'left', padding: '0.5rem', border: 'none', cursor: 'pointer', borderRadius: '0.25rem' }} onClick={() => openEditModal(folder)}>Editar</button>
                      <button className="btn-ghost" style={{ textAlign: 'left', padding: '0.5rem', border: 'none', cursor: 'pointer', color: 'var(--danger)', borderRadius: '0.25rem' }} onClick={() => handleDelete(folder.id)}>Eliminar</button>
                    </div>
                  )}
                </div>
              </div>
              
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>{folder.name}</h3>
                {folder.title && <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{folder.title}</p>}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Command size={14} /> {folderCommands.length} cmd(s)</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> {updateDate}</span>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-ghost" style={{ flex: 1, padding: '0.5rem' }} onClick={(e) => {
                    e.stopPropagation();
                    generateDashboardPDF(folder, folderCommands);
                  }} title="Descargar PDF">
                    <FileText size={16} /> PDF
                  </button>
                  <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => navigate(`/folder/${folder.id}`)}>
                    <FolderOpen size={16} /> Abrir carpeta
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content glass" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>{editingFolder ? 'Editar carpeta' : 'Generar carpeta'}</h2>
            <form onSubmit={handleCreateOrEdit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Nombre de la carpeta</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={folderName} 
                  onChange={e => setFolderName(e.target.value)}
                  placeholder="Ej. Despliegue Backend"
                  required
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editingFolder ? 'Guardar cambios' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
