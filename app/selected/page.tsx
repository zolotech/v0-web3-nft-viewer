"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Grid3X3, RectangleHorizontal, RectangleVertical, Square, Trash2 } from "lucide-react"
import { useSelectedNFTs } from "@/contexts/selected-nfts-context"
import { SelectedNFTsDisplay } from "@/components/selected-nfts-display"
import { GifGeneratorDialog } from "@/components/gif-generator-dialog"
import { ImageGeneratorDialog } from "@/components/image-generator-dialog"

type LayoutType = "grid" | "landscape" | "portrait" | "full"

export default function SelectedPage() {
  const { selectedNFTs, clearAll, count } = useSelectedNFTs()
  const [currentLayout, setCurrentLayout] = useState<LayoutType>("grid")

  useEffect(() => {
    console.log("[v0] Selected page loaded, NFT count:", count)
    console.log("[v0] Selected NFTs:", selectedNFTs)
  }, [selectedNFTs, count])

  const layoutOptions = [
    { type: "grid" as LayoutType, icon: Grid3X3, label: "Grid" },
    { type: "landscape" as LayoutType, icon: RectangleHorizontal, label: "Landscape" },
    { type: "portrait" as LayoutType, icon: RectangleVertical, label: "Portrait" },
    { type: "full" as LayoutType, icon: Square, label: "Full Size" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
              Selected NFTs
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              View and manage your selected NFTs from across different collections and blockchains. Choose your
              preferred layout and export options.
            </p>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              <span className="text-xl font-bold text-primary"><a href="/">click here to Select NFTs</a></span>
            </p>

            {count > 0 && (
              <div className="flex items-center justify-center gap-4">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {count} NFT{count !== 1 ? "s" : ""} Selected
                </Badge>
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
          </div>

          {selectedNFTs.length === 0 ? (
            <Card className="max-w-md mx-auto">
              <CardContent className="text-center py-12">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <Grid3X3 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">No NFTs Selected</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start exploring collections and select NFTs to view them here.
                    </p>
                    <Button asChild>
                      <a href="/">Explore Collections</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Layout Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Display Options</span>
                    <div className="flex gap-2">
                      <GifGeneratorDialog nfts={selectedNFTs} />
                      <ImageGeneratorDialog nfts={selectedNFTs} currentLayout={currentLayout} />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {layoutOptions.map(({ type, icon: Icon, label }) => (
                      <Button
                        key={type}
                        variant={currentLayout === type ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentLayout(type)}
                        className="flex items-center gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Separator />

              {/* NFTs Display */}
              <SelectedNFTsDisplay nfts={selectedNFTs} layout={currentLayout} />
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
