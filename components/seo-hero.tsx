import { Search } from "lucide-react"

export function SeoHero() {
  return (
    <div className="bg-background py-12 border-b">
      <div className="container px-4 mx-auto text-center">
        <div className="inline-flex items-center justify-center p-2 mb-4 rounded-full bg-primary/10">
          <Search className="w-5 h-5 mr-2 text-primary" />
          <span className="text-sm font-medium text-primary">SEO Analyzer</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">Comprehensive SEO Analysis</h1>
        <p className="max-w-2xl mx-auto mt-4 text-xl text-muted-foreground">
          Analyze any website for technical and content SEO factors. Get actionable insights to improve your search
          rankings.
        </p>
      </div>
    </div>
  )
}

