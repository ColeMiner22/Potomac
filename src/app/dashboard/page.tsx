'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DonorAnalytics } from '@/components/DonorAnalytics';
import { DonorTable } from '@/components/DonorTable';
import { DonorRecord, loadExcelData } from '@/utils/loadExcelData';
import { Card, Title, Text } from '@tremor/react';

export default function DashboardPage() {
  const [data, setData] = useState<DonorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const loadedData = await loadExcelData();
        setData(loadedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Data</h2>
          <p>{error}</p>
          <p className="mt-4">Please make sure the Excel file is in the correct format and location.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-8 text-center">Donor Analytics Dashboard</h1>
        
        <div className="space-y-8">
          <DonorAnalytics data={data} />
          <DonorTable data={data} />
        </div>
      </motion.div>
    </main>
  );
} 