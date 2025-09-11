// @ts-ignore - gif.js doesn't have proper TypeScript definitions
import GIF from "gif.js"
import type { NFT } from "@/app/page"

export interface GifOptions {
  width?: number
  height?: number
  delay?: number // milliseconds per frame
  quality?: number // 1-30, lower is better
  background?: string
}

export class NFTGifGenerator {
  private gif: any
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  constructor(options: GifOptions = {}) {
    const { width = 512, height = 512, delay = 2000, quality = 10, background = "#000000" } = options

    // Initialize GIF encoder
    this.gif = new GIF({
      workers: 2,
      quality: quality,
      width: width,
      height: height,
      background: background,
      transparent: null,
    })

    // Create canvas for rendering frames
    this.canvas = document.createElement("canvas")
    this.canvas.width = width
    this.canvas.height = height
    this.ctx = this.canvas.getContext("2d")!

    // Set default delay
    this.gif.setDelay(delay)
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

  private drawImageToCanvas(img: HTMLImageElement, nft: NFT) {
    // Clear canvas
    this.ctx.fillStyle = "#000000"
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Calculate image dimensions to fit canvas while maintaining aspect ratio
    const canvasAspect = this.canvas.width / this.canvas.height
    const imgAspect = img.width / img.height

    let drawWidth, drawHeight, drawX, drawY

    if (imgAspect > canvasAspect) {
      // Image is wider than canvas
      drawWidth = this.canvas.width
      drawHeight = this.canvas.width / imgAspect
      drawX = 0
      drawY = (this.canvas.height - drawHeight) / 2
    } else {
      // Image is taller than canvas
      drawHeight = this.canvas.height
      drawWidth = this.canvas.height * imgAspect
      drawX = (this.canvas.width - drawWidth) / 2
      drawY = 0
    }

    // Draw the NFT image
    this.ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)

    // Add text overlay with NFT info
    this.addTextOverlay(nft)
  }

  private addTextOverlay(nft: NFT) {
    const padding = 20
    const textHeight = 30

    // Semi-transparent background for text
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    this.ctx.fillRect(0, this.canvas.height - textHeight - padding, this.canvas.width, textHeight + padding)

    // NFT name
    this.ctx.fillStyle = "#ffffff"
    this.ctx.font = "bold 18px Arial"
    this.ctx.textAlign = "left"
    this.ctx.fillText(nft.name || "Untitled NFT", padding, this.canvas.height - padding / 2)

    // Token ID and blockchain
    this.ctx.font = "14px Arial"
    this.ctx.textAlign = "right"
    this.ctx.fillText(
      `#${nft.tokenId} • ${nft.blockchain}`,
      this.canvas.width - padding,
      this.canvas.height - padding / 2,
    )
  }

  async generateGif(nfts: NFT[]): Promise<Blob> {
    if (nfts.length === 0) {
      throw new Error("No NFTs provided for GIF generation")
    }

    console.log("[v0] Starting GIF generation with", nfts.length, "NFTs")

    // Load and add each NFT as a frame
    for (let i = 0; i < nfts.length; i++) {
      const nft = nfts[i]
      console.log("[v0] Processing NFT frame", i + 1, "of", nfts.length, ":", nft.name)

      try {
        const img = await this.loadImage(nft.image || "/placeholder.svg")
        this.drawImageToCanvas(img, nft)
        this.gif.addFrame(this.canvas, { copy: true })
      } catch (error) {
        console.error("[v0] Failed to load image for NFT:", nft.name, error)
        // Continue with next NFT instead of failing completely
      }
    }

    // Generate the GIF
    return new Promise((resolve, reject) => {
      this.gif.on("finished", (blob: Blob) => {
        console.log("[v0] GIF generation completed, size:", blob.size, "bytes")
        resolve(blob)
      })

      this.gif.on("progress", (progress: number) => {
        console.log("[v0] GIF generation progress:", Math.round(progress * 100) + "%")
      })

      this.gif.render()
    })
  }

  destroy() {
    // Clean up resources
    if (this.gif) {
      this.gif.abort()
    }
  }
}

export async function createNFTGif(nfts: NFT[], options?: GifOptions): Promise<Blob> {
  const generator = new NFTGifGenerator(options)
  try {
    return await generator.generateGif(nfts)
  } finally {
    generator.destroy()
  }
}
