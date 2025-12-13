"use client"
import React, { useState } from 'react'
import { ThemeProvider as NextThemeProvider } from 'next-themes'
import Header from '@/components/custom/Header'
import { UserDetailContext } from '@/context/UserDetailContext'
import {MessageContext} from '@/context/MessageContext'
import { GoogleOAuthProvider } from '@react-oauth/google'
function Provider({ children }) {
    const [messages, setMessages] = useState()
    const [userDetail,setUserDetail]=useState()
    return (
       
        <div>
          
<GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
            <UserDetailContext.Provider value={{userDetail,setUserDetail}}>
            <MessageContext.Provider value={{messages,setMessages}}>
            <NextThemeProvider attribute="class"
            defaultTheme="dark"
            enableSystem
                    disableTransitionOnChange><Header />{children}</NextThemeProvider>
                </MessageContext.Provider>
            </UserDetailContext.Provider>   
            </GoogleOAuthProvider>
        </div>
    )
}
export default Provider