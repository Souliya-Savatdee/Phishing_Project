import React from "react";
import { LineChart } from "@mui/x-charts/LineChart";

const Linecharts = ({ resultData }) => {
  const formatMonth = (date) => date.toLocaleString('default', { month: 'short' });

  const formattedData = resultData.map(entry => ({
    date: new Date(entry.create_date),
    value: entry.success,
    name: entry.cam_name,
    dateFormatted: formatMonth(new Date(entry.create_date)),
  }));

  return (
    <LineChart
      xAxis={[
        {
          scaleType: "time",
          data: formattedData.map(entry => entry.date),
          tickFormatter: (date) => formatMonth(date),
          ticks: formattedData.map(entry => entry.date),
        },
      ]}
      series={[
        {
          label: "Phishing Success Overview",
          data: formattedData.map(entry => entry.value),
          color: "#778ab0",
          area: true,
        },
      ]}
      height={300}
    />
  );
};

export default Linecharts;
