import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { SoundToggle } from './components/common/SoundToggle';
import { initSoundDelegation } from './audio/soundDelegation';

const ProjectPage = lazy(() =>
  import('./pages/ProjectPage').then((m) => ({ default: m.ProjectPage }))
);
const PhotographyPage = lazy(() =>
  import('./pages/PhotographyPage').then((m) => ({ default: m.PhotographyPage }))
);
const ArtCraftPage = lazy(() =>
  import('./pages/ArtCraftPage').then((m) => ({ default: m.ArtCraftPage }))
);
const NotFoundPage = lazy(() =>
  import('./components/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

// Dev-only sound lab route (omitted in production)
const SoundLabPage = import.meta.env.DEV
  ? lazy(() => import('./pages/SoundLabPage').then((m) => ({ default: m.SoundLabPage })))
  : null;

export function App() {
  // Initialize delegated click & fine-pointer hover listeners for UI sound groups
  useEffect(() => {
    const cleanup = initSoundDelegation();
    return cleanup;
  }, []);

  return (
    <>
      {/* Floating glass sound on/off button at top-right (z-60) */}
      <SoundToggle />

      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-[#0B0C11]">
            <div className="w-8 h-8 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects/:slug" element={<ProjectPage />} />
          <Route path="/photography" element={<PhotographyPage />} />
          <Route path="/art-craft" element={<ArtCraftPage />} />
          {import.meta.env.DEV && SoundLabPage && (
            <Route path="/sound-lab" element={<SoundLabPage />} />
          )}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}
