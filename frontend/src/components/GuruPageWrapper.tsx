import React from 'react';
import PageTransition from './PageTransition';

interface GuruPageWrapperProps {
  children: React.ReactNode;
}

const GuruPageWrapper: React.FC<GuruPageWrapperProps> = ({ children }) => {
  return (
    <PageTransition>
      {children}
    </PageTransition>
  );
};

export default GuruPageWrapper;
