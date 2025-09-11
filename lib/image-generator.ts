import type { NFT } from "@/app/page"

export interface ImageOptions {
  width?: number
  height?: number
  format?: "png" | "jpeg"
  quality?: number // 0-1 for JPEG quality
  background?: string
  padding?: number
}

export type LayoutType = "grid" | "landscape" | "portrait" | "full"

export class NFTImageGenerator {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  constructor() {
    this.canvas = document.createElement("canvas")
    this.ctx = this.canvas.getContext("2d")!
  }

  private async loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }

  private calculateGridDimensions(nftCount: number): { cols: number; rows: number } {
    if (nftCount <= 1) return { cols: 1, rows: 1 }
    if (nftCount <= 4) return { cols: 2, rows: 2 }
    if (nftCount <= 9) return { cols: 3, rows: 3 }
    if (nftCount <= 16) return { cols: 4, rows: 4 }

    // For larger collections, use a more rectangular layout
    const cols = Math.ceil(Math.sqrt(nftCount * 1.5))
    const rows = Math.ceil(nftCount / cols)
    return { cols, rows }
  }

  private drawNFTImage(
    img: HTMLImageElement,
    x: number,
    y: number,
    width: number,
    height: number,
    nft: NFT,
    showLabels = true,
  ) {
    // Draw image with aspect ratio preservation
    const imgAspect = img.width / img.height
    const containerAspect = width / height

    let drawWidth, drawHeight, drawX, drawY

    if (imgAspect > containerAspect) {
      drawWidth = width
      drawHeight = width / imgAspect
      drawX = x
      drawY = y + (height - drawHeight) / 2
    } else {
      drawHeight = height
      drawWidth = height * imgAspect
      drawX = x + (width - drawWidth) / 2
      drawY = y
    }

    // Draw the image
    this.ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)

    // Add label if requested
    if (showLabels) {
      this.addImageLabel(nft, x, y, width, height)
    }
  }

  private addImageLabel(nft: NFT, x: number, y: number, width: number, height: number) {
    const labelHeight = 40
    const padding = 8

    // Semi-transparent background
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
    this.ctx.fillRect(x, y + height - labelHeight, width, labelHeight)

    // NFT name
    this.ctx.fillStyle = "#ffffff"
    this.ctx.font = "bold 14px Arial"
    this.ctx.textAlign = "left"
    this.ctx.fillText(nft.name || "Untitled NFT", x + padding, y + height - labelHeight + 18)

    // Token ID
    this.ctx.font = "12px Arial"
    this.ctx.textAlign = "right"
    this.ctx.fillText(`#${nft.tokenId}`, x + width - padding, y + height - labelHeight + 18)

    // Blockchain
    this.ctx.textAlign = "right"
    this.ctx.fillText(nft.blockchain, x + width - padding, y + height - labelHeight + 32)
  }

  async generateGridLayout(nfts: NFT[], options: ImageOptions = {}): Promise<Blob> {
    const { width = 1200, height = 1200, format = "png", quality = 0.9, background = "#000000", padding = 20 } = options

    const { cols, rows } = this.calculateGridDimensions(nfts.length)

    this.canvas.width = width
    this.canvas.height = height

    // Fill background
    this.ctx.fillStyle = background
    this.ctx.fillRect(0, 0, width, height)

    const cellWidth = (width - padding * (cols + 1)) / cols
    const cellHeight = (height - padding * (rows + 1)) / rows

    console.log("[v0] Generating grid layout:", cols, "x", rows, "for", nfts.length, "NFTs")

    // Load and draw each NFT
    for (let i = 0; i < nfts.length; i++) {
      const nft = nfts[i]
      const col = i % cols
      const row = Math.floor(i / cols)

      const x = padding + col * (cellWidth + padding)
      const y = padding + row * (cellHeight + padding)

      try {
        const img = await this.loadImage(nft.image || "/placeholder.svg")
        this.drawNFTImage(img, x, y, cellWidth, cellHeight, nft)
      } catch (error) {
        console.error("[v0] Failed to load image for NFT:", nft.name, error)
      }
    }

    return this.canvasToBlob(format, quality)
  }

  async generateLandscapeLayout(nfts: NFT[], options: ImageOptions = {}): Promise<Blob> {
    const { width = 1600, height = 600, format = "png", quality = 0.9, background = "#000000", padding = 20 } = options

    this.canvas.width = width
    this.canvas.height = height

    // Fill background
    this.ctx.fillStyle = background
    this.ctx.fillRect(0, 0, width, height)

    const cellWidth = (width - padding * (nfts.length + 1)) / nfts.length
    const cellHeight = height - padding * 2

    console.log("[v0] Generating landscape layout for", nfts.length, "NFTs")

    // Load and draw each NFT horizontally
    for (let i = 0; i < nfts.length; i++) {
      const nft = nfts[i]
      const x = padding + i * (cellWidth + padding)
      const y = padding

      try {
        const img = await this.loadImage(nft.image || "/placeholder.svg")
        this.drawNFTImage(img, x, y, cellWidth, cellHeight, nft)
      } catch (error) {
        console.error("[v0] Failed to load image for NFT:", nft.name, error)
      }
    }

    return this.canvasToBlob(format, quality)
  }

  async generatePortraitLayout(nfts: NFT[], options: ImageOptions = {}): Promise<Blob> {
    const { width = 600, height = 1600, format = "png", quality = 0.9, background = "#000000", padding = 20 } = options

    this.canvas.width = width
    this.canvas.height = height

    // Fill background
    this.ctx.fillStyle = background
    this.ctx.fillRect(0, 0, width, height)

    const cellWidth = width - padding * 2
    const cellHeight = (height - padding * (nfts.length + 1)) / nfts.length

    console.log("[v0] Generating portrait layout for", nfts.length, "NFTs")

    // Load and draw each NFT vertically
    for (let i = 0; i < nfts.length; i++) {
      const nft = nfts[i]
      const x = padding
      const y = padding + i * (cellHeight + padding)

      try {
        const img = await this.loadImage(nft.image || "/placeholder.svg")
        this.drawNFTImage(img, x, y, cellWidth, cellHeight, nft)
      } catch (error) {
        console.error("[v0] Failed to load image for NFT:", nft.name, error)
      }
    }

    return this.canvasToBlob(format, quality)
  }

  async generateFullLayout(nfts: NFT[], options: ImageOptions = {}): Promise<Blob> {
    const { width = 800, format = "png", quality = 0.9, background = "#000000", padding = 40 } = options

    // Calculate total height needed
    const nftHeight = 600
    const labelHeight = 100
    const totalHeight = nfts.length * (nftHeight + labelHeight + padding) + padding

    this.canvas.width = width
    this.canvas.height = totalHeight

    // Fill background
    this.ctx.fillStyle = background
    this.ctx.fillRect(0, 0, width, totalHeight)

    console.log("[v0] Generating full layout for", nfts.length, "NFTs")

    let currentY = padding

    // Load and draw each NFT with full details
    for (let i = 0; i < nfts.length; i++) {
      const nft = nfts[i]

      try {
        const img = await this.loadImage(nft.image || "/placeholder.svg")

        // Draw image
        this.drawNFTImage(img, padding, currentY, width - padding * 2, nftHeight, nft, false)

        // Add detailed label
        this.addDetailedLabel(nft, padding, currentY + nftHeight, width - padding * 2, labelHeight)

        currentY += nftHeight + labelHeight + padding
      } catch (error) {
        console.error("[v0] Failed to load image for NFT:", nft.name, error)
        currentY += nftHeight + labelHeight + padding
      }
    }

    return this.canvasToBlob(format, quality)
  }

  private addDetailedLabel(nft: NFT, x: number, y: number, width: number, height: number) {
    const padding = 16

    // Background
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.1)"
    this.ctx.fillRect(x, y, width, height)

    // NFT name
    this.ctx.fillStyle = "#ffffff"
    this.ctx.font = "bold 24px Arial"
    this.ctx.textAlign = "left"
    this.ctx.fillText(nft.name || "Untitled NFT", x + padding, y + 30)

    // Details
    this.ctx.font = "16px Arial"
    this.ctx.fillText(`Token ID: ${nft.tokenId}`, x + padding, y + 55)
    this.ctx.fillText(`Blockchain: ${nft.blockchain}`, x + padding, y + 75)

    // Contract address (truncated)
    if (nft.contractAddress) {
      const truncated = `${nft.contractAddress.slice(0, 10)}...${nft.contractAddress.slice(-8)}`
      this.ctx.fillText(`Contract: ${truncated}`, x + width - 300, y + 55)
    }
  }

  private canvasToBlob(format: "png" | "jpeg", quality: number): Promise<Blob> {
    return new Promise((resolve) => {
      this.canvas.toBlob((blob) => resolve(blob!), format === "jpeg" ? "image/jpeg" : "image/png", quality)
    })
  }
}

export async function createNFTImage(nfts: NFT[], layout: LayoutType, options?: ImageOptions): Promise<Blob> {
  const generator = new NFTImageGenerator()

  switch (layout) {
    case "grid":
      return generator.generateGridLayout(nfts, options)
    case "landscape":
      return generator.generateLandscapeLayout(nfts, options)
    case "portrait":
      return generator.generatePortraitLayout(nfts, options)
    case "full":
      return generator.generateFullLayout(nfts, options)
    default:
      return generator.generateGridLayout(nfts, options)
  }
}
