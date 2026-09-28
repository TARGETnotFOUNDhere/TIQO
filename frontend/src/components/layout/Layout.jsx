import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './Header';
import AmbientScene from '../ui/AmbientScene';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

const Layout = () => {
  const location = useLocation();
  const reduced = usePrefersReducedMotion();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <AmbientScene />
      <div className="noise" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={reduced ? false : { opacity: 0, y: 10, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, filter: 'blur(6px)' }}
              transition={{ duration: 0.28 }}
              className="mx-auto w-full max-w-[1320px] px-4 py-6 md:px-8 md:py-8"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Layout;
