import React from 'react';
import TransactionList from '../../components/DivisiUnit/TransactionList';

const PemasukanLainnyaPage: React.FC = () => {
  return (
    <TransactionList 
      type="income"
      fundingSourceType="other"
      title="Pemasukan Sumber Lainnya"
    />
  );
};

export default PemasukanLainnyaPage;

