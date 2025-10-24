'use client'
import React, { createContext, useContext, useState } from 'react';
import Navbar from './Navbar';
import { usePathname } from 'next/navigation';

// Create context for loading state
const LoadingContext = createContext<{
  isLoading: boolean,
  setIsLoading: (loading: boolean) => void
}>({
  isLoading: false,
  setIsLoading: () => {}
});

export const useLoading = () => useContext(LoadingContext);

// Minimal loading navbar component
const MinimalLoadingNavbar = () => {
  return (
    <nav className='w-full border-b border-gray-100 bg-white px-6 py-4'>
      <div className='flex justify-center items-center'>
        <div className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
          AI Interview App
          Interview AI
        </div>
      </div>
    </nav>
  );
};

const ClientNavbar = () => {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  
  // Show minimal navbar during any loading state on dashboard or protected routes
  const shouldShowMinimal = isLoading && (
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/interview') ||
    pathname.startsWith('/create') ||
    pathname.startsWith('/resume-analyzer') ||
    pathname.startsWith('/performance')
  );

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {shouldShowMinimal ? <MinimalLoadingNavbar /> : <Navbar />}
    </LoadingContext.Provider>
  );
};

export default ClientNavbar;
export { LoadingContext };