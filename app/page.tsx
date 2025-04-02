import { UrlForm } from "@/components/url-form"
import { SeoHero } from "@/components/seo-hero"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      <SeoHero />
      <div className="container px-4 py-12 mx-auto">
        <UrlForm />
      </div>
    </div>
  )
}

