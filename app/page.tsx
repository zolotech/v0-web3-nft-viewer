"use client"

import { useState } from "react"
import { WalletInput } from "@/components/wallet-input"
import { NFTCollectionDropdown } from "@/components/nft-collection-dropdown"
import { NFTGrid } from "@/components/nft-grid"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorMessage } from "@/components/error-message"
import { WalletDashboard } from "@/components/wallet-dashboard"
import { fetchNFTsByBlockchain } from "@/lib/blockchain-apis"
import { useSelectedNFTs } from "@/contexts/selected-nfts-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export type Blockchain = "ethereum" | "solana" | "abstract" | "apechain"

export interface NFTCollection {
  id: string
  name: string
  contractAddress: string
  tokenCount: number
  floorPrice?: number
  blockchain: Blockchain
}

export interface NFT {
  id: string
  name: string
  description?: string
  image: string
  tokenId: string
  contractAddress: string
  attributes?: Array<{
    trait_type: string
    value: string | number
  }>
  blockchain: Blockchain
}

export default function HomePage() {
  const { selectedNFTs, clearAll, count } = useSelectedNFTs()
  const [walletAddress, setWalletAddress] = useState("")
  const [selectedBlockchain, setSelectedBlockchain] = useState<Blockchain>("ethereum")
  const [collections, setCollections] = useState<NFTCollection[]>([])
  const [selectedCollection, setSelectedCollection] = useState<NFTCollection | null>(null)
  const [nfts, setNfts] = useState<NFT[]>([])
  const [allNfts, setAllNfts] = useState<NFT[]>([])
  const [totalNfts, setTotalNfts] = useState(0)
  const [transactionCount, setTransactionCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleWalletSubmit = async (address: string, blockchain: Blockchain) => {
    setWalletAddress(address)
    setSelectedBlockchain(blockchain)
    setIsLoading(true)
    setError(null)
    setCollections([])
    setSelectedCollection(null)
    setNfts([])
    setAllNfts([])
    setTotalNfts(0)
    setTransactionCount(0)

    try {
      const {
        collections: fetchedCollections,
        nfts: fetchedNfts,
        totalNfts: total,
        transactionCount: txCount,
      } = await fetchNFTsByBlockchain(address, blockchain)

      setCollections(fetchedCollections)
      setAllNfts(fetchedNfts)
      setTotalNfts(total)
      setTransactionCount(txCount)
      setIsLoading(false)

      if (fetchedCollections.length === 0) {
        setError("No NFT collections found for this wallet address.")
      }
    } catch (err) {
      console.error("Error fetching NFTs:", err)
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch NFT collections. Please check your wallet address and try again.",
      )
      setIsLoading(false)
    }
  }

  const handleCollectionSelect = async (collection: NFTCollection) => {
    setSelectedCollection(collection)
    setIsLoading(true)
    setError(null)
    setNfts([])

    try {
      const collectionNfts = allNfts.filter((nft) => nft.contractAddress === collection.contractAddress)
      setNfts(collectionNfts)
      setIsLoading(false)
    } catch (err) {
      setError("Failed to fetch NFTs from this collection.")
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        backgroundImage: "url('/bggrid1.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        backgroundColor: "var(--background)", // Fallback for theme
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "oklch(0.7 0.15 200 / 0.2)", // Cyan overlay for readability
          zIndex: -1,
        }}
      ></div>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <Card className="glow-effect">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
                    <span className="text-primary">Zoloz</span> <span className="text-secondary">Crypto</span>{" "}
                    <span className="text-accent">Canvas</span>
                  </h1>
                  
                </CardTitle>
                <CardDescription>
                  Craft your own NFT masterpiece. Connect your wallet, select your favorite digital assets from multiple Ethereum wallets 
                  and create a stunning grid to download and share.
                  <br /><br />
                  <span className="text-xl font-bold text-primary"><a href="/selected">Selected NFTs</a></span><br /><br />
                  {count > 0 && (
                  
                    <div className="flex items-center justify-center gap-4">
                      <a href="/selected">
                        <Badge variant="secondary" className="text-sm px-3 py-1">
                          {count} NFT{count !== 1 ? "s" : ""} Selected
                        </Badge>
                      </a>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAll}
                        className="text-destructive hover:text-destructive bg-transparent"
                      >
                      <Trash2 className="h-4 w-4 mr-2" />
                        Clear All
                      </Button>
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        

        <div className="max-w-4xl mx-auto space-y-8">
          <WalletInput onSubmit={handleWalletSubmit} isLoading={isLoading} />

          {error && <ErrorMessage message={error} />}

          {isLoading && <LoadingSpinner />}

          {walletAddress && collections.length > 0 && !isLoading && (
            <WalletDashboard
              walletAddress={walletAddress}
              blockchain={selectedBlockchain}
              totalNfts={totalNfts}
              totalCollections={collections.length}
              transactionCount={transactionCount}
            />
          )}

          {collections.length > 0 && !isLoading && (
            <NFTCollectionDropdown
              collections={collections}
              selectedCollection={selectedCollection}
              onCollectionSelect={handleCollectionSelect}
              walletAddress={walletAddress}
              blockchain={selectedBlockchain}
            />
          )}

          {nfts.length > 0 && selectedCollection && !isLoading && (
            <NFTGrid nfts={nfts} collection={selectedCollection} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
