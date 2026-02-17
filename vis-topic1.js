async function loadData() {
  const data = await d3.csv("./dataset/videogames_wide.csv", d3.autoType);
  console.log("CSV loaded rows:", data.length);
  return data;
}

function render(viewID, spec) {
  vegaEmbed(viewID, spec, { actions: false })
    .then((res) => res.view.run())
    .catch((err) => console.error("vegaEmbed error:", err));
}

loadData().then((data) => {
  
  // 1A: Total Global Sales by Genre

  const spec1A = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Total Global Sales by Genre",
    data: { values: data },
    mark: "bar",
    encoding: {
      y: { field: "Genre", type: "nominal", sort: "-x", title: "Genre" },
      x: {
        field: "Global_Sales",
        type: "quantitative",
        aggregate: "sum",
        title: "Total Global Sales (millions)",
      },
      tooltip: [
        { field: "Genre", type: "nominal" },
        {
          field: "Global_Sales",
          type: "quantitative",
          aggregate: "sum",
          title: "Total Global Sales",
        },
      ],
    },
    width: "container",
    height: 360,
  };

  // Compute top 5 platforms by total Global_Sales
  const platformTotals = d3.rollups(
    data,
    (v) => d3.sum(v, (d) => d.Global_Sales),
    (d) => d.Platform
  );

  platformTotals.sort((a, b) => b[1] - a[1]);

  const top5Platforms = platformTotals.slice(0, 5).map((d) => d[0]);
  const top5Set = new Set(top5Platforms);

  console.log("Top 5 platforms:", top5Platforms);

  // Filter to only top 5 platforms (used for 1B)
  const filteredTop5 = data.filter((d) => top5Set.has(d.Platform));

  // 1B: Top 5 Platforms broken down by Genre (stacked bars)

  const spec1B = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Top 5 Platforms (by Global Sales), broken down by Genre",
    data: { values: filteredTop5 },
    mark: "bar",
    encoding: {
      x: {
        field: "Platform",
        type: "nominal",
        title: "Platform",
        sort: top5Platforms,
      },
      y: {
        field: "Global_Sales",
        type: "quantitative",
        aggregate: "sum",
        title: "Total Global Sales (millions)",
      },
      color: {
        field: "Genre",
        type: "nominal",
        title: "Genre",
        scale: { scheme: "category20" },
      },
      tooltip: [
        { field: "Platform", type: "nominal" },
        { field: "Genre", type: "nominal" },
        {
          field: "Global_Sales",
          type: "quantitative",
          aggregate: "sum",
          title: "Total Global Sales",
          format: ".2f",
        },
      ],
    },
    width: "container",
    height: 420,
  };

  // 2A: Sales over time for the top 5 platforms (line chart)
  // I reused top5Platforms and filter again, but also removed missing year values.
  const filteredTop5WithYear = data.filter(
    (d) => top5Set.has(d.Platform) && d.Year != null && !Number.isNaN(d.Year)
  );

  const spec2A = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Global Sales Over Time (Top 5 Platforms)",
    data: { values: filteredTop5WithYear },
    transform: [
      { calculate: "toDate(floor(datum.Year) + '-01-01')", as: "YearDate" },
      { filter: "datum.Year >= 2000" }
    ],
    mark: { type: "line", point: true },
    encoding: {
      x: { field: "YearDate", type: "temporal", title: "Year" },
      y: {
        field: "Global_Sales",
        type: "quantitative",
        aggregate: "sum",
        title: "Total Global Sales (millions)",
      },
      color: {
        field: "Platform",
        type: "nominal",
        title: "Platform",
        sort: top5Platforms,
      },
      tooltip: [
        { field: "Platform", type: "nominal" },
        { field: "YearDate", type: "temporal", title: "Year" },
        {
          field: "Global_Sales",
          type: "quantitative",
          aggregate: "sum",
          title: "Total Global Sales",
          format: ".2f",
        },
      ],
    },
    width: "container",
    height: 420,
  };

// 2B: Sales over time for the top 5 genres (line chart)

// 1) Find top 5 genres by total global sales
const genreTotals = d3.rollups(
  data,
  (v) => d3.sum(v, (d) => d.Global_Sales),
  (d) => d.Genre
);

genreTotals.sort((a, b) => b[1] - a[1]);

const top5Genres = genreTotals.slice(0, 5).map((d) => d[0]);
const top5GenreSet = new Set(top5Genres);

console.log("Top 5 genres:", top5Genres);

// 2) Filter to only those genres + valid Year
const filteredTop5GenresWithYear = data.filter(
  (d) => top5GenreSet.has(d.Genre) && d.Year != null && !Number.isNaN(d.Year)
);

const spec2B = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  title: "Global Sales Over Time (Top 5 Genres)",
  data: { values: filteredTop5GenresWithYear },
  transform: [
    { calculate: "toDate(floor(datum.Year) + '-01-01')", as: "YearDate" },
    { filter: "datum.Year >= 2000" }
  ],
  mark: { type: "line", point: true },
  encoding: {
    x: { field: "YearDate", type: "temporal", title: "Year" },
    y: {
      field: "Global_Sales",
      type: "quantitative",
      aggregate: "sum",
      title: "Total Global Sales (millions)"
    },
    color: {
      field: "Genre",
      type: "nominal",
      title: "Genre",
      sort: top5Genres
    },
    tooltip: [
      { field: "Genre", type: "nominal" },
      { field: "YearDate", type: "temporal", title: "Year" },
      {
        field: "Global_Sales",
        type: "quantitative",
        aggregate: "sum",
        title: "Total Global Sales",
        format: ".2f"
      }
    ]
  },
  width: "container",
  height: 420
};

// 3A: Regional Sales Comparison (Top 5 Platforms)

const regionalTop5Data = data.filter((d) => top5Set.has(d.Platform));

const spec3A = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  title: "Regional Sales Comparison (Top 5 Platforms)",
  data: { values: regionalTop5Data },

  transform: [
    {
      fold: ["NA_Sales", "EU_Sales", "JP_Sales", "Other_Sales"],
      as: ["Region", "Sales"],
    },
    {
      calculate:
        "datum.Region == 'NA_Sales' ? 'North America' : " +
        "datum.Region == 'EU_Sales' ? 'Europe' : " +
        "datum.Region == 'JP_Sales' ? 'Japan' : " +
        "'Other'",
      as: "RegionLabel",
    },
  ],

  mark: "bar",

  encoding: {
    x: {
      field: "RegionLabel",
      type: "nominal",
      title: "Region",
      sort: ["North America", "Europe", "Japan", "Other"],
    },

    xOffset: {
      field: "Platform",
      type: "nominal",
      sort: top5Platforms,
    },

    y: {
      field: "Sales",
      type: "quantitative",
      aggregate: "sum",
      title: "Total Sales (millions)",
    },

    color: {
      field: "Platform",
      type: "nominal",
      title: "Platform",
      sort: top5Platforms,
    },

    tooltip: [
      { field: "Platform", type: "nominal" },
      { field: "RegionLabel", type: "nominal", title: "Region" },
      {
        field: "Sales",
        type: "quantitative",
        aggregate: "sum",
        title: "Total Sales",
        format: ".2f",
      },
    ],
  },

  width: "container",
  height: 420,
};

// 3B: Which platforms have the highest sales in Japan compared to North America?
// (Top 10 platforms in each region)

const spec3B = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  title: "Top 10 Platforms in Japan vs North America (Regional Sales)",
  data: { values: data },
  transform: [
    {
      fold: ["NA_Sales", "JP_Sales"],
      as: ["Region", "Sales"]
    },

    {
      calculate:
        "datum.Region === 'NA_Sales' ? 'North America' : 'Japan'",
      as: "RegionLabel"
    },

    // Sum sales by Platform within each region
    {
      aggregate: [{ op: "sum", field: "Sales", as: "TotalSales" }],
      groupby: ["RegionLabel", "Platform"]
    },

    // Rank platforms within each region
    {
      window: [{ op: "rank", as: "rank" }],
      sort: [{ field: "TotalSales", order: "descending" }],
      groupby: ["RegionLabel"]
    },

    { filter: "datum.rank <= 10" }
  ],

  facet: {
    column: { field: "RegionLabel", type: "nominal", title: null }
  },

  spec: {
    mark: "bar",
    encoding: {
      y: {
        field: "Platform",
        type: "nominal",
        sort: "-x",
        title: "Platform"
      },
      x: {
        field: "TotalSales",
        type: "quantitative",
        title: "Total Sales (millions)"
      },
      tooltip: [
        { field: "RegionLabel", type: "nominal", title: "Region" },
        { field: "Platform", type: "nominal" },
        { field: "TotalSales", type: "quantitative", title: "Total Sales", format: ".2f" }
      ]
    },
    width: 320,
    height: 420
  },

  resolve: { scale: { y: "independent" } }
};

// 4A Zoomed histogram 

const spec4A = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  title: "Global Sales Distribution (Are there a few blockbusters?)",
  data: { values: data },
  transform: [
    { filter: "datum.Global_Sales != null && datum.Global_Sales >= 0" },
    {
      bin: { step: 1, extent: [0, 15] },
      field: "Global_Sales",
      as: ["bin_start", "bin_end"]
    },

    { filter: "datum.bin_start < 15" }
  ],

  mark: { type: "bar", binSpacing: 0 },

  encoding: {
    x: {
      field: "bin_start",
      type: "quantitative",
      scale: { domain: [0, 15], nice: false, padding: 0 },
      axis: {
        format: ".0f",
        values: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
      },
      title: "Global Sales per Game (millions, capped at 15)"
    },
    x2: { field: "bin_end" },

    y: {
      aggregate: "count",
      type: "quantitative",
      title: "Number of Games"
    },

    tooltip: [
      { field: "bin_start", type: "quantitative", title: "Sales from (millions)", format: ".0f" },
      { field: "bin_end", type: "quantitative", title: "Sales to (millions)", format: ".0f" },
      { aggregate: "count", type: "quantitative", title: "Games in range" }
    ]
  },

  width: "container",
  height: 420
};

// 4B: Publisher diversification vs total sales
const spec4B = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  title: "Publisher Genre Diversity vs Total Global Sales",
  data: { values: data },
  transform: [
    { filter: "datum.Publisher != null && datum.Genre != null && datum.Global_Sales != null" },

    {
      aggregate: [
        { op: "sum", field: "Global_Sales", as: "TotalGlobalSales" },
        { op: "count", as: "GameCount" },
        { op: "distinct", field: "Genre", as: "GenreCount" }
      ],
      groupby: ["Publisher"]
    },

    // Remove tiny publishers so plot is readable
    { filter: "datum.GameCount >= 5" }
  ],
  mark: { type: "circle", opacity: 0.7 },
  encoding: {
    x: {
      field: "GenreCount",
      type: "quantitative",
      title: "Number of Genres Published",
      scale: { domain: [0, 12], nice: false },
      axis: {
        format: ".0f",
        values: [1,2,3,4,5,6,7,8,9,10,11,12]
      }
    },
    y: {
      field: "TotalGlobalSales",
      type: "quantitative",
      title: "Total Global Sales (millions)"
    },
    size: {
      field: "GameCount",
      type: "quantitative",
      title: "Number of Games",
      legend: null
    },
    tooltip: [
      { field: "Publisher", type: "nominal" },
      { field: "GenreCount", type: "quantitative", title: "Genres" },
      { field: "GameCount", type: "quantitative", title: "Games" },
      { field: "TotalGlobalSales", type: "quantitative", title: "Total Sales (M)", format: ".2f" }
    ]
  },
  width: "container",
  height: 450
};

// Render 
render("#vis1", spec1A);
render("#vis2", spec1B);
render("#vis3", spec2A);
render("#vis4", spec2B);
render("#vis5", spec3A);
render("#vis6", spec3B);
render("#vis7", spec4A);
render("#vis8", spec4B);
});
