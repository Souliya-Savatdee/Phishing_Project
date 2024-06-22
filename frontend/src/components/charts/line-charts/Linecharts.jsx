import React, { useState, useEffect } from "react";
import { LineChart } from "@mui/x-charts/LineChart";

const Linecharts = ({ resultData }) => {
  const [loading, setLoading] = useState(false);
  const [formattedData, setFormattedData] = useState([]);

  useEffect(() => {
    setLoading(true); // Set loading to true immediately
    const parseDateString = (dateString) => {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    const processChartData = () => {
      const data = resultData.map((entry) => ({
        date: new Date(parseDateString(entry.full_create_date_time)),
        value: entry.success,
        name: entry.cam_name,
      }));

      setFormattedData(data);
      setLoading(false); // Set loading to false after processing data
    };

    const delay = setTimeout(processChartData, 300); // Add a delay of 300ms before processing data

    return () => clearTimeout(delay); // Cleanup function to clear the timeout if component unmounts
  }, [resultData]);

  const formatDateTime = (date) => date.toLocaleString("default", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).replace(",", "");

  if (loading) {
    return null
  }

  return (
    <LineChart
      xAxis={[
        {
          scaleType: "time",
          data: formattedData.map(entry => entry.date),
          tickFormatter: (date) => formatDateTime(date),
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
