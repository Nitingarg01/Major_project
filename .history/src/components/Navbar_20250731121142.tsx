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
    <NavigationMenu className='p-2 ml-6 mt-2 flex flex-row justify-between border-b-2 w-full'>
      
      <NavigationMenuList className='flex-row space-x-7 border-2 border-black'>

        <NavigationMenuItem>
          <span className='font-bold text-xl'>AI Interview App</span>
        </NavigationMenuItem>

      </NavigationMenuList>

      <NavigationMenuList className='flex flex-row space-x-4 mt-1 border-2 border-black'>
        {navItems.map((item, index) => <NavigationMenuItem key={index}>{item.name}</NavigationMenuItem>)}
      </NavigationMenuList>

    </NavigationMenu>
  )
}

export default Navbar

