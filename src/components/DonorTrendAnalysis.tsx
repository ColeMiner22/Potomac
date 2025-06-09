'use client';

import { useEffect, useState } from 'react';
import { Card, Title, Text, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell } from '@tremor/react';
import { DonorRecord } from '@/utils/loadExcelData';
import { analyzeDonorTrends, getTierChanges, loadMultipleExcelFiles } from '@/utils/loadExcelData';

export default function DonorTrendAnalysis() {
  const [data, setData] = useState<DonorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const donorData = await loadMultipleExcelFiles();
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

  const trends = analyzeDonorTrends(data);
  const increasingTrends = trends.filter(t => t.trend === 'Increasing');
  const decreasingTrends = trends.filter(t => t.trend === 'Decreasing');
  const stoppedTrends = trends.filter(t => t.trend === 'Insufficient Data'); // Or adjust as needed
  const newTrends = trends.filter(t => t.trend === 'Consistent'); // Or adjust as needed

  // For tier changes, pass the filtered donor records
  const increasingTierChanges = getTierChanges(data.filter(donor => increasingTrends.some(t => t.vanId === donor.vanId)));
  const decreasingTierChanges = getTierChanges(data.filter(donor => decreasingTrends.some(t => t.vanId === donor.vanId)));

  return (
    <div className="space-y-8">
      {/* Increasing Donors */}
      <Card>
        <Title>Donors Giving More Over Time</Title>
        <Text>Total donors: {increasingTrends.length}</Text>
        <div className="mt-4">
          <Text>Tier Changes:</Text>
          <Table className="mt-2">
            <TableHead>
              <TableRow>
                <TableHeaderCell>From</TableHeaderCell>
                <TableHeaderCell>To</TableHeaderCell>
                <TableHeaderCell>Count</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(increasingTierChanges).map(([change, count], index) => (
                <TableRow key={index}>
                  <TableCell>{change.split(' to ')[0]}</TableCell>
                  <TableCell>{change.split(' to ')[1]}</TableCell>
                  <TableCell>{count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Decreasing Donors */}
      <Card>
        <Title>Donors Giving Less Over Time</Title>
        <Text>Total donors: {decreasingTrends.length}</Text>
        <div className="mt-4">
          <Text>Tier Changes:</Text>
          <Table className="mt-2">
            <TableHead>
              <TableRow>
                <TableHeaderCell>From</TableHeaderCell>
                <TableHeaderCell>To</TableHeaderCell>
                <TableHeaderCell>Count</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(decreasingTierChanges).map(([change, count], index) => (
                <TableRow key={index}>
                  <TableCell>{change.split(' to ')[0]}</TableCell>
                  <TableCell>{change.split(' to ')[1]}</TableCell>
                  <TableCell>{count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Stopped Giving */}
      <Card>
        <Title>Donors Who Stopped Giving</Title>
        <Text>Total donors: {stoppedTrends.length}</Text>
      </Card>

      {/* New Donors */}
      <Card>
        <Title>New Donors</Title>
        <Text>Total donors: {newTrends.length}</Text>
      </Card>
    </div>
  );
} 