"use client"

import { useEffect } from "react"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, Github, Twitter, Settings, Heart } from "lucide-react"
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
          <span className="text-xl font-bold text-primary">NFT Viewer</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              Explore
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
          <Link href="/setup">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Setup
            </Button>
          </Link>
          <Button variant="ghost" size="sm">
            About
          </Button>
        </nav>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Github className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Twitter className="h-5 w-5" />
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
