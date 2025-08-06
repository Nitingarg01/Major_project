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
      {/* <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink>Link</NavigationMenuLink>
      </NavigationMenuContent> */}
      About Us
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
  )
}

export default Navbar

