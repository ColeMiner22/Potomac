'use client';

import { useState } from 'react';
import { Card, Title, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, TextInput } from '@tremor/react';
import { DonorRecord } from '@/utils/loadExcelData';

interface DonorTableProps {
  data: DonorRecord[];
}

export function DonorTable({ data }: DonorTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(donor => 
    donor.vanId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <Title>Donor Records</Title>
      <div className="mt-4 mb-4">
        <TextInput
          placeholder="Search by VAN ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>VAN ID</TableHeaderCell>
            <TableHeaderCell>FY25</TableHeaderCell>
            <TableHeaderCell>FY24</TableHeaderCell>
            <TableHeaderCell>FY23</TableHeaderCell>
            <TableHeaderCell>FY22</TableHeaderCell>
            <TableHeaderCell>FY21</TableHeaderCell>
            <TableHeaderCell>FY20</TableHeaderCell>
            <TableHeaderCell>Mid Range</TableHeaderCell>
            <TableHeaderCell>Major Donor Prospect</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredData.map((donor) => (
            <TableRow key={donor.vanId}>
              <TableCell>{donor.vanId}</TableCell>
              <TableCell>{donor.fiscalYears.FY25?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
              <TableCell>{donor.fiscalYears.FY24?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
              <TableCell>{donor.fiscalYears.FY23?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
              <TableCell>{donor.fiscalYears.FY22?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
              <TableCell>{donor.fiscalYears.FY21?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
              <TableCell>{donor.fiscalYears.FY20?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
              <TableCell>{donor.flags.isMidRange ? 'Yes' : 'No'}</TableCell>
              <TableCell>{donor.flags.isMajorDonorProspect ? 'Yes' : 'No'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
} 