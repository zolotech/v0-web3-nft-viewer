import type { NFTCollection, NFT, Blockchain } from "@/app/page"

// Client-side API functions that call our secure server endpoints
export async function fetchNFTsByBlockchain(
  walletAddress: string,
  blockchain: Blockchain,
): Promise<{ collections: NFTCollection[]; nfts: NFT[]; totalNfts: number; transactionCount: number }> {
  const response = await fetch("/api/nfts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      walletAddress,
      blockchain,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to fetch NFTs")
  }

  return response.json()
}

// Function to get NFTs for a specific collection
export async function fetchNFTsForCollection(walletAddress: string, collection: NFTCollection): Promise<NFT[]> {
  const { nfts } = await fetchNFTsByBlockchain(walletAddress, collection.blockchain)
  return nfts.filter((nft) => nft.contractAddress === collection.contractAddress)
}
