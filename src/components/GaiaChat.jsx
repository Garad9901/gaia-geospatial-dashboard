import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, ChevronRight } from 'lucide-react';

export default function GaiaChat({ clickedData }) {
  const [messages, setMessages] = useState([
    {
      role: 'gaia',
      content: "What Earth system are we investigating? Select a layer on the left and click anywhere on the map or click a California Housing marker to analyze local socioeconomic and geophysical parameters. I will take it from there."
    }
  ]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Respond to clicked map data dynamically
  useEffect(() => {
    if (!clickedData) return;

    // Add coordinate log message
    const coordString = `Selected Point: [Lat: ${clickedData.lat.toFixed(4)}, Lng: ${clickedData.lng.toFixed(4)}]`;
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: coordString }
    ]);

    if (clickedData.isHousing) {
      if (clickedData.loading) {
        setMessages((prev) => [
          ...prev,
          { role: 'gaia', content: "Retrieving backend geoscientific assessment for census tract..." }
        ]);
      } else {
        // Render the backend generated report
        setMessages((prev) => [
          ...prev,
          { role: 'gaia', content: clickedData.assessment || "No report available." }
        ]);
      }
    } else {
      // Normal point observation
      const normalAssessment = `### Geophysical Point Assessment

**Coordinates:** ${clickedData.lat.toFixed(4)}, ${clickedData.lng.toFixed(4)}
**Vegetation (NDVI Proxy):** ${clickedData.ndvi}
**Soil Moisture (SMAP Proxy):** ${clickedData.smap} m³/m³
**Seismic Shaking Zone:** ${clickedData.seismic}

*Note: Activate the California Housing layer to overlay socioeconomic census data on these geoscientific features.*`;
      setMessages((prev) => [
        ...prev,
        { role: 'gaia', content: normalAssessment }
      ]);
    }
  }, [clickedData]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setInput('');

    // Simulate GAIA's expert reasoning based on keywords
    setTimeout(() => {
      let reply = "";
      const lower = userText.toLowerCase();

      if (lower.includes('seismic') || lower.includes('fault') || lower.includes('earthquake')) {
        reply = `**USGS Seismic Fault Analysis:**
California tectonic hazards are dominated by the San Andreas Fault plate boundary (strike-slip system). In our simulation, seismic risk is computed based on coordinate proximity to known fault lines (e.g. -122.25° longitude for northern segments and -118.25° for southern segments). High-risk zones require structural reinforcement under local building safety regulations.`;
      } else if (lower.includes('ndvi') || lower.includes('vegetation') || lower.includes('green')) {
        reply = `**Normalized Difference Vegetation Index (NDVI):**
NDVI measures surface greenness by comparing red (chlorophyll absorbing) and near-infrared (mesophyll reflecting) bands:
$$\\text{NDVI} = \\frac{\\text{NIR} - \\text{Red}}{\\text{NIR} + \\text{Red}}$$
In residential areas, NDVI displays a strong socioeconomic coupling known as the **luxury effect**: wealthier communities show higher greenness due to municipal canopy investments and active home irrigation.`;
      } else if (lower.includes('smap') || lower.includes('moisture') || lower.includes('water') || lower.includes('hydro')) {
        reply = `**Hydrological Soil Moisture Profiling:**
NASA's Soil Moisture Active Passive (SMAP) satellite measures L-band microwave emissions to retrieve volumetric water content in the top 5 cm of soil. Anomalies (<0.10 m³/m³) identify crop distress and drought, while elevated levels correlate with river basin runoff and watershed recharge.`;
      } else if (lower.includes('income') || lower.includes('socioeconomic') || lower.includes('housing') || lower.includes('price')) {
        reply = `**Socio-Environmental Interactions:**
Our dataset connects socioeconomic variables (median house value, household income, population density) with geoscientific parameters. Clicking different block groups reveals how proximity to the coast (ocean proximity) shifts both property values and local NDVI greenery scores.`;
      } else {
        reply = `**GAIA Geoscientific Agent:**
I can provide detailed explanations on the following topics:
- **Tectonics & Seismic Hazards** (fault proximity, risk levels)
- **Ecosystems & NDVI** (the socio-ecological luxury effect, equations)
- **Hydrology & Soil Moisture** (SMAP radar observation, anomalies)
- **Socio-Environmental Systems** (California housing correlations)

Please select coordinates on the map or ask a specific question.`;
      }

      setMessages((prev) => [...prev, { role: 'gaia', content: reply }]);
    }, 1000);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        id="gaia-chat-open-btn"
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-900 border border-gray-700 border-r-0 text-blue-400 p-3 rounded-l-xl shadow-2xl z-30 hover:bg-gray-800 transition-colors"
      >
        <Bot className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="w-96 bg-gray-900 border-l border-gray-800 flex flex-col shadow-2xl z-20 transition-all duration-300 h-full shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/20 p-2 rounded-lg border border-blue-500/30">
            <Bot className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-100 tracking-tight">GAIA</h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Geoscientific Agent</p>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          id="gaia-chat-close-btn"
          className="text-gray-500 hover:text-gray-300 p-1"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'gaia' ? 'bg-blue-900 text-blue-400' : 'bg-gray-800 text-gray-400'}`}>
              {msg.role === 'gaia' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div className={`p-3 rounded-xl text-sm leading-relaxed max-w-[85%] ${
              msg.role === 'gaia' 
                ? 'bg-gray-800/50 text-gray-300 border border-gray-700/50' 
                : 'bg-blue-600 text-white'
            }`}>
              <span className="whitespace-pre-wrap font-sans block">{msg.content}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            id="gaia-chat-input"
            placeholder="Ask GAIA or click map for coords..."
            className="w-full bg-gray-800 border border-gray-700 text-sm text-gray-200 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button 
            type="submit"
            id="gaia-chat-send-btn"
            className="absolute right-2 text-blue-400 hover:text-blue-300 p-2 disabled:opacity-50"
            disabled={!input.trim()}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}