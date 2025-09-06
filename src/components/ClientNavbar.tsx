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
  
  // Determine if we should show minimal navbar based on loading state
  const shouldShowMinimal = isLoading && pathname === '/dashboard';

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      <Navbar minimal={shouldShowMinimal} />
    </LoadingContext.Provider>
  );
};

export default ClientNavbar;
export { LoadingContext };