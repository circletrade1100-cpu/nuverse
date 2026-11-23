import React from 'react';
import Sidebar from './Sidebar.tsx';
import Header from './Header.tsx';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="drawer lg:drawer-open bg-slate-50 min-h-screen" data-theme="annur">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      
      <div className="drawer-content flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 bg-slate-50 p-2 sm:p-4 lg:p-6 xl:p-8 container-responsive">
          <div className="w-full mx-auto container-adaptive" style={{
            maxWidth: 'min(100vw - 2rem, 1536px)',
            width: '100%'
          }}>
            {children}
          </div>
        </main>
      </div>
      
      <Sidebar />
    </div>
  );
};

export default MainLayout;
