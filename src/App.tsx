import { FigmaProvider } from '@/context/Figma/FigmaProvider';
import { Home } from './pages';
import { Themes } from './recursica/RecursicaRecursicaThemes.css';
import { ThemeProvider } from '@/ui-kit';

function App() {
  return (
    <FigmaProvider>
      <ThemeProvider themeClassname={Themes.Default.Light}>
        <Home />
      </ThemeProvider>
    </FigmaProvider>
  );
}

export default App;
