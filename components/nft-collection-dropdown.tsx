"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CopyleftIcon as Collection, Coins } from "lucide-react"
import type { NFTCollection, Blockchain } from "@/app/page"

interface NFTCollectionDropdownProps {
  collections: NFTCollection[]
  selectedCollection: NFTCollection | null
  onCollectionSelect: (collection: NFTCollection) => void
  walletAddress: string
  blockchain: Blockchain
}

export function NFTCollectionDropdown({
  collections,
  selectedCollection,
  onCollectionSelect,
  walletAddress,
  blockchain,
}: NFTCollectionDropdownProps) {
  const handleCollectionChange = (collectionId: string) => {
    const collection = collections.find((c) => c.id === collectionId)
    if (collection) {
      onCollectionSelect(collection)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Collection className="h-5 w-5 text-primary" />
          NFT Collections
        </CardTitle>
        <CardDescription>
          Found {collections.length} collection{collections.length !== 1 ? "s" : ""} for {walletAddress.slice(0, 6)}...
          {walletAddress.slice(-4)} on {blockchain}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select value={selectedCollection?.id || ""} onValueChange={handleCollectionChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a collection to view NFTs" />
            </SelectTrigger>
            <SelectContent>
              {collections.map((collection) => (
                <SelectItem key={collection.id} value={collection.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{collection.name}</span>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant="secondary">{collection.tokenCount} NFTs</Badge>
                      {collection.floorPrice && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Coins className="h-3 w-3" />
                          {collection.floorPrice} ETH
                        </Badge>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedCollection && (
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">{selectedCollection.name}</h3>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span>Contract: {selectedCollection.contractAddress.slice(0, 10)}...</span>
                <span>•</span>
                <span>{selectedCollection.tokenCount} NFTs owned</span>
                {selectedCollection.floorPrice && (
                  <>
                    <span>•</span>
                    <span>Floor: {selectedCollection.floorPrice} ETH</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
