import React from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";

const Auth = () => {
  return (
    <div>
      <div className="p-2">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem className="font-bold text-xl">
              Ai Recruiter App
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
};

export default Auth;
