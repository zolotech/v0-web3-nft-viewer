import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Key, Settings } from "lucide-react"

export function ApiSetupGuide() {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          API Setup Guide
        </CardTitle>
        <CardDescription>Configure your blockchain API keys to enable real NFT data fetching</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Key className="h-4 w-4" />
          <AlertDescription>
            To use real blockchain data, you need to set up API keys for the supported networks. Add these as
            environment variables in your Vercel project settings.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Ethereum</Badge>
              <span className="text-sm font-medium">Alchemy API</span>
            </div>
            <div className="text-sm space-y-2">
              <p>
                1. Sign up at{" "}
                <a href="https://alchemy.com" className="text-primary hover:underline inline-flex items-center gap-1">
                  alchemy.com <ExternalLink className="h-3 w-3" />
                </a>
              </p>
              <p>2. Create a new app for Ethereum Mainnet</p>
              <p>3. Copy your API key</p>
              <p>4. Set environment variable in Vercel Project Settings:</p>
              <code className="block bg-muted p-2 rounded text-xs">ALCHEMY_API_KEY=your_api_key_here</code>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Solana</Badge>
              <span className="text-sm font-medium">Helius API</span>
            </div>
            <div className="text-sm space-y-2">
              <p>
                1. Sign up at{" "}
                <a href="https://helius.dev" className="text-primary hover:underline inline-flex items-center gap-1">
                  helius.dev <ExternalLink className="h-3 w-3" />
                </a>
              </p>
              <p>2. Create a new project</p>
              <p>3. Copy your API key</p>
              <p>4. Set environment variable in Vercel Project Settings:</p>
              <code className="block bg-muted p-2 rounded text-xs">HELIUS_API_KEY=your_api_key_here</code>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Security Note</h4>
          <p className="text-sm text-muted-foreground">
            API keys are securely stored as server-side environment variables and never exposed to the client. All
            blockchain API calls are made through secure server endpoints.
          </p>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Coming Soon</h4>
          <div className="flex gap-2">
            <Badge variant="outline">Abstract</Badge>
            <Badge variant="outline">ApeChain</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            API integrations for Abstract and ApeChain will be added once their official APIs are available.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
