'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export function AppTransitions({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const key = pathname || '';
  const isFirst = lastPathRef.current === null;
  lastPathRef.current = key;

  return (
    <motion.div
      key={key}
      initial={mounted && !isFirst ? { opacity: 0, y: 6 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}


