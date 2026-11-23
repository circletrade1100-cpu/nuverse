import React from 'react';
import TransactionList from '../../components/DivisiUnit/TransactionList';

const PengeluaranLainnyaPage: React.FC = () => {
  return (
    <TransactionList 
      type="expense"
      fundingSourceType="other"
      title="Pengeluaran Sumber Lainnya"
    />
  );
};

export default PengeluaranLainnyaPage;

