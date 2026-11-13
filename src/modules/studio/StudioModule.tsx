import { Route, Routes } from 'react-router-dom';
import StudioPage from './StudioPage';
import { StudioHome } from './StudioHome';

export default function StudioModule() {
  return (
    <Routes>
      <Route index element={<StudioHome />} />
      <Route path=":projectId" element={<StudioPage />} />
    </Routes>
  );
}
