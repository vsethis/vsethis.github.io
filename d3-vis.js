import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

let svg;

const width = 800;
const height = 600;
const maxCircles = 10;

let circlesData = [];
let nextId = 0;

async function prepareVis() {
  svg = d3
    .select("#chart")
    .attr("width", width)
    .attr("height", height)
    .style("cursor", "crosshair")
    .on("click", handleCanvasClick);
}

async function drawVis() {
  const circles = svg.selectAll("circle").data(circlesData, (d) => d.id);

  circles
    .exit()
    .transition()
    .duration(250)
    .attr("r", 0)
    .style("opacity", 0)
    .remove();

  const circlesEnter = circles
    .enter()
    .append("circle")
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("r", 0)
    .attr("fill", () => d3.schemeTableau10[Math.floor(Math.random() * 10)])
    .attr("opacity", 0.8);

  circlesEnter
    .transition()
    .duration(300)
    .attr("r", (d) => d.r);

  circles
    .merge(circlesEnter)
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y);
}

function handleCanvasClick(event) {
  const [x, y] = d3.pointer(event);

  circlesData.push({
    id: nextId,
    x: x,
    y: y,
    r: Math.random() * 20 + 10
  });

  nextId++;

  if (circlesData.length > maxCircles) {
    circlesData.shift();
  }

  drawVis();
}

async function runApp() {
  await prepareVis();
  await drawVis();
}

runApp();