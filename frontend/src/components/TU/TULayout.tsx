import React from 'react';

interface TULayoutProps {
  children: React.ReactNode;
}

const TULayout: React.FC<TULayoutProps> = ({ children }) => {
  return (
    <div className="p-6 space-y-6">
      {/* Content */}
      {children}
    </div>
  );
};

export default TULayout;
