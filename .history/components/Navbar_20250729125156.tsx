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

]

const Navbar = () => {
  return (
    <NavigationMenu className='border-2 border-black'>
      <NavigationMenuList className='flex-row space-x-7'>
        <NavigationMenuItem>
     <span className=''>AI Recruiter App</span>
    </NavigationMenuItem>
    
        <NavigationMenuItem>
          About Us
        </NavigationMenuItem>
        <NavigationMenuItem>
          Contact US
        </NavigationMenuItem>

      </NavigationMenuList>
    </NavigationMenu>
  )
}

export default Navbar

