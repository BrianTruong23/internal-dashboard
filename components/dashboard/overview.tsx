"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  {
    name: "Jan",
    users: 5,
    stores: 8,
  },
  {
    name: "Feb",
    users: 12,
    stores: 18,
  },
  {
    name: "Mar",
    users: 20,
    stores: 32,
  },
  {
    name: "Apr",
    users: 28,
    stores: 45,
  },
  {
    name: "May",
    users: 42,
    stores: 68,
  },
  {
    name: "Jun",
    users: 58,
    stores: 95,
  },
  {
    name: "Jul",
    users: 75,
    stores: 125,
  },
  {
    name: "Aug",
    users: 92,
    stores: 158,
  },
  {
    name: "Sep",
    users: 110,
    stores: 195,
  },
  {
    name: "Oct",
    users: 135,
    stores: 240,
  },
  {
    name: "Nov",
    users: 165,
    stores: 298,
  },
];

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="users"
          stroke="#8884d8"
          strokeWidth={2}
          activeDot={{ r: 8 }}
          name="Users"
        />
        <Line
          type="monotone"
          dataKey="stores"
          stroke="#82ca9d"
          strokeWidth={2}
          activeDot={{ r: 8 }}
          name="Stores"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
