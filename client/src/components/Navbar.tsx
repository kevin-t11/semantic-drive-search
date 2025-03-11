"use client"

import { Button } from "@/components/ui/button"
import { LogOut, Search, FileText } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"

interface NavBarProps {
  onLogout: () => void
}

export function NavBar({ onLogout }: NavBarProps) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">DriveSearch</span>
        </div>

        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-2">
            <Button variant={location.pathname === "/ingest" ? "default" : "ghost"} onClick={() => navigate("/ingest")}>
              <FileText className="mr-2 h-4 w-4" />
              Ingest Files
            </Button>
            <Button variant={location.pathname === "/search" ? "default" : "ghost"} onClick={() => navigate("/search")}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </nav>

          <Button variant="outline" size="icon" onClick={onLogout}>
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Log out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

