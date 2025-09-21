"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Search } from "lucide-react"
import type { Blockchain } from "@/app/page"

interface WalletInputProps {
  onSubmit: (address: string, blockchain: Blockchain) => void
  isLoading: boolean
}

export function WalletInput({ onSubmit, isLoading }: WalletInputProps) {
  const [address, setAddress] = useState("")
  const [blockchain, setBlockchain] = useState<Blockchain>("ethereum")
  const [error, setError] = useState("")

  const validateAddress = (addr: string, chain: Blockchain): boolean => {
    setError("")

    if (!addr.trim()) {
      setError("Please enter a wallet address")
      return false
    }

    // Basic validation patterns
    const patterns = {
      ethereum: /^0x[a-fA-F0-9]{40}$/,
      solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
      abstract: /^0x[a-fA-F0-9]{40}$/, // Similar to Ethereum
      apechain: /^0x[a-fA-F0-9]{40}$/, // Similar to Ethereum
    }

    if (!patterns[chain].test(addr.trim())) {
      setError(`Invalid ${chain} wallet address format`)
      return false
    }

    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateAddress(address, blockchain)) {
      onSubmit(address.trim(), blockchain)
    }
  }

  return (
    <Card className="glow-effect">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Wallet className="h-6 w-6 text-primary" />
          Enter Wallet Address
        </CardTitle>
        <CardDescription>
          Select your blockchain and enter your wallet address to view your NFT collections
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="blockchain">Blockchain</Label>
            <Select value={blockchain} onValueChange={(value: Blockchain) => setBlockchain(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select blockchain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ethereum">Ethereum</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Wallet Address</Label>
            <Input
              id="address"
              type="text"
              placeholder={blockchain === "solana" ? "Enter Solana wallet address..." : "Enter wallet address (0x...)"}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={error ? "border-destructive" : ""}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>Loading...</>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                View NFTs
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
