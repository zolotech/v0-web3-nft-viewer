"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Twitter } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const collections = [
  {
    name: "AIFrogz",
    description: "The flagship NFT collection from CyberMaster Academy. A unique collection of 333 AI-generated frog characters living on the Ethereum blockchain.",
    size: 333,
    blockchain: "Ethereum",
    status: "Live",
    openSeaUrl: "https://opensea.io/collection/aifrogz-1",
    twitterUrl: null,
    image: "/images/aifrogz-205.jpeg",
    featured: true,
  },
  {
    name: "Frogz on Ape",
    description: "The next evolution of the Frogz universe is hopping onto ApeChain. A brand new collection bringing the beloved frog characters to the ApeCoin ecosystem.",
    size: null,
    blockchain: "ApeChain",
    status: "Coming Soon",
    openSeaUrl: null,
    twitterUrl: "https://x.com/FrogzonApe",
    image: "/images/frogz-on-ape-4490.jpeg",
    featured: false,
  },
]

export default function CollectionsPage() {
  return (
    <div
      style={{
        backgroundImage: "url('/bggrid1.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        backgroundColor: "var(--background)",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "oklch(0.7 0.15 200 / 0.2)",
          zIndex: -1,
        }}
      ></div>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="glow-effect">
              <CardHeader className="text-center">
                <CardTitle>
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                    <span className="text-primary">CyberMaster</span>{" "}
                    <span className="text-secondary">Academy</span>{" "}
                    <span className="text-accent">Collections</span>
                  </h1>
                </CardTitle>
                <CardDescription className="text-lg">
                  Explore our official NFT collections. From AI-generated art to cross-chain innovations, 
                  discover unique digital assets crafted by the CyberMaster community.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-2">
          {collections.map((collection) => (
            <Card 
              key={collection.name} 
              className={`nft-card-hover overflow-hidden ${collection.featured ? 'ring-2 ring-primary' : ''}`}
            >
              <div className="relative h-64 bg-muted overflow-hidden">
                <Image
                  src={collection.image}
                  alt={collection.name}
                  fill
                  className="object-cover"
                />
                {collection.featured && (
                  <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                    Featured Collection
                  </Badge>
                )}
                <Badge 
                  className={`absolute top-4 right-4 ${
                    collection.status === "Live" 
                      ? "bg-green-500/90 text-white" 
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {collection.status}
                </Badge>
              </div>
              
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{collection.name}</span>
                  <Badge variant="outline">{collection.blockchain}</Badge>
                </CardTitle>
                <CardDescription>{collection.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-4">
                  {collection.size && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Collection Size:</span>{" "}
                      <span className="font-semibold text-foreground">{collection.size} NFTs</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {collection.openSeaUrl && (
                    <Button asChild variant="default" size="sm">
                      <Link href={collection.openSeaUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on OpenSea
                      </Link>
                    </Button>
                  )}
                  {collection.twitterUrl && (
                    <Button asChild variant="outline" size="sm">
                      <Link href={collection.twitterUrl} target="_blank" rel="noopener noreferrer">
                        <Twitter className="h-4 w-4 mr-2" />
                        Follow on X
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-4xl mx-auto mt-12">
          <Card className="glow-effect">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Join the Community</CardTitle>
              <CardDescription>
                Connect with CyberMaster Academy on social media to stay updated on new collections, 
                drops, and exclusive community events.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="default" size="lg">
                <Link href="https://x.com/CyberMasterMSc" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-5 w-5 mr-2" />
                  Follow on X
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="https://discord.gg/DFAHZwpRKH" target="_blank" rel="noopener noreferrer">
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                  Join Discord
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
