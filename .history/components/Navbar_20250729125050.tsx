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
     <span>AI Recruiter App</span>
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

