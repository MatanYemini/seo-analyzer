"use client"

import type React from "react"

interface ChartWrapperProps {
  content: React.ComponentType<any>
  className?: string
  title: string
}

export function ChartWrapper({ content: Content, className, title }: ChartWrapperProps) {
  return (
    <div className={className} aria-label={title}>
      <Content />
    </div>
  )
}

