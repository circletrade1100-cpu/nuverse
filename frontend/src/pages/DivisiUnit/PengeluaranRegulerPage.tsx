import React from 'react';
import TransactionList from '../../components/DivisiUnit/TransactionList';

const PengeluaranRegulerPage: React.FC = () => {
  return (
    <TransactionList 
      type="expense"
      fundingSourceType="regular"
      title="Pengeluaran Sekolah Reguler"
    />
  );
};

export default PengeluaranRegulerPage;

