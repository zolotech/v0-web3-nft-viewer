import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { SelectedNFTsProvider } from "@/contexts/selected-nfts-context"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Web3 NFT Viewer - Explore Your Digital Assets",
  description:
    "View your NFT collections across multiple blockchains including Ethereum, Solana, Abstract, and ApeChain",
  generator: "v0.app",
  keywords: ["NFT", "Web3", "Ethereum", "Solana", "Blockchain", "Digital Assets"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <SelectedNFTsProvider>{children}</SelectedNFTsProvider>
          </ThemeProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
