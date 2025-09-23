import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Wallet, Hash, Activity } from "lucide-react"
import type { Blockchain } from "@/app/page"

interface WalletDashboardProps {
  walletAddress: string
  blockchain: Blockchain
  totalNfts: number
  totalCollections: number
  transactionCount: number
}

// Helper function to get blockchain explorer URLs
function getExplorerUrl(blockchain: Blockchain, address: string): string {
  switch (blockchain) {
    case "ethereum":
      return `https://etherscan.io/address/${address}`
    case "solana":
      return `https://solscan.io/account/${address}`
    case "abstract":
      return `https://explorer.abstract.money/address/${address}`
    case "apechain":
      return `https://apescan.io/address/${address}`
    default:
      return "#"
  }
}

function getBlockchainName(blockchain: Blockchain): string {
  switch (blockchain) {
    case "ethereum":
      return "Ethereum"
    case "solana":
      return "Solana"
    case "abstract":
      return "Abstract"
    case "apechain":
      return "ApeChain"
    default:
      return blockchain
  }
}

export function WalletDashboard({
  walletAddress,
  blockchain,
  totalNfts,
  totalCollections,
  transactionCount,
}: WalletDashboardProps) {
  const explorerUrl = getExplorerUrl(blockchain, walletAddress)
  const blockchainName = getBlockchainName(blockchain)

  return (
    <Card className="w-full bg-card backdrop-blur-sm border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wallet className="h-5 w-5 text-primary" />
          Wallet Dashboard
          <Badge variant="secondary" className="ml-auto">
            {blockchainName}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wallet Address */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Hash className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-mono truncate" title={walletAddress}>
              {walletAddress}
            </span>
          </div>
          <Button variant="ghost" size="sm" asChild className="ml-2 flex-shrink-0">
            <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              View on {blockchainName === "Ethereum" ? "Etherscan" : `${blockchainName} Explorer`}
            </a>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4  rounded-lg border border-primary/20">
            <div className="text-2xl font-bold text-primary">{totalNfts.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total NFTs</div>
          </div>

          <div className="text-center p-4  rounded-lg border border-secondary/20">
            <div className="text-2xl font-bold text-secondary">{totalCollections.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Collections</div>
          </div>

          <div className="text-center p-4  rounded-lg border border-accent/20">
            <div className="flex items-center justify-center gap-1">
              <Activity className="h-4 w-4 text-accent" />
              <div className="text-2xl font-bold text-accent">{transactionCount.toLocaleString()}</div>
            </div>
            <div className="text-sm text-muted-foreground">Transactions</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
