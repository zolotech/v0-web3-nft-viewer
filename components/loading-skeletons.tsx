import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />
}

export function WalletDashboardSkeleton() {
  return (
    <Card className="w-full border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <SkeletonBlock className="h-5 w-44" />
          <SkeletonBlock className="h-6 w-20" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SkeletonBlock className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SkeletonBlock className="h-20 w-full" />
          <SkeletonBlock className="h-20 w-full" />
          <SkeletonBlock className="h-20 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export function CollectionDropdownSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <SkeletonBlock className="h-5 w-48" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SkeletonBlock className="h-10 w-full" />
        <SkeletonBlock className="h-16 w-full" />
      </CardContent>
    </Card>
  )
}

export function NFTGridSkeleton({ cards = 8 }: { cards?: number }) {
  return (
    <Card className="glow-effect">
      <CardHeader>
        <CardTitle>
          <SkeletonBlock className="h-6 w-56" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: cards }).map((_, index) => (
            <div key={index} className="space-y-3">
              <SkeletonBlock className="aspect-square w-full" />
              <SkeletonBlock className="h-4 w-2/3" />
              <SkeletonBlock className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

