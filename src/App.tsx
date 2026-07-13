import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { GamePage } from './pages/GamePage';
import { DeveloperPage } from './pages/DeveloperPage';
import { SeriesPage } from './pages/SeriesPage';
import { MyListPage } from './pages/MyListPage';
import { RoulettePage } from './pages/RoulettePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ImportAdminPage } from './pages/ImportAdminPage';

function RedirectBootstrap() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const redirect = params.get('redirect');
    if (redirect) {
      params.delete('redirect');
      navigate(redirect, { replace: true });
    }
  }, [location.search, navigate]);

  return null;
}

export default function App() {
  return (
    <>
      <RedirectBootstrap />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/games" element={<CatalogPage />} />
          <Route path="/games/:slug" element={<GamePage />} />
          <Route path="/developers/:slug" element={<DeveloperPage />} />
          <Route path="/series/:slug" element={<SeriesPage />} />
          <Route path="/my-list" element={<MyListPage />} />
          <Route path="/roulette" element={<RoulettePage />} />
          <Route path="/admin/import" element={<ImportAdminPage />} />
          <Route path="/catalog" element={<Navigate to="/games" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </>
  );
}
