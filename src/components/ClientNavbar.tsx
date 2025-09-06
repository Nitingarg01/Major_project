'use client'
import React, { createContext, useContext, useState } from 'react'
import Navbar from './Navbar'
import { usePathname } from 'next/navigation'

// Create context for loading state
const LoadingContext = createContext<{
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}>({
  isLoading: false,
  setIsLoading: () => {}
});

export const useLoading = () => useContext(LoadingContext);

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
      <Navbar minimal={shouldShowMinimal} />
    </LoadingContext.Provider>
  );
};

export default ClientNavbar;
export { LoadingContext };