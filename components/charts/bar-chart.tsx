"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  {
    name: "Meta Tags",
    score: 75,
  },
  {
    name: "Content",
    score: 60,
  },
  {
    name: "Links",
    score: 85,
  },
  {
    name: "Images",
    score: 45,
  },
  {
    name: "Performance",
    score: 70,
  },
  {
    name: "Security",
    score: 90,
  },
]

export default function BarChart1() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Bar dataKey="score" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  )
}

