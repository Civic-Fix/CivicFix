const pptxgen = require("pptxgenjs");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pptx.author = "SIH 2026";
pptx.subject = "AI-Based Landslide Susceptibility and Dynamic Risk Monitoring";
pptx.title = "Landslide Risk Monitoring System Architecture";
pptx.company = "SIH 2026";
pptx.lang = "en-IN";
pptx.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "en-IN"
};

pptx.defineSlideMaster({
  title: "MASTER",
  background: { color: "F7F9FC" },
  objects: [
    {
      text: {
        text: "SIH 2026 • AI-Based Landslide Risk Monitoring",
        options: {
          x: 0.35,
          y: 7.15,
          w: 8,
          h: 0.18,
          fontFace: "Aptos",
          fontSize: 7,
          color: "64748B"
        }
      }
    },
    {
      text: {
        text: "Northeast India",
        options: {
          x: 11.2,
          y: 7.15,
          w: 1.8,
          h: 0.18,
          align: "right",
          fontFace: "Aptos",
          fontSize: 7,
          color: "64748B"
        }
      }
    }
  ],
  slideNumber: {
    x: 12.95,
    y: 7.12,
    color: "64748B",
    fontFace: "Aptos",
    fontSize: 7
  }
});

const C = {
  navy: "17324D",
  blue: "2563EB",
  blueLight: "EAF2FF",

  green: "15803D",
  greenLight: "EAF8EF",

  purple: "7C3AED",
  purpleLight: "F2ECFF",

  orange: "EA580C",
  orangeLight: "FFF1E8",

  red: "DC2626",
  redLight: "FEECEC",

  cyan: "0891B2",
  cyanLight: "E7F8FC",

  slate: "475569",
  slateLight: "F1F5F9",

  dark: "0F172A",
  white: "FFFFFF",
  border: "CBD5E1",
  yellow: "CA8A04",
  yellowLight: "FFF8DB"
};

function addSection(slide, x, y, w, h, title, color) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: 0.08,
    fill: { color: C.white, transparency: 0 },
    line: { color, width: 1.5 }
  });

  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h: 0.32,
    fill: { color },
    line: { color, transparency: 100 }
  });

  slide.addText(title, {
    x: x + 0.12,
    y: y + 0.055,
    w: w - 0.24,
    h: 0.2,
    fontFace: "Aptos Display",
    fontSize: 11,
    bold: true,
    color: C.white,
    margin: 0,
    breakLine: false
  });
}

function addNode(slide, x, y, w, h, text, opts = {}) {
  const fill = opts.fill || C.white;
  const line = opts.line || C.border;
  const fontSize = opts.fontSize || 8;

  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: 0.05,
    fill: { color: fill },
    line: { color: line, width: opts.lineWidth || 1 }
  });

  slide.addText(text, {
    x: x + 0.07,
    y: y + 0.05,
    w: w - 0.14,
    h: h - 0.1,
    fontFace: "Aptos",
    fontSize,
    bold: opts.bold !== false,
    color: opts.color || C.dark,
    align: opts.align || "center",
    valign: "mid",
    margin: 0.02,
    breakLine: false,
    fit: "shrink"
  });
}

function addArrow(slide, x1, y1, x2, y2, opts = {}) {
  slide.addShape(pptx.ShapeType.line, {
    x: x1,
    y: y1,
    w: x2 - x1,
    h: y2 - y1,
    line: {
      color: opts.color || C.slate,
      width: opts.width || 1.2,
      beginArrowType: opts.beginArrow ? "triangle" : "none",
      endArrowType: opts.endArrow === false ? "none" : "triangle",
      dash: opts.dash || "solid"
    }
  });
}

function addLabel(slide, x, y, w, text, color = C.slate) {
  slide.addText(text, {
    x, y, w, h: 0.18,
    fontFace: "Aptos",
    fontSize: 6.5,
    color,
    align: "center",
    margin: 0,
    fit: "shrink"
  });
}

// ============================================================
// SLIDE
// ============================================================

let slide = pptx.addSlide("MASTER");

slide.addText("AI-Based Landslide Susceptibility & Dynamic Risk Monitoring", {
  x: 0.35,
  y: 0.16,
  w: 9.8,
  h: 0.38,
  fontFace: "Aptos Display",
  fontSize: 20,
  bold: true,
  color: C.navy,
  margin: 0
});

slide.addText("End-to-end architecture • Northeast India", {
  x: 0.36,
  y: 0.56,
  w: 5,
  h: 0.2,
  fontSize: 8.5,
  color: C.slate,
  margin: 0
});

// ============================================================
// 1. DATA ACQUISITION
// ============================================================

addSection(
  slide,
  0.25, 0.88, 2.15, 2.15,
  "1. DATA ACQUISITION",
  C.blue
);

addNode(slide, 0.38, 1.32, 0.88, 0.48,
  "GSI Landslide\nInventory",
  { fill: C.blueLight, line: C.blue, fontSize: 7.2 });

addNode(slide, 1.37, 1.32, 0.88, 0.48,
  "Google Earth\nEngine",
  { fill: C.blueLight, line: C.blue, fontSize: 7.2 });

addNode(slide, 0.38, 1.88, 0.88, 0.48,
  "ERA5 /\nERA5-Land",
  { fill: C.blueLight, line: C.blue, fontSize: 7.2 });

addNode(slide, 1.37, 1.88, 0.88, 0.48,
  "Copernicus DEM\n& Terrain",
  { fill: C.blueLight, line: C.blue, fontSize: 7.2 });

addNode(slide, 0.38, 2.44, 0.88, 0.43,
  "Sentinel /\nLandsat",
  { fill: C.blueLight, line: C.blue, fontSize: 7 });

addNode(slide, 1.37, 2.44, 0.88, 0.43,
  "CHIRPS /\nIMD Rainfall",
  { fill: C.blueLight, line: C.blue, fontSize: 7 });

addNode(slide, 0.87, 2.92, 0.88, 0.43,
  "Seismic /\nGeological",
  { fill: C.blueLight, line: C.blue, fontSize: 7 });

// ============================================================
// 2. PREPROCESSING
// ============================================================

addSection(
  slide,
  2.55, 0.88, 2.45, 2.15,
  "2. GEO-SPATIAL PROCESSING",
  C.green
);

addNode(slide, 2.72, 1.32, 1.05, 0.42,
  "Cleaning &\nValidation",
  { fill: C.greenLight, line: C.green, fontSize: 7 });

addNode(slide, 3.85, 1.32, 1.00, 0.42,
  "Spatial Matching\n& Projection",
  { fill: C.greenLight, line: C.green, fontSize: 6.7 });

addNode(slide, 2.72, 1.84, 1.05, 0.42,
  "Feature\nEngineering",
  { fill: C.greenLight, line: C.green, fontSize: 7 });

addNode(slide, 3.85, 1.84, 1.00, 0.42,
  "Spatial Join",
  { fill: C.greenLight, line: C.green, fontSize: 7 });

addNode(slide, 2.72, 2.36, 2.13, 0.53,
  "STATIC / SLOWLY CHANGING\nElevation • Slope • Aspect • Terrain • NDVI\nLandcover • Soil Moisture • Seismic • Rainfall Climatology",
  { fill: C.white, line: C.green, fontSize: 6.3, bold: false });

addNode(slide, 2.72, 2.94, 2.13, 0.53,
  "TEMPORAL FEATURES\nRainfall Accumulation • Intensity • Soil Moisture\nERA5 Weather • Historical Sequences",
  { fill: C.white, line: C.green, fontSize: 6.3, bold: false });

// ============================================================
// 3. MODEL 1
// ============================================================

addSection(
  slide,
  5.15, 0.88, 2.15, 2.15,
  "3. MODEL 1 — SUSCEPTIBILITY",
  C.purple
);

addNode(slide, 5.32, 1.32, 1.81, 0.42,
  "Historical Spatial Dataset",
  { fill: C.purpleLight, line: C.purple, fontSize: 7 });

addNode(slide, 5.32, 1.84, 0.82, 0.45,
  "XGBoost",
  { fill: C.white, line: C.purple, fontSize: 7.5 });

addNode(slide, 6.31, 1.84, 0.82, 0.45,
  "LightGBM",
  { fill: C.white, line: C.purple, fontSize: 7.5 });

addNode(slide, 5.32, 2.40, 1.81, 0.42,
  "Compare + Validate\nROC-AUC • PR-AUC • F1 • Recall",
  { fill: C.white, line: C.purple, fontSize: 6.5 });

addNode(slide, 5.32, 2.92, 0.82, 0.42,
  "Best\nModel",
  { fill: C.purpleLight, line: C.purple, fontSize: 7 });

addNode(slide, 6.31, 2.92, 0.82, 0.42,
  "SHAP /\nXAI",
  { fill: C.purpleLight, line: C.purple, fontSize: 7 });

addNode(slide, 5.32, 3.43, 1.81, 0.45,
  "SUSCEPTIBILITY PROBABILITY\n0 → 1",
  { fill: C.purple, line: C.purple, color: C.white, fontSize: 7.5 });

// ============================================================
// 4. MODEL 2
// ============================================================

addSection(
  slide,
  7.45, 0.88, 2.15, 2.15,
  "4. MODEL 2 — DYNAMIC RISK",
  C.orange
);

addNode(slide, 7.62, 1.32, 1.81, 0.47,
  "Temporal Dataset\nLocation + Time + Weather + Static Features",
  { fill: C.orangeLight, line: C.orange, fontSize: 6.3 });

addNode(slide, 7.62, 1.89, 1.81, 0.38,
  "Model 1 Susceptibility Score",
  { fill: C.yellowLight, line: C.yellow, fontSize: 6.7 });

addNode(slide, 7.62, 2.37, 0.52, 0.43,
  "XGB",
  { fill: C.white, line: C.orange, fontSize: 6.8 });

addNode(slide, 8.27, 2.37, 0.52, 0.43,
  "LGBM",
  { fill: C.white, line: C.orange, fontSize: 6.8 });

addNode(slide, 8.91, 2.37, 0.52, 0.43,
  "GRU",
  { fill: C.white, line: C.orange, fontSize: 6.8 });

addNode(slide, 7.62, 2.91, 1.81, 0.43,
  "Temporal Model Comparison",
  { fill: C.white, line: C.orange, fontSize: 6.5 });

addNode(slide, 7.62, 3.45, 0.82, 0.42,
  "Best\nModel",
  { fill: C.orangeLight, line: C.orange, fontSize: 7 });

addNode(slide, 8.61, 3.45, 0.82, 0.42,
  "Dynamic\nRisk",
  { fill: C.orange, line: C.orange, color: C.white, fontSize: 7 });

// ============================================================
// 5. REAL-TIME
// ============================================================

addSection(
  slide,
  9.75, 0.88, 1.75, 2.15,
  "5. REAL-TIME ENGINE",
  C.red
);

addNode(slide, 9.90, 1.32, 0.72, 0.47,
  "IMD APIs\nWeather / Forecast",
  { fill: C.redLight, line: C.red, fontSize: 6.2 });

addNode(slide, 10.70, 1.32, 0.65, 0.47,
  "IoT /\nSensors",
  { fill: C.redLight, line: C.red, fontSize: 6.5 });

addNode(slide, 9.90, 1.91, 1.45, 0.43,
  "Sensor Health\nWorking • Offline • Fault",
  { fill: C.white, line: C.red, fontSize: 6.2 });

addNode(slide, 9.90, 2.46, 1.45, 0.43,
  "Real-Time Feature\nGeneration",
  { fill: C.white, line: C.red, fontSize: 6.7 });

addNode(slide, 9.90, 3.01, 1.45, 0.47,
  "Live Risk Update\n+ Early Warning",
  { fill: C.red, line: C.red, color: C.white, fontSize: 7 });

// ============================================================
// MAIN FLOW ARROWS
// ============================================================

addArrow(slide, 2.40, 1.95, 2.55, 1.95);
addArrow(slide, 5.00, 2.0, 5.15, 2.0);
addArrow(slide, 7.30, 2.0, 7.45, 2.0);
addArrow(slide, 9.60, 2.0, 9.75, 2.0);

// ============================================================
// MODEL CONNECTIONS
// ============================================================

addArrow(slide, 4.85, 2.62, 5.32, 1.53, {
  color: C.green
});

addArrow(slide, 4.85, 2.95, 7.62, 1.55, {
  color: C.green
});

addArrow(slide, 6.23, 3.43, 7.62, 2.08, {
  color: C.purple,
  width: 1.5
});

addLabel(
  slide,
  6.25, 2.55, 1.15,
  "Susceptibility Score",
  C.purple
);

addArrow(slide, 9.43, 3.66, 8.61, 3.66, {
  color: C.red
});

// ============================================================
// 6. DASHBOARD
// ============================================================

addSection(
  slide,
  0.25, 3.75, 4.05, 2.75,
  "6. MULTILINGUAL GIS DASHBOARD",
  C.cyan
);

addNode(slide, 0.43, 4.20, 1.08, 0.52,
  "INTERACTIVE\nGIS MAP",
  { fill: C.cyan, line: C.cyan, color: C.white, fontSize: 8 });

addNode(slide, 1.67, 4.20, 1.15, 0.52,
  "Susceptibility\nZones",
  { fill: C.cyanLight, line: C.cyan, fontSize: 7 });

addNode(slide, 2.98, 4.20, 1.15, 0.52,
  "Current /\nDynamic Risk",
  { fill: C.cyanLight, line: C.cyan, fontSize: 7 });

addNode(slide, 0.43, 4.87, 1.08, 0.52,
  "Sensor\nLocations",
  { fill: C.cyanLight, line: C.cyan, fontSize: 7 });

addNode(slide, 1.67, 4.87, 1.15, 0.52,
  "Historical\nLandslides",
  { fill: C.cyanLight, line: C.cyan, fontSize: 7 });

addNode(slide, 2.98, 4.87, 1.15, 0.52,
  "Vulnerable Roads\n& Connectivity",
  { fill: C.cyanLight, line: C.cyan, fontSize: 6.6 });

addNode(slide, 0.43, 5.54, 1.08, 0.52,
  "Critical\nInfrastructure",
  { fill: C.cyanLight, line: C.cyan, fontSize: 6.7 });

addNode(slide, 1.67, 5.54, 1.15, 0.52,
  "Reported\nPublic Issues",
  { fill: C.cyanLight, line: C.cyan, fontSize: 6.8 });

addNode(slide, 2.98, 5.54, 1.15, 0.52,
  "Weather Forecast\n+ Risk Warning",
  { fill: C.cyanLight, line: C.cyan, fontSize: 6.5 });

addNode(slide, 0.43, 6.12, 1.73, 0.30,
  "Feature-Level Risk: Rainfall • Soil Moisture • Slope • Seismic • Terrain",
  { fill: C.white, line: C.cyan, fontSize: 5.8, bold: false });

addNode(slide, 2.33, 6.12, 1.80, 0.30,
  "Risk Prediction & Warning Panel",
  { fill: C.cyan, line: C.cyan, color: C.white, fontSize: 6.3 });

// ============================================================
// 7. CITIZEN APP
// ============================================================

addSection(
  slide,
  4.50, 3.75, 4.15, 2.75,
  "7. CITIZEN MOBILE APP",
  C.blue
);

addNode(slide, 4.68, 4.20, 1.15, 0.48,
  "Auto Location /\nGPS",
  { fill: C.blueLight, line: C.blue, fontSize: 7 });

addNode(slide, 5.98, 4.20, 1.15, 0.48,
  "Hazard Reporting\nSocial-Style Posting",
  { fill: C.blueLight, line: C.blue, fontSize: 6.3 });

addNode(slide, 7.28, 4.20, 1.15, 0.48,
  "Photos / Videos\nEvidence",
  { fill: C.blueLight, line: C.blue, fontSize: 6.8 });

addNode(slide, 4.68, 4.82, 1.15, 0.48,
  "AI Severity\nPrediction",
  { fill: C.white, line: C.blue, fontSize: 7 });

addNode(slide, 5.98, 4.82, 1.15, 0.48,
  "Duplicate\nDetection",
  { fill: C.white, line: C.blue, fontSize: 7 });

addNode(slide, 7.28, 4.82, 1.15, 0.48,
  "AI Issue\nSummary",
  { fill: C.white, line: C.blue, fontSize: 7 });

addNode(slide, 4.68, 5.44, 1.15, 0.48,
  "Community /\nAuthority Verification",
  { fill: C.white, line: C.blue, fontSize: 6.4 });

addNode(slide, 5.98, 5.44, 1.15, 0.48,
  "Emergency Response\nPrioritisation",
  { fill: C.white, line: C.blue, fontSize: 6.3 });

addNode(slide, 7.28, 5.44, 1.15, 0.48,
  "GIS Map +\nSearch / Filter",
  { fill: C.white, line: C.blue, fontSize: 6.7 });

addNode(slide, 4.68, 6.06, 1.15, 0.34,
  "AI Chatbot",
  { fill: C.blueLight, line: C.blue, fontSize: 6.8 });

addNode(slide, 5.98, 6.06, 1.15, 0.34,
  "Severity-Based\nNotifications",
  { fill: C.blueLight, line: C.blue, fontSize: 6.3 });

addNode(slide, 7.28, 6.06, 1.15, 0.34,
  "SOS + 10-sec\nCancel",
  { fill: C.redLight, line: C.red, fontSize: 6.5 });

// ============================================================
// 8. ADMIN
// ============================================================

addSection(
  slide,
  8.85, 3.75, 4.23, 2.75,
  "8. ADMIN / AUTHORITY RESPONSE",
  C.green
);

addNode(slide, 9.03, 4.20, 1.18, 0.45,
  "Admin /\nAuthority Login",
  { fill: C.greenLight, line: C.green, fontSize: 7 });

addNode(slide, 10.37, 4.20, 1.18, 0.45,
  "Issue Management\nDashboard",
  { fill: C.greenLight, line: C.green, fontSize: 6.7 });

addNode(slide, 11.71, 4.20, 1.18, 0.45,
  "Kanban Workflow",
  { fill: C.greenLight, line: C.green, fontSize: 6.8 });

addNode(slide, 9.03, 4.80, 1.18, 0.45,
  "Drag & Drop\nStatus",
  { fill: C.white, line: C.green, fontSize: 7 });

addNode(slide, 10.37, 4.80, 1.18, 0.45,
  "Reported → Verified\n→ Assigned",
  { fill: C.white, line: C.green, fontSize: 6.3 });

addNode(slide, 11.71, 4.80, 1.18, 0.45,
  "In Progress\n→ Resolved",
  { fill: C.white, line: C.green, fontSize: 6.7 });

addNode(slide, 9.03, 5.40, 1.18, 0.45,
  "SLA Monitoring\n& Escalation",
  { fill: C.white, line: C.green, fontSize: 6.5 });

addNode(slide, 10.37, 5.40, 1.18, 0.45,
  "GIS Issue\nMap",
  { fill: C.white, line: C.green, fontSize: 7 });

addNode(slide, 11.71, 5.40, 1.18, 0.45,
  "Emergency Response\nCoordination",
  { fill: C.green, line: C.green, color: C.white, fontSize: 6.3 });

addNode(slide, 9.03, 6.00, 3.86, 0.40,
  "Verified / Resolved Events → Feedback → Model Improvement",
  { fill: C.yellowLight, line: C.yellow, fontSize: 7 });

// ============================================================
// INTERNAL DASHBOARD ARROWS
// ============================================================

addArrow(slide, 1.51, 4.46, 1.67, 4.46, { color: C.cyan });
addArrow(slide, 2.82, 4.46, 2.98, 4.46, { color: C.cyan });

addArrow(slide, 0.97, 4.72, 0.97, 4.87, { color: C.cyan });
addArrow(slide, 2.24, 4.72, 2.24, 4.87, { color: C.cyan });
addArrow(slide, 3.55, 4.72, 3.55, 4.87, { color: C.cyan });

addArrow(slide, 0.97, 5.39, 0.97, 5.54, { color: C.cyan });
addArrow(slide, 2.24, 5.39, 2.24, 5.54, { color: C.cyan });
addArrow(slide, 3.55, 5.39, 3.55, 5.54, { color: C.cyan });

// ============================================================
// APP FLOW
// ============================================================

addArrow(slide, 5.25, 4.68, 5.25, 4.82, { color: C.blue });
addArrow(slide, 6.55, 4.68, 6.55, 4.82, { color: C.blue });
addArrow(slide, 7.85, 4.68, 7.85, 4.82, { color: C.blue });

addArrow(slide, 5.25, 5.30, 5.25, 5.44, { color: C.blue });
addArrow(slide, 6.55, 5.30, 6.55, 5.44, { color: C.blue });
addArrow(slide, 7.85, 5.30, 7.85, 5.44, { color: C.blue });

addArrow(slide, 5.25, 5.92, 5.25, 6.06, { color: C.blue });
addArrow(slide, 6.55, 5.92, 6.55, 6.06, { color: C.blue });
addArrow(slide, 7.85, 5.92, 7.85, 6.06, { color: C.blue });

// ============================================================
// ADMIN FLOW
// ============================================================

addArrow(slide, 10.21, 4.65, 10.37, 4.65, { color: C.green });
addArrow(slide, 11.55, 4.65, 11.71, 4.65, { color: C.green });

addArrow(slide, 9.62, 4.65, 9.62, 4.80, { color: C.green });
addArrow(slide, 10.96, 4.65, 10.96, 4.80, { color: C.green });
addArrow(slide, 12.30, 4.65, 12.30, 4.80, { color: C.green });

addArrow(slide, 9.62, 5.25, 9.62, 5.40, { color: C.green });
addArrow(slide, 10.96, 5.25, 10.96, 5.40, { color: C.green });
addArrow(slide, 12.30, 5.25, 12.30, 5.40, { color: C.green });

// ============================================================
// CROSS-SYSTEM CONNECTIONS
// ============================================================

// Real-time → dashboard
addArrow(slide, 10.60, 3.48, 3.65, 4.20, {
  color: C.red,
  width: 1.3
});

addLabel(
  slide,
  6.65, 3.52, 1.25,
  "Live Risk / Sensor Data",
  C.red
);

// Dynamic model → dashboard
addArrow(slide, 9.43, 3.66, 3.90, 4.20, {
  color: C.orange,
  width: 1.2
});

// Dashboard → App
addArrow(slide, 4.30, 5.25, 4.50, 5.25, {
  color: C.cyan,
  width: 1.5
});

addLabel(
  slide,
  4.25, 5.00, 0.35,
  "GIS",
  C.cyan
);

// App → Admin
addArrow(slide, 8.65, 5.25, 8.85, 5.25, {
  color: C.blue,
  width: 1.5
});

addLabel(
  slide,
  8.25, 5.00, 0.45,
  "Reports",
  C.blue
);

// Admin → notifications/app
addArrow(slide, 10.95, 6.00, 7.85, 6.06, {
  color: C.green,
  width: 1.2
});

addLabel(
  slide,
  9.05, 6.28, 1.45,
  "Response / Notifications",
  C.green
);

// ============================================================
// FEEDBACK LOOP
// ============================================================

slide.addShape(pptx.ShapeType.arc, {
  x: 4.95,
  y: 6.15,
  w: 4.0,
  h: 0.85,
  adjustPoint: 0.25,
  line: {
    color: C.yellow,
    width: 1.5,
    dash: "dash",
    endArrowType: "triangle"
  }
});

addLabel(
  slide,
  5.65, 6.60, 2.7,
  "NEW OBSERVATIONS • VERIFIED EVENTS • SENSOR DATA → MODEL UPDATE",
  C.yellow
);

// ============================================================
// TOP MODEL FLOW LABELS
// ============================================================

addLabel(
  slide,
  2.00, 3.14, 1.25,
  "Prepared Features",
  C.green
);

addLabel(
  slide,
  6.05, 3.92, 1.5,
  "WHERE?",
  C.purple
);

addLabel(
  slide,
  8.55, 3.92, 1.5,
  "WHEN?",
  C.orange
);

// ============================================================
// SAVE
// ============================================================

pptx.writeFile({
  fileName: "SIH_Landslide_System_Architecture.pptx"
});