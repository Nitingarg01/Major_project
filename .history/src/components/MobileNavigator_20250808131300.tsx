'use client'
import React from 'react'
import { useEffect, useState } from 'react'

const MobileNavigator = () => {

    const [isMobile, setIsMobile] = useState<boolean>(false)


    useEffect(() => {
        const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)

        if (isMobileDevice || window.innerWidth < 768) {
            setIsMobile(true)
        }
    }, [])

    if(!isMobile){
        return null
    }

    return (
        <div>

        </div>
    )
}

export default MobileNavigator
