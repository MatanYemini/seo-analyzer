"use server"

import * as cheerio from "cheerio"

export type SeoAnalysisResult = {
  url: string
  timestamp: string
  metaTags: {
    title: string
    description: string
    robots: string
    canonical: string
    viewport: string
    ogTags: Record<string, string>
    twitterTags: Record<string, string>
  }
  headings: {
    h1: string[]
    h2: string[]
    h3: string[]
    h4: string[]
    h5: string[]
    h6: string[]
  }
  images: {
    total: number
    withAlt: number
    withoutAlt: number
    details: Array<{
      src: string
      alt: string
      hasAlt: boolean
    }>
  }
  links: {
    internal: number
    external: number
    details: Array<{
      url: string
      text: string
      isExternal: boolean
    }>
  }
  performance: {
    htmlSize: number
    resourceCount: {
      scripts: number
      stylesheets: number
      images: number
      iframes: number
    }
  }
  security: {
    https: boolean
  }
  structuredData: any[]
  contentAnalysis: {
    wordCount: number
    paragraphCount: number
    readabilityScore: number
  }
  overallScore: number
  issues: Array<{
    type: "critical" | "warning" | "info"
    message: string
    details?: string
  }>
  recommendations: Array<{
    priority: "high" | "medium" | "low"
    title: string
    description: string
    impact: string
  }>
}

export async function analyzeSeo(url: string): Promise<SeoAnalysisResult> {
  try {
    // Fetch the HTML content of the URL
    const response = await fetch(url, {
      headers: {
        "User-Agent": "SEO Analyzer Bot/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()
    const htmlSize = new Blob([html]).size

    // Parse the HTML with cheerio
    const $ = cheerio.load(html)

    // Extract meta tags
    const metaTags = {
      title: $("title").text() || "",
      description: $('meta[name="description"]').attr("content") || "",
      robots: $('meta[name="robots"]').attr("content") || "",
      canonical: $('link[rel="canonical"]').attr("href") || "",
      viewport: $('meta[name="viewport"]').attr("content") || "",
      ogTags: extractOpenGraphTags($),
      twitterTags: extractTwitterTags($),
    }

    // Extract headings
    const headings = {
      h1: $("h1")
        .map((_, el) => $(el).text().trim())
        .get(),
      h2: $("h2")
        .map((_, el) => $(el).text().trim())
        .get(),
      h3: $("h3")
        .map((_, el) => $(el).text().trim())
        .get(),
      h4: $("h4")
        .map((_, el) => $(el).text().trim())
        .get(),
      h5: $("h5")
        .map((_, el) => $(el).text().trim())
        .get(),
      h6: $("h6")
        .map((_, el) => $(el).text().trim())
        .get(),
    }

    // Extract images
    const images = extractImages($, url)

    // Extract links
    const links = extractLinks($, url)

    // Extract performance metrics
    const performance = {
      htmlSize,
      resourceCount: {
        scripts: $("script").length,
        stylesheets: $('link[rel="stylesheet"]').length,
        images: $("img").length,
        iframes: $("iframe").length,
      },
    }

    // Extract security info
    const security = {
      https: url.startsWith("https://"),
    }

    // Extract structured data
    const structuredData = extractStructuredData($)

    // Analyze content
    const contentAnalysis = analyzeContent($)

    // Generate issues
    const issues = generateIssues({
      metaTags,
      headings,
      images,
      links,
      performance,
      security,
      structuredData,
      contentAnalysis,
    })

    // Generate recommendations
    const recommendations = generateRecommendations({
      metaTags,
      headings,
      images,
      links,
      performance,
      security,
      structuredData,
      contentAnalysis,
      issues,
    })

    // Calculate overall score
    const overallScore = calculateOverallScore({
      metaTags,
      headings,
      images,
      links,
      performance,
      security,
      structuredData,
      contentAnalysis,
      issues,
    })

    // Create the result object
    const result: SeoAnalysisResult = {
      url,
      timestamp: new Date().toISOString(),
      metaTags,
      headings,
      images,
      links,
      performance,
      security,
      structuredData,
      contentAnalysis,
      overallScore,
      issues,
      recommendations,
    }

    // Store the result in the database or cache
    await storeAnalysisResult(url, result)

    return result
  } catch (error) {
    console.error("Error analyzing SEO:", error)
    throw new Error("Failed to analyze the website")
  }
}

function extractOpenGraphTags($: cheerio.CheerioAPI): Record<string, string> {
  const ogTags: Record<string, string> = {}

  $('meta[property^="og:"]').each((_, el) => {
    const property = $(el).attr("property")
    const content = $(el).attr("content")

    if (property && content) {
      ogTags[property] = content
    }
  })

  return ogTags
}

function extractTwitterTags($: cheerio.CheerioAPI): Record<string, string> {
  const twitterTags: Record<string, string> = {}

  $('meta[name^="twitter:"]').each((_, el) => {
    const name = $(el).attr("name")
    const content = $(el).attr("content")

    if (name && content) {
      twitterTags[name] = content
    }
  })

  return twitterTags
}

function extractImages($: cheerio.CheerioAPI, baseUrl: string) {
  const images = {
    total: $("img").length,
    withAlt: 0,
    withoutAlt: 0,
    details: [] as Array<{
      src: string
      alt: string
      hasAlt: boolean
    }>,
  }

  $("img").each((_, el) => {
    const src = $(el).attr("src") || ""
    const alt = $(el).attr("alt") || ""
    const hasAlt = alt.trim() !== ""

    if (hasAlt) {
      images.withAlt++
    } else {
      images.withoutAlt++
    }

    // Only include the first 50 images to avoid excessive data
    if (images.details.length < 50) {
      let fullSrc = src

      // Handle relative URLs
      if (src && !src.startsWith("http") && !src.startsWith("data:")) {
        const baseUrlObj = new URL(baseUrl)
        if (src.startsWith("/")) {
          fullSrc = `${baseUrlObj.origin}${src}`
        } else {
          fullSrc = `${baseUrlObj.origin}/${src}`
        }
      }

      images.details.push({
        src: fullSrc,
        alt,
        hasAlt,
      })
    }
  })

  return images
}

function extractLinks($: cheerio.CheerioAPI, baseUrl: string) {
  const baseUrlObj = new URL(baseUrl)
  const links = {
    internal: 0,
    external: 0,
    details: [] as Array<{
      url: string
      text: string
      isExternal: boolean
    }>,
  }

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || ""
    const text = $(el).text().trim()

    // Skip empty, javascript:, and anchor links
    if (!href || href.startsWith("javascript:") || href === "#") {
      return
    }

    let isExternal = false
    let fullHref = href

    // Handle relative URLs and determine if external
    if (!href.startsWith("http") && !href.startsWith("//")) {
      if (href.startsWith("/")) {
        fullHref = `${baseUrlObj.origin}${href}`
      } else {
        fullHref = `${baseUrlObj.origin}/${href}`
      }
      isExternal = false
    } else {
      try {
        const hrefUrl = new URL(href.startsWith("//") ? `https:${href}` : href)
        isExternal = hrefUrl.hostname !== baseUrlObj.hostname
      } catch (e) {
        // Invalid URL, consider it internal
        isExternal = false
      }
    }

    if (isExternal) {
      links.external++
    } else {
      links.internal++
    }

    // Only include the first 100 links to avoid excessive data
    if (links.details.length < 100) {
      links.details.push({
        url: fullHref,
        text,
        isExternal,
      })
    }
  })

  return links
}

function extractStructuredData($: cheerio.CheerioAPI) {
  const structuredData: any[] = []

  // Extract JSON-LD structured data
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || "{}")
      structuredData.push(json)
    } catch (e) {
      // Invalid JSON, skip
    }
  })

  return structuredData
}

function analyzeContent($: cheerio.CheerioAPI) {
  // Extract all text content
  const bodyText = $("body").text().replace(/\s+/g, " ").trim()
  const paragraphs = $("p").length

  // Simple word count
  const words = bodyText.split(/\s+/).filter(Boolean)
  const wordCount = words.length

  // Very simple readability score (0-100)
  // This is a simplified version of various readability formulas
  const avgWordsPerSentence = calculateAvgWordsPerSentence(bodyText)
  const avgWordLength = calculateAvgWordLength(words)

  // Lower values are better for readability
  const readabilityScore = Math.max(0, Math.min(100, 100 - avgWordsPerSentence * 2 - avgWordLength * 5))

  return {
    wordCount,
    paragraphCount: paragraphs,
    readabilityScore,
  }
}

function calculateAvgWordsPerSentence(text: string) {
  const sentences = text.split(/[.!?]+/).filter(Boolean)
  if (sentences.length === 0) return 0

  const totalWords = sentences.reduce((sum, sentence) => {
    return sum + sentence.split(/\s+/).filter(Boolean).length
  }, 0)

  return totalWords / sentences.length
}

function calculateAvgWordLength(words: string[]) {
  if (words.length === 0) return 0

  const totalLength = words.reduce((sum, word) => sum + word.length, 0)
  return totalLength / words.length
}

function generateIssues(data: any) {
  const issues: Array<{
    type: "critical" | "warning" | "info"
    message: string
    details?: string
  }> = []

  // Meta tag issues
  if (!data.metaTags.title) {
    issues.push({
      type: "critical",
      message: "Missing page title",
      details: "The page does not have a title tag, which is crucial for SEO.",
    })
  } else if (data.metaTags.title.length < 10) {
    issues.push({
      type: "warning",
      message: "Title tag is too short",
      details: `Current title (${data.metaTags.title.length} characters): "${data.metaTags.title}". Recommended length is 50-60 characters.`,
    })
  } else if (data.metaTags.title.length > 60) {
    issues.push({
      type: "warning",
      message: "Title tag is too long",
      details: `Current title (${data.metaTags.title.length} characters) may be truncated in search results. Recommended length is 50-60 characters.`,
    })
  }

  if (!data.metaTags.description) {
    issues.push({
      type: "warning",
      message: "Missing meta description",
      details:
        "The page does not have a meta description, which helps improve click-through rates from search results.",
    })
  } else if (data.metaTags.description.length < 50) {
    issues.push({
      type: "warning",
      message: "Meta description is too short",
      details: `Current description (${data.metaTags.description.length} characters). Recommended length is 150-160 characters.`,
    })
  } else if (data.metaTags.description.length > 160) {
    issues.push({
      type: "info",
      message: "Meta description is too long",
      details: `Current description (${data.metaTags.description.length} characters) may be truncated in search results. Recommended length is 150-160 characters.`,
    })
  }

  // Heading issues
  if (data.headings.h1.length === 0) {
    issues.push({
      type: "critical",
      message: "Missing H1 heading",
      details: "The page does not have an H1 heading, which is important for both SEO and accessibility.",
    })
  } else if (data.headings.h1.length > 1) {
    issues.push({
      type: "warning",
      message: "Multiple H1 headings",
      details: `The page has ${data.headings.h1.length} H1 headings. It's recommended to have only one H1 heading per page.`,
    })
  }

  // Image issues
  if (data.images.total > 0 && data.images.withoutAlt > 0) {
    const percentage = Math.round((data.images.withoutAlt / data.images.total) * 100)

    if (percentage > 50) {
      issues.push({
        type: "critical",
        message: "Many images missing alt text",
        details: `${data.images.withoutAlt} out of ${data.images.total} images (${percentage}%) are missing alt text, which is important for accessibility and SEO.`,
      })
    } else {
      issues.push({
        type: "warning",
        message: "Some images missing alt text",
        details: `${data.images.withoutAlt} out of ${data.images.total} images (${percentage}%) are missing alt text, which is important for accessibility and SEO.`,
      })
    }
  }

  // Security issues
  if (!data.security.https) {
    issues.push({
      type: "critical",
      message: "Website not using HTTPS",
      details:
        "The website is not using HTTPS, which is important for security and is a ranking factor for search engines.",
    })
  }

  // Performance issues
  if (data.performance.htmlSize > 100000) {
    issues.push({
      type: "warning",
      message: "Large HTML size",
      details: `The HTML size is ${Math.round(data.performance.htmlSize / 1024)} KB, which may impact page load speed. Consider optimizing the HTML.`,
    })
  }

  if (data.performance.resourceCount.scripts > 20) {
    issues.push({
      type: "warning",
      message: "High number of script tags",
      details: `The page has ${data.performance.resourceCount.scripts} script tags, which may impact page load speed. Consider combining or optimizing scripts.`,
    })
  }

  if (data.performance.resourceCount.stylesheets > 10) {
    issues.push({
      type: "warning",
      message: "High number of stylesheet links",
      details: `The page has ${data.performance.resourceCount.stylesheets} stylesheet links, which may impact page load speed. Consider combining stylesheets.`,
    })
  }

  // Content issues
  if (data.contentAnalysis.wordCount < 300) {
    issues.push({
      type: "warning",
      message: "Low word count",
      details: `The page has only ${data.contentAnalysis.wordCount} words. Search engines typically prefer content-rich pages with at least 300 words.`,
    })
  }

  if (data.contentAnalysis.readabilityScore < 30) {
    issues.push({
      type: "warning",
      message: "Poor readability score",
      details: "The content may be difficult to read. Consider simplifying sentences and using more common words.",
    })
  }

  // Social media issues
  if (Object.keys(data.metaTags.ogTags).length === 0) {
    issues.push({
      type: "info",
      message: "Missing Open Graph tags",
      details:
        "The page does not have Open Graph tags, which improve how the page appears when shared on social media.",
    })
  }

  if (Object.keys(data.metaTags.twitterTags).length === 0) {
    issues.push({
      type: "info",
      message: "Missing Twitter Card tags",
      details: "The page does not have Twitter Card tags, which improve how the page appears when shared on Twitter.",
    })
  }

  // Structured data issues
  if (data.structuredData.length === 0) {
    issues.push({
      type: "info",
      message: "No structured data found",
      details:
        "The page does not have any structured data (JSON-LD), which can help search engines understand the content better.",
    })
  }

  return issues
}

function generateRecommendations(data: any) {
  const recommendations: Array<{
    priority: "high" | "medium" | "low"
    title: string
    description: string
    impact: string
  }> = []

  // Process critical issues first
  data.issues.forEach((issue: any) => {
    if (issue.type === "critical") {
      switch (issue.message) {
        case "Missing page title":
          recommendations.push({
            priority: "high",
            title: "Add a page title",
            description:
              "Create a descriptive title tag that accurately summarizes the page content in 50-60 characters.",
            impact: "High impact on search rankings and click-through rates",
          })
          break

        case "Missing H1 heading":
          recommendations.push({
            priority: "high",
            title: "Add an H1 heading",
            description: "Add a primary H1 heading that clearly describes the main topic of the page.",
            impact: "Improves content structure and helps search engines understand your page",
          })
          break

        case "Many images missing alt text":
          recommendations.push({
            priority: "high",
            title: "Add alt text to images",
            description: "Add descriptive alt text to all images that conveys their content and function.",
            impact: "Improves accessibility and helps search engines understand image content",
          })
          break

        case "Website not using HTTPS":
          recommendations.push({
            priority: "high",
            title: "Switch to HTTPS",
            description: "Implement SSL/TLS and redirect all HTTP traffic to HTTPS.",
            impact: "Improves security, user trust, and is a ranking factor for search engines",
          })
          break
      }
    }
  })

  // Process warnings
  data.issues.forEach((issue: any) => {
    if (issue.type === "warning") {
      switch (issue.message) {
        case "Missing meta description":
          recommendations.push({
            priority: "medium",
            title: "Add a meta description",
            description: "Create a compelling meta description of 150-160 characters that summarizes the page content.",
            impact: "Improves click-through rates from search results",
          })
          break

        case "Title tag is too short":
        case "Title tag is too long":
          recommendations.push({
            priority: "medium",
            title: "Optimize page title length",
            description:
              "Adjust your title to be between 50-60 characters to ensure it displays properly in search results.",
            impact: "Ensures your full title is visible in search results",
          })
          break

        case "Multiple H1 headings":
          recommendations.push({
            priority: "medium",
            title: "Use only one H1 heading",
            description: "Consolidate multiple H1 headings into a single, descriptive H1 heading.",
            impact: "Clarifies the main topic of your page for search engines",
          })
          break

        case "Some images missing alt text":
          recommendations.push({
            priority: "medium",
            title: "Add alt text to remaining images",
            description: "Add descriptive alt text to all images that are missing it.",
            impact: "Improves accessibility and image search visibility",
          })
          break

        case "Large HTML size":
          recommendations.push({
            priority: "medium",
            title: "Reduce HTML size",
            description: "Minimize HTML by removing unnecessary comments, whitespace, and inline scripts/styles.",
            impact: "Improves page load speed and user experience",
          })
          break

        case "High number of script tags":
          recommendations.push({
            priority: "medium",
            title: "Optimize JavaScript usage",
            description: "Combine multiple script files, use async/defer attributes, and remove unused scripts.",
            impact: "Reduces render-blocking resources and improves page speed",
          })
          break

        case "Low word count":
          recommendations.push({
            priority: "medium",
            title: "Expand content depth",
            description: "Add more comprehensive, valuable content to reach at least 300-500 words.",
            impact: "Helps search engines understand the topic and may improve rankings",
          })
          break
      }
    }
  })

  // Process info issues
  data.issues.forEach((issue: any) => {
    if (issue.type === "info") {
      switch (issue.message) {
        case "Missing Open Graph tags":
          recommendations.push({
            priority: "low",
            title: "Add Open Graph tags",
            description: "Implement og:title, og:description, og:image, and og:url tags for better social sharing.",
            impact: "Improves appearance when shared on social media platforms",
          })
          break

        case "Missing Twitter Card tags":
          recommendations.push({
            priority: "low",
            title: "Add Twitter Card tags",
            description: "Implement twitter:card, twitter:title, twitter:description, and twitter:image tags.",
            impact: "Improves appearance when shared on Twitter",
          })
          break

        case "No structured data found":
          recommendations.push({
            priority: "low",
            title: "Implement structured data",
            description: "Add JSON-LD structured data appropriate for your content type (e.g., Article, Product, FAQ).",
            impact: "Enables rich results in search and helps search engines understand content",
          })
          break
      }
    }
  })

  // Add general recommendations if we have few specific ones
  if (recommendations.length < 3) {
    recommendations.push({
      priority: "medium",
      title: "Improve internal linking",
      description: "Add more contextual internal links to help users and search engines navigate your site.",
      impact: "Improves site structure and helps distribute page authority",
    })

    recommendations.push({
      priority: "low",
      title: "Optimize for mobile",
      description: "Ensure your site is fully responsive and provides a good experience on all devices.",
      impact: "Mobile-friendliness is a ranking factor for search engines and affects user experience",
    })

    recommendations.push({
      priority: "low",
      title: "Improve page load speed",
      description: "Optimize images, leverage browser caching, and minimize render-blocking resources.",
      impact: "Faster pages rank better and provide better user experience",
    })
  }

  return recommendations
}

function calculateOverallScore(data: any) {
  // Calculate a score from 0-100 based on various factors
  let score = 100

  // Deduct points for critical issues
  const criticalIssues = data.issues.filter((issue: any) => issue.type === "critical").length
  score -= criticalIssues * 15

  // Deduct points for warnings
  const warningIssues = data.issues.filter((issue: any) => issue.type === "warning").length
  score -= warningIssues * 5

  // Deduct points for info issues
  const infoIssues = data.issues.filter((issue: any) => issue.type === "info").length
  score -= infoIssues * 2

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score))
}

async function storeAnalysisResult(url: string, result: SeoAnalysisResult) {
  // In a real application, this would store the result in a database
  // For this example, we'll just log it
  console.log(`Stored analysis result for ${url}`)

  // In a real implementation, you might use:
  // - Server-side caching
  // - Database storage
  // - Redis or other key-value store

  return true
}

