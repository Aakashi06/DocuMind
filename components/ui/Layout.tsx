
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children, sidebar }) => {
  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col hidden md:flex shrink-0">
        {sidebar}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {children}
      </main>
    </div>
  );
};
