import { FigmaProvider } from '@/context';
import {
  SelectProject,
  Home,
  RepositoryConnection,
  PublishFiles,
  SelectSources,
  FetchSources,
  RunAdapter,
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
          <MemoryRouter initialEntries={['/home']}>
            <Routes>
              <Route path='/' element={<Layout />}>
                <Route path='home' element={<Home />} />
                <Route path='figma'>
                  <Route path='select-sources' element={<SelectSources />} />
                  <Route path='fetch-data' element={<FetchSources />} />
                </Route>
                <Route path='recursica'>
                  <Route path='token' element={<RepositoryConnection />} />
                  <Route path='select-project' element={<SelectProject />} />
                  <Route path='run-adapter' element={<RunAdapter />} />
                  <Route path='publish-files' element={<PublishFiles />} />
                  {/* <Route path='success' element={<RecursicaSuccess />} /> */}
                  {/* <Route path='error' element={<RecursicaError />} /> */}
                </Route>
              </Route>
            </Routes>
          </MemoryRouter>
        </RepositoryProvider>
      </FigmaProvider>
    </ThemeProvider>
  );
}

export default App;
