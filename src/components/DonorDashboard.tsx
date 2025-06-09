'use client';

import { useState, useEffect } from 'react';
import { Card, Title, Text, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Badge, Grid, Tab, TabList, TabGroup, TabPanel, TabPanels, Metric, Flex } from '@tremor/react';
import { DonorRecord } from '@/utils/loadExcelData';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

export default function DonorDashboard() {
  const [data, setData] = useState<DonorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState('FY25');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/donors');
        if (!response.ok) {
          throw new Error('Failed to fetch donor data');
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <Card className="max-w-md bg-white/80 backdrop-blur-sm">
          <Title className="text-red-500">Error</Title>
          <Text>{error}</Text>
        </Card>
      </div>
    );
  }

  const totalDonors = data.length;
  const totalAmount = data.reduce((sum, donor) => sum + (donor.fiscalYears[selectedYear as keyof typeof donor.fiscalYears] || 0), 0);
  const midRangeDonors = data.filter(donor => donor.flags.isMidRange).length;
  const majorDonorProspects = data.filter(donor => donor.flags.isMajorDonorProspect).length;

  // Calculate year-over-year change
  const prevYear = selectedYear === 'FY25' ? 'FY24' : 'FY23';
  const currentYearAmount = data.reduce((sum, donor) => sum + (donor.fiscalYears[selectedYear as keyof typeof donor.fiscalYears] || 0), 0);
  const prevYearAmount = data.reduce((sum, donor) => sum + (donor.fiscalYears[prevYear as keyof typeof donor.fiscalYears] || 0), 0);
  const yoyChange = ((currentYearAmount - prevYearAmount) / prevYearAmount) * 100;

  // Prepare data for charts
  const yearlyData = ['FY20', 'FY21', 'FY22', 'FY23', 'FY24', 'FY25'].map(year => {
    const yearDonors = data.filter(donor => donor.fiscalYears[year as keyof typeof donor.fiscalYears] !== null);
    const totalDonations = yearDonors.reduce((sum, donor) => 
      sum + (donor.fiscalYears[year as keyof typeof donor.fiscalYears] || 0), 0);
    
    const tiers = {
      tier1: yearDonors.filter(d => (d.fiscalYears[year as keyof typeof d.fiscalYears] || 0) < 500).length,
      tier2: yearDonors.filter(d => (d.fiscalYears[year as keyof typeof d.fiscalYears] || 0) >= 500 && (d.fiscalYears[year as keyof typeof d.fiscalYears] || 0) < 1000).length,
      tier3: yearDonors.filter(d => (d.fiscalYears[year as keyof typeof d.fiscalYears] || 0) >= 1000 && (d.fiscalYears[year as keyof typeof d.fiscalYears] || 0) < 5000).length,
      tier4: yearDonors.filter(d => (d.fiscalYears[year as keyof typeof d.fiscalYears] || 0) >= 5000).length,
    };

    return {
      year,
      totalDonations,
      ...tiers,
      donorsGained: 0,
      donorsLost: 0
    };
  });

  // Calculate donors gained/lost
  for (let i = 1; i < yearlyData.length; i++) {
    const currentYear = yearlyData[i].year;
    const prevYear = yearlyData[i - 1].year;
    
    const currentDonors = new Set(data
      .filter(d => d.fiscalYears[currentYear as keyof typeof d.fiscalYears] !== null)
      .map(d => d.vanId));
    
    const prevDonors = new Set(data
      .filter(d => d.fiscalYears[prevYear as keyof typeof d.fiscalYears] !== null)
      .map(d => d.vanId));

    yearlyData[i].donorsGained = [...currentDonors].filter(id => !prevDonors.has(id)).length;
    yearlyData[i].donorsLost = [...prevDonors].filter(id => !currentDonors.has(id)).length;
  }

  // Prepare pie chart data
  const pieData = [
    { name: '<$500', value: data.filter(d => (d.fiscalYears[selectedYear as keyof typeof d.fiscalYears] || 0) < 500).length },
    { name: '$500-$999', value: data.filter(d => (d.fiscalYears[selectedYear as keyof typeof d.fiscalYears] || 0) >= 500 && (d.fiscalYears[selectedYear as keyof typeof d.fiscalYears] || 0) < 1000).length },
    { name: '$1K-$4.9K', value: data.filter(d => (d.fiscalYears[selectedYear as keyof typeof d.fiscalYears] || 0) >= 1000 && (d.fiscalYears[selectedYear as keyof typeof d.fiscalYears] || 0) < 5000).length },
    { name: '$5K+', value: data.filter(d => (d.fiscalYears[selectedYear as keyof typeof d.fiscalYears] || 0) >= 5000).length }
  ];

  const COLORS = ['#22d3ee', '#3b82f6', '#6366f1', '#8b5cf6'];

  const getAmountColor = (amount: number | null) => {
    if (!amount) return 'text-gray-700';
    if (amount >= 5000) return 'text-purple-700';
    if (amount >= 1000) return 'text-blue-700';
    if (amount >= 500) return 'text-cyan-700';
    return 'text-green-700';
  };

  const getTierColor = (amount: number | null) => {
    if (!amount) return 'bg-gray-200 text-gray-800';
    if (amount >= 5000) return 'bg-purple-200 text-purple-900';
    if (amount >= 1000) return 'bg-blue-200 text-blue-900';
    if (amount >= 500) return 'bg-cyan-200 text-cyan-900';
    return 'bg-green-200 text-green-900';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Title className="text-3xl font-bold text-indigo-900">Donor Analytics Dashboard</Title>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 rounded-lg border-2 border-blue-900 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white text-blue-900 font-medium"
          >
            <option value="FY25" className="text-blue-900">FY25</option>
            <option value="FY24" className="text-blue-900">FY24</option>
            <option value="FY23" className="text-blue-900">FY23</option>
            <option value="FY22" className="text-blue-900">FY22</option>
            <option value="FY21" className="text-blue-900">FY21</option>
            <option value="FY20" className="text-blue-900">FY20</option>
          </select>
        </div>
        
        <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
            <Text className="text-blue-800">Total Donors</Text>
            <Title className="text-2xl font-bold text-blue-900">{totalDonors.toLocaleString()}</Title>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
            <Text className="text-blue-800">Total Amount ({selectedYear})</Text>
            <Title className="text-2xl font-bold text-blue-900">${totalAmount.toLocaleString()}</Title>
            <Text className={`mt-2 ${yoyChange >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {yoyChange >= 0 ? '↑' : '↓'} {Math.abs(yoyChange).toFixed(1)}% vs {prevYear}
            </Text>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
            <Text className="text-blue-800">Mid-Range Donors</Text>
            <Title className="text-2xl font-bold text-blue-900">{midRangeDonors.toLocaleString()}</Title>
            <Text className="text-blue-700 mt-2">
              {((midRangeDonors / totalDonors) * 100).toFixed(1)}% of total
            </Text>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
            <Text className="text-blue-800">Major Donor Prospects</Text>
            <Title className="text-2xl font-bold text-blue-900">{majorDonorProspects.toLocaleString()}</Title>
            <Text className="text-blue-700 mt-2">
              {((majorDonorProspects / totalDonors) * 100).toFixed(1)}% of total
            </Text>
          </Card>
        </Grid>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <Title className="text-xl font-semibold text-indigo-900 mb-6">Donation Trends</Title>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="year" stroke="#4f46e5" />
                  <YAxis stroke="#4f46e5" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="totalDonations" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="Total Donations"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <Title className="text-xl font-semibold text-indigo-900 mb-6">Donor Distribution</Title>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <TabGroup>
          <TabList className="mb-8 space-x-8">
            <Tab className="text-indigo-600 hover:text-indigo-800 px-4 py-2">Donor List</Tab>
            <Tab className="text-indigo-600 hover:text-indigo-800 px-4 py-2">Tier Analysis</Tab>
            <Tab className="text-indigo-600 hover:text-indigo-800 px-4 py-2">Trend Analysis</Tab>
            <Tab className="text-indigo-600 hover:text-indigo-800 px-4 py-2">Donation Trends</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <div className="flex justify-between items-center mb-6">
                  <Title className="text-xl font-semibold text-indigo-900">Donor List</Title>
                  <div className="flex gap-4">
                    <Badge color="indigo" size="sm">Total: {totalDonors}</Badge>
                    <Badge color="violet" size="sm">Active: {data.filter(d => d.fiscalYears[selectedYear as keyof typeof d.fiscalYears] !== null).length}</Badge>
                  </div>
                </div>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell className="text-blue-900 font-semibold">VAN ID</TableHeaderCell>
                      <TableHeaderCell className="text-blue-900 font-semibold">Amount</TableHeaderCell>
                      <TableHeaderCell className="text-blue-900 font-semibold">Tier</TableHeaderCell>
                      <TableHeaderCell className="text-blue-900 font-semibold">Flags</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((donor) => {
                      const amount = donor.fiscalYears[selectedYear as keyof typeof donor.fiscalYears];
                      const tier = amount ? (amount >= 5000 ? '$5K+' : amount >= 1000 ? '$1K-$4.9K' : amount >= 500 ? '$500-$999' : '<$500') : 'No Gift';
                      
                      return (
                        <TableRow key={donor.vanId} className="hover:bg-indigo-50/50">
                          <TableCell className="text-blue-900 font-medium">{donor.vanId}</TableCell>
                          <TableCell className={getAmountColor(amount)}>
                            {amount ? `$${amount.toLocaleString()}` : 'No Gift'}
                          </TableCell>
                          <TableCell>
                            <Badge color={getTierColor(amount).split(' ')[0]} size="sm">
                              {tier}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {donor.flags.isMidRange && (
                                <Badge color="indigo" size="sm">Mid-Range</Badge>
                              )}
                              {donor.flags.isMajorDonorProspect && (
                                <Badge color="violet" size="sm">Major Prospect</Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            </TabPanel>
            <TabPanel>
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <Title className="text-xl font-semibold text-indigo-900 mb-6">Tier Analysis</Title>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {['$5K+', '$1K-$4.9K', '$500-$999', '<$500'].map((tier) => {
                      const count = data.filter(donor => {
                        const amount = donor.fiscalYears[selectedYear as keyof typeof donor.fiscalYears];
                        if (!amount) return tier === 'No Gift';
                        if (tier === '$5K+') return amount >= 5000;
                        if (tier === '$1K-$4.9K') return amount >= 1000 && amount < 5000;
                        if (tier === '$500-$999') return amount >= 500 && amount < 1000;
                        return amount < 500;
                      }).length;

                      return (
                        <Card key={tier} className="bg-gradient-to-br from-indigo-50 to-white shadow-md border-0">
                          <Text className="text-indigo-600">{tier}</Text>
                          <Title className="text-2xl font-bold text-indigo-900">{count.toLocaleString()}</Title>
                          <Text className="text-indigo-400 mt-2">
                            {((count / totalDonors) * 100).toFixed(1)}% of total
                          </Text>
                        </Card>
                      );
                    })}
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={yearlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="year" stroke="#4f46e5" />
                        <YAxis stroke="#4f46e5" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend />
                        <Bar dataKey="tier1" stackId="a" fill="#22d3ee" name="<$500" />
                        <Bar dataKey="tier2" stackId="a" fill="#3b82f6" name="$500-$999" />
                        <Bar dataKey="tier3" stackId="a" fill="#6366f1" name="$1K-$4.9K" />
                        <Bar dataKey="tier4" stackId="a" fill="#8b5cf6" name="$5K+" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>
            </TabPanel>
            <TabPanel>
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <Title className="text-xl font-semibold text-indigo-900 mb-6">Trend Analysis</Title>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gradient-to-br from-violet-50 to-white shadow-md border-0">
                      <Text className="text-violet-600">Increasing Donors</Text>
                      <Title className="text-2xl font-bold text-violet-700">
                        {data.filter(donor => {
                          const current = donor.fiscalYears[selectedYear as keyof typeof donor.fiscalYears] || 0;
                          const previous = donor.fiscalYears[selectedYear === 'FY25' ? 'FY24' : 'FY23' as keyof typeof donor.fiscalYears] || 0;
                          return current > previous && previous > 0;
                        }).length.toLocaleString()}
                      </Title>
                    </Card>
                    <Card className="bg-gradient-to-br from-indigo-50 to-white shadow-md border-0">
                      <Text className="text-indigo-600">New Donors</Text>
                      <Title className="text-2xl font-bold text-indigo-700">
                        {data.filter(donor => {
                          const current = donor.fiscalYears[selectedYear as keyof typeof donor.fiscalYears] || 0;
                          const previous = donor.fiscalYears[selectedYear === 'FY25' ? 'FY24' : 'FY23' as keyof typeof donor.fiscalYears] || 0;
                          return current > 0 && previous === 0;
                        }).length.toLocaleString()}
                      </Title>
                    </Card>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={yearlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="year" stroke="#4f46e5" />
                        <YAxis stroke="#4f46e5" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="donorsGained" 
                          stackId="1" 
                          fill="#8b5cf6" 
                          stroke="#7c3aed"
                          name="Donors Gained" 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="donorsLost" 
                          stackId="1" 
                          fill="#6366f1" 
                          stroke="#4f46e5"
                          name="Donors Lost" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>
            </TabPanel>
            <TabPanel>
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <Title className="text-xl font-semibold text-indigo-900 mb-6">Donation Trends Analysis</Title>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Consistent Donors */}
                  <Card className="bg-gradient-to-br from-emerald-50 to-white shadow-md border-0">
                    <Text className="text-emerald-600">Consistent Donors</Text>
                    <Title className="text-2xl font-bold text-emerald-700">
                      {data.filter(donor => {
                        const years = ['FY25', 'FY24', 'FY23', 'FY22', 'FY21', 'FY20'];
                        const amounts = years.map(year => donor.fiscalYears[year as keyof typeof donor.fiscalYears] || 0);
                        const nonZeroAmounts = amounts.filter(amount => amount > 0);
                        if (nonZeroAmounts.length < 2) return false;
                        
                        // Check if all non-zero amounts are within 10% of each other
                        const avg = nonZeroAmounts.reduce((a, b) => a + b, 0) / nonZeroAmounts.length;
                        return nonZeroAmounts.every(amount => 
                          Math.abs(amount - avg) / avg <= 0.1
                        );
                      }).length.toLocaleString()}
                    </Title>
                    <Text className="text-emerald-400 mt-2">Donors with consistent giving amounts</Text>
                  </Card>

                  {/* Increasing Donors */}
                  <Card className="bg-gradient-to-br from-violet-50 to-white shadow-md border-0">
                    <Text className="text-violet-600">Increasing Donors</Text>
                    <Title className="text-2xl font-bold text-violet-700">
                      {data.filter(donor => {
                        const years = ['FY25', 'FY24', 'FY23', 'FY22', 'FY21', 'FY20'];
                        const amounts = years.map(year => donor.fiscalYears[year as keyof typeof donor.fiscalYears] || 0);
                        const nonZeroAmounts = amounts.filter(amount => amount > 0);
                        if (nonZeroAmounts.length < 2) return false;
                        
                        // Check if amounts are generally increasing
                        let increasing = true;
                        for (let i = 1; i < nonZeroAmounts.length; i++) {
                          if (nonZeroAmounts[i] < nonZeroAmounts[i-1]) {
                            increasing = false;
                            break;
                          }
                        }
                        return increasing;
                      }).length.toLocaleString()}
                    </Title>
                    <Text className="text-violet-400 mt-2">Donors with increasing giving amounts</Text>
                  </Card>

                  {/* Decreasing Donors */}
                  <Card className="bg-gradient-to-br from-rose-50 to-white shadow-md border-0">
                    <Text className="text-rose-600">Decreasing Donors</Text>
                    <Title className="text-2xl font-bold text-rose-700">
                      {data.filter(donor => {
                        const years = ['FY25', 'FY24', 'FY23', 'FY22', 'FY21', 'FY20'];
                        const amounts = years.map(year => donor.fiscalYears[year as keyof typeof donor.fiscalYears] || 0);
                        const nonZeroAmounts = amounts.filter(amount => amount > 0);
                        if (nonZeroAmounts.length < 2) return false;
                        
                        // Check if amounts are generally decreasing
                        let decreasing = true;
                        for (let i = 1; i < nonZeroAmounts.length; i++) {
                          if (nonZeroAmounts[i] > nonZeroAmounts[i-1]) {
                            decreasing = false;
                            break;
                          }
                        }
                        return decreasing;
                      }).length.toLocaleString()}
                    </Title>
                    <Text className="text-rose-400 mt-2">Donors with decreasing giving amounts</Text>
                  </Card>

                  {/* Fluctuating Donors */}
                  <Card className="bg-gradient-to-br from-amber-50 to-white shadow-md border-0">
                    <Text className="text-amber-600">Fluctuating Donors</Text>
                    <Title className="text-2xl font-bold text-amber-700">
                      {data.filter(donor => {
                        const years = ['FY25', 'FY24', 'FY23', 'FY22', 'FY21', 'FY20'];
                        const amounts = years.map(year => donor.fiscalYears[year as keyof typeof donor.fiscalYears] || 0);
                        const nonZeroAmounts = amounts.filter(amount => amount > 0);
                        if (nonZeroAmounts.length < 2) return false;
                        
                        // Check if amounts fluctuate (not consistent, increasing, or decreasing)
                        const avg = nonZeroAmounts.reduce((a, b) => a + b, 0) / nonZeroAmounts.length;
                        const hasIncrease = nonZeroAmounts.some((amount, i) => i > 0 && amount > nonZeroAmounts[i-1]);
                        const hasDecrease = nonZeroAmounts.some((amount, i) => i > 0 && amount < nonZeroAmounts[i-1]);
                        const isConsistent = nonZeroAmounts.every(amount => Math.abs(amount - avg) / avg <= 0.1);
                        
                        return !isConsistent && hasIncrease && hasDecrease;
                      }).length.toLocaleString()}
                    </Title>
                    <Text className="text-amber-400 mt-2">Donors with fluctuating giving amounts</Text>
                  </Card>
                </div>

                {/* Detailed Trend Analysis Table */}
                <div className="mt-8">
                  <Title className="text-xl font-semibold text-indigo-900 mb-4">Detailed Trend Analysis</Title>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>VAN ID</TableHeaderCell>
                        <TableHeaderCell>Trend Type</TableHeaderCell>
                        <TableHeaderCell>FY25</TableHeaderCell>
                        <TableHeaderCell>FY24</TableHeaderCell>
                        <TableHeaderCell>FY23</TableHeaderCell>
                        <TableHeaderCell>FY22</TableHeaderCell>
                        <TableHeaderCell>FY21</TableHeaderCell>
                        <TableHeaderCell>FY20</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.map(donor => {
                        const years = ['FY25', 'FY24', 'FY23', 'FY22', 'FY21', 'FY20'];
                        const amounts = years.map(year => donor.fiscalYears[year as keyof typeof donor.fiscalYears] || 0);
                        const nonZeroAmounts = amounts.filter(amount => amount > 0);
                        
                        let trendType = 'No Trend';
                        if (nonZeroAmounts.length >= 2) {
                          const avg = nonZeroAmounts.reduce((a, b) => a + b, 0) / nonZeroAmounts.length;
                          const isConsistent = nonZeroAmounts.every(amount => Math.abs(amount - avg) / avg <= 0.1);
                          const isIncreasing = nonZeroAmounts.every((amount, i) => i === 0 || amount >= nonZeroAmounts[i-1]);
                          const isDecreasing = nonZeroAmounts.every((amount, i) => i === 0 || amount <= nonZeroAmounts[i-1]);
                          
                          if (isConsistent) trendType = 'Consistent';
                          else if (isIncreasing) trendType = 'Increasing';
                          else if (isDecreasing) trendType = 'Decreasing';
                          else trendType = 'Fluctuating';
                        }

                        return (
                          <TableRow key={donor.vanId}>
                            <TableCell className="text-blue-900 font-medium">{donor.vanId}</TableCell>
                            <TableCell>
                              <Badge
                                color={
                                  trendType === 'Consistent' ? 'emerald' :
                                  trendType === 'Increasing' ? 'violet' :
                                  trendType === 'Decreasing' ? 'rose' :
                                  trendType === 'Fluctuating' ? 'amber' : 'blue'
                                }
                              >
                                {trendType}
                              </Badge>
                            </TableCell>
                            {years.map(year => (
                              <TableCell key={year} className={getAmountColor(donor.fiscalYears[year as keyof typeof donor.fiscalYears])}>
                                {donor.fiscalYears[year as keyof typeof donor.fiscalYears]?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || '-'}
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </motion.div>
  );
} 