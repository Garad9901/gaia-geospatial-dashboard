import { useState, useEffect, useMemo } from 'react';
import { Layers, Activity, Droplets, Leaf, Settings, Info, Home, Users, MapPin, SlidersHorizontal, Loader2 } from 'lucide-react';
import GeoMap from './components/Map';
import LayerControl from './components/LayerControl';
import GaiaChat from './components/GaiaChat';

function App() {
  const [activeLayers, setActiveLayers] = useState({
    ndvi: false,
    seismic: false,
    hydrology: false,
    housing: false,
  });

  const [clickedData, setClickedData] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // California Housing Filters State
  const [maxPrice, setMaxPrice] = useState(500001);
  const [minIncome, setMinIncome] = useState(0);
  const [proximityFilter, setProximityFilter] = useState('ALL');
  const [colorMode, setColorMode] = useState('value'); // 'value', 'income', 'pop'

  // Backend state
  const [housingPoints, setHousingPoints] = useState([]);
  const [stats, setStats] = useState({
    avgValue: 0,
    avgIncome: 0,
    avgAge: 0,
    totalPop: 0,
    count: 0,
    byProximity: []
  });
  const [loadingData, setLoadingData] = useState(false);

  const handleLayerToggle = (layerKey) => {
    setActiveLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey],
    }));
  };

  // Fetch housing points and aggregated stats from Express backend
  useEffect(() => {
    // Only fetch if housing layer is activated (or to pre-load charts/stats)
    if (!activeLayers.housing) return;

    const fetchData = async () => {
      setLoadingData(true);
      try {
        const query = `?maxPrice=${maxPrice}&minIncome=${minIncome}&proximity=${proximityFilter}`;
        
        // Fetch housing coordinates
        const pointsRes = await fetch(`/api/housing${query}`);
        const points = await pointsRes.json();
        setHousingPoints(points);

        // Fetch aggregated stats
        const statsRes = await fetch(`/api/stats${query}`);
        const statsData = await statsRes.json();
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching backend data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [activeLayers.housing, maxPrice, minIncome, proximityFilter]);

  // Coordinate analysis endpoint trigger
  const handleMapClick = async (point) => {
    // If it is a California Housing marker (contains census properties)
    if (point.income !== undefined) {
      setLoadingAnalysis(true);
      setClickedData({ ...point, isHousing: true, loading: true });
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(point),
        });
        const data = await res.json();
        setClickedData({ ...data, isHousing: true, loading: false });
      } catch (err) {
        console.error('Analysis API fetch failed:', err);
        // Fallback calculations in client if server fails
        const ndviVal = Math.min(0.95, Math.max(0.05, 0.15 + (point.income / 12) * 0.6)).toFixed(2);
        const distToFault = Math.abs(point.lng - (-122.25));
        const seismicRisk = distToFault < 0.25 ? 'High' : (distToFault < 0.65 ? 'Moderate' : 'Low');
        setClickedData({
          ...point,
          ndvi: ndviVal,
          smap: '0.138',
          seismic: seismicRisk,
          isHousing: true,
          loading: false,
          assessment: '### Analysis Offline\nFailed to fetch from backend API. Utilizing fallback client estimation.'
        });
      } finally {
        setLoadingAnalysis(false);
      }
    } else {
      // It is a normal map empty coordinate click
      setClickedData({
        ...point,
        isHousing: false,
      });
    }
  };

  // Find max value in proximity distribution to scale the SVG bar chart
  const maxProximityVal = useMemo(() => {
    if (!stats.byProximity || stats.byProximity.length === 0) return 1;
    return Math.max(...stats.byProximity.map(x => x.avgValue), 1);
  }, [stats.byProximity]);

  return (
    <div className="flex h-screen bg-gray-950 text-gray-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col shadow-2xl z-20 shrink-0">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-100 tracking-tight">GAIA</h1>
            <p className="text-xs text-blue-400 font-semibold tracking-wider uppercase">Geospatial Dashboard</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Data Layers</h2>
            <LayerControl activeLayers={activeLayers} onToggle={handleLayerToggle} />
          </div>

          {/* California Housing Dashboard & Filters panel (Displays only when Housing layer is active) */}
          {activeLayers.housing && (
            <div className="border-t border-gray-800 pt-6 space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 mb-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Housing Dashboard</h3>
              </div>

              {/* Color Mode Switcher */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 block">GIS Marker Color Mode</label>
                <div className="grid grid-cols-3 gap-1 bg-gray-950 p-1 rounded-lg border border-gray-800">
                  {[
                    { id: 'value', label: 'Price' },
                    { id: 'income', label: 'Income' },
                    { id: 'pop', label: 'Pop' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      id={`gis-colormode-${mode.id}`}
                      onClick={() => setColorMode(mode.id)}
                      className={`text-[10px] uppercase font-bold py-1.5 px-2 rounded transition-all ${
                        colorMode === mode.id
                          ? 'bg-amber-500 text-gray-950 font-extrabold shadow'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price filter */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Max House Value</span>
                  <span className="text-amber-400 font-mono font-bold">${maxPrice.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={15000}
                  max={500001}
                  step={10000}
                  id="filter-price-slider"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Income filter */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Min Median Income</span>
                  <span className="text-amber-400 font-mono font-bold">${(minIncome * 10000).toLocaleString()}/yr</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={15}
                  step={0.5}
                  id="filter-income-slider"
                  value={minIncome}
                  onChange={(e) => setMinIncome(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Ocean proximity filter */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 block">Ocean Proximity</label>
                <select
                  value={proximityFilter}
                  id="filter-proximity-select"
                  onChange={(e) => setProximityFilter(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-xs rounded-lg p-2 text-gray-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="ALL">All Regions</option>
                  <option value="NEAR BAY">Near Bay</option>
                  <option value="<1H OCEAN">&lt;1 Hour to Ocean</option>
                  <option value="INLAND">Inland</option>
                  <option value="NEAR OCEAN">Near Ocean</option>
                  <option value="ISLAND">Island</option>
                </select>
              </div>

              {/* Aggregated Stats Cards / Skeletons */}
              <div className="border-t border-gray-800 pt-5 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Metrics ({stats.count} groups)</h4>
                  {loadingData && <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin" />}
                </div>
                
                {loadingData ? (
                  // Shimmering Skeletons
                  <div className="grid grid-cols-2 gap-2.5 animate-pulse">
                    {[1, 2, 3, 4].map(x => (
                      <div key={x} className="bg-gray-800/40 p-2.5 rounded-lg border border-gray-800/50 h-12">
                        <div className="h-2 w-10 bg-gray-800 rounded mb-2"></div>
                        <div className="h-3 w-16 bg-gray-800 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-gray-800/60 p-2.5 rounded-lg border border-gray-800">
                      <span className="text-[9px] text-gray-500 uppercase block font-medium">Avg Value</span>
                      <span className="text-xs font-mono font-bold text-amber-400">${Math.round(stats.avgValue).toLocaleString()}</span>
                    </div>
                    <div className="bg-gray-800/60 p-2.5 rounded-lg border border-gray-800">
                      <span className="text-[9px] text-gray-500 uppercase block font-medium">Avg Income</span>
                      <span className="text-xs font-mono font-bold text-amber-400">${Math.round(stats.avgIncome).toLocaleString()}</span>
                    </div>
                    <div className="bg-gray-800/60 p-2.5 rounded-lg border border-gray-800">
                      <span className="text-[9px] text-gray-500 uppercase block font-medium">Total Pop</span>
                      <span className="text-xs font-mono font-bold text-amber-400">{stats.totalPop.toLocaleString()}</span>
                    </div>
                    <div className="bg-gray-800/60 p-2.5 rounded-lg border border-gray-800">
                      <span className="text-[9px] text-gray-500 uppercase block font-medium">Avg Age</span>
                      <span className="text-xs font-mono font-bold text-amber-400">{Math.round(stats.avgAge)} yrs</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic SVG Bar Chart */}
              {!loadingData && stats.byProximity && stats.byProximity.length > 0 && (
                <div className="space-y-2 border-t border-gray-800 pt-5">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">Price Distribution By Proximity</span>
                  <svg width="100%" height="110" className="bg-gray-950 rounded-lg p-2 border border-gray-800">
                    {stats.byProximity.map((item, index) => {
                      const barWidth = 30;
                      const spacing = 14;
                      const x = index * (barWidth + spacing) + 12;
                      const height = maxProximityVal ? (item.avgValue / maxProximityVal) * 55 : 0;
                      const y = 80 - height;
                      const isSelected = proximityFilter === item.proximity;

                      return (
                        <g 
                          key={item.proximity} 
                          className="cursor-pointer group"
                          id={`chart-bar-${item.proximity.replace(/[^a-zA-Z0-9]/g, '')}`}
                          onClick={() => setProximityFilter(proximityFilter === item.proximity ? 'ALL' : item.proximity)}
                        >
                          {/* Background hover bar */}
                          <rect 
                            x={x - 4} 
                            y={10} 
                            width={barWidth + 8} 
                            height={85} 
                            fill="transparent" 
                            className="group-hover:fill-gray-800/30 rounded transition-colors"
                          />
                          {/* Bar */}
                          <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={height}
                            fill={isSelected ? '#f59e0b' : '#3b82f6'}
                            rx="3"
                            className="transition-all duration-300 opacity-80 group-hover:opacity-100"
                          />
                          {/* Top value */}
                          <text
                            x={x + barWidth / 2}
                            y={y - 4}
                            textAnchor="middle"
                            fill="#d1d5db"
                            fontSize="8"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            {item.avgValue ? `$${Math.round(item.avgValue / 1000)}k` : '0'}
                          </text>
                          {/* Label */}
                          <text
                            x={x + barWidth / 2}
                            y="95"
                            textAnchor="middle"
                            fill={isSelected ? '#f59e0b' : '#9ca3af'}
                            fontSize="7"
                            fontWeight="bold"
                          >
                            {item.proximity === '<1H OCEAN' ? '<1H' : (item.proximity === 'NEAR OCEAN' ? 'OCEAN' : (item.proximity === 'NEAR BAY' ? 'BAY' : item.proximity))}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                  <span className="text-[9px] text-gray-500 block text-center italic">Tip: Click bars to toggle proximity filtering</span>
                </div>
              )}
            </div>
          )}

          <div className="border-t border-gray-800 pt-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Analysis Context</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Select layers to visualize synthetic multi-spectral and geophysical datasets alongside real socio-environmental California Housing metrics.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-gray-800 bg-gray-900 flex justify-between items-center text-gray-500">
          <button className="hover:text-gray-300 transition-colors p-2 rounded hover:bg-gray-800"><Settings className="w-5 h-5" /></button>
          <button className="hover:text-gray-300 transition-colors p-2 rounded hover:bg-gray-800"><Info className="w-5 h-5" /></button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Map Container */}
        <div className="flex-1 relative z-0">
          <GeoMap activeLayers={activeLayers} onMapClick={handleMapClick} housingData={housingPoints} colorMode={colorMode} />
        </div>

        {/* Bottom Data Panel */}
        {clickedData && (
          <div className="absolute bottom-6 right-6 left-6 bg-gray-900/95 backdrop-blur-md border border-gray-700 p-5 rounded-2xl shadow-2xl z-20 animate-in slide-in-from-bottom-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                {clickedData.isHousing ? 'Socio-Environmental Inspection' : 'Point Observation Data'}
              </h3>
              <button 
                onClick={() => setClickedData(null)}
                className="text-gray-500 hover:text-gray-300 text-sm font-semibold"
              >
                Close
              </button>
            </div>
            
            {clickedData.isHousing ? (
              clickedData.loading ? (
                // Shimmering assessment skeleton
                <div className="flex items-center justify-center py-12 gap-3">
                  <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                  <span className="text-gray-400 text-sm font-medium">Analyzing spatial indices and fault lines...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-2">
                  {/* Geophysical context */}
                  <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-400" />
                      Geophysical Context
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-1">
                      <div className="bg-gray-900 p-2 rounded border border-gray-800/50">
                        <span className="text-[10px] text-gray-500 block">Latitude</span>
                        <span className="font-mono text-gray-300 font-bold">{clickedData.lat.toFixed(4)}</span>
                      </div>
                      <div className="bg-gray-900 p-2 rounded border border-gray-800/50">
                        <span className="text-[10px] text-gray-500 block">Longitude</span>
                        <span className="font-mono text-gray-300 font-bold">{clickedData.lng.toFixed(4)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs bg-gray-900 p-2 rounded border border-gray-800/50">
                        <span className="text-emerald-400 flex items-center gap-1"><Leaf className="w-3.5 h-3.5" /> NDVI (Greening)</span>
                        <span className="font-mono font-bold text-emerald-300">{clickedData.ndvi}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs bg-gray-900 p-2 rounded border border-gray-800/50">
                        <span className="text-blue-400 flex items-center gap-1"><Droplets className="w-3.5 h-3.5" /> Soil Moisture</span>
                        <span className="font-mono font-bold text-blue-300">{clickedData.smap} m³/m³</span>
                      </div>
                      <div className="flex justify-between items-center text-xs bg-gray-900 p-2 rounded border border-gray-800/50">
                        <span className="text-red-400 flex items-center gap-1"><Activity className="w-3.5 h-3.5" /> Seismic Hazard</span>
                        <span className="font-mono font-bold text-red-300">{clickedData.seismic}</span>
                      </div>
                    </div>
                  </div>

                  {/* Socioeconomic parameters */}
                  <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5 text-amber-400" />
                      Socioeconomics
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center bg-gray-900 p-2 rounded border border-gray-800/50">
                        <span className="text-gray-400">Median House Value</span>
                        <span className="font-mono font-bold text-amber-400 text-sm">${clickedData.value.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center bg-gray-900 p-2 rounded border border-gray-800/50">
                        <span className="text-gray-400">Median Income</span>
                        <span className="font-mono font-bold text-gray-200">${Math.round(clickedData.income * 10000).toLocaleString()}/yr</span>
                      </div>
                      <div className="flex justify-between items-center bg-gray-900 p-2 rounded border border-gray-800/50">
                        <span className="text-gray-400">Median Housing Age</span>
                        <span className="font-mono font-bold text-gray-200">{clickedData.age} years</span>
                      </div>
                      <div className="flex justify-between items-center bg-gray-900 p-2 rounded border border-gray-800/50">
                        <span className="text-gray-400">Ocean Proximity</span>
                        <span className="font-bold text-blue-300">{clickedData.proximity}</span>
                      </div>
                    </div>
                  </div>

                  {/* Demographics / block scale details */}
                  <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      Demographics & Scale
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center bg-gray-900 p-2 rounded border border-gray-800/50">
                        <span className="text-gray-400">Total Population</span>
                        <span className="font-mono font-bold text-gray-200">{clickedData.pop.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center bg-gray-900 p-2 rounded border border-gray-800/50">
                        <span className="text-gray-400">Total Households</span>
                        <span className="font-mono font-bold text-gray-200">{clickedData.households.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center bg-gray-900 p-2 rounded border border-gray-800/50">
                        <span className="text-gray-400">Total Rooms</span>
                        <span className="font-mono font-bold text-gray-200">{clickedData.rooms}</span>
                      </div>
                      <div className="flex justify-between items-center bg-gray-900 p-2 rounded border border-gray-800/50">
                        <span className="text-gray-400">Total Bedrooms</span>
                        <span className="font-mono font-bold text-gray-200">{clickedData.bedrooms}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ) : (
              // Default view for normal map point selection
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Coordinates</p>
                  <p className="font-mono text-sm mt-1">{clickedData.lat.toFixed(4)}, {clickedData.lng.toFixed(4)}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                  <p className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1"><Leaf className="w-3 h-3 text-emerald-400" /> Est. NDVI</p>
                  <p className="font-mono text-sm mt-1 text-emerald-400">{clickedData.ndvi}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                  <p className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1"><Droplets className="w-3 h-3 text-blue-400" /> SMAP Anomaly</p>
                  <p className="font-mono text-sm mt-1 text-blue-400">{clickedData.smap} m³/m³</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                  <p className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1"><Activity className="w-3 h-3 text-red-400" /> Seismic Hazard</p>
                  <p className="font-mono text-sm mt-1 text-red-400">{clickedData.seismic}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* GAIA Chat Interface */}
      <GaiaChat clickedData={clickedData} />
    </div>
  );
}

export default App;