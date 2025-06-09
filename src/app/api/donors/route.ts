import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { DonorRecord } from '@/utils/loadExcelData';

const columnMappings = {
  vanId: ['VANID'],
  fiscalYears: {
    FY25: ['FY25'],
    FY24: ['FY24'],
    FY23: ['FY23'],
    FY22: ['FY22'],
    FY21: ['FY21'],
    FY20: ['FY20']
  },
  flags: {
    isMidRange: ['MidRange_1 0004999_(Public)'],
    isMajorDonorProspect: ['Major_Donor_Prospect_(Public)']
  }
};

function findMatchingColumn(availableColumns: string[], possibleNames: string[]): string | null {
  const normalizedAvailable = availableColumns.map(col => col.toLowerCase().trim());
  const normalizedPossible = possibleNames.map(name => name.toLowerCase().trim());
  
  for (const possible of normalizedPossible) {
    const index = normalizedAvailable.findIndex(col => col === possible);
    if (index !== -1) {
      return availableColumns[index];
    }
  }
  return null;
}

export async function GET() {
  try {
    const fileNames = ['FY20.xlsx', 'FY21.xlsx', 'FY22.xlsx', 'FY23.xlsx'];
    const donorMap = new Map<string, DonorRecord>();

    for (const fileName of fileNames) {
      try {
        console.log(`Loading file: ${fileName}`);
        const filePath = path.join(process.cwd(), 'public', fileName);
        
        if (!fs.existsSync(filePath)) {
          console.error(`File not found: ${filePath}`);
          continue;
        }

        const fileBuffer = fs.readFileSync(filePath);
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          console.error(`${fileName} contains no sheets`);
          continue;
        }

        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json<Record<string, string | number | null>>(worksheet);
        
        if (rawData.length === 0) {
          console.warn(`Warning: ${fileName} is empty`);
          continue;
        }

        // Get all available columns from the first row
        const availableColumns = Object.keys(rawData[0]);
        console.log(`Available columns in ${fileName}:`, availableColumns);

        // Find matching columns
        const columnMap = {
          vanId: findMatchingColumn(availableColumns, columnMappings.vanId),
          fiscalYears: {
            FY25: findMatchingColumn(availableColumns, columnMappings.fiscalYears.FY25),
            FY24: findMatchingColumn(availableColumns, columnMappings.fiscalYears.FY24),
            FY23: findMatchingColumn(availableColumns, columnMappings.fiscalYears.FY23),
            FY22: findMatchingColumn(availableColumns, columnMappings.fiscalYears.FY22),
            FY21: findMatchingColumn(availableColumns, columnMappings.fiscalYears.FY21),
            FY20: findMatchingColumn(availableColumns, columnMappings.fiscalYears.FY20)
          },
          flags: {
            isMidRange: findMatchingColumn(availableColumns, columnMappings.flags.isMidRange) !== null,
            isMajorDonorProspect: findMatchingColumn(availableColumns, columnMappings.flags.isMajorDonorProspect) !== null
          }
        };

        // Check for required columns
        if (!columnMap.vanId) {
          throw new Error(`Missing required column VANID in ${fileName}`);
        }

        // Process each row
        rawData.forEach(row => {
          const vanIdCol = columnMap.vanId;
          if (!vanIdCol) {
            throw new Error(`Missing VANID column in ${fileName}`);
          }

          const vanId = String(row[vanIdCol] || '');
          if (!vanId) return; // Skip rows without VANID

          const newRecord: DonorRecord = {
            vanId,
            fiscalYears: {
              FY25: columnMap.fiscalYears.FY25 ? Number(row[columnMap.fiscalYears.FY25]) || null : null,
              FY24: columnMap.fiscalYears.FY24 ? Number(row[columnMap.fiscalYears.FY24]) || null : null,
              FY23: columnMap.fiscalYears.FY23 ? Number(row[columnMap.fiscalYears.FY23]) || null : null,
              FY22: columnMap.fiscalYears.FY22 ? Number(row[columnMap.fiscalYears.FY22]) || null : null,
              FY21: columnMap.fiscalYears.FY21 ? Number(row[columnMap.fiscalYears.FY21]) || null : null,
              FY20: columnMap.fiscalYears.FY20 ? Number(row[columnMap.fiscalYears.FY20]) || null : null
            },
            flags: {
              isMidRange: columnMap.flags.isMidRange,
              isMajorDonorProspect: columnMap.flags.isMajorDonorProspect
            }
          };

          // If we already have a record for this VANID, merge the data
          const existingRecord = donorMap.get(vanId);
          if (existingRecord) {
            // Merge fiscal years, keeping non-null values
            Object.keys(newRecord.fiscalYears).forEach(year => {
              const key = year as keyof typeof newRecord.fiscalYears;
              if (newRecord.fiscalYears[key] !== null) {
                existingRecord.fiscalYears[key] = newRecord.fiscalYears[key];
              }
            });
            // Merge flags, using OR operation
            existingRecord.flags.isMidRange = existingRecord.flags.isMidRange || newRecord.flags.isMidRange;
            existingRecord.flags.isMajorDonorProspect = existingRecord.flags.isMajorDonorProspect || newRecord.flags.isMajorDonorProspect;
          } else {
            donorMap.set(vanId, newRecord);
          }
        });

        console.log(`Successfully processed ${rawData.length} records from ${fileName}`);
      } catch (error) {
        console.error(`Error processing ${fileName}:`, error);
        continue; // Continue with next file even if one fails
      }
    }

    const allData = Array.from(donorMap.values());
    if (allData.length === 0) {
      throw new Error('No data found in Excel files');
    }

    return NextResponse.json(allData);
  } catch (error) {
    console.error('Error loading donor data:', error);
    return NextResponse.json(
      { error: 'Failed to load donor data' },
      { status: 500 }
    );
  }
} 