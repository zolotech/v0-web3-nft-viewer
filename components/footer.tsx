export function Footer() {
  return (
    <footer className="border-t bg-muted/50 mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Web3 NFT Viewer</h3>
            <p className="text-sm text-muted-foreground">
              Explore your digital assets across multiple blockchains with ease.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Supported Chains</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Ethereum</li>
              <li>Solana</li>
              <li>Abstract</li>
              <li>ApeChain</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Documentation</li>
              <li>API Reference</li>
              <li>Support</li>
              <li>Status</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Cookie Policy</li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Web3 NFT Viewer. Built with Next.js and powered by blockchain APIs.</p>
        </div>
      </div>
    </footer>
  )
}
