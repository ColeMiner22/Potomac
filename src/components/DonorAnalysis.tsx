'use client';

import { useEffect, useState } from 'react';
import { Card, Title, Text } from '@tremor/react';
import { DonorRecord, findMidRangeDonorsOver1000, loadExcelData } from '@/utils/loadExcelData';

export default function DonorAnalysis() {
  const [data, setData] = useState<DonorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const donorData = await loadExcelData();
        setData(donorData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card>
        <Title>Loading...</Title>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Title>Error</Title>
        <Text>{error}</Text>
      </Card>
    );
  }

  const midRangeDonorsOver1000 = findMidRangeDonorsOver1000(data);

  return (
    <Card>
      <Title>Mid-Range Donors Over $1,000 in FY25</Title>
      <Text>Number of donors: {midRangeDonorsOver1000.length}</Text>
      <div className="mt-4">
        <Text>VANIDs:</Text>
        <ul className="list-disc pl-5 mt-2">
          {midRangeDonorsOver1000.map(vanId => (
            <li key={vanId}>{vanId}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
} 