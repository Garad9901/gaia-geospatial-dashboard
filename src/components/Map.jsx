import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polygon, useMapEvents, LayersControl, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Synthetic Data Generators
const generateSeismicData = () => {
  const points = [];
  // California region
  for (let i = 0; i < 50; i++) {
    points.push({
      id: i,
      pos: [36 + (Math.random() - 0.5) * 8, -120 + (Math.random() - 0.5) * 8],
      mag: 2 + Math.random() * 5
    });
  }
  // Japan region
  for (let i = 0; i < 60; i++) {
    points.push({
      id: i + 50,
      pos: [36 + (Math.random() - 0.5) * 10, 138 + (Math.random() - 0.5) * 10],
      mag: 3 + Math.random() * 5
    });
  }
  return points;
};

const syntheticSeismic = generateSeismicData();

// Simple mock watersheds (Polygons)
const syntheticWatersheds = [
  { id: 1, name: 'Amazon Basin Mock', positions: [[0, -70], [5, -60], [-5, -50], [-15, -65]] },
  { id: 2, name: 'Congo Basin Mock', positions: [[5, 15], [5, 25], [-10, 25], [-10, 15]] },
  { id: 3, name: 'Mississippi Mock', positions: [[45, -95], [45, -90], [30, -90], [30, -95]] }
];

// Mock NDVI patches
const syntheticNDVI = [
  { id: 1, name: 'High Veg', positions: [[-5, -70], [0, -60], [-10, -55], [-20, -65]], color: '#10b981' },
  { id: 2, name: 'Low Veg', positions: [[20, -10], [30, 0], [25, 10], [15, 0]], color: '#d97706' },
  { id: 3, name: 'Med Veg', positions: [[40, -100], [45, -90], [35, -95]], color: '#84cc16' }
];

// Visual scale parameters for California Housing
const getHousingColor = (val) => {
  if (val >= 450000) return '#a78bfa'; // Violet/Purple (Ultra Premium)
  if (val >= 350000) return '#ef4444'; // Red (High Value)
  if (val >= 220000) return '#f97316'; // Orange (Medium-High)
  if (val >= 120000) return '#10b981'; // Emerald (Medium)
  return '#3b82f6'; // Blue (Affordable)
};

const getIncomeColor = (val) => {
  // Income ranges from 0 to 15 (representing $0 to $150k/yr)
  if (val >= 10.0) return '#ec4899'; // Pink (High wealth)
  if (val >= 7.0) return '#f43f5e';  // Rose
  if (val >= 5.0) return '#a855f7';  // Purple
  if (val >= 3.0) return '#6366f1';  // Indigo
  return '#06b6d4';                  // Cyan (Lower/moderate)
};

const getPopColor = (val) => {
  // Population scale per block group
  if (val >= 3000) return '#f43f5e'; // Rose (Very high density)
  if (val >= 2000) return '#fb923c'; // Orange
  if (val >= 1200) return '#facc15'; // Yellow
  if (val >= 600) return '#4ade80';  // Green
  return '#60a5fa';                  // Blue (Low density)
};

const getPointColor = (point, colorMode) => {
  if (colorMode === 'income') return getIncomeColor(point.income);
  if (colorMode === 'pop') return getPopColor(point.pop);
  return getHousingColor(point.value);
};

const getHousingRadius = (pop) => {
  // Normalize sizes: min radius 3, max radius 10 based on block group population
  return Math.max(3, Math.min(10, 3 + pop / 1200));
};

function MapInteractionHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      // Simulate reading data at coordinates
      const mockData = {
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        ndvi: (Math.random() * 0.8 + 0.1).toFixed(2),
        smap: (Math.random() * 0.4).toFixed(3),
        seismic: Math.random() > 0.8 ? 'High' : (Math.random() > 0.5 ? 'Moderate' : 'Low')
      };
      onMapClick(mockData);
    },
  });
  return null;
}

// Controller to zoom to dataset bounds when California Housing layer is activated
function MapViewUpdater({ activeLayers }) {
  const map = useMap();
  useEffect(() => {
    if (activeLayers.housing) {
      // Focus on California bounds
      map.flyTo([37.1, -119.5], 6, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [activeLayers.housing, map]);
  return null;
}

export default function GeoMap({ activeLayers, onMapClick, housingData = [], colorMode = 'value' }) {
  return (
    <MapContainer 
      center={[20, 0]} 
      zoom={3} 
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
      attributionControl={false}
      preferCanvas={true}
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Dark Matter (CartoDB)">
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Satellite (Esri)">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri"
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      <MapInteractionHandler onMapClick={onMapClick} />
      <MapViewUpdater activeLayers={activeLayers} />

      {/* Render Data Layers */}
      {activeLayers.ndvi && syntheticNDVI.map(patch => (
        <Polygon key={`ndvi-${patch.id}`} positions={patch.positions} pathOptions={{ color: patch.color, weight: 1, fillOpacity: 0.4 }}>
           <Tooltip>{patch.name}</Tooltip>
        </Polygon>
      ))}

      {activeLayers.hydrology && syntheticWatersheds.map(basin => (
        <Polygon key={`hydro-${basin.id}`} positions={basin.positions} pathOptions={{ color: '#3b82f6', weight: 2, fillOpacity: 0.1, dashArray: '5, 10' }}>
           <Tooltip>{basin.name}</Tooltip>
        </Polygon>
      ))}

      {activeLayers.seismic && syntheticSeismic.map(quake => (
        <CircleMarker 
          key={`quake-${quake.id}`} 
          center={quake.pos}
          radius={quake.mag * 2}
          pathOptions={{ 
            color: '#ef4444', 
            fillColor: '#ef4444', 
            fillOpacity: 0.6,
            weight: 1
          }}
        >
          <Tooltip>Mag: {quake.mag.toFixed(1)}</Tooltip>
        </CircleMarker>
      ))}

      {/* Render California Housing Layer */}
      {activeLayers.housing && housingData.map((point, idx) => {
        const markerColor = getPointColor(point, colorMode);
        return (
          <CircleMarker
            key={`housing-${idx}`}
            center={[point.lat, point.lng]}
            radius={getHousingRadius(point.pop)}
            pathOptions={{
              color: markerColor,
              fillColor: markerColor,
              fillOpacity: 0.6,
              weight: 0.5
            }}
            eventHandlers={{
              click: () => onMapClick(point)
            }}
          >
            <Tooltip>
              <div>
                <strong className="block text-gray-950 font-semibold">Median Value: ${point.value.toLocaleString()}</strong>
                <span className="block text-gray-500 text-xs mt-0.5">Income: ${Math.round(point.income * 10000).toLocaleString()}/yr</span>
                <span className="block text-gray-500 text-xs">Population: {point.pop.toLocaleString()}</span>
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}