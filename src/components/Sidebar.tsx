'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  PlusCircle, 
  FileText, 
  Settings, 
  HelpCircle, 
  LogOut, 
  User,
  BarChart3,
  Zap
} from 'lucide-react'
import { signOut } from 'next-auth/react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      current: pathname === '/dashboard'
    },
    {
      name: 'Create Interview',
      href: '/create',
      icon: PlusCircle,
      current: pathname === '/create'
    },
    {
      name: 'Resume Analyzer',
      href: '/resume-analyzer',
      icon: FileText,
      current: pathname.startsWith('/resume-analyzer')
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      current: pathname === '/analytics'
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      current: pathname === '/profile'
    }
  ]

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const handleLinkClick = () => {
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
            <Link href="/" className="text-white font-bold text-xl">
              RecruiterAI
            </Link>
          </div>

          {/* Enhanced Status Badge */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg p-3 text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="w-5 h-5 mr-2" />
                <span className='font-bold text-lg'>Premium Access</span>
              </div>
              <p className='text-xs mt-1'>Advanced AI Interview Platform</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${item.current
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <Link
              href="/settings"
              onClick={handleLinkClick}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <Settings className="w-5 h-5 mr-3" />
              Settings
            </Link>
            
            <Link
              href="/help"
              onClick={handleLinkClick}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <HelpCircle className="w-5 h-5 mr-3" />
              Help & Support
            </Link>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors text-left"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar