'use client';

import { useEffect, useState } from 'react';
import { Card, Title, Text, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell } from '@tremor/react';
import { DonorRecord, DonorTrend, analyzeDonorTrends, getTierChanges, loadMultipleExcelFiles } from '@/utils/loadExcelData';

export default function DonorTrendAnalysis() {
  const [data, setData] = useState<DonorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // List your actual Excel files here
        const fileNames = [
          'FY20.xlsx',
          'FY21.xlsx',
          'FY22.xlsx',
          'FY23.xlsx'
        ];
        const donorData = await loadMultipleExcelFiles(fileNames);
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
  const increasingTierChanges = getTierChanges(trends.increasing);
  const decreasingTierChanges = getTierChanges(trends.decreasing);

  return (
    <div className="space-y-8">
      {/* Increasing Donors */}
      <Card>
        <Title>Donors Giving More Over Time</Title>
        <Text>Total donors: {trends.increasing.length}</Text>
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
              {Array.from(increasingTierChanges.values()).map((change, index) => (
                <TableRow key={index}>
                  <TableCell>{change.from}</TableCell>
                  <TableCell>{change.to}</TableCell>
                  <TableCell>{change.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Decreasing Donors */}
      <Card>
        <Title>Donors Giving Less Over Time</Title>
        <Text>Total donors: {trends.decreasing.length}</Text>
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
              {Array.from(decreasingTierChanges.values()).map((change, index) => (
                <TableRow key={index}>
                  <TableCell>{change.from}</TableCell>
                  <TableCell>{change.to}</TableCell>
                  <TableCell>{change.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Stopped Giving */}
      <Card>
        <Title>Donors Who Stopped Giving</Title>
        <Text>Total donors: {trends.stopped.length}</Text>
        <div className="mt-4">
          <Text>By Year:</Text>
          <Table className="mt-2">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Year</TableHeaderCell>
                <TableHeaderCell>Count</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(
                trends.stopped.reduce((acc, trend) => {
                  acc[trend.year] = (acc[trend.year] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([year, count]) => (
                <TableRow key={year}>
                  <TableCell>{year}</TableCell>
                  <TableCell>{count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* New Donors */}
      <Card>
        <Title>New Donors</Title>
        <Text>Total donors: {trends.new.length}</Text>
        <div className="mt-4">
          <Text>By Year:</Text>
          <Table className="mt-2">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Year</TableHeaderCell>
                <TableHeaderCell>Count</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(
                trends.new.reduce((acc, trend) => {
                  acc[trend.year] = (acc[trend.year] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([year, count]) => (
                <TableRow key={year}>
                  <TableCell>{year}</TableCell>
                  <TableCell>{count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
} 