interface DonorRecord {
  name: string;
  amount: number;
  date: string;
}

interface YearlyDonorData {
  [donorName: string]: number;
}

interface GivingTier {
  min: number;
  max: number | null;
  label: string;
}

const GIVING_TIERS: GivingTier[] = [
  { min: 0, max: 1000, label: 'Under $1K' },
  { min: 1000, max: 2500, label: '$1K–$2.5K' },
  { min: 2500, max: 5000, label: '$2.5K–$5K' },
  { min: 5000, max: null, label: '$5K+' }
];

export interface DonorAnalytics {
  increasingDonors: string[];
  decreasingDonors: string[];
  tierChanges: Array<{
    donor: string;
    fromTier: string;
    toTier: string;
  }>;
  stoppedGiving: string[];
  newDonorsByYear: {
    [year: string]: string[];
  };
}

function getGivingTier(amount: number): string {
  const tier = GIVING_TIERS.find(t => 
    amount >= t.min && (t.max === null || amount < t.max)
  );
  return tier?.label || 'Unknown';
}

function processYearlyData(donors: DonorRecord[]): YearlyDonorData {
  return donors.reduce((acc, donor) => {
    const year = new Date(donor.date).getFullYear();
    const key = `${donor.name}_${year}`;
    acc[key] = (acc[key] || 0) + donor.amount;
    return acc;
  }, {} as YearlyDonorData);
}

function getDonorAmountsByYear(
  yearlyData: YearlyDonorData,
  year: number
): { [donor: string]: number } {
  return Object.entries(yearlyData)
    .filter(([key]) => key.endsWith(`_${year}`))
    .reduce((acc, [key, amount]) => {
      const donor = key.split('_')[0];
      acc[donor] = amount;
      return acc;
    }, {} as { [donor: string]: number });
}

export function analyzeDonorPatterns(
  year1Data: DonorRecord[],
  year2Data: DonorRecord[],
  year3Data: DonorRecord[],
  cumulativeData: DonorRecord[]
): DonorAnalytics {
  // Process all data into yearly totals
  const allData = [...year1Data, ...year2Data, ...year3Data, ...cumulativeData];
  const yearlyData = processYearlyData(allData);

  // Get donor amounts for each year
  const year1Amounts = getDonorAmountsByYear(yearlyData, 2021);
  const year2Amounts = getDonorAmountsByYear(yearlyData, 2022);
  const year3Amounts = getDonorAmountsByYear(yearlyData, 2023);

  // Find increasing donors
  const increasingDonors = Object.keys(year3Amounts).filter(donor => {
    const y1 = year1Amounts[donor] || 0;
    const y2 = year2Amounts[donor] || 0;
    const y3 = year3Amounts[donor] || 0;
    return y1 < y2 && y2 < y3;
  });

  // Find decreasing donors
  const decreasingDonors = Object.keys(year3Amounts).filter(donor => {
    const y1 = year1Amounts[donor] || 0;
    const y2 = year2Amounts[donor] || 0;
    const y3 = year3Amounts[donor] || 0;
    return y1 > y2 && y2 > y3;
  });

  // Find tier changes
  const tierChanges = Object.keys(year3Amounts)
    .filter(donor => {
      const y1 = year1Amounts[donor] || 0;
      const y3 = year3Amounts[donor] || 0;
      return getGivingTier(y1) !== getGivingTier(y3);
    })
    .map(donor => ({
      donor,
      fromTier: getGivingTier(year1Amounts[donor] || 0),
      toTier: getGivingTier(year3Amounts[donor] || 0)
    }));

  // Find donors who stopped giving
  const stoppedGiving = Object.keys(year1Amounts).filter(donor => 
    !year2Amounts[donor] && !year3Amounts[donor]
  );

  // Find new donors each year
  const newDonorsByYear = {
    '2022': Object.keys(year2Amounts).filter(donor => !year1Amounts[donor]),
    '2023': Object.keys(year3Amounts).filter(donor => !year2Amounts[donor])
  };

  return {
    increasingDonors,
    decreasingDonors,
    tierChanges,
    stoppedGiving,
    newDonorsByYear
  };
}

// Helper function to filter data by year
export function filterDataByYear(data: DonorRecord[], year: number): DonorRecord[] {
  return data.filter(record => new Date(record.date).getFullYear() === year);
}

// Helper function to get unique donors
export function getUniqueDonors(data: DonorRecord[]): string[] {
  return [...new Set(data.map(record => record.name))];
} 