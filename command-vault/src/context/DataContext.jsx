import { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();
const API_URL = 'http://localhost:3000/api';

export function DataProvider({ children }) {
  const [folders, setFolders] = useState([]);
  const [commands, setCommands] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/folders`).then(res => res.json()).then(setFolders).catch(console.error);
    fetch(`${API_URL}/commands`).then(res => res.json()).then(setCommands).catch(console.error);
    fetch(`${API_URL}/users`).then(res => res.json()).then(data => {
      if(data.length === 0) {
        // Create initial admin if no users
        fetch(`${API_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Main Admin', username: 'admin', password: 'password', role: 'admin' })
        }).then(res => res.json()).then(newUser => setUsers([newUser]));
      } else {
        setUsers(data);
      }
    }).catch(console.error);
  }, []);

  const addFolder = async (name) => {
    const res = await fetch(`${API_URL}/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    const newFolder = await res.json();
    setFolders([...folders, newFolder]);
    return newFolder.id;
  };

  const updateFolder = async (id, name) => {
    const res = await fetch(`${API_URL}/folders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    const updated = await res.json();
    setFolders(folders.map(f => f.id === id ? updated : f));
  };

  const deleteFolder = async (id) => {
    await fetch(`${API_URL}/folders/${id}`, { method: 'DELETE' });
    setFolders(folders.filter(f => f.id !== id));
    setCommands(commands.filter(c => c.folderId !== id));
  };

  const saveFolderContent = async (folderId, details) => {
    // details: { title, videoLink, globalDescription, commands: [] }
    const { commands: newCommands, ...folderData } = details;
    
    // Update folder
    const resFolder = await fetch(`${API_URL}/folders/${folderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(folderData)
    });
    const updatedFolder = await resFolder.json();
    setFolders(folders.map(f => f.id === folderId ? updatedFolder : f));

    // Update commands
    if (newCommands) {
      const resCmds = await fetch(`${API_URL}/folders/${folderId}/commands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commands: newCommands })
      });
      const savedCommands = await resCmds.json();
      setCommands([...commands.filter(c => c.folderId !== folderId), ...savedCommands]);
    }
  };

  return (
    <DataContext.Provider value={{
      folders, addFolder, updateFolder, deleteFolder,
      commands, setCommands,
      users, setUsers,
      saveFolderContent,
      API_URL
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
