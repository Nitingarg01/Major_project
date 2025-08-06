import React from 'react'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"
import { signOut } from '@/app/auth'

const navItems = [
  {
    'name': 'About Us'
  },
  {
    'name': 'Contact Us'
  }
]

const Navbar = () => {
  return (
    <nav className='w-full border-b-1 border-black px-1 py-1'>
      <div className='flex justify-between items-center'>
        <NavigationMenu className='p-2 ml-6 mt-2 flex justify-between w-full'>

          <NavigationMenuList className='flex-row space-x-7 '>

            <NavigationMenuItem>
              <span className='font-bold text-xl'>AI Interview App</span>
            </NavigationMenuItem>

          </NavigationMenuList>
        </NavigationMenu>

        <NavigationMenu>

          <NavigationMenuList className='flex flex-row space-x-4 mt-1 '>
            {navItems.map((item, index) => <NavigationMenuItem key={index}>{item.name}</NavigationMenuItem>)}
          </NavigationMenuList>

        </NavigationMenu>

        <NavigationMenu>
          <NavigationMenuList className='flex flex-row space-x-6 pr-2'>
            <NavigationMenuItem>Hi Chirag</NavigationMenuItem>
            <NavigationMenuItem>
              <button >Sign Out</button>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

    </nav>

  )
}

export default Navbar

