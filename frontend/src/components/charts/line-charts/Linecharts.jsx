import * as React from "react";
import { LineChart } from "@mui/x-charts/LineChart";

const data = [
  { date: new Date("2024-06-01T00:00:00"), value: 3 },
  { date: new Date("2024-07-01T00:00:00"), value: 3 },
  { date: new Date("2024-08-01T00:00:00"), value: 10 },
  { date: new Date("2024-09-01T00:00:00"), value: 6 },
];

// Custom function to format date to short month name
const formatMonth = (date) => date.toLocaleString('default', { month: 'short' });

// Preprocess data to include formatted date
const formattedData = data.map(entry => ({
  ...entry,
  dateFormatted: formatMonth(entry.date),
}));

export default function Linecharts() {
  return (
    <LineChart
      xAxis={[
        {
          scaleType: "time",
          data: data.map(entry => entry.date),
          tickFormatter: (date) => formatMonth(date),
          ticks: data.map(entry => entry.date), // Ensure only the provided dates are used as ticks
        },
      ]}
      series={[
        {
          label: "Phishing Success Overview",
          data: data.map(entry => entry.value),
          color: "#778ab0",
          area: true,
        },
      ]}
      height={350}

    />
  );
}
