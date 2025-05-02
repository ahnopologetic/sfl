import { RouteProtection } from '@/app/components/auth/route-protection'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await RouteProtection()
  return children
} 