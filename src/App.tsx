import { useEffect, useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { CreatePage } from './pages/CreatePage';
import { HelpPage } from './pages/HelpPage';
import { HomePage } from './pages/HomePage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ResultPage } from './pages/ResultPage';

function getHashPath() {
  const path = location.hash.replace(/^#/, '');
  return path.startsWith('/') ? path : '/';
}

export default function App() {
  const [path, setPath] = useState(getHashPath);
  const Page = path === '/create' ? CreatePage : path === '/result' ? ResultPage : path === '/help' ? HelpPage : path === '/privacy' ? PrivacyPage : HomePage;

  useEffect(() => {
    const updatePath = () => setPath(getHashPath());
    addEventListener('hashchange', updatePath);
    return () => removeEventListener('hashchange', updatePath);
  }, []);

  return <AppLayout page={path}><Page /></AppLayout>;
}
