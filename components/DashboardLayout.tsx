'use client';

// Shell layout for all authenticated pages — sidebar + animated content area
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';

type Props = {
  user: { email?: string };
  children: React.ReactNode;
};

// Shared page transition — content slides up and fades in
const pageVariants = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
};

export default function DashboardLayout({ user, children }: Props) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar user={user} />

      {/* Main content — offset by sidebar width */}
      <div className="flex-1 ml-[220px] min-w-0">
        <motion.main
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          className="min-h-screen"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
