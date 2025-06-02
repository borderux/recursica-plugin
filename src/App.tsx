import { FigmaProvider, RecursicaProvider } from '@/context';
import {
  SelectProject,
  SelectBranch,
  Home,
  Offline,
  RepositoryConnection,
  PublishFiles,
} from './pages';
import { MemoryRouter, Route, Routes } from 'react-router';
import { Themes } from './recursica/RecursicaRecursicaThemes.css';
import { ThemeProvider } from '@/ui-kit';
import { Layout } from '@/components';
import { RepositoryProvider } from './context/Repository/RepositoryProvider';

function App() {
  return (
    <ThemeProvider themeClassname={Themes.Default.Light}>
      <FigmaProvider>
        <RepositoryProvider>
          <RecursicaProvider>
            <MemoryRouter initialEntries={['/home']}>
              <Routes>
                <Route path='/' element={<Layout />}>
                  <Route path='home' element={<Home />} />
                  <Route path='offline' element={<Offline />} />
                  <Route path='recursica'>
                    <Route path='token' element={<RepositoryConnection />} />
                    <Route path='select-project' element={<SelectProject />} />
                    <Route path='select-branch' element={<SelectBranch />} />
                    <Route path='publish-files' element={<PublishFiles />} />
                    {/* <Route path='success' element={<RecursicaSuccess />} /> */}
                    {/* <Route path='error' element={<RecursicaError />} /> */}
                  </Route>
                </Route>
              </Routes>
            </MemoryRouter>
          </RecursicaProvider>
        </RepositoryProvider>
      </FigmaProvider>
    </ThemeProvider>
  );
}

export default App;
