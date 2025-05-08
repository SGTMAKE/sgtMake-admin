"use client"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

const data = [
  { name: "Battery Packs", value: 4 },
  { name: "Wiring Harness", value: 3 },
  { name: "CNC Machining", value: 2 },
  { name: "Laser Cutting", value: 1 },
  { name: "3D Designing", value: 2 },
]

const COLORS = ["#463acb", "#18BF60", "#FF6B6B", "#FFD166", "#06D6A0"]

const ServicesSummaryGraph = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart width={400} height={400}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#82ca9d"
          label
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default ServicesSummaryGraph
