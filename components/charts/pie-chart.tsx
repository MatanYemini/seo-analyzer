"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

const data = [
  { name: "Critical", value: 2, color: "#ef4444" },
  { name: "Warnings", value: 3, color: "#f59e0b" },
  { name: "Suggestions", value: 4, color: "#3b82f6" },
  { name: "Passed", value: 8, color: "#22c55e" },
]

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#22c55e"]

export default function PieChart1() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

