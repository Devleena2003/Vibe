'use client'
import React from 'react'
import Image from 'next/image'
import { Button } from '../ui/button'
import { useContext } from 'react'
import { UserDetailContext } from '@/context/UserDetailContext'
function Header() {
    const {userDetail,setUserDetail}=useContext(UserDetailContext)
    return(
        <div className='flex px-2 justify-between items-center'><Image src="/logo.jpg" alt="logo" width={50} height={40} />
            {!userDetail?.name && <div className="flex gap-5">
                <Button variant="ghost">Sign In</Button>
                <Button>Get Started</Button>
            </div>}</div>
    )
}
export default Header