import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';
import './styles/index.css';
import { Layout } from './app/Layout';
import { ACTIVE_MODULES } from './modules/registry';
import { requestPersistentStorage } from './core/db/database';
import { NotFound } from './app/NotFound';

// Pide almacenamiento persistente para que el navegador no borre tus datos por falta de espacio.
void requestPersistentStorage();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          {ACTIVE_MODULES.map((m) => {
            const Page = m.load!;
            return <Route key={m.id} path={m.routePattern ?? `${m.path}/*`} element={<Page />} />;
          })}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  </StrictMode>,
);
