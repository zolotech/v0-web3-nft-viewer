"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, ExternalLink } from "lucide-react"
import { useSelectedNFTs } from "@/contexts/selected-nfts-context"
import type { NFT } from "@/app/page"

interface SelectedNFTsDisplayProps {
  nfts: NFT[]
  layout: "grid" | "landscape" | "portrait" | "full"
}

export function SelectedNFTsDisplay({ nfts, layout }: SelectedNFTsDisplayProps) {
  const { removeNFT } = useSelectedNFTs()

  const getLayoutClasses = () => {
    switch (layout) {
      case "grid":
        return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      case "landscape":
        return "flex flex-wrap gap-4"
      case "portrait":
        return "flex flex-col gap-4"
      case "full":
        return "flex flex-col gap-6"
      default:
        return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    }
  }

  const getCardClasses = () => {
    switch (layout) {
      case "landscape":
        return "w-48 flex-shrink-0"
      case "portrait":
        return "max-w-sm mx-auto"
      case "full":
        return "w-full"
      default:
        return ""
    }
  }

  const getImageClasses = () => {
    switch (layout) {
      case "landscape":
        return "aspect-square"
      case "portrait":
        return "aspect-square"
      case "full":
        return "aspect-[16/9] max-h-96"
      default:
        return "aspect-square"
    }
  }

  const getContentLayout = () => {
    if (layout === "full") {
      return "grid grid-cols-1 md:grid-cols-3 gap-6"
    }
    return "space-y-3"
  }

  return (
    <div className={getLayoutClasses()}>
      {nfts.map((nft) => (
        <Card key={nft.id} className={`group relative ${getCardClasses()}`}>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 z-10 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => removeNFT(nft.id)}
          >
            <X className="h-3 w-3" />
          </Button>

          <CardContent className="p-0">
            <div className={layout === "full" ? getContentLayout() : ""}>
              <div
                className={`relative overflow-hidden ${layout === "full" ? "" : "rounded-t-lg"} ${getImageClasses()}`}
              >
                <img src={nft.image || "/placeholder.svg"} alt={nft.name} className="w-full h-full object-cover" />
              </div>

              <div className={layout === "full" ? "md:col-span-2 space-y-4" : "p-4 space-y-3"}>
                <div>
                  <h3 className={`font-semibold truncate ${layout === "full" ? "text-xl" : ""}`}>{nft.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Token ID: {nft.tokenId} • {nft.blockchain}
                  </p>
                </div>

                {nft.description && layout === "full" && (
                  <p className="text-sm text-muted-foreground">{nft.description}</p>
                )}

                {nft.contractAddress && layout === "full" && (
                  <div>
                    <h4 className="font-medium mb-1">Contract Address</h4>
                    <p className="text-xs font-mono text-muted-foreground break-all">{nft.contractAddress}</p>
                  </div>
                )}

                {nft.attributes && nft.attributes.length > 0 && (
                  <div>
                    {layout === "full" && <h4 className="font-medium mb-2">Attributes</h4>}
                    <div className={`flex flex-wrap gap-1 ${layout === "full" ? "gap-2" : ""}`}>
                      {nft.attributes.slice(0, layout === "full" ? 10 : 2).map((attr, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {attr.trait_type}: {attr.value}
                        </Badge>
                      ))}
                      {nft.attributes.length > (layout === "full" ? 10 : 2) && (
                        <Badge variant="outline" className="text-xs">
                          +{nft.attributes.length - (layout === "full" ? 10 : 2)} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {layout === "full" && (
                  <Button variant="outline" className="w-full bg-transparent">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Blockchain
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
