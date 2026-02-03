// vis.js
// Generates SVG visualizations using JavaScript.

document.addEventListener("DOMContentLoaded", () => {
  // Draw chart if the SVG exists on this page
  drawTintTradeoffChart();

  // Generative art
  drawGenerativeArt();
  const regen = document.getElementById("regen-art");
  if (regen) regen.addEventListener("click", drawGenerativeArt);
});

/* =========================
   Visualization 1: Tradeoff Chart
   ========================= */

function drawTintTradeoffChart() {
  const svg = document.getElementById("tintChart");
  if (!svg) return;

  svg.innerHTML = "";

  const isDark = document.body.classList.contains("dark");

  // Theme-aware colors
  const bgFill = "transparent"; // card handles background
  const axis = isDark ? "#cfcfcf" : "#999";
  const text = isDark ? "#f2f2f2" : "#111";
  const subtle = isDark ? "#2f3642" : "#eee";
  const legendStroke = isDark ? "#3a4250" : "#ddd";

  const confidenceColor = "#2e6bd6"; // blue
  const visibilityColor = "#e74c3c"; // red
  const refColor = isDark ? "#cfcfcf" : "#444";

  // Your data (kept as-is)
  const data = [
    { tint: 70, confidence: 1, visibility: 9 },
    { tint: 60, confidence: 2, visibility: 8 },
    { tint: 50, confidence: 3, visibility: 7 },
    { tint: 40, confidence: 5, visibility: 6 },
    { tint: 30, confidence: 6, visibility: 5 },
    { tint: 20, confidence: 7, visibility: 3 },
    { tint: 10, confidence: 8, visibility: 2 },
    { tint: 0, confidence: 9, visibility: 1 },
  ].sort((a, b) => a.tint - b.tint);

  const W = 900;
  const H = 520;

  const margin = { top: 30, right: 70, bottom: 70, left: 70 };
  const innerW = W - margin.left - margin.right;
  const innerH = H - margin.top - margin.bottom;

  // Scale helpers
  function xScale(tint) {
    return margin.left + (tint / 70) * innerW; 
  }

  function yScale(v) {
    return margin.top + innerH - ((v - 1) / 9) * innerH; 
  }

  function el(name, attrs = {}) {
    const e = document.createElementNS("http://www.w3.org/2000/svg", name);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    svg.appendChild(e);
    return e;
  }

  // Background
  el("rect", { x: 0, y: 0, width: W, height: H, fill: bgFill });

  // Axes
  el("line", {
    x1: margin.left,
    y1: margin.top,
    x2: margin.left,
    y2: margin.top + innerH,
    stroke: axis,
  });

  el("line", {
    x1: margin.left,
    y1: margin.top + innerH,
    x2: margin.left + innerW,
    y2: margin.top + innerH,
    stroke: axis,
  });

  // X ticks (0..70 step 10)
  for (let t = 0; t <= 70; t += 10) {
    const x = xScale(t);

    el("line", {
      x1: x,
      y1: margin.top + innerH,
      x2: x,
      y2: margin.top + innerH + 6,
      stroke: axis,
    });

    el("text", {
      x,
      y: margin.top + innerH + 24,
      "text-anchor": "middle",
      "font-size": "12",
      fill: text,
    }).textContent = t;
  }

  // Y ticks (1..10) + gridlines
  for (let v = 1; v <= 10; v++) {
    const y = yScale(v);

    el("line", { x1: margin.left - 6, y1: y, x2: margin.left, y2: y, stroke: axis });

    el("text", {
      x: margin.left - 12,
      y: y + 4,
      "text-anchor": "end",
      "font-size": "12",
      fill: text,
    }).textContent = v;

    el("line", {
      x1: margin.left,
      y1: y,
      x2: margin.left + innerW,
      y2: y,
      stroke: subtle,
    });
  }

  // Axis labels
  el("text", {
    x: margin.left + innerW / 2,
    y: H - 25,
    "text-anchor": "middle",
    "font-size": "14",
    fill: text,
  }).textContent = "Tint Percentage (lower % = darker tint)";

  el("text", {
    x: 18,
    y: margin.top + innerH / 2,
    transform: `rotate(-90 18 ${margin.top + innerH / 2})`,
    "text-anchor": "middle",
    "font-size": "14",
    fill: text,
  }).textContent = "Visibility (1 = very poor, 10 = very clear)";

  el("text", {
    x: W - 18,
    y: margin.top + innerH / 2,
    transform: `rotate(90 ${W - 18} ${margin.top + innerH / 2})`,
    "text-anchor": "middle",
    "font-size": "14",
    fill: text,
  }).textContent = "Confidence (1 = low, 10 = very high)";

  // Reference line at 20%
  const refX = xScale(20);
  el("line", {
    x1: refX,
    y1: margin.top,
    x2: refX,
    y2: margin.top + innerH,
    stroke: refColor,
    "stroke-dasharray": "6 6",
  });

  el("text", { x: refX + 6, y: margin.top + innerH + 45, "font-size": "12", fill: refColor })
    .textContent = "High privacy, low night visibility";

  // Line path builder
  function linePath(key) {
    return data
      .map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(d.tint)} ${yScale(d[key])}`)
      .join(" ");
  }

  // Visibility line (red)
  el("path", {
    d: linePath("visibility"),
    fill: "none",
    stroke: visibilityColor,
    "stroke-width": "4",
  });

  // Confidence line (blue)
  el("path", {
    d: linePath("confidence"),
    fill: "none",
    stroke: confidenceColor,
    "stroke-width": "4",
  });

  // Legend
  el("rect", { x: W - 170, y: 20, width: 150, height: 56, fill: "transparent", stroke: legendStroke });

  el("line", { x1: W - 160, y1: 40, x2: W - 130, y2: 40, stroke: confidenceColor, "stroke-width": "4" });
  el("text", { x: W - 120, y: 44, "font-size": "12", fill: text }).textContent = "Confidence";

  el("line", { x1: W - 160, y1: 62, x2: W - 130, y2: 62, stroke: visibilityColor, "stroke-width": "4" });
  el("text", { x: W - 120, y: 66, "font-size": "12", fill: text }).textContent = "Visibility";
}

/* =========================
   Visualization 2: Generative SVG Art (theme-aware)
   ========================= */

function drawGenerativeArt() {
  const container = document.getElementById("viz-art");
  if (!container) return;

  container.innerHTML = "";

  const width = 720;
  const height = 320;
  const svg = createSvg(width, height);

  const isDark = document.body.classList.contains("dark");
  const strokeColor = isDark ? "#e6e6e6" : "#1f1f1f";
  const nodeColor = isDark ? "#f2f2f2" : "#1f1f1f";

  const bg = ns("rect");
  bg.setAttribute("x", "0");
  bg.setAttribute("y", "0");
  bg.setAttribute("width", String(width));
  bg.setAttribute("height", String(height));
  bg.setAttribute("fill", "transparent");
  svg.appendChild(bg);

  const points = [];
  const count = 18;

  for (let i = 0; i < count; i++) {
    points.push({
      x: rand(40, width - 40),
      y: rand(40, height - 40),
    });
  }

  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];

    const line = ns("line");
    line.setAttribute("x1", String(a.x));
    line.setAttribute("y1", String(a.y));
    line.setAttribute("x2", String(b.x));
    line.setAttribute("y2", String(b.y));
    line.setAttribute("stroke", strokeColor);
    line.setAttribute("stroke-width", "1");
    line.setAttribute("opacity", "0.4");
    svg.appendChild(line);
  }

  points.forEach((p) => {
    const c = ns("circle");
    c.setAttribute("cx", String(p.x));
    c.setAttribute("cy", String(p.y));
    c.setAttribute("r", String(rand(3, 7)));
    c.setAttribute("fill", nodeColor);
    c.setAttribute("opacity", "0.85");
    svg.appendChild(c);
  });

  container.appendChild(svg);
}

/* =========================
   Helpers
   ========================= */

function createSvg(width, height) {
  const svg = ns("svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.setAttribute("role", "img");
  svg.style.display = "block";
  return svg;
}

function ns(tag) {
  return document.createElementNS("http://www.w3.org/2000/svg", tag);
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
