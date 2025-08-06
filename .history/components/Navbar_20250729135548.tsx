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
    'name':'About Us'
  },
  {
    'name':'Contact Us'
  }
]

const Navbar = () => {
  return (
    <NavigationMenu className='p-2 ml-6 mt-2'>
      <NavigationMenuList className='flex-row space-x-7'>
        <NavigationMenuItem>
     <span className='font-bold text-xl'>AI Interview App</span>
    </NavigationMenuItem>
      </NavigationMenuList>
     <NavigationMenuList>
      {navItems.map((item,index)=><NavigationMenuItem key={index}>{item.name}</NavigationMenuItem>)}
        {/* <NavigationMenuItem>
          About Us
        </NavigationMenuItem>
        <NavigationMenuItem>
          Contact Us
        </NavigationMenuItem> */}

     </NavigationMenuList>
    </NavigationMenu>
  )
}

export default Navbar

