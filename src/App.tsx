import { FigmaProvider } from '@/context/Figma/FigmaProvider';
import { Home } from './pages';
import { ThemeProvider } from '@/ui-kit';
import { useThemeDetector } from './hooks/useThemeDetector';

function App() {
  const isDarkTheme = useThemeDetector();
  return (
    <FigmaProvider>
      <ThemeProvider defaultColorScheme={isDarkTheme ? 'dark' : 'light'}>
        <Home />
      </ThemeProvider>
    </FigmaProvider>
  );
}

export default App;
