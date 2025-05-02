import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function RouteProtection() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  
  if (error || !data?.user) {
    redirect('/login')
  }
  
  return null
}

// Example usage in a protected page layout:
// export default async function ProtectedLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   await RouteProtection()
//   return children
// } 