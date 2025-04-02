"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { analyzeSeo } from "@/lib/analyze-seo"

export function UrlForm() {
  const [url, setUrl] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Basic URL validation
    if (!url) {
      setError("Please enter a URL")
      return
    }

    let formattedUrl = url
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      formattedUrl = `https://${url}`
    }

    try {
      // Validate URL format
      new URL(formattedUrl)

      setIsAnalyzing(true)

      try {
        // Call the server action to analyze the URL
        await analyzeSeo(formattedUrl)

        // Redirect to results page
        router.push(`/results?url=${encodeURIComponent(formattedUrl)}`)
      } catch (err) {
        console.error(err)
        setError("Failed to analyze the website. Please try again.")
        setIsAnalyzing(false)
      }
    } catch (err) {
      setError("Please enter a valid URL")
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="url" className="text-sm font-medium">
              Enter a website URL to analyze
            </label>
            <div className="flex w-full items-center space-x-2">
              <Input
                id="url"
                type="text"
                placeholder="example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <>
                    <span className="mr-2">Analyzing</span>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <div className="text-xs text-muted-foreground">
            <p>
              This tool will analyze the provided URL for SEO factors including meta tags, headings, images, page speed,
              mobile responsiveness, and more.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

