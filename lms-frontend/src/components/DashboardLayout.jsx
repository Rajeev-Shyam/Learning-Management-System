import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <main className="pt-16 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
