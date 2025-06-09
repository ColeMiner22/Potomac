'use client';

import { Card, Title, Text } from '@tremor/react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { analyzeDonorPatterns, filterDataByYear } from '@/utils/donorAnalytics';

interface AnalyticsDashboardProps {
  data: Array<{
    name: string;
    amount: number;
    date: string;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  // Filter data by year
  const year1Data = filterDataByYear(data, 2021);
  const year2Data = filterDataByYear(data, 2022);
  const year3Data = filterDataByYear(data, 2023);

  // Get analytics
  const analytics = analyzeDonorPatterns(year1Data, year2Data, year3Data, data);

  // Prepare data for charts
  const yearlyDonationData = [
    {
      year: '2021',
      total: year1Data.reduce((sum, record) => sum + record.amount, 0),
      donors: year1Data.length
    },
    {
      year: '2022',
      total: year2Data.reduce((sum, record) => sum + record.amount, 0),
      donors: year2Data.length
    },
    {
      year: '2023',
      total: year3Data.reduce((sum, record) => sum + record.amount, 0),
      donors: year3Data.length
    }
  ];

  const tierChangeData = analytics.tierChanges.map(change => ({
    name: change.donor,
    fromTier: change.fromTier,
    toTier: change.toTier
  }));

  const newDonorsData = Object.entries(analytics.newDonorsByYear).map(([year, donors]) => ({
    year,
    count: (donors as string[]).length
  }));

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
      className="space-y-8"
    >
      <motion.div variants={itemVariants}>
        <Title>Donation Trends Over Time</Title>
        <Text className="mt-2">Yearly donation totals and donor counts</Text>
        <div className="h-80 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={yearlyDonationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="total"
                stroke="#8884d8"
                name="Total Donations ($)"
                animationDuration={2000}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="donors"
                stroke="#82ca9d"
                name="Number of Donors"
                animationDuration={2000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <Title>Donor Movement</Title>
            <Text className="mt-2">Increasing vs Decreasing Donors</Text>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Increasing', value: analytics.increasingDonors.length },
                      { name: 'Decreasing', value: analytics.decreasingDonors.length },
                      { name: 'Stopped', value: analytics.stoppedGiving.length }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    animationDuration={2000}
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <Title>New Donors by Year</Title>
            <Text className="mt-2">Growth in donor base</Text>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={newDonorsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="count"
                    fill="#8884d8"
                    name="New Donors"
                    animationDuration={2000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <Title>Tier Changes</Title>
          <Text className="mt-2">Donor movement between giving tiers</Text>
          <div className="mt-4 space-y-4">
            {tierChangeData.map((change, index) => (
              <motion.div
                key={change.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="font-medium">{change.name}</span>
                <span className="text-gray-600">
                  {change.fromTier} → {change.toTier}
                </span>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <Title>Key Metrics</Title>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <Text className="text-blue-600 font-medium">Increasing Donors</Text>
              <Text className="text-2xl font-bold mt-2">{analytics.increasingDonors.length}</Text>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <Text className="text-green-600 font-medium">New Donors (2023)</Text>
              <Text className="text-2xl font-bold mt-2">
                {(analytics.newDonorsByYear['2023'] as string[]).length}
              </Text>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <Text className="text-red-600 font-medium">Stopped Giving</Text>
              <Text className="text-2xl font-bold mt-2">{analytics.stoppedGiving.length}</Text>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
} 