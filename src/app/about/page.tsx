'use client';

import { motion } from 'framer-motion';
import { Card, Title, Text } from '@tremor/react';

export default function AboutPage() {
  const features = [
    {
      title: 'Data Upload',
      description: 'Upload Excel files containing donor data for analysis. Supports multiple file formats and data structures.',
    },
    {
      title: 'Analytics Dashboard',
      description: 'Comprehensive visualization of donor giving patterns, trends, and insights.',
    },
    {
      title: 'Donor Movement',
      description: 'Track donor behavior including increasing/decreasing donations and tier changes.',
    },
    {
      title: 'Interactive Charts',
      description: 'Engage with interactive charts and graphs to explore donor data in detail.',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title className="text-4xl font-bold text-gray-900 mb-2">
          About This Project
        </Title>
        <Text className="text-gray-600 mb-8">
          A modern web application for analyzing and visualizing donor giving patterns
        </Text>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="p-6 h-full">
              <Title className="text-xl font-semibold mb-2">{feature.title}</Title>
              <Text className="text-gray-600">{feature.description}</Text>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8"
      >
        <Card className="p-6">
          <Title className="text-xl font-semibold mb-4">Technologies Used</Title>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Next.js', 'React', 'Tailwind CSS', 'Framer Motion', 'Recharts', 'TypeScript', 'Excel.js', 'Tremor'].map((tech) => (
              <div
                key={tech}
                className="bg-gray-50 rounded-lg p-3 text-center text-gray-700 font-medium"
              >
                {tech}
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
} 