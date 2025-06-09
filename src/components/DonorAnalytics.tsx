'use client';

import { Card, Title, Text, Grid, BarChart, LineChart } from '@tremor/react';
import { motion } from 'framer-motion';
import { DonorRecord, getDonorTrends, getGivingTier } from '@/utils/loadExcelData';

interface DonorAnalyticsProps {
  data: DonorRecord[];
}

export function DonorAnalytics({ data }: DonorAnalyticsProps) {
  const trends = getDonorTrends(data);
  const years = ['FY25', 'FY24', 'FY23', 'FY22', 'FY21', 'FY20'];

  // Prepare data for charts
  const yearlyTotals = years.map(year => ({
    year,
    total: data.reduce((sum, donor) => sum + (donor.fiscalYears[year] || 0), 0),
    count: data.filter(donor => donor.fiscalYears[year] !== null).length
  }));

  const tierDistribution = years.map(year => {
    const tiers = data.reduce((acc, donor) => {
      const tier = getGivingTier(donor.fiscalYears[year]);
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      year,
      ...tiers
    };
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <motion.div variants={itemVariants}>
          <Card>
            <Title>Increasing Donors</Title>
            <Text>{trends.increasing.length} donors</Text>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <Title>Decreasing Donors</Title>
            <Text>{trends.decreasing.length} donors</Text>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <Title>Stopped Giving</Title>
            <Text>{trends.stopped.length} donors</Text>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <Title>New Donors (FY25)</Title>
            <Text>{trends.new.length} donors</Text>
          </Card>
        </motion.div>
      </Grid>

      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card>
          <Title>Yearly Donation Totals</Title>
          <BarChart
            data={yearlyTotals}
            index="year"
            categories={['total']}
            colors={['blue']}
            valueFormatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
            yAxisWidth={80}
          />
        </Card>

        <Card>
          <Title>Donor Count by Year</Title>
          <LineChart
            data={yearlyTotals}
            index="year"
            categories={['count']}
            colors={['green']}
            yAxisWidth={40}
          />
        </Card>
      </Grid>

      <Card>
        <Title>Giving Tier Distribution</Title>
        <BarChart
          data={tierDistribution}
          index="year"
          categories={[
            'Leadership ($50,000+)',
            'Visionary ($25,000+)',
            'Sustainer ($10,000+)',
            'Major ($5,000+)',
            'Mid-Range ($1,000+)',
            'Supporter ($500+)',
            'Friend ($1-$499)',
            'No Gift'
          ]}
          colors={['blue', 'cyan', 'indigo', 'violet', 'fuchsia', 'rose', 'orange', 'amber']}
          stack={true}
          yAxisWidth={40}
        />
      </Card>

      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card>
          <Title>Increasing Donors</Title>
          <div className="mt-4 space-y-2">
            {trends.increasing.map(vanId => (
              <Text key={vanId}>{vanId}</Text>
            ))}
          </div>
        </Card>

        <Card>
          <Title>New Donors (FY25)</Title>
          <div className="mt-4 space-y-2">
            {trends.new.map(vanId => (
              <Text key={vanId}>{vanId}</Text>
            ))}
          </div>
        </Card>
      </Grid>
    </motion.div>
  );
} 