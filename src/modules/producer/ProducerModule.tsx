import { Route, Routes } from 'react-router-dom';
import { ProjectsList } from './ProjectsList';
import { NewProject } from './NewProject';
import { ProjectWorkspace } from './ProjectWorkspace';

export default function ProducerModule() {
  return (
    <Routes>
      <Route index element={<ProjectsList />} />
      <Route path="nuevo" element={<NewProject />} />
      <Route path=":projectId" element={<ProjectWorkspace />} />
    </Routes>
  );
}
