'use client';

import { Card, Title, Text, Grid, BarChart } from '@tremor/react';
import { motion } from 'framer-motion';
import { DonorRecord, analyzeDonorTrends } from '@/utils/loadExcelData';

interface DonorAnalyticsProps {
  data: DonorRecord[];
}

export function DonorAnalytics({ data }: DonorAnalyticsProps) {
  const trends = analyzeDonorTrends(data);
  const years = ['FY25', 'FY24', 'FY23', 'FY22', 'FY21', 'FY20'] as const;

  // Calculate total donations by year
  const yearlyTotals = years.map(year => {
    const total = data.reduce((sum, donor) => {
      const amount = donor.fiscalYears[year];
      return sum + (amount || 0);
    }, 0);
    return { year, total };
  });

  // Calculate donor counts by trend type
  const trendCounts = trends.reduce((acc, trend) => {
    acc[trend.trend] = (acc[trend.trend] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get top donors by trend type
  const getTopDonorsByTrend = (trendType: string) => {
    return trends
      .filter(trend => trend.trend === trendType)
      .slice(0, 5)
      .map(trend => ({
        vanId: trend.vanId,
        amount: trend.amounts[trend.amounts.length - 1] || 0
      }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
        <Card>
          <Title>Total Donations by Year</Title>
          <BarChart
            data={yearlyTotals}
            index="year"
            categories={['total']}
            colors={['blue']}
            className="mt-4"
          />
        </Card>

        <Card>
          <Title>Donor Trends</Title>
          <BarChart
            data={Object.entries(trendCounts).map(([trend, count]) => ({
              trend,
              count
            }))}
            index="trend"
            categories={['count']}
            colors={['blue']}
            className="mt-4"
          />
        </Card>

        <Card>
          <Title>Top Increasing Donors</Title>
          <div className="mt-4 space-y-2">
            {getTopDonorsByTrend('Increasing').map(donor => (
              <div key={donor.vanId} className="flex justify-between">
                <Text>{donor.vanId}</Text>
                <Text>${donor.amount.toLocaleString()}</Text>
              </div>
            ))}
          </div>
        </Card>
      </Grid>
    </motion.div>
  );
} 