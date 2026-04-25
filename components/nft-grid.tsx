"use client"

import type React from "react"
import Image from "next/image"

import { Card, CardContent, CardTitle, CardDescription, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ExternalLink, Eye, Plus, Check } from "lucide-react"
import { useSelectedNFTs } from "@/contexts/selected-nfts-context"
import type { NFT, NFTCollection } from "@/app/page"

interface NFTGridProps {
  nfts: NFT[]
  collection: NFTCollection
}

export function NFTGrid({ nfts, collection }: NFTGridProps) {
  const { addNFT, removeNFT, isSelected } = useSelectedNFTs()

  const handleSelectNFT = (nft: NFT, e: React.MouseEvent) => {
    e.stopPropagation()
    if (isSelected(nft.id)) {
      removeNFT(nft.id)
    } else {
      addNFT(nft)
    }
  }

  return (
    <Card className="glow-effect">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">{collection.name}</h2>
            <p className="text-muted-foreground">
              Showing {nfts.length} NFT{nfts.length !== 1 ? "s" : ""} from your collection
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardDescription>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {nfts.map((nft) => (
            <Card key={nft.id} className="nft-card-hover cursor-pointer group relative">
              {isSelected(nft.id) && (
                <div className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}

              <CardContent className="p-0">
                <div className="aspect-square relative overflow-hidden rounded-t-lg">
                  <Image
                    src={nft.image || "/placeholder.svg"}
                    alt={nft.name}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleSelectNFT(nft, e)}
                    >
                      {isSelected(nft.id) ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Selected
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Select
                        </>
                      )}
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{nft.name}</DialogTitle>
                          <DialogDescription>
                            Token ID: {nft.tokenId} | {nft.blockchain}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="aspect-square">
                            <div className="relative h-full w-full">
                              <Image
                                src={nft.image || "/placeholder.svg"}
                                alt={nft.name}
                                fill
                                unoptimized
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover rounded-lg"
                              />
                            </div>
                          </div>
                          <div className="space-y-4">
                            {nft.description && (
                              <div>
                                <h4 className="font-semibold mb-2">Description</h4>
                                <p className="text-sm text-muted-foreground">{nft.description}</p>
                              </div>
                            )}

                            <div>
                              <h4 className="font-semibold mb-2">Contract</h4>
                              <p className="text-sm font-mono text-muted-foreground">{nft.contractAddress}</p>
                            </div>

                            {nft.attributes && nft.attributes.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2">Attributes</h4>
                                <div className="grid grid-cols-2 gap-2">
                                  {nft.attributes.map((attr, index) => (
                                    <div key={index} className="text-center p-2 bg-muted rounded">
                                      <div className="text-xs text-muted-foreground">{attr.trait_type}</div>
                                      <div className="text-sm font-medium">{attr.value}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <Button className="w-full bg-transparent" variant="outline">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View on OpenSea
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold mb-1 truncate">{nft.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">Token ID: {nft.tokenId}</p>

                  {nft.attributes && nft.attributes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {nft.attributes.slice(0, 2).map((attr, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {attr.trait_type}: {attr.value}
                        </Badge>
                      ))}
                      {nft.attributes.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{nft.attributes.length - 2} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardDescription>
    </Card>
  )
}
