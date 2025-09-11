"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { NFT } from "@/app/page"

interface SelectedNFTsContextType {
  selectedNFTs: NFT[]
  addNFT: (nft: NFT) => void
  removeNFT: (nftId: string) => void
  isSelected: (nftId: string) => boolean
  clearAll: () => void
  count: number
}

const SelectedNFTsContext = createContext<SelectedNFTsContextType | undefined>(undefined)

export function SelectedNFTsProvider({ children }: { children: ReactNode }) {
  const [selectedNFTs, setSelectedNFTs] = useState<NFT[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("selectedNFTs")
      if (stored) {
        const parsedNFTs = JSON.parse(stored)
        console.log("[v0] Loaded selected NFTs from localStorage:", parsedNFTs.length)
        setSelectedNFTs(parsedNFTs)
      }
    } catch (error) {
      console.error("[v0] Error loading selected NFTs from localStorage:", error)
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("selectedNFTs", JSON.stringify(selectedNFTs))
        console.log("[v0] Saved selected NFTs to localStorage:", selectedNFTs.length)
      } catch (error) {
        console.error("[v0] Error saving selected NFTs to localStorage:", error)
      }
    }
  }, [selectedNFTs, isLoaded])

  const addNFT = (nft: NFT) => {
    console.log("[v0] Adding NFT to selection:", nft.name)
    setSelectedNFTs((prev) => {
      // Check if NFT is already selected
      if (prev.some((selected) => selected.id === nft.id)) {
        console.log("[v0] NFT already selected, skipping")
        return prev
      }
      const newSelection = [...prev, nft]
      console.log("[v0] New selection count:", newSelection.length)
      return newSelection
    })
  }

  const removeNFT = (nftId: string) => {
    console.log("[v0] Removing NFT from selection:", nftId)
    setSelectedNFTs((prev) => {
      const newSelection = prev.filter((nft) => nft.id !== nftId)
      console.log("[v0] New selection count after removal:", newSelection.length)
      return newSelection
    })
  }

  const isSelected = (nftId: string) => {
    return selectedNFTs.some((nft) => nft.id === nftId)
  }

  const clearAll = () => {
    console.log("[v0] Clearing all selected NFTs")
    setSelectedNFTs([])
  }

  if (!isLoaded) {
    return null
  }

  return (
    <SelectedNFTsContext.Provider
      value={{
        selectedNFTs,
        addNFT,
        removeNFT,
        isSelected,
        clearAll,
        count: selectedNFTs.length,
      }}
    >
      {children}
    </SelectedNFTsContext.Provider>
  )
}

export function useSelectedNFTs() {
  const context = useContext(SelectedNFTsContext)
  if (context === undefined) {
    throw new Error("useSelectedNFTs must be used within a SelectedNFTsProvider")
  }
  return context
}
