import React from 'react';
import { Leaf, Activity, Droplets, Home } from 'lucide-react';

const layers = [
  {
    id: 'ndvi',
    name: 'Vegetation Index (NDVI)',
    description: 'MODIS/Terra 16-Day L3 Global 250m',
    icon: Leaf,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-500/20',
    dotClass: 'border-emerald-500 bg-emerald-400'
  },
  {
    id: 'seismic',
    name: 'Seismic Hazards',
    description: 'USGS Earthquake Fault Zones',
    icon: Activity,
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-500/20',
    dotClass: 'border-red-500 bg-red-400'
  },
  {
    id: 'hydrology',
    name: 'Hydrological Basins',
    description: 'HydroSHEDS Global Watersheds',
    icon: Droplets,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-500/20',
    dotClass: 'border-blue-500 bg-blue-400'
  },
  {
    id: 'housing',
    name: 'California Housing',
    description: 'California Census Tract Block Groups',
    icon: Home,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-500/20',
    dotClass: 'border-amber-500 bg-amber-400'
  }
];

export default function LayerControl({ activeLayers, onToggle }) {
  return (
    <div className="space-y-3">
      {layers.map((layer) => {
        const Icon = layer.icon;
        const isActive = activeLayers[layer.id];
        
        return (
          <button
            key={layer.id}
            id={`layer-toggle-${layer.id}`}
            onClick={() => onToggle(layer.id)}
            className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-start gap-3
              ${isActive 
                ? `bg-gray-800 ${layer.border} shadow-lg` 
                : 'bg-gray-900/50 border-transparent hover:bg-gray-800 hover:border-gray-700'
              }`}
          >
            <div className={`p-2 rounded-lg ${isActive ? layer.bg : 'bg-gray-800'}`}>
              <Icon className={`w-5 h-5 ${isActive ? layer.color : 'text-gray-500'}`} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h3 className={`font-medium ${isActive ? 'text-gray-200' : 'text-gray-400'}`}>
                  {layer.name}
                </h3>
                <div className={`w-3 h-3 rounded-full border-2 ${isActive ? layer.dotClass : 'border-gray-600 bg-transparent'}`} />
              </div>
              <p className="text-xs text-gray-500 mt-1">{layer.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}