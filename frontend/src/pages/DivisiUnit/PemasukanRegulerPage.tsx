import React from 'react';
import TransactionList from '../../components/DivisiUnit/TransactionList';

const PemasukanRegulerPage: React.FC = () => {
  return (
    <TransactionList 
      type="income"
      fundingSourceType="regular"
      title="Pemasukan Sekolah Reguler"
    />
  );
};

export default PemasukanRegulerPage;

