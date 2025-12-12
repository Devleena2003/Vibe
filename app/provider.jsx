"use client"
import React from 'react'
import { ThemeProvider as NextThemeProvider } from 'next-themes'
import Header from '@/components/custom/Header'
function Provider({children}) {
    return (
       
        <div> <NextThemeProvider  attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange><Header/>{children}</NextThemeProvider></div>
    )
}
export default Provider