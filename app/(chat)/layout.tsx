import { ClerkProvider } from '@clerk/nextjs'
import { cookies } from 'next/headers'
import { ClientLayout } from './client-layout'
import { auth } from '../(auth)/auth'

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()

  return (
    <ClerkProvider>
      <ClientLayout>
        {children}
      </ClientLayout>
    </ClerkProvider>
  )
}