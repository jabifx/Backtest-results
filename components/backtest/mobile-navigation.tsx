"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, LineChart, List, Settings } from "lucide-react"

interface MobileNavigationProps {
  className?: string
  id: string
  symbol: string
  strategy: string
}

export function MobileNavigation({ className, id }: MobileNavigationProps) {
  const pathname = usePathname()

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 border-t bg-background z-10", className)}>
      <div className="flex justify-around">
        <NavItem
          href={`/backtest/${id}`}
          icon={<Home className="h-5 w-5" />}
          label="Dashboard"
          isActive={pathname === `/backtest/${id}`}
        />
        <NavItem
          href={`/backtest/${id}/analysis`}
          icon={<LineChart className="h-5 w-5" />}
          label="Análisis"
          isActive={pathname === `/backtest/${id}/analysis`}
        />
        <NavItem
          href={`/backtest/${id}/trades`}
          icon={<List className="h-5 w-5" />}
          label="Trades"
          isActive={pathname === `/backtest/${id}/trades`}
        />
        <NavItem
          href={`/backtest/${id}/config`}
          icon={<Settings className="h-5 w-5" />}
          label="Config"
          isActive={pathname === `/backtest/${id}/config`}
        />
      </div>
    </div>
  )
}

function NavItem({
  href,
  icon,
  label,
  isActive,
}: {
  href: string
  icon: React.ReactNode
  label: string
  isActive: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center py-3 px-4 text-xs",
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      <span className="mt-1">{label}</span>
    </Link>
  )
}
