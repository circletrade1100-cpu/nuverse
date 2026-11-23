import React from 'react';
import TransactionList from '../../components/DivisiUnit/TransactionList';

const PemasukanUnitPage: React.FC = () => {
  return (
    <TransactionList 
      type="income"
      fundingSourceType="regular"
      title="Pemasukan Sekolah Unit"
    />
  );
};

export default PemasukanUnitPage;

