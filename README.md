# 🌍 GAIA — Geospatial & Socio-Environmental Analytics Dashboard

GAIA is a high-performance, full-stack GIS and geospatial intelligence platform that combines California census data with environmental and geoscientific indicators to generate meaningful spatial insights.

The platform integrates socioeconomic block-group statistics with vegetation canopy estimates (NDVI), soil moisture proxies (SMAP), and seismic hazard indicators to provide an interactive exploration of environmental, geological, and demographic patterns.

---

## 🚀 Features

### 🌎 Seismic & Tectonic Risk Analysis
- Calculates fault-line proximity using USGS-inspired seismic proxies.
- Estimates localized earthquake risk levels.
- Supports major California fault systems:
  - San Andreas Fault
  - Newport-Inglewood Fault
- Categorizes locations into:
  - High Risk
  - Moderate Risk
  - Low Risk

### 🌿 Eco-Socioeconomic Modeling
- Implements the **Luxury Effect** hypothesis.
- Models the relationship between median household income and vegetation density.
- Estimates NDVI-based urban canopy coverage.

### 🎨 Dynamic GIS Visualization
- Interactive marker styling based on:
  - Property Value
  - Household Income
  - Population
- Real-time filtering and rendering.

### 📊 Interactive Analytics Dashboard
- SVG-powered responsive charts.
- Visualizes average housing prices by ocean proximity.
- Clickable chart filters linked directly to map data.

### 🤖 AI-Powered Geospatial Assistant
- Context-aware environmental chatbot.
- Uses active map coordinates for localized responses.
- Answers:
  - Environmental questions
  - Geological queries
  - Seismic risk assessments
  - Socioeconomic observations

### ⚡ Optimized Performance
- Leaflet Canvas Rendering (`preferCanvas`)
- Backend-side filtering with Express
- Smooth rendering of thousands of markers
- Designed for high-performance geospatial exploration

---

## 🏗️ Architecture

```text
┌─────────────────────┐
│ React Frontend      │
│ Leaflet GIS Layer   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Express Backend API │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Census Data Engine  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Geo Analysis Layer  │
│ NDVI • SMAP • Risk  │
└─────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Lucide React

### GIS & Mapping
- Leaflet
- React Leaflet
- Canvas Rendering Engine

### Backend
- Node.js
- Express.js
- CORS

### Data Processing
- Python
- Data Cleaning
- Data Downsampling

### Development Tools
- Concurrently
- npm

---

# 🔌 API Documentation

Backend runs on **Port 3001**.

---

## 1. Retrieve Housing Records

### Endpoint

```http
GET /api/housing
```

### Query Parameters

| Parameter | Type | Description |
|------------|--------|-------------|
| maxPrice | Number | Maximum property value |
| minIncome | Number | Minimum household income |
| proximity | String | Ocean proximity filter |

### Example

```http
GET /api/housing?maxPrice=300000&minIncome=4
```

---

## 2. Retrieve Aggregated Statistics

### Endpoint

```http
GET /api/stats
```

### Sample Response

```json
{
  "avgValue": 206850,
  "avgIncome": 38700,
  "avgAge": 28.6,
  "totalPop": 1420500,
  "count": 1250,
  "byProximity": [
    {
      "proximity": "INLAND",
      "avgValue": 124500,
      "count": 680
    },
    {
      "proximity": "NEAR BAY",
      "avgValue": 352000,
      "count": 180
    }
  ]
}
```

---

## 3. Spatial Point Analysis

### Endpoint

```http
POST /api/analyze
```

### Request Body

```json
{
  "lat": 37.88,
  "lng": -122.23,
  "income": 8.32,
  "value": 452600,
  "proximity": "NEAR BAY"
}
```

### Response

Returns a comprehensive geospatial and socioeconomic assessment with a generated scientific narrative.

---

# 💻 Installation

## Prerequisites

- Node.js v18+
- Git

---

## Clone Repository

```bash
git clone https://github.com/Garad9901/gaia-geospatial-dashboard.git

cd gaia-geospatial-dashboard
```

---

## Install Dependencies

```bash
npm install
```

---

## Run Development Server

```bash
npm run dev
```

### Frontend

```text
http://localhost:5174
```

### Backend

```text
http://localhost:3001
```

---

## Production Build

```bash
npm run build
```

Builds and optimizes the application for deployment.

---

# 🔬 Scientific Models

## Vegetation Canopy Estimation (Luxury Effect)

\[
NDVI = clamp\left(
0.15 + \left(\frac{Income}{12}\right) \times 0.6 + \delta,
0.05,
0.95
\right)
\]

Where:

- **Income** = normalized census income
- **δ** = localized environmental variance

---

## Seismic Fault Distance Index

\[
Distance = min(|Lng + 122.25|,\ |Lng + 118.25|)
\]

### Risk Thresholds

| Distance | Risk Level |
|-----------|-----------|
| < 0.20 | High |
| 0.20 – 0.60 | Moderate |
| ≥ 0.60 | Low |

---

# 📈 Applications

- Smart Cities
- Urban Planning
- Environmental Monitoring
- Disaster Risk Assessment
- Climate Adaptation Research
- Geospatial Intelligence
- Socioeconomic Analytics

---

# 📸 Screenshots

Add screenshots here:

```md
![Dashboard](./screenshots/dashboard.png)
![Map View](./screenshots/map-view.png)
![Analytics](./screenshots/analytics.png)
```

---

# 📄 License

Licensed under the **MIT License**.

---

# 👨‍💻 Author

### Yash Garad

Building at the intersection of:

- 🌍 Geospatial Analytics
- 📊 Data Science
- 🤖 Artificial Intelligence
- 📈 Machine Learning

---

⭐ If you found this project interesting, consider starring the repository.
