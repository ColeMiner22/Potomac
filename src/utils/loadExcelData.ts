import * as XLSX from 'xlsx';

export interface DonorRecord {
  vanId: string;
  fiscalYears: {
    FY25: number | null;
    FY24: number | null;
    FY23: number | null;
    FY22: number | null;
    FY21: number | null;
    FY20: number | null;
  };
  flags: {
    isMidRange: boolean;
    isMajorDonorProspect: boolean;
  };
}

export interface DonorTrend {
  vanId: string;
  trend: 'increasing' | 'decreasing' | 'stopped' | 'new';
  year: string;
  previousAmount: number | null;
  currentAmount: number | null;
  previousTier: string;
  currentTier: string;
}

// Define possible column name variations
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

// Helper function to find matching column name
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

export async function loadExcelData(): Promise<DonorRecord[]> {
  try {
    // Load data from each fiscal year file
    const fileNames = ['FY20.xlsx', 'FY21.xlsx', 'FY22.xlsx', 'FY23.xlsx'];
    const allData = await loadMultipleExcelFiles(fileNames);
    
    if (!allData || allData.length === 0) {
      throw new Error('No data found in Excel files');
    }

    return allData;
  } catch (error) {
    console.error('Error loading Excel data:', error);
    throw new Error('Failed to load Excel data. Please make sure all Excel files (FY20.xlsx, FY21.xlsx, FY22.xlsx, FY23.xlsx) are in the public directory.');
  }
}

export function getGivingTier(amount: number | null): string {
  if (!amount) return 'No Gift';
  if (amount >= 5000) return '$5K+';
  if (amount >= 1000) return '$1K-$4.9K';
  if (amount >= 500) return '$500-$999';
  return '<$500';
}

export function analyzeDonorTrends(data: DonorRecord[]): {
  increasing: DonorTrend[];
  decreasing: DonorTrend[];
  stopped: DonorTrend[];
  new: DonorTrend[];
} {
  const trends = {
    increasing: [] as DonorTrend[],
    decreasing: [] as DonorTrend[],
    stopped: [] as DonorTrend[],
    new: [] as DonorTrend[]
  };

  const years = ['FY25', 'FY24', 'FY23', 'FY22', 'FY21', 'FY20'] as const;

  data.forEach(donor => {
    // Check for trends between consecutive years
    for (let i = 0; i < years.length - 1; i++) {
      const currentYear = years[i];
      const previousYear = years[i + 1];
      const currentAmount = donor.fiscalYears[currentYear] || 0;
      const previousAmount = donor.fiscalYears[previousYear] || 0;

      // Skip if both years have no donations
      if (currentAmount === 0 && previousAmount === 0) continue;

      const currentTier = getGivingTier(currentAmount);
      const previousTier = getGivingTier(previousAmount);

      // Check for increasing donors (comparing current to previous year)
      if (currentAmount > previousAmount && previousAmount > 0) {
        trends.increasing.push({
          vanId: donor.vanId,
          trend: 'increasing',
          year: currentYear,
          previousAmount,
          currentAmount,
          previousTier,
          currentTier
        });
      }

      // Check for decreasing donors (comparing current to previous year)
      if (currentAmount < previousAmount && currentAmount > 0) {
        trends.decreasing.push({
          vanId: donor.vanId,
          trend: 'decreasing',
          year: currentYear,
          previousAmount,
          currentAmount,
          previousTier,
          currentTier
        });
      }

      // Check for stopped giving (had donations in previous year but none in current year)
      if (previousAmount > 0 && currentAmount === 0) {
        trends.stopped.push({
          vanId: donor.vanId,
          trend: 'stopped',
          year: currentYear,
          previousAmount,
          currentAmount,
          previousTier,
          currentTier
        });
      }

      // Check for new donors (no donations in previous year but has donations in current year)
      if (previousAmount === 0 && currentAmount > 0) {
        trends.new.push({
          vanId: donor.vanId,
          trend: 'new',
          year: currentYear,
          previousAmount,
          currentAmount,
          previousTier,
          currentTier
        });
      }
    }
  });

  return trends;
}

export function getTierChanges(trends: DonorTrend[]): Map<string, { from: string; to: string; count: number }> {
  const tierChanges = new Map<string, { from: string; to: string; count: number }>();

  trends.forEach(trend => {
    const key = `${trend.previousTier}->${trend.currentTier}`;
    const existing = tierChanges.get(key);
    
    if (existing) {
      existing.count++;
    } else {
      tierChanges.set(key, {
        from: trend.previousTier,
        to: trend.currentTier,
        count: 1
      });
    }
  });

  return tierChanges;
}

export function getDonorTrends(data: DonorRecord[]) {
  const trends = {
    increasing: [] as string[],
    decreasing: [] as string[],
    stopped: [] as string[],
    new: [] as string[]
  };

  data.forEach(donor => {
    const fy25 = donor.fiscalYears.FY25 || 0;
    const fy24 = donor.fiscalYears.FY24 || 0;
    const fy23 = donor.fiscalYears.FY23 || 0;
    const fy22 = donor.fiscalYears.FY22 || 0;
    const fy21 = donor.fiscalYears.FY21 || 0;
    const fy20 = donor.fiscalYears.FY20 || 0;

    // Check for increasing donors (comparing FY25 to FY24)
    if (fy25 > fy24 && fy24 > 0) {
      trends.increasing.push(donor.vanId);
    }

    // Check for decreasing donors (comparing FY25 to FY24)
    if (fy25 < fy24 && fy25 > 0) {
      trends.decreasing.push(donor.vanId);
    }

    // Check for stopped giving (had donations in FY24 but none in FY25)
    if (fy24 > 0 && fy25 === 0) {
      trends.stopped.push(donor.vanId);
    }

    // Check for new donors (no donations in FY24 but has donations in FY25)
    if (fy24 === 0 && fy25 > 0) {
      trends.new.push(donor.vanId);
    }
  });

  return trends;
}

export function getDonorsByFlag(records: DonorRecord[], flag: keyof DonorRecord['flags']) {
  return records.filter(record => record.flags[flag]);
}

export function getDonorsByAmount(records: DonorRecord[], year: keyof DonorRecord['fiscalYears'], minAmount: number) {
  return records.filter(record => (record.fiscalYears[year] || 0) >= minAmount);
}

export function getDonorsByTier(records: DonorRecord[], year: keyof DonorRecord['fiscalYears'], tier: string) {
  return records.filter(record => getGivingTier(record.fiscalYears[year]) === tier);
}

export function findMidRangeDonorsOver1000(data: DonorRecord[]): string[] {
  return data
    .filter(donor => 
      (donor.fiscalYears.FY25 || 0) > 1000 && 
      donor.flags.isMidRange
    )
    .map(donor => donor.vanId);
}

export async function loadMultipleExcelFiles(fileNames: string[]): Promise<DonorRecord[]> {
  const donorMap = new Map<string, DonorRecord>();
  
  for (const fileName of fileNames) {
    try {
      console.log(`Loading file: ${fileName}`);
      const response = await fetch(`/public/${fileName}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${fileName}: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error(`${fileName} contains no sheets`);
      }

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json<any>(worksheet);

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

        const vanId = row[vanIdCol] || '';
        if (!vanId) return; // Skip rows without VANID

        const newRecord = {
          vanId,
          fiscalYears: {
            FY25: columnMap.fiscalYears.FY25 ? row[columnMap.fiscalYears.FY25] ?? null : null,
            FY24: columnMap.fiscalYears.FY24 ? row[columnMap.fiscalYears.FY24] ?? null : null,
            FY23: columnMap.fiscalYears.FY23 ? row[columnMap.fiscalYears.FY23] ?? null : null,
            FY22: columnMap.fiscalYears.FY22 ? row[columnMap.fiscalYears.FY22] ?? null : null,
            FY21: columnMap.fiscalYears.FY21 ? row[columnMap.fiscalYears.FY21] ?? null : null,
            FY20: columnMap.fiscalYears.FY20 ? row[columnMap.fiscalYears.FY20] ?? null : null
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
      throw new Error(`Failed to process ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return Array.from(donorMap.values());
} 