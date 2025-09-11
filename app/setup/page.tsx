import { ApiSetupGuide } from "@/components/api-setup-guide"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">API Setup</h1>
          <p className="text-muted-foreground">Configure your blockchain API keys to start viewing real NFT data</p>
        </div>

        <ApiSetupGuide />
      </main>

      <Footer />
    </div>
  )
}
