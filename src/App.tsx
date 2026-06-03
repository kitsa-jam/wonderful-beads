import { AppLayout } from './components/layout/AppLayout';
import { CreatePage } from './pages/CreatePage';
import { HelpPage } from './pages/HelpPage';
import { HomePage } from './pages/HomePage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ResultPage } from './pages/ResultPage';
export default function App(){ const path=location.pathname; const Page=path==='/create'?CreatePage:path==='/result'?ResultPage:path==='/help'?HelpPage:path==='/privacy'?PrivacyPage:HomePage; return <AppLayout page={path}><Page/></AppLayout> }
