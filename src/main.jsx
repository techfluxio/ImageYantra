import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './routes.jsx';

/* ── Global Styles (import order matters) ─────────── */
import './styles/tokens.css';
import './styles/global.css';
import './styles/animations.css';
import './styles/components.css';
import './styles/responsive.css';
import './styles/tailwind.css';

export const createRoot = ViteReactSSG({ routes });
