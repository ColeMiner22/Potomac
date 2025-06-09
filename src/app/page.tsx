'use client';

import { motion } from 'framer-motion';
import DonorDashboard from '@/components/DonorDashboard';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-8">Donor Analytics Dashboard</h1>
        <DonorDashboard />
      </motion.div>
    </main>
  );
}
