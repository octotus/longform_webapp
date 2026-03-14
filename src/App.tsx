import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LibraryPage from './pages/LibraryPage';
import EditorPage from './pages/EditorPage';
import ReferencesPage from './pages/ReferencesPage';
import FocusPage from './pages/FocusPage';
import SettingsPage from './pages/SettingsPage';
import CorpusPage from './pages/CorpusPage';

export default function App() {
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
