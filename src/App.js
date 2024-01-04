import { useEffect, useRef, useState } from "react";
import "./App.css";
import * as d3 from "d3";

function App() {
  const [values, setValues] = useState([]);
  const chartRef = useRef();
  const tooltipRef = useRef();
  const colors = ["#FFECD6", "#4CB9E7", "#3559E0", "#0F2167"];

  useEffect(() => {
    async function fetchGDP() {
      const response = await fetch(
        "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
      );
      const json = await response.json();
      const newValues = json.data.map((i) => ({
        date: new Date(i[0]),
        gdp: i[1],
      }));
      setValues(newValues);
    }
    fetchGDP();
  }, []);

  useEffect(() => {
    if (values.length === 0) return;

    const margin = { top: 10, right: 10, bottom: 20, left: 40 };
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xAxis = svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height})`);
    const yAxis = svg.append("g").attr("id", "y-axis");

    const xScale = d3
      .scaleTime()
      .domain([
        new Date(d3.min(values, (d) => d.date)),
        new Date(d3.max(values, (d) => d.date)),
      ])
      .range([0, width]);
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(values, (d) => d.gdp)])
      .range([height, 0]);

    const dateFormatter = d3.timeFormat("%Y-%m-%d");

    xAxis.call(d3.axisBottom(xScale).ticks(10).tickFormat(dateFormatter));
    yAxis.call(d3.axisLeft(yScale).ticks(10).tickFormat(d3.format(".2r")));

    const tooltip = d3
      .select(tooltipRef.current)
      .append("div")
      .attr("id", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "black")
      .style("color", "white")
      .style("border", "1px solid #222")
      .style("padding", "5px")
      .style("font-size", "18px");

    svg
      .selectAll(".bar")
      .data(values)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.date))
      .attr("y", (d) => yScale(d.gdp))
      .attr("width", width / values.length)
      .attr("height", (d) => height - yScale(d.gdp))
      .attr("data-date", (d) => dateFormatter(d.date))
      .attr("data-gdp", (d) => d.gdp)
      .attr("fill", (d, i) => colors[i % colors.length])
      .on("mouseover", (event, d) => {
        const formattedDate = dateFormatter(d.date);
        const [year, month, day] = formattedDate.split("-");
        const zeroPaddedDate = `${year}-${month.padStart(
          2,
          "0"
        )}-${day.padStart(2, "0")}`;
        const xPosition = event.pageX;
        const yPosition = event.pageY;
        tooltip
          .transition()
          .duration(100)
          .style("opacity", 0.8)
          .attr("data-date", zeroPaddedDate);
        tooltip
          .html(`Date: ${dateFormatter(d.date)}<br>GDP: ${d.gdp}`)
          .style("left", xPosition - margin.left + margin.right + "px")
          .style("top", yPosition - margin.top + margin.bottom + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(100).style("opacity", 0);
      });

    svg
      .append("text")
      .attr("x", -height / 2)
      .attr("y", margin.left / 2)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .style("font-size", "0.75em")
      .text("Gross Domestic Product");
  }, [values, colors]);

  return (
    <div className="App">
      <h1 id="title">USA GDP</h1>
      <div ref={chartRef}></div>
      <div ref={tooltipRef}></div>
    </div>
  );
}

export default App;
