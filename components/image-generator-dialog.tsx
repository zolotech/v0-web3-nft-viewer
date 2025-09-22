"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Download, Loader2, ImageIcon } from "lucide-react"
import { createNFTImage, type ImageOptions, type LayoutType } from "@/lib/image-generator"
import type { NFT } from "@/app/page"

interface ImageGeneratorDialogProps {
  nfts: NFT[]
  currentLayout: LayoutType
  trigger?: React.ReactNode
}

export function ImageGeneratorDialog({ nfts, currentLayout, trigger }: ImageGeneratorDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<Blob | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [layout, setLayout] = useState<LayoutType>(currentLayout)
  const [options, setOptions] = useState<ImageOptions>({
    width: 1200,
    height: 1200,
    format: "png",
    quality: 0.9,
    background: "#000000",
  })

  const handleGenerateImage = async () => {
    if (nfts.length === 0) return

    setIsGenerating(true)
    setGeneratedImage(null)
    setImageUrl(null)

    try {
      console.log("[v0] Starting image generation with layout:", layout, "options:", options)
      const imageBlob = await createNFTImage(nfts, layout, options)
      setGeneratedImage(imageBlob)

      // Create URL for preview
      const url = URL.createObjectURL(imageBlob)
      setImageUrl(url)
      console.log("[v0] Image generated successfully")
    } catch (error) {
      console.error("[v0] Image generation failed:", error)
      alert("Failed to generate image. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadImage = () => {
    if (!generatedImage) return

    const url = URL.createObjectURL(generatedImage)
    const a = document.createElement("a")
    a.href = url
    a.download = `nft-collection-${layout}-${Date.now()}.${options.format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getDefaultDimensions = (selectedLayout: LayoutType) => {
    switch (selectedLayout) {
      case "landscape":
        return { width: 1600, height: 600 }
      case "portrait":
        return { width: 600, height: 1600 }
      case "full":
        return { width: 800, height: 1200 }
      default:
        return { width: 1200, height: 1200 }
    }
  }

  const handleLayoutChange = (newLayout: LayoutType) => {
    setLayout(newLayout)
    const dimensions = getDefaultDimensions(newLayout)
    setOptions((prev) => ({ ...prev, ...dimensions }))
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm" disabled={nfts.length === 0}>
      <Download className="h-4 w-4 mr-2" />
      Download Image
    </Button>
  )

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Download as Image</DialogTitle>
          <DialogDescription>
            Generate and download an image of your {nfts.length} selected NFT{nfts.length !== 1 ? "s" : ""} in your
            preferred layout
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Image Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Layout</Label>
                <Select value={layout} onValueChange={handleLayoutChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grid Layout</SelectItem>
                    <SelectItem value="landscape">Landscape (Horizontal)</SelectItem>
                    <SelectItem value="portrait">Portrait (Vertical)</SelectItem>
                    <SelectItem value="full">Full Size (Detailed)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="img-width">Width (px)</Label>
                  <Input
                    id="img-width"
                    type="number"
                    value={options.width}
                    onChange={(e) =>
                      setOptions((prev) => ({ ...prev, width: Number.parseInt(e.target.value) || 1200 }))
                    }
                    min="400"
                    max="4000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="img-height">Height (px)</Label>
                  <Input
                    id="img-height"
                    type="number"
                    value={options.height}
                    onChange={(e) =>
                      setOptions((prev) => ({ ...prev, height: Number.parseInt(e.target.value) || 1200 }))
                    }
                    min="400"
                    max="4000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select
                    value={options.format}
                    onValueChange={(value: "png" | "jpeg") => setOptions((prev) => ({ ...prev, format: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG (Lossless)</SelectItem>
                      <SelectItem value="jpeg">JPEG (Smaller file)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bg-color">Background Color</Label>
                  <Input
                    id="bg-color"
                    type="color"
                    value={options.background}
                    onChange={(e) => setOptions((prev) => ({ ...prev, background: e.target.value }))}
                  />
                </div>
              </div>

              {options.format === "jpeg" && (
                <div className="space-y-2">
                  <Label>Quality: {Math.round(options.quality! * 100)}%</Label>
                  <Slider
                    value={[options.quality! * 100]}
                    onValueChange={([value]) => setOptions((prev) => ({ ...prev, quality: value / 100 }))}
                    min={10}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              )}
            </CardContent>
          </Card>
{/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button onClick={handleGenerateImage} disabled={isGenerating || nfts.length === 0} className="min-w-32">
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Generate Image
                </>
              )}
            </Button>

            {generatedImage && (
              <Button onClick={handleDownloadImage} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Image
              </Button>
            )}
          </div>
          {/* Preview */}
          {imageUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <img
                    src={imageUrl || "/placeholder.svg"}
                    alt="Generated NFT Image"
                    className="max-w-full h-auto border rounded-lg"
                    style={{ maxHeight: "400px" }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          
        </div>
      </DialogContent>
    </Dialog>
  )
}
