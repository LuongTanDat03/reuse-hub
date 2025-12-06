import { ReactNode } from 'react';
import { Header } from '../screens/Desktop/sections/Header/Header';
import { ChatWidget } from './ChatWidget/ChatWidget';

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export const Layout = ({ children, showHeader = true }: LayoutProps): JSX.Element => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {showHeader && <Header />}
      <main className="w-full">
        {children}
      </main>
      <ChatWidget />
    </div>
  );
};
