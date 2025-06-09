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
    donor.vanId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <Title>Donor Records</Title>
      <div className="mt-4 mb-4">
        <TextInput
          placeholder="Search by VAN ID or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>VAN ID</TableHeaderCell>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>FY25</TableHeaderCell>
            <TableHeaderCell>FY24</TableHeaderCell>
            <TableHeaderCell>FY23</TableHeaderCell>
            <TableHeaderCell>FY22</TableHeaderCell>
            <TableHeaderCell>FY21</TableHeaderCell>
            <TableHeaderCell>FY20</TableHeaderCell>
            <TableHeaderCell>MRC Ever</TableHeaderCell>
            <TableHeaderCell>MRC Date</TableHeaderCell>
            <TableHeaderCell>MRC Source</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredData.map((donor) => (
            <TableRow key={donor.vanId}>
              <TableCell>{donor.vanId}</TableCell>
              <TableCell>{donor.name}</TableCell>
              <TableCell>{donor.fiscalYears.FY25?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
              <TableCell>{donor.fiscalYears.FY24?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
              <TableCell>{donor.fiscalYears.FY23?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
              <TableCell>{donor.fiscalYears.FY22?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
              <TableCell>{donor.fiscalYears.FY21?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
              <TableCell>{donor.fiscalYears.FY20?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
              <TableCell>{donor.mrcEver?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
              <TableCell>{donor.mrcDate}</TableCell>
              <TableCell>{donor.mrcSourceCode}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
} 