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
import { auth, signOut } from '@/app/auth'
import { Button } from './ui/button'
import { handleLogout } from '@/app/(auth)/login/actions'
import Link from 'next/link'

const navItems = [
  {
    'name': 'About Us',
    'link':''
  },
  {
    'name': 'Contact Us',
    'link':'https://www.linkedin.com/in/chirag-gupta-528294217/'
  }
]

const Navbar = async () => {
  const session = await auth()


  return (
    <nav className='w-full border-b-1 border-black px-1 py-1 fixed top-0 z-10'>
      <div className='flex justify-between items-center'>
        <NavigationMenu className='p-2 ml-6 mt-2 flex justify-between w-full'>

          <NavigationMenuList className='flex-row space-x-7 '>

            <NavigationMenuItem>
              <Link className='font-bold text-xl' href='/'>AI Interview App</Link>
            </NavigationMenuItem>

          </NavigationMenuList>
        </NavigationMenu>

        <NavigationMenu>

          <NavigationMenuList className='flex flex-row space-x-4 mt-1 '>
            {navItems.map((item, index) => <NavigationMenuItem key={index}><Link href={item.link} className='hover:underline hover:text-blue-500' target='_blank'>{item.name}</Link></NavigationMenuItem>)}
          </NavigationMenuList>

        </NavigationMenu>

{session && <>
        <NavigationMenu>
          <NavigationMenuList className='flex flex-row space-x-6 pr-2'>
            <NavigationMenuItem className='font-semibold'>Hi {session?.user?.name}</NavigationMenuItem>
            <NavigationMenuItem>
              <Button variant="default" onClick={handleLogout}>Sign Out</Button>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
</>}

      </div>

    </nav>

  )
}

export default Navbar

