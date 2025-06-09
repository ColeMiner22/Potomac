'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileUpload } from '@/components/FileUpload';
import { DonorRecord } from '@/utils/loadExcelData';
import { Card, Title, Text } from '@tremor/react';

export default function UploadPage() {
  const handleDataLoaded = (newData: DonorRecord[]) => {
    // Handle the data if needed
    console.log('Data loaded:', newData.length, 'records');
  };

  return (
    <main className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-8 text-center">Upload Donor Data</h1>
        
        <Card>
          <Title>Upload Excel Files</Title>
          <Text className="mt-2">
            Upload your Excel files containing donor data. The files should have the following columns:
          </Text>
          <ul className="list-disc list-inside mt-4 text-sm text-gray-600">
            <li>VANID (unique donor identifier)</li>
            <li>Name (donor name)</li>
            <li>FY25 through FY20 (fiscal year donation amounts)</li>
            <li>MRC Ever (Most Recent Contribution amount)</li>
            <li>MRC Ever Date (date of most recent contribution)</li>
            <li>MRC Source Code (source of the contribution)</li>
            <li>Optional flag columns (Major Donor, Mid-Range, etc.)</li>
          </ul>
        </Card>

        <div className="mt-8">
          <FileUpload onDataLoaded={handleDataLoaded} />
        </div>
      </motion.div>
    </main>
  );
} 