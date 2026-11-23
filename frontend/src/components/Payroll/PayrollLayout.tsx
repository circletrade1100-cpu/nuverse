import React from 'react';

interface PayrollLayoutProps {
  children: React.ReactNode;
}

const PayrollLayout: React.FC<PayrollLayoutProps> = ({ children }) => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
      </div>

      {/* Content */}
      {children}
    </div>
  );
};

export default PayrollLayout;
