import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import {
  AudioWaveform,
  Bot,
  Disc3,
  Ear,
  GraduationCap,
  LayoutDashboard,
  Library,
  Lightbulb,
  Plug,
  Settings,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';

/**
 * REGISTRO DE MÓDULOS — punto único para añadir funcionalidades.
 *
 * Para añadir un módulo nuevo (ver CLAUDE.md › "Añadir un módulo"):
 *  1. Crea la carpeta src/modules/<id>/ con un componente por defecto (Page).
 *  2. Añade aquí una entrada con status 'activo' y su `load`.
 *  3. Si guarda datos nuevos, añade un store con una migración ADITIVA en core/db/database.ts.
 * Los módulos 'planeado' aparecen en el mapa de módulos (Sistema) pero no en la navegación,
 * para no mostrar botones que no hacen nada.
 */
export interface ModuleDef {
  id: string;
  title: string;
  short: string;
  description: string;
  icon: LucideIcon;
  path: string;
  routePattern?: string; // por defecto `${path}/*`
  nav: 'main' | 'more' | 'none';
  status: 'activo' | 'planeado';
  load?: LazyExoticComponent<ComponentType>;
}

export const MODULES: ModuleDef[] = [
  { id: 'dashboard', title: 'Estudio', short: 'Inicio', description: 'Resumen de tu progreso, proyectos y siguiente paso.', icon: LayoutDashboard, path: '/', routePattern: '/', nav: 'main', status: 'activo', load: lazy(() => import('./dashboard/DashboardPage')) },
  { id: 'academy', title: 'Academia', short: 'Academia', description: 'Ruta de aprendizaje progresiva con lecciones interactivas y evaluaciones.', icon: GraduationCap, path: '/academia', nav: 'main', status: 'activo', load: lazy(() => import('./academy/AcademyModule')) },
  { id: 'producer', title: 'Productor paso a paso', short: 'Proyectos', description: 'Crea canciones guiado por las 15 etapas de producción.', icon: Disc3, path: '/proyectos', nav: 'main', status: 'activo', load: lazy(() => import('./producer/ProducerModule')) },
  { id: 'tutor', title: 'Profesor', short: 'Profesor', description: 'Pregunta en lenguaje natural y recibe diagnóstico y pasos en REAPER.', icon: Bot, path: '/profesor', nav: 'main', status: 'activo', load: lazy(() => import('./tutor/TutorPage')) },
  { id: 'sounds', title: 'Biblioteca de sonidos', short: 'Sonidos', description: 'Catálogo inteligente de tipos de sonido con buscador por intención.', icon: Library, path: '/sonidos', nav: 'more', status: 'activo', load: lazy(() => import('./sounds/SoundsPage')) },
  { id: 'plugins', title: 'Plugins', short: 'Plugins', description: 'Registra tus plugins y recibe recomendaciones priorizadas.', icon: Plug, path: '/plugins', nav: 'more', status: 'activo', load: lazy(() => import('./plugins/PluginsPage')) },
  { id: 'ideas', title: 'Ideas y mejoras', short: 'Ideas', description: 'Registra, prioriza y convierte ideas en nuevas funciones.', icon: Lightbulb, path: '/ideas', nav: 'more', status: 'activo', load: lazy(() => import('./ideas/IdeasPage')) },
  { id: 'system', title: 'Sistema', short: 'Sistema', description: 'Copias de seguridad, historial, IA, registro de cambios y mapa de módulos.', icon: Settings, path: '/sistema', nav: 'more', status: 'activo', load: lazy(() => import('./system/SystemPage')) },
  // ---- Planeados (siguientes incrementos) ----
  { id: 'plugin-lab', title: 'Laboratorio de plugins', short: 'Laboratorio', description: 'Simulaciones de EQ, compresor, limitador, reverb, delay, saturación, filtros y sidechain con audio y gráficas.', icon: SlidersHorizontal, path: '/laboratorio', nav: 'none', status: 'planeado' },
  { id: 'mixmaster', title: 'Mezcla y mastering', short: 'Análisis', description: 'Medidores, analizador espectral, estéreo, LUFS, True Peak, A/B y análisis local de archivos.', icon: AudioWaveform, path: '/analisis', nav: 'none', status: 'planeado' },
  { id: 'ear', title: 'Entrenamiento auditivo', short: 'Oído', description: 'Ejercicios de frecuencias, compresión, reverb, estéreo y ritmo con puntuación.', icon: Ear, path: '/oido', nav: 'none', status: 'planeado' },
];

export const ACTIVE_MODULES = MODULES.filter((m) => m.status === 'activo');
