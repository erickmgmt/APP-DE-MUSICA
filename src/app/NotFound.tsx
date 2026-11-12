import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="text-5xl font-bold text-gradient">404</p>
      <p className="mt-2 text-fog-300">Esta sección no existe (todavía).</p>
      <Link to="/" className="btn-primary mt-6">Volver al estudio</Link>
    </div>
  );
}
