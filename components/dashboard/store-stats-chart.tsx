"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface StoreStatsChartProps {
  data: {
    date: string;
    revenue: number;
    products_sold: number;
    total_orders: number;
  }[];
}

type MetricType = "revenue" | "products_sold" | "total_orders";

const metricConfig = {
  revenue: {
    label: "Revenue",
    color: "#10b981",
    format: (value: number) => `$${value.toFixed(2)}`,
  },
  products_sold: {
    label: "Products Sold",
    color: "#3b82f6",
    format: (value: number) => value.toString(),
  },
  total_orders: {
    label: "Total Orders",
    color: "#8b5cf6",
    format: (value: number) => value.toString(),
  },
};

export function StoreStatsChart({ data }: StoreStatsChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("revenue");
  const config = metricConfig[selectedMetric];

  return (
    <div className="w-full">
      {/* Metric Selector */}
      <div className="mb-4 flex gap-2">
        <select
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value as MetricType)}
          className="px-4 py-2 border border-zinc-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          <option value="revenue">Revenue</option>
          <option value="products_sold">Products Sold</option>
          <option value="total_orders">Total Orders</option>
        </select>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={config.format}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
            formatter={(value: number) => [config.format(value), config.label]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={selectedMetric}
            name={config.label}
            stroke={config.color}
            strokeWidth={2}
            dot={{ fill: config.color, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
