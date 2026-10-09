import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { foldersApi, commandsApi, usersApi, tokenStorage } from '../services/api';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [folders, setFolders] = useState([]);
  const [commands, setCommands] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    // Only attempt loading if token exists
    const token = tokenStorage.get();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const [foldersData, commandsData] = await Promise.all([
        foldersApi.getAll().catch(err => {
          console.error('Error fetching folders:', err);
          return [];
        }),
        commandsApi.getAll().catch(err => {
          console.error('Error fetching commands:', err);
          return [];
        })
      ]);

      setFolders(foldersData || []);
      setCommands(commandsData || []);

      // Attempt to load users (may fail with 403 if not admin, which is handled gracefully)
      try {
        const usersData = await usersApi.getAll();
        setUsers(usersData || []);
      } catch (userErr) {
        // Non-admin users cannot list all users, normal behavior
      }
    } catch (err) {
      console.error('Data loading error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const handleLoginSuccess = () => loadData();
    window.addEventListener('cv:login_success', handleLoginSuccess);
    return () => window.removeEventListener('cv:login_success', handleLoginSuccess);
  }, [loadData]);

  const addFolder = async (folderData) => {
    const payload = typeof folderData === 'string' ? { name: folderData } : folderData;
    const newFolder = await foldersApi.create(payload);
    setFolders(prev => [newFolder, ...prev]);
    return newFolder.id || newFolder._id;
  };

  const updateFolder = async (id, folderData) => {
    const payload = typeof folderData === 'string' ? { name: folderData } : folderData;
    const updated = await foldersApi.update(id, payload);
    setFolders(prev => prev.map(f => (f.id === id || f._id === id) ? updated : f));
    return updated;
  };

  const deleteFolder = async (id) => {
    await foldersApi.delete(id);
    setFolders(prev => prev.filter(f => f.id !== id && f._id !== id));
    setCommands(prev => prev.filter(c => c.folderId !== id));
  };

  const duplicateFolder = async (id) => {
    const duplicated = await foldersApi.duplicate(id);
    setFolders(prev => [duplicated, ...prev]);
    // Refresh commands as well to get cloned commands
    const freshCmds = await commandsApi.getAll();
    setCommands(freshCmds || []);
    return duplicated;
  };

  const saveFolderContent = async (folderId, details) => {
    const { commands: newCommands, ...folderData } = details;

    // Update folder metadata
    const updatedFolder = await foldersApi.update(folderId, folderData);
    setFolders(prev => prev.map(f => (f.id === folderId || f._id === folderId) ? updatedFolder : f));

    // Update commands for this folder
    if (newCommands) {
      const savedCommands = await commandsApi.saveForFolder(folderId, newCommands);
      setCommands(prev => [
        ...prev.filter(c => c.folderId !== folderId),
        ...(savedCommands || [])
      ]);
    }
  };

  const recordCommandCopy = async (commandId) => {
    try {
      const updated = await commandsApi.recordCopy(commandId);
      if (updated) {
        setCommands(prev => prev.map(c => (c.id === commandId || c._id === commandId) ? updated : c));
      }
    } catch (err) {
      console.warn('Could not record copy count:', err);
    }
  };

  return (
    <DataContext.Provider value={{
      folders,
      setFolders,
      addFolder,
      updateFolder,
      deleteFolder,
      duplicateFolder,
      commands,
      setCommands,
      recordCommandCopy,
      users,
      setUsers,
      saveFolderContent,
      loading,
      error,
      refreshData: loadData
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
