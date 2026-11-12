import { Route, Routes } from 'react-router-dom';
import { AcademyHome } from './AcademyHome';
import { LessonPage } from './LessonPage';

export default function AcademyModule() {
  return (
    <Routes>
      <Route index element={<AcademyHome />} />
      <Route path=":lessonId" element={<LessonPage />} />
    </Routes>
  );
}
