'use client'

import { UserProvider } from '@auth0/nextjs-auth0/client'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    lightRed: {
      500: '#FEB2B2'
    },
    lightGreen: {
      500: '#68D391'
    }
  }
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ChakraProvider theme={theme}>
        {children}
      </ChakraProvider>
    </UserProvider>
  )
}
