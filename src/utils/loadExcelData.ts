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
  trend: 'Increasing' | 'Decreasing' | 'Consistent' | 'Fluctuating' | 'Insufficient Data';
  amounts: number[];
}

export async function loadExcelData(): Promise<DonorRecord[]> {
  try {
    const allData = await loadMultipleExcelFiles();
    
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

export function analyzeDonorTrends(data: DonorRecord[]): DonorTrend[] {
  return data.map(donor => {
    const amounts = [
      donor.fiscalYears.FY20,
      donor.fiscalYears.FY21,
      donor.fiscalYears.FY22,
      donor.fiscalYears.FY23,
      donor.fiscalYears.FY24,
      donor.fiscalYears.FY25
    ].filter((amount): amount is number => amount !== null);

    if (amounts.length < 2) {
      return {
        vanId: donor.vanId,
        trend: 'Insufficient Data',
        amounts: amounts
      };
    }

    const firstAmount = amounts[0];
    const lastAmount = amounts[amounts.length - 1];
    const percentChange = ((lastAmount - firstAmount) / firstAmount) * 100;

    let trend: 'Increasing' | 'Decreasing' | 'Consistent' | 'Fluctuating' = 'Fluctuating';
    
    if (Math.abs(percentChange) < 10) {
      trend = 'Consistent';
    } else if (percentChange > 0) {
      trend = 'Increasing';
    } else {
      trend = 'Decreasing';
    }

    return {
      vanId: donor.vanId,
      trend,
      amounts
    };
  });
}

export function getTierChanges(data: DonorRecord[]): { [key: string]: number } {
  const tierChanges: { [key: string]: number } = {
    'Tier 1 to Tier 2': 0,
    'Tier 2 to Tier 1': 0,
    'Tier 2 to Tier 3': 0,
    'Tier 3 to Tier 2': 0,
    'Tier 3 to Tier 4': 0,
    'Tier 4 to Tier 3': 0
  };

  data.forEach(donor => {
    const fy24 = donor.fiscalYears.FY24;
    const fy25 = donor.fiscalYears.FY25;

    if (fy24 === null || fy25 === null) return;

    const fy24Tier = getTier(fy24);
    const fy25Tier = getTier(fy25);

    if (fy24Tier !== fy25Tier) {
      const change = `${fy24Tier} to ${fy25Tier}`;
      tierChanges[change] = (tierChanges[change] || 0) + 1;
    }
  });

  return tierChanges;
}

function getTier(amount: number): string {
  if (amount >= 10000) return 'Tier 1';
  if (amount >= 5000) return 'Tier 2';
  if (amount >= 1000) return 'Tier 3';
  return 'Tier 4';
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

export async function loadMultipleExcelFiles(): Promise<DonorRecord[]> {
  const fileNames = ['FY20.xlsx', 'FY21.xlsx', 'FY22.xlsx', 'FY23.xlsx'];
  const donorMap = new Map<string, DonorRecord>();

  for (const fileName of fileNames) {
    try {
      const response = await fetch(`/${fileName}`);
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<Record<string, string | number | null>>(worksheet);

      data.forEach(row => {
        const vanId = String(row['VANID'] || '');
        if (!vanId) return;

        const newRecord: DonorRecord = {
          vanId,
          fiscalYears: {
            FY25: Number(row['FY25']) || null,
            FY24: Number(row['FY24']) || null,
            FY23: Number(row['FY23']) || null,
            FY22: Number(row['FY22']) || null,
            FY21: Number(row['FY21']) || null,
            FY20: Number(row['FY20']) || null
          },
          flags: {
            isMidRange: Boolean(row['MidRange_1 0004999_(Public)']),
            isMajorDonorProspect: Boolean(row['Major_Donor_Prospect_(Public)'])
          }
        };

        const existingRecord = donorMap.get(vanId);
        if (existingRecord) {
          Object.keys(newRecord.fiscalYears).forEach(year => {
            const key = year as keyof typeof newRecord.fiscalYears;
            if (newRecord.fiscalYears[key] !== null) {
              existingRecord.fiscalYears[key] = newRecord.fiscalYears[key];
            }
          });
          existingRecord.flags.isMidRange = existingRecord.flags.isMidRange || newRecord.flags.isMidRange;
          existingRecord.flags.isMajorDonorProspect = existingRecord.flags.isMajorDonorProspect || newRecord.flags.isMajorDonorProspect;
        } else {
          donorMap.set(vanId, newRecord);
        }
      });
    } catch (error) {
      console.error(`Error processing ${fileName}:`, error);
      continue;
    }
  }

  return Array.from(donorMap.values());
} 