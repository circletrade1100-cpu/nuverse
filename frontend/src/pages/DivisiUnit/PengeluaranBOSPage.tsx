import React from 'react';
import TransactionList from '../../components/DivisiUnit/TransactionList';

const PengeluaranBOSPage: React.FC = () => {
  return (
    <TransactionList 
      type="expense"
      fundingSourceType="bos"
      title="Pengeluaran Sekolah BOS"
    />
  );
};

export default PengeluaranBOSPage;

