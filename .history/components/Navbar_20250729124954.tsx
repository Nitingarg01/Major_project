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
   <NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
     
      About Us
    </NavigationMenuItem>
    <NavigationMenuItem>
      
      contact US
    </NavigationMenuItem>
    
  </NavigationMenuList>
</NavigationMenu>
  )
}

export default Navbar

