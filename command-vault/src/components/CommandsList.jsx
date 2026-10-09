import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Search, Terminal, FolderOpen, Copy, Check, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { showToast } from '../utils/alerts';

export default function CommandsList() {
  const { commands, folders, recordCommandCopy } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState('ALL');
  const [expandedCmds, setExpandedCmds] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  const navigate = useNavigate();

  const getFolder = (folderId) => {
    return folders.find(f => f.id === folderId || f._id === folderId);
  };

  const copyToClipboard = (cmd) => {
    if (!cmd.executable) return;
    navigator.clipboard.writeText(cmd.executable);
    const cmdId = cmd.id || cmd._id;
    setCopiedId(cmdId);
    setTimeout(() => setCopiedId(null), 1800);
    showToast('¡Comando copiado al portapapeles!');
    if (cmdId) {
      recordCommandCopy(cmdId);
    }
  };

  const toggleExpand = (id) => {
    setExpandedCmds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredCommands = commands.filter(c => {
    const matchesSearch = 
      (c.executable && c.executable.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (c.purpose && c.purpose.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFolder = 
      selectedFolderId === 'ALL' || 
      c.folderId === selectedFolderId;

    return matchesSearch && matchesFolder;
  });

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Directorio Global de Comandos</h1>
        <p style={{ color: 'var(--text-muted)' }}>Busca, filtra y copia rápidamente cualquier comando documentado en tus flujos</p>
      </div>

      <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input type="text" className="input-field" placeholder="Buscar por comando, palabras clave, explicación..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
          </div>

          <div>
            <select className="input-field" value={selectedFolderId} onChange={(e) => setSelectedFolderId(e.target.value)}>
              <option value="ALL" style={{ background: '#1e293b' }}>Todas las carpetas ({commands.length})</option>
              {folders.map(f => {
                const fId = f.id || f._id;
                const count = commands.filter(c => c.folderId === fId).length;
                return (
                  <option key={fId} value={fId} style={{ background: '#1e293b' }}>
                    {f.name} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', paddingTop: '0.5rem', borderTop: '1px solid var(--card-border)' }}>
          <span>Mostrando <strong>{filteredCommands.length}</strong> de {commands.length} comando(s)</span>
          {searchTerm && (
            <button className="btn-ghost" style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem' }} onClick={() => setSearchTerm('')}>
              Limpiar búsqueda
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredCommands.length === 0 ? (
          <div className="glass" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '1rem' }}>
            <Terminal size={42} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p>No se encontraron comandos que coincidan con la búsqueda.</p>
          </div>
        ) : (
          filteredCommands.map(cmd => {
            const cmdId = cmd.id || cmd._id;
            const folderObj = getFolder(cmd.folderId);
            const isLong = cmd.purpose && cmd.purpose.length > 100;
            const isExpanded = expandedCmds[cmdId];
            const isCopied = copiedId === cmdId;

            return (
              <div key={cmdId} className="glass" style={{ padding: '1.25rem 1.5rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button className="btn-ghost" onClick={() => folderObj && navigate(`/folder/${folderObj.id || folderObj._id}`)}
                      style={{display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.8rem', color: 'var(--primary)', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', cursor: folderObj ? 'pointer' : 'default'}} title="Ir al flujo completo">
                      <FolderOpen size={14} />
                      <span>{folderObj ? folderObj.name : 'Carpeta del flujo'}</span>
                      {folderObj && <ExternalLink size={12} />}
                    </button>

                    {cmd.copyCount > 0 && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Copiado {cmd.copyCount} vez{cmd.copyCount !== 1 ? 'ces' : ''}
                      </span>
                    )}
                  </div>

                  <button className="btn btn-ghost" style={{ padding: '0.4rem 0.8rem', borderRadius: '0.5rem', border: '1px solid var(--card-border)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: isCopied ? 'var(--success)' : 'var(--text-main)', fontSize: '0.85rem' }} onClick={() => copyToClipboard(cmd)}>
                    {isCopied ? <Check size={16} /> : <Copy size={16} />}
                    {isCopied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.85rem' }}>
                      <Terminal size={15} />
                      <span>Comando</span>
                    </div>
                    <pre className="input-field code-font" style={{ background: 'rgba(0,0,0,0.25)', whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0, fontSize: '0.88rem' }}>
                      {cmd.executable}
                    </pre>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.85rem' }}>
                      Descripción
                    </div>
                    <div style={{color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: 1.5, whiteSpace: 'pre-wrap', overflow: 'hidden', display: isExpanded ? 'block' : '-webkit-box', WebkitLineClamp: isExpanded ? 'unset' : 3, WebkitBoxOrient: 'vertical'}}>
                      {cmd.purpose || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin descripción registrada</span>}
                    </div>
                    {isLong && (
                      <button className="btn btn-ghost" style={{ alignSelf: 'flex-start', marginTop: '0.5rem', padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}  onClick={() => toggleExpand(cmdId)}>
                        {isExpanded ? <><ChevronUp size={14}/> Menos</> : <><ChevronDown size={14}/> Más detalle</>}
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
