'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Title, Text } from '@tremor/react';
import { DonorRecord } from '@/utils/loadExcelData';
import * as XLSX from 'xlsx';

interface FileUploadProps {
  onDataLoaded: (data: DonorRecord[]) => void;
}

interface UploadedFile {
  name: string;
  data: DonorRecord[];
  error?: string;
}

interface RawExcelRow {
  VANID: string;
  Name: string;
  FY25: number | null;
  FY24: number | null;
  FY23: number | null;
  FY22: number | null;
  FY21: number | null;
  FY20: number | null;
  'MRC Ever': number;
  'MRC Ever Date': string;
  'MRC Source Code': string;
  'Major Donor'?: boolean;
  'Mid-Range'?: boolean;
  'Planned Giving'?: boolean;
  'Anonymous'?: boolean;
  'Email Only'?: boolean;
  'Easement Donor'?: boolean;
  'One Solicit Per Year'?: boolean;
  'One Solicit Spring'?: boolean;
  'Friend of PPS'?: boolean;
  'Major Donor Prospect'?: boolean;
}

export function FileUpload({ onDataLoaded }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const processExcelFile = async (file: File): Promise<UploadedFile> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json<RawExcelRow>(worksheet);

      if (rawData.length === 0) {
        throw new Error('The Excel file is empty');
      }

      // Get all column names from the first row
      const firstRow = rawData[0];
      const availableColumns = Object.keys(firstRow);

      // Define required columns and their display names
      const requiredColumns = {
        'VANID': 'VANID',
        'Name': 'Name',
        'FY25': 'FY25',
        'FY24': 'FY24',
        'FY23': 'FY23',
        'FY22': 'FY22',
        'FY21': 'FY21',
        'FY20': 'FY20',
        'MRC Ever': 'MRC Ever',
        'MRC Ever Date': 'MRC Ever Date',
        'MRC Source Code': 'MRC Source Code'
      };

      // Check for missing required columns
      const missingColumns = Object.entries(requiredColumns)
        .filter(([key]) => !availableColumns.includes(key))
        .map(([_, displayName]) => displayName);

      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
      }

      // Transform data with null checks
      const processedData: DonorRecord[] = rawData.map(row => ({
        vanId: row.VANID || '',
        name: row.Name || '',
        fiscalYears: {
          FY25: row.FY25 ?? null,
          FY24: row.FY24 ?? null,
          FY23: row.FY23 ?? null,
          FY22: row.FY22 ?? null,
          FY21: row.FY21 ?? null,
          FY20: row.FY20 ?? null
        },
        mrcEver: row['MRC Ever'] ?? 0,
        mrcDate: row['MRC Ever Date'] || '',
        mrcSourceCode: row['MRC Source Code'] || '',
        flags: {
          isMajorDonor: row['Major Donor'] ?? false,
          isMidRange: row['Mid-Range'] ?? false,
          isPlannedGiving: row['Planned Giving'] ?? false,
          isAnonymous: row['Anonymous'] ?? false,
          isEmailOnly: row['Email Only'] ?? false,
          isEasementDonor: row['Easement Donor'] ?? false,
          isOneSolicitPerYear: row['One Solicit Per Year'] ?? false,
          isOneSolicitSpring: row['One Solicit Spring'] ?? false,
          isFriendOfPPS: row['Friend of PPS'] ?? false,
          isMajorDonorProspect: row['Major Donor Prospect'] ?? false
        }
      }));

      return {
        name: file.name,
        data: processedData
      };
    } catch (error) {
      return {
        name: file.name,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to process file'
      };
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const newFiles = await Promise.all(
      acceptedFiles.map(file => processExcelFile(file))
    );

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Combine all valid data
    const allData = newFiles
      .filter(file => !file.error)
      .flatMap(file => file.data);

    if (allData.length > 0) {
      onDataLoaded(allData);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    }
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((file, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <Card>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
          }`}
        >
          <input {...getInputProps()} />
          <Title>Upload Donor Data</Title>
          <Text className="mt-2">
            {isDragActive
              ? 'Drop the Excel files here...'
              : 'Drag and drop Excel files here, or click to select files'}
          </Text>
        </div>
      </Card>

      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <Card>
            <Title>Uploaded Files</Title>
            <div className="mt-4 space-y-4">
              {uploadedFiles.map((file, index) => (
                <motion.div
                  key={file.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <Text className="font-medium">{file.name}</Text>
                    {file.error ? (
                      <Text className="text-red-500 mt-1">{file.error}</Text>
                    ) : (
                      <Text className="text-green-500 mt-1">
                        Successfully loaded {file.data.length} records
                      </Text>
                    )}
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </motion.div>
              ))}
            </div>
          </Card>
        )}
      </AnimatePresence>
    </div>
  );
} 