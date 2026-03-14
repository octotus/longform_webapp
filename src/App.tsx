import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LibraryPage from './pages/LibraryPage';
import EditorPage from './pages/EditorPage';
import ReferencesPage from './pages/ReferencesPage';
import FocusPage from './pages/FocusPage';
import SettingsPage from './pages/SettingsPage';
import CorpusPage from './pages/CorpusPage';
import { useSettingsStore } from './stores/settingsStore';
import { saveBackupSlot } from './utils/backup';

export default function App() {
  const theme = useSettingsStore(s => s.theme);
  const autoBackupInterval = useSettingsStore(s => s.autoBackupInterval);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [theme]);

  useEffect(() => {
    if (!autoBackupInterval) return;
    const id = setInterval(saveBackupSlot, autoBackupInterval * 60 * 1000);
    return () => clearInterval(id);
  }, [autoBackupInterval]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LibraryPage />} />
        <Route path="/editor/:articleId" element={<EditorPage />} />
        <Route path="/references/:articleId" element={<ReferencesPage />} />
        <Route path="/focus/:articleId" element={<FocusPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/corpus" element={<CorpusPage />} />
      </Routes>
    </BrowserRouter>
  );
}
