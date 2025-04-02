"use client"

export function PieChartFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="h-20 w-20 mx-auto mb-4 rounded-full bg-muted animate-pulse"></div>
        <p className="text-sm text-muted-foreground">Chart visualization</p>
      </div>
    </div>
  )
}

export function BarChartFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center w-full px-8">
        <div className="flex items-end justify-between h-40 w-full">
          {[65, 40, 85, 30, 70, 50].map((height, i) => (
            <div key={i} className="bg-muted animate-pulse w-8" style={{ height: `${height}%` }}></div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-4">Chart visualization</p>
      </div>
    </div>
  )
}

