import React from 'react';
import GlobalPageTransition from './GlobalPageTransition';

interface GlobalPageWrapperProps {
  children: React.ReactNode;
}

const GlobalPageWrapper: React.FC<GlobalPageWrapperProps> = ({ children }) => {
  return (
    <GlobalPageTransition>
      {children}
    </GlobalPageTransition>
  );
};

export default GlobalPageWrapper;
