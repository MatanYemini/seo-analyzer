import { Suspense } from "react"
import { notFound } from "next/navigation"
import { SeoResults } from "@/components/seo-results"
import { SeoResultsSkeleton } from "@/components/seo-results-skeleton"
import { analyzeSeo } from "@/lib/analyze-seo"

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: { url?: string }
}) {
  const url = searchParams.url

  if (!url) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8 mx-auto">
        <h1 className="text-2xl font-bold mb-6">SEO Analysis Results</h1>
        <p className="text-muted-foreground mb-8">
          Analysis for: <span className="font-medium text-foreground">{url}</span>
        </p>

        <Suspense fallback={<SeoResultsSkeleton />}>
          <SeoResultsWrapper url={url} />
        </Suspense>
      </div>
    </div>
  )
}

async function SeoResultsWrapper({ url }: { url: string }) {
  try {
    const results = await analyzeSeo(url)
    return <SeoResults results={results} />
  } catch (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Analysis Failed</h2>
        <p className="text-muted-foreground">We encountered an error while analyzing {url}. Please try again.</p>
      </div>
    )
  }
}

