import { useState } from 'react';
import { useData } from '../context/DataContext';
import { Search, Terminal, FolderOpen, Copy, ChevronDown, ChevronUp } from 'lucide-react';

export default function CommandsList() {
  const { commands, folders } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCmds, setExpandedCmds] = useState({});

  const filteredCommands = commands.filter(c => 
    (c.executable && c.executable.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (c.purpose && c.purpose.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getFolderName = (folderId) => {
    const f = folders.find(f => f.id === folderId);
    return f ? f.name : 'Desconocido';
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Could use SweetAlert here too later
  };

  const toggleExpand = (id) => {
    setExpandedCmds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Directorio de Comandos</h1>
        <p style={{ color: 'var(--text-muted)' }}>Busca y visualiza todos los comandos registrados en tus flujos</p>
      </div>

      <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem' }}>
        <div className="search-bar-container" style={{ margin: 0 }}>
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Buscar por comando, descripción..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredCommands.length === 0 ? (
          <div className="glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '1rem' }}>
            No se encontraron comandos
          </div>
        ) : (
          filteredCommands.map(cmd => {
            const isLong = cmd.purpose && cmd.purpose.length > 100;
            const isExpanded = expandedCmds[cmd.id];

            return (
              <div key={cmd.id} className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    <FolderOpen size={16} />
                    <span>Carpeta: {getFolderName(cmd.folderId)}</span>
                  </div>
                  <button className="btn-ghost" style={{ padding: '0.5rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer' }} onClick={() => copyToClipboard(cmd.executable)}>
                    <Copy size={16} />
                  </button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 600 }}>
                      <Terminal size={16} />
                      <span>Comando</span>
                    </div>
                    <pre className="input-field code-font" style={{ background: 'rgba(0,0,0,0.2)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                      {cmd.executable}
                    </pre>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                      Descripción
                    </div>
                    <div style={{ 
                      color: 'var(--text-main)', 
                      fontSize: '0.9rem', 
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                      overflow: 'hidden',
                      display: isExpanded ? 'block' : '-webkit-box',
                      WebkitLineClamp: isExpanded ? 'unset' : 3,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {cmd.purpose || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin descripción</span>}
                    </div>
                    {isLong && (
                      <button 
                        className="btn btn-primary" 
                        style={{ alignSelf: 'flex-start', marginTop: '0.75rem', padding: '0.35rem 0.8rem', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.35rem', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }} 
                        onClick={() => toggleExpand(cmd.id)}
                      >
                        {isExpanded ? <><ChevronUp size={14}/> Ver menos</> : <><ChevronDown size={14}/> Ver más</>}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
