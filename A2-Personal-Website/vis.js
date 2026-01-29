// vis.js
// Generates SVG visualizations using JavaScript.

document.addEventListener("DOMContentLoaded", () => {
  // Default VLT
  const initialVlt = 20;

  const car = buildTintCarSvg();
  const chartContainer = document.getElementById("viz-chart");
  if (chartContainer) {
    chartContainer.innerHTML = "";
    chartContainer.appendChild(car.svg);
    applyVltToAllWindows(car.windowEls, initialVlt);
  }

  const status = document.getElementById("tint-status");
  if (status) status.textContent = `Selected: ${initialVlt}% VLT`;

  // Wire up tint buttons
  document.querySelectorAll(".tint-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const vlt = Number(btn.dataset.vlt);
      applyVltToAllWindows(car.windowEls, vlt);
      if (status) status.textContent = `Selected: ${vlt}% VLT`;
    });
  });

  // Creative art
  drawGenerativeArt();
  const regen = document.getElementById("regen-art");
  if (regen) regen.addEventListener("click", drawGenerativeArt);
});

function buildTintCarSvg() {
  const width = 720;
  const height = 300;
  const svg = createSvg(width, height);

  // Background
  const bg = ns("rect");
  bg.setAttribute("x", "0");
  bg.setAttribute("y", "0");
  bg.setAttribute("width", String(width));
  bg.setAttribute("height", String(height));
  bg.setAttribute("fill", "#fff");
  svg.appendChild(bg);

  // Title
  const title = ns("text");
  title.setAttribute("x", "20");
  title.setAttribute("y", "35");
  title.setAttribute("font-size", "18");
  title.setAttribute("font-weight", "700");
  title.textContent = "Tint Preview (Click a VLT option)";
  svg.appendChild(title);

  // Car body (simple silhouette)
  const body = ns("path");
  body.setAttribute(
    "d",
    "M120 190 Q160 125 260 125 L410 125 Q500 125 560 165 Q590 185 615 190 L635 205 Q650 215 650 235 L650 245 Q650 255 640 255 L110 255 Q90 255 90 235 L90 225 Q90 205 110 200 Z"
  );
  body.setAttribute("fill", "#f5f5f5");
  body.setAttribute("stroke", "#222");
  body.setAttribute("stroke-width", "2");
  svg.appendChild(body);

  addWheel(svg, 210);
  addWheel(svg, 540);

  // Windows 
  const windshield = makeRect(265, 135, 70, 40, 6);
  const frontSide = makeRect(340, 135, 80, 45, 6);
  const rearSide = makeRect(430, 140, 85, 40, 6);
  const rear = makeRect(520, 150, 55, 35, 6);

  const windowEls = [windshield, frontSide, rearSide, rear];
  windowEls.forEach((w) => {
    w.setAttribute("stroke", "#222");
    w.setAttribute("stroke-width", "2");
    svg.appendChild(w);
  });

  // Small labels (static)
  addLabel(svg, 265, 130, "Windshield");
  addLabel(svg, 340, 130, "Front");
  addLabel(svg, 430, 135, "Rear Side");
  addLabel(svg, 520, 145, "Rear");

  return { svg, windowEls };

  function addWheel(svgEl, cx) {
    const outer = ns("circle");
    outer.setAttribute("cx", String(cx));
    outer.setAttribute("cy", "255");
    outer.setAttribute("r", "26");
    outer.setAttribute("fill", "#222");
    svgEl.appendChild(outer);

    const inner = ns("circle");
    inner.setAttribute("cx", String(cx));
    inner.setAttribute("cy", "255");
    inner.setAttribute("r", "12");
    inner.setAttribute("fill", "#ddd");
    svgEl.appendChild(inner);
  }

  function addLabel(svgEl, x, y, text) {
    const t = ns("text");
    t.setAttribute("x", String(x));
    t.setAttribute("y", String(y));
    t.setAttribute("font-size", "11");
    t.setAttribute("fill", "#111");
    t.textContent = text;
    svgEl.appendChild(t);
  }

  function makeRect(x, y, w, h, rx) {
    const el = ns("rect");
    el.setAttribute("x", String(x));
    el.setAttribute("y", String(y));
    el.setAttribute("width", String(w));
    el.setAttribute("height", String(h));
    el.setAttribute("rx", String(rx));
    return el;
  }
}

function applyVltToAllWindows(windowEls, vlt) {
  const fill = tintFill(vlt);
  windowEls.forEach((w) => {
    w.setAttribute("fill", fill);
    w.setAttribute("opacity", "0.92");
  });
}

// Map VLT% -> grayscale fill (lower VLT = darker)
function tintFill(vlt) {
  const v = Math.max(0, Math.min(100, vlt));
  const shade = Math.round(20 + (v / 100) * 210); // 20..230
  return `rgb(${shade}, ${shade}, ${shade})`;
}

/* ---- Creative SVG art ---- */
function drawGenerativeArt() {
  const container = document.getElementById("viz-art");
  if (!container) return;
  container.innerHTML = "";

  const width = 720;
  const height = 320;
  const svg = createSvg(width, height);

  // Background
  const bg = ns("rect");
  bg.setAttribute("x", "0");
  bg.setAttribute("y", "0");
  bg.setAttribute("width", String(width));
  bg.setAttribute("height", String(height));
  bg.setAttribute("fill", "#f4f4f4");
  svg.appendChild(bg);

  // Points
  const points = [];
  const count = 18;

  for (let i = 0; i < count; i++) {
    points.push({
      x: rand(40, width - 40),
      y: rand(40, height - 40),
    });
  }

  // Lines between points
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];

    const line = ns("line");
    line.setAttribute("x1", String(a.x));
    line.setAttribute("y1", String(a.y));
    line.setAttribute("x2", String(b.x));
    line.setAttribute("y2", String(b.y));
    line.setAttribute("stroke", "#1f1f1f");
    line.setAttribute("stroke-width", "1");
    line.setAttribute("opacity", "0.35");
    svg.appendChild(line);
  }

  // Nodes
  points.forEach((p) => {
    const c = ns("circle");
    c.setAttribute("cx", String(p.x));
    c.setAttribute("cy", String(p.y));
    c.setAttribute("r", String(rand(3, 7)));
    c.setAttribute("fill", "#1f1f1f");
    c.setAttribute("opacity", "0.85");
    svg.appendChild(c);
  });

  container.appendChild(svg);
}

function createSvg(width, height) {
  const svg = ns("svg");
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
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
