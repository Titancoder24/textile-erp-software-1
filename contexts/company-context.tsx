"use client"

import { createContext, useContext } from "react"
import type { Database } from "@/types/database"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

interface CompanyContextValue {
  companyId: string
  userId: string
  role: string
  profile: Profile
}

const CompanyContext = createContext<CompanyContextValue | null>(null)

export function CompanyProvider({
  profile,
  children,
}: {
  profile: Profile
  children: React.ReactNode
}) {
  return (
    <CompanyContext.Provider
      value={{
        companyId: profile.company_id!,
        userId: profile.id,
        role: profile.role,
        profile,
      }}
    >
      {children}
    </CompanyContext.Provider>
  )
}

export function useCompany() {
  const ctx = useContext(CompanyContext)
  if (!ctx) {
    throw new Error("useCompany must be used within a CompanyProvider")
  }
  return ctx
}
