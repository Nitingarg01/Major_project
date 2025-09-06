'use client'
import React from 'react'
import DSACompiler from '@/components/DSACompiler'

const TestDSAPage = () => {
  const handleSubmit = (code: string, results: any) => {
    console.log('DSA Solution submitted:', { code, results })
    alert('DSA solution submitted successfully!')
  }

  // Test with null problem to verify error handling
  const testWithNull = false;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">DSA Compiler Test Page</h1>
        <p className="text-center mb-8 text-gray-600">
          This page tests the DSA Compiler component to verify the bug fixes.
        </p>
        
        <DSACompiler
          problem={testWithNull ? null : undefined} // Test both null and undefined scenarios
          onSubmit={handleSubmit}
          timeLimit={45}
        />
      </div>
    </div>
  )
}

export default TestDSAPage