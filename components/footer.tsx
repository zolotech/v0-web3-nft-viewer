import Link from "next/link"
import { Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t bg-muted/90 mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Image 
                src="/images/frog-logo-color.png" 
                alt="CyberMaster Academy" 
                width={48} 
                height={48}
                className="rounded-full"
              />
              <h3 className="text-lg font-semibold">CyberMaster Academy</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Explore NFT collections and your digital assets across multiple blockchains.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Collections</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="https://opensea.io/collection/aifrogz-1" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  AIFrogz (333 NFTs)
                </Link>
              </li>
              <li>
                <Link href="https://x.com/FrogzonApe" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  Frogz on Ape (Coming Soon)
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Supported Chains</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Ethereum</li>
              <li>Solana (coming soon)</li>
              <li>Abstract (coming soon)</li>
              <li>ApeChain (coming soon)</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Community</h4>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                <Link href="https://x.com/CyberMasterMSc" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                <Link href="https://discord.gg/DFAHZwpRKH" target="_blank" rel="noopener noreferrer">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 CyberMaster Academy. Built by Zolo with blockchain APIs.</p>
        </div>
      </div>
    </footer>
  )
}
