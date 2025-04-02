"use client"

import type React from "react"

import { useState } from "react"
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Download,
  ExternalLink,
  FileText,
  ImageIcon,
  Info,
  LinkIcon,
  Shield,
  X,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartWrapper } from "@/components/chart-wrapper"
import { PieChartFallback, BarChartFallback } from "@/components/fallback-charts"
import type { SeoAnalysisResult } from "@/lib/analyze-seo"

// Dynamic imports for the charts to avoid SSR issues
import dynamic from "next/dynamic"

const PieChart = dynamic(() => import("@/components/charts/pie-chart"), {
  ssr: false,
  loading: () => <PieChartFallback />,
})

const BarChart = dynamic(() => import("@/components/charts/bar-chart"), {
  ssr: false,
  loading: () => <BarChartFallback />,
})

export function SeoResults({ results }: { results: SeoAnalysisResult }) {
  const [activeTab, setActiveTab] = useState("overview")

  const handleDownloadReport = () => {
    // In a real implementation, this would generate a PDF or CSV report
    alert("This would download a PDF report in a real implementation")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">SEO Health Score: {results.overallScore}</h2>
          <p className="text-muted-foreground">{getScoreDescription(results.overallScore)}</p>
        </div>
        <Button onClick={handleDownloadReport}>
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <ScoreCard
          title="Critical Issues"
          count={results.issues.filter((i) => i.type === "critical").length}
          icon={<X className="h-4 w-4" />}
          color="destructive"
        />
        <ScoreCard
          title="Warnings"
          count={results.issues.filter((i) => i.type === "warning").length}
          icon={<AlertTriangle className="h-4 w-4" />}
          color="warning"
        />
        <ScoreCard
          title="Suggestions"
          count={results.issues.filter((i) => i.type === "info").length}
          icon={<Info className="h-4 w-4" />}
          color="info"
        />
        <ScoreCard
          title="Passed Checks"
          count={10 - results.issues.length}
          icon={<Check className="h-4 w-4" />}
          color="success"
        />
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full max-w-3xl overflow-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="meta">Meta Tags</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Issue Breakdown</CardTitle>
                <CardDescription>Distribution of SEO issues by severity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartWrapper content={PieChart} className="h-full" title="Issue breakdown chart" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>SEO Score by Category</CardTitle>
                <CardDescription>Performance across different SEO aspects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartWrapper content={BarChart} className="h-full" title="SEO score by category" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Issues</CardTitle>
              <CardDescription>The most important issues to address</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.issues.slice(0, 5).map((issue, index) => (
                  <div key={index} className="flex items-start gap-3">
                    {issue.type === "critical" ? (
                      <div className="mt-0.5 rounded-full bg-destructive/20 p-1">
                        <X className="h-3 w-3 text-destructive" />
                      </div>
                    ) : issue.type === "warning" ? (
                      <div className="mt-0.5 rounded-full bg-yellow-100 p-1">
                        <AlertTriangle className="h-3 w-3 text-yellow-600" />
                      </div>
                    ) : (
                      <div className="mt-0.5 rounded-full bg-blue-100 p-1">
                        <Info className="h-3 w-3 text-blue-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{issue.message}</p>
                      <p className="text-sm text-muted-foreground">{issue.details}</p>
                    </div>
                  </div>
                ))}

                {results.issues.length > 5 && (
                  <Button variant="outline" onClick={() => setActiveTab("issues")} className="w-full">
                    View All Issues
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Issues</CardTitle>
              <CardDescription>Complete list of SEO issues found on the page</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {results.issues.length > 0 ? (
                  results.issues.map((issue, index) => (
                    <AccordionItem key={index} value={`issue-${index}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          {issue.type === "critical" ? (
                            <Badge variant="destructive">Critical</Badge>
                          ) : issue.type === "warning" ? (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                              Warning
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                              Info
                            </Badge>
                          )}
                          <span>{issue.message}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-10 pt-2">
                          <p className="text-muted-foreground">{issue.details}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-muted-foreground">No issues found!</p>
                  </div>
                )}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meta" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Meta Tags</CardTitle>
                <CardDescription>Basic meta information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Title</h3>
                    <p className="mt-1 text-sm">{results.metaTags.title || "Not set"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {results.metaTags.title ? `${results.metaTags.title.length} characters` : ""}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium">Description</h3>
                    <p className="mt-1 text-sm">{results.metaTags.description || "Not set"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {results.metaTags.description ? `${results.metaTags.description.length} characters` : ""}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium">Canonical URL</h3>
                    <p className="mt-1 text-sm">{results.metaTags.canonical || "Not set"}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium">Robots</h3>
                    <p className="mt-1 text-sm">{results.metaTags.robots || "Not set"}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium">Viewport</h3>
                    <p className="mt-1 text-sm">{results.metaTags.viewport || "Not set"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Media Tags</CardTitle>
                <CardDescription>Open Graph and Twitter Card tags</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Open Graph Tags</h3>
                    {Object.keys(results.metaTags.ogTags).length > 0 ? (
                      <div className="space-y-2">
                        {Object.entries(results.metaTags.ogTags).map(([key, value]) => (
                          <div key={key} className="grid grid-cols-3 gap-2 text-sm">
                            <div className="font-medium">{key}</div>
                            <div className="col-span-2 truncate">{value}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No Open Graph tags found</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Twitter Card Tags</h3>
                    {Object.keys(results.metaTags.twitterTags).length > 0 ? (
                      <div className="space-y-2">
                        {Object.entries(results.metaTags.twitterTags).map(([key, value]) => (
                          <div key={key} className="grid grid-cols-3 gap-2 text-sm">
                            <div className="font-medium">{key}</div>
                            <div className="col-span-2 truncate">{value}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No Twitter Card tags found</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Content Overview</CardTitle>
                <CardDescription>Analysis of page content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <h3 className="text-sm font-medium">Word Count</h3>
                      <span className="text-sm">{results.contentAnalysis.wordCount} words</span>
                    </div>
                    <Progress value={Math.min(100, (results.contentAnalysis.wordCount / 1000) * 100)} className="h-2" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {results.contentAnalysis.wordCount < 300
                        ? "Content is too short. Aim for at least 300 words."
                        : results.contentAnalysis.wordCount < 600
                          ? "Content length is acceptable but could be improved."
                          : "Good content length."}
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <h3 className="text-sm font-medium">Readability Score</h3>
                      <span className="text-sm">{Math.min(100, (results.contentAnalysis.wordCount / 1000) * 100)}</span>
                    </div>
                    <Progress value={Math.min(100, (results.contentAnalysis.wordCount / 1000) * 100)} className="h-2" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {results.contentAnalysis.readabilityScore < 30
                        ? "Content may be difficult to read. Consider simplifying."
                        : results.contentAnalysis.readabilityScore < 70
                          ? "Content readability is acceptable."
                          : "Content is easy to read."}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Paragraph Count</h3>
                    <p className="text-sm">{results.contentAnalysis.paragraphCount} paragraphs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Headings Structure</CardTitle>
                <CardDescription>Analysis of page headings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["h1", "h2", "h3", "h4", "h5", "h6"].map((level) => (
                    <div key={level}>
                      <div className="flex justify-between mb-1">
                        <h3 className="text-sm font-medium">{level.toUpperCase()}</h3>
                        <span className="text-sm">
                          {results.headings[level as keyof typeof results.headings].length}
                        </span>
                      </div>

                      {results.headings[level as keyof typeof results.headings].length > 0 ? (
                        <div className="space-y-1 mt-2">
                          {results.headings[level as keyof typeof results.headings]
                            .slice(0, 3)
                            .map((heading, index) => (
                              <p key={index} className="text-xs truncate">
                                {heading}
                              </p>
                            ))}

                          {results.headings[level as keyof typeof results.headings].length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{results.headings[level as keyof typeof results.headings].length - 3} more
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No {level.toUpperCase()} headings found</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
              <CardDescription>Analysis of images on the page</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Total Images</h3>
                    <p className="text-2xl font-bold">{results.images.total}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-1">With Alt Text</h3>
                    <p className="text-2xl font-bold text-green-600">{results.images.withAlt}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-1">Missing Alt Text</h3>
                    <p className="text-2xl font-bold text-red-600">{results.images.withoutAlt}</p>
                  </div>
                </div>

                {results.images.total > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Image Details</h3>
                    <div className="overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">Image</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Alt Text</TableHead>
                            <TableHead className="w-20">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {results.images.details.slice(0, 10).map((image, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                </div>
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                <span className="text-xs">{image.src}</span>
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                <span className="text-xs">{image.alt || "—"}</span>
                              </TableCell>
                              <TableCell>
                                {image.hasAlt ? (
                                  <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                                    OK
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive">Missing</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {results.images.details.length > 10 && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Showing 10 of {results.images.details.length} images
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
                <CardDescription>Page performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">HTML Size</h3>
                    <p className="text-2xl font-bold">{(results.performance.htmlSize / 1024).toFixed(1)} KB</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {results.performance.htmlSize > 100000
                        ? "HTML is quite large. Consider optimizing."
                        : "HTML size is acceptable."}
                    </p>
                  </div>

                  <div className="pt-2">
                    <h3 className="text-sm font-medium mb-2">Resource Count</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm">Scripts</p>
                        <p className="text-xl font-bold">{results.performance.resourceCount.scripts}</p>
                      </div>
                      <div>
                        <p className="text-sm">Stylesheets</p>
                        <p className="text-xl font-bold">{results.performance.resourceCount.stylesheets}</p>
                      </div>
                      <div>
                        <p className="text-sm">Images</p>
                        <p className="text-xl font-bold">{results.performance.resourceCount.images}</p>
                      </div>
                      <div>
                        <p className="text-sm">iFrames</p>
                        <p className="text-xl font-bold">{results.performance.resourceCount.iframes}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Security-related information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${results.security.https ? "bg-green-100" : "bg-red-100"}`}>
                      <Shield className={`h-5 w-5 ${results.security.https ? "text-green-600" : "text-red-600"}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">HTTPS</h3>
                      <p className="text-sm text-muted-foreground">
                        {results.security.https
                          ? "The website is using HTTPS, which is secure."
                          : "The website is not using HTTPS, which is a security risk."}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Links</CardTitle>
              <CardDescription>Analysis of links on the page</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Total Links</h3>
                    <p className="text-2xl font-bold">{results.links.internal + results.links.external}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-1">Internal Links</h3>
                    <p className="text-2xl font-bold">{results.links.internal}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-1">External Links</h3>
                    <p className="text-2xl font-bold">{results.links.external}</p>
                  </div>
                </div>

                {results.links.internal + results.links.external > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Link Details</h3>
                    <div className="overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>URL</TableHead>
                            <TableHead>Text</TableHead>
                            <TableHead className="w-24">Type</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {results.links.details.slice(0, 10).map((link, index) => (
                            <TableRow key={index}>
                              <TableCell className="max-w-[300px] truncate">
                                <div className="flex items-center gap-1">
                                  <LinkIcon className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                                  <span className="text-xs truncate">{link.url}</span>
                                </div>
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                <span className="text-xs">{link.text || "—"}</span>
                              </TableCell>
                              <TableCell>
                                {link.isExternal ? (
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    <ExternalLink className="h-3 w-3" />
                                    External
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    <LinkIcon className="h-3 w-3" />
                                    Internal
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {results.links.details.length > 10 && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Showing 10 of {results.links.details.length} links
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Structured Data</CardTitle>
              <CardDescription>JSON-LD structured data found on the page</CardDescription>
            </CardHeader>
            <CardContent>
              {results.structuredData.length > 0 ? (
                <div className="space-y-4">
                  {results.structuredData.map((data, index) => (
                    <div key={index} className="p-4 bg-muted rounded-md">
                      <h3 className="text-sm font-medium mb-2">
                        {data["@type"] ? `Type: ${data["@type"]}` : `Structured Data ${index + 1}`}
                      </h3>
                      <pre className="text-xs overflow-auto whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center">
                  <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No structured data found on the page</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>Actionable steps to improve your SEO</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {results.recommendations.length > 0 ? (
                  results.recommendations.map((rec, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div
                          className={`rounded-full p-2 ${
                            rec.priority === "high"
                              ? "bg-red-100"
                              : rec.priority === "medium"
                                ? "bg-yellow-100"
                                : "bg-blue-100"
                          }`}
                        >
                          {rec.priority === "high" ? (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          ) : rec.priority === "medium" ? (
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          ) : (
                            <Info className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{rec.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{rec.description}</p>
                        <div className="mt-2 flex items-center">
                          <Badge variant="outline" className="text-xs">
                            Impact: {rec.impact}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-muted-foreground">No recommendations available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ScoreCard({
  title,
  count,
  icon,
  color,
}: {
  title: string
  count: number
  icon: React.ReactNode
  color: "destructive" | "warning" | "info" | "success"
}) {
  const colorClasses = {
    destructive: "bg-destructive/10 text-destructive",
    warning: "bg-yellow-100 text-yellow-800",
    info: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold">{count}</p>
          </div>
          <div className={`rounded-full p-2 ${colorClasses[color]}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function getScoreDescription(score: number) {
  if (score >= 90) return "Excellent! Your site has very few SEO issues."
  if (score >= 70) return "Good. Your site has some minor SEO issues to fix."
  if (score >= 50) return "Average. Your site has several SEO issues that need attention."
  if (score >= 30) return "Poor. Your site has significant SEO problems to address."
  return "Critical. Your site has major SEO issues that require immediate attention."
}

