'use client'
import React from 'react'
import { useEffect,useState } from 'react'

const MobileNavigator = () => {

    const [isMobile,setIsMobile] = useState<boolean>(false)


    useEffect(()=>{
        const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    },[])

  return (
    <div>
      
    </div>
  )
}

export default MobileNavigator
