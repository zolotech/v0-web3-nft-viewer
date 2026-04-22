"use client"

import { useEffect } from "react"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, Twitter, Heart, Search, Layers } from "lucide-react"
import { useSelectedNFTs } from "@/contexts/selected-nfts-context"
import Link from "next/link"

export function Header() {
  const { count } = useSelectedNFTs()

  useEffect(() => {
    console.log("[v0] Header count updated:", count)
  }, [count])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Wallet className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-primary">CyberMaster Academy</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/collections">
            <Button variant="ghost" size="sm">
              <Layers className="h-4 w-4 mr-2" />
              Collections
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Wallet Explore
            </Button>
          </Link>
          <Link href="/selected">
            <Button variant="ghost" size="sm" className="relative">
              <Heart className="h-4 w-4 mr-2" />
              Selected
              {count > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {count}
                </Badge>
              )}
            </Button>
          </Link>
        </nav>

        <div className="flex items-center space-x-2">
          <Link href="https://x.com/CyberMasterMSc" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon">
              <Twitter className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="https://discord.gg/DFAHZwpRKH" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </Button>
          </Link>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
