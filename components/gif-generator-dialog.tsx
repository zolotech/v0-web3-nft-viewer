"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Play, Download, Loader2 } from "lucide-react"
import { createNFTGif, type GifOptions } from "@/lib/gif-generator"
import type { NFT } from "@/app/page"

interface GifGeneratorDialogProps {
  nfts: NFT[]
  trigger?: React.ReactNode
}

export function GifGeneratorDialog({ nfts, trigger }: GifGeneratorDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedGif, setGeneratedGif] = useState<Blob | null>(null)
  const [gifUrl, setGifUrl] = useState<string | null>(null)
  const [options, setOptions] = useState<GifOptions>({
    width: 512,
    height: 512,
    delay: 2000,
    quality: 10,
  })

  const handleGenerateGif = async () => {
    if (nfts.length === 0) return

    setIsGenerating(true)
    setGeneratedGif(null)
    setGifUrl(null)

    try {
      console.log("[v0] Starting GIF generation with options:", options)
      const gifBlob = await createNFTGif(nfts, options)
      setGeneratedGif(gifBlob)

      // Create URL for preview
      const url = URL.createObjectURL(gifBlob)
      setGifUrl(url)
      console.log("[v0] GIF generated successfully")
    } catch (error) {
      console.error("[v0] GIF generation failed:", error)
      alert("Failed to generate GIF. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadGif = () => {
    if (!generatedGif) return

    const url = URL.createObjectURL(generatedGif)
    const a = document.createElement("a")
    a.href = url
    a.download = `nft-collection-${Date.now()}.gif`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm" disabled={nfts.length === 0}>
      <Play className="h-4 w-4 mr-2" />
      Create GIF
    </Button>
  )

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Animated GIF</DialogTitle>
          <DialogDescription>
            Generate an animated GIF that cycles through your {nfts.length} selected NFT{nfts.length !== 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">GIF Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width">Width (px)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={options.width}
                    onChange={(e) => setOptions((prev) => ({ ...prev, width: Number.parseInt(e.target.value) || 512 }))}
                    min="256"
                    max="1024"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (px)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={options.height}
                    onChange={(e) =>
                      setOptions((prev) => ({ ...prev, height: Number.parseInt(e.target.value) || 512 }))
                    }
                    min="256"
                    max="1024"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  Frame Duration: {options.delay}ms ({(options.delay! / 1000).toFixed(1)}s per NFT)
                </Label>
                <Slider
                  value={[options.delay!]}
                  onValueChange={([value]) => setOptions((prev) => ({ ...prev, delay: value }))}
                  min={500}
                  max={5000}
                  step={100}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Quality: {options.quality} (lower = better quality, larger file)</Label>
                <Slider
                  value={[options.quality!]}
                  onValueChange={([value]) => setOptions((prev) => ({ ...prev, quality: value }))}
                  min={1}
                  max={30}
                  step={1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {gifUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <img
                    src={gifUrl || "/placeholder.svg"}
                    alt="Generated NFT GIF"
                    className="max-w-full h-auto border rounded-lg"
                    style={{ maxHeight: "300px" }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button onClick={handleGenerateGif} disabled={isGenerating || nfts.length === 0} className="min-w-32">
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Generate GIF
                </>
              )}
            </Button>

            {generatedGif && (
              <Button onClick={handleDownloadGif} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download GIF
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
