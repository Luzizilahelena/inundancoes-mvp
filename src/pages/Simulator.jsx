import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://inunda-es-sig.onrender.com";

const SEV = {
  Leve:     { fill: "rgba(59,173,227,0.72)",  border: "#1a7fa8", hex: "#3baee3", label: "Leve" },
  Moderada: { fill: "rgba(245,166,35,0.78)",  border: "#c47d08", hex: "#f5a623", label: "Moderada" },
  Grave:    { fill: "rgba(255,92,92,0.82)",   border: "#c0392b", hex: "#ff5c5c", label: "Grave" },
  Crítica:  { fill: "rgba(200,60,180,0.86)",  border: "#7b1fa2", hex: "#c83cb4", label: "Crítica" },
  safe:     { fill: "rgba(61,220,104,0.15)",  border: "#2d6e42", hex: "#3ddc68", label: "Segura" },
};

function getSev(severity, flooded) {
  if (!flooded || !severity || severity === "Nenhuma") return SEV.safe;
  return SEV[severity] || SEV.Moderada;
}

function fmt(n) { return new Intl.NumberFormat("pt-BR").format(n); }

function LeafletLoader({ onLoad }) {
  useEffect(() => {
    if (window.L) { onLoad(); return; }
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(css);
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = onLoad;
    document.head.appendChild(script);
  }, []);
  return null;
}

export default function Simulator() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInst = useRef(null);
  const layerRef = useRef(null);
  const L = useRef(null);

  const [level, setLevel] = useState("province");
  const [province, setProvince] = useState("all");
  const [municipality, setMunicipality] = useState("all");
  const [bairro, setBairro] = useState("all");
  const [floodRate, setFloodRate] = useState(50);
  const [waterLevel, setWaterLevel] = useState("");

  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [bairros, setBairros] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [results, setResults] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* FIX 1 — Lock body scroll when sidebar open on mobile */
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  /* FIX 2 — Close sidebar when rotating to landscape / resizing above breakpoint */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const initMap = useCallback(() => {
    if (mapInst.current || !mapRef.current || !window.L) return;
    L.current = window.L;
    const map = L.current.map(mapRef.current, { zoomControl: false }).setView([-8.8383, 13.2344], 11);
    L.current.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap © CARTO", maxZoom: 19,
    }).addTo(map);
    L.current.control.zoom({ position: "bottomright" }).addTo(map);
    mapInst.current = map;
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/provinces`)
      .then(r => r.json()).then(d => d.success && setProvinces(d.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (province === "all") { setMunicipalities([]); setMunicipality("all"); return; }
    fetch(`${API_URL}/api/municipalities?province=${encodeURIComponent(province)}`)
      .then(r => r.json()).then(d => { if (d.success) { setMunicipalities(d.data); setMunicipality("all"); } }).catch(() => {});
  }, [province]);

  useEffect(() => {
    if (municipality === "all" || level !== "bairro") { setBairros([]); setBairro("all"); return; }
    fetch(`${API_URL}/api/bairros?province=${encodeURIComponent(province)}&municipality=${encodeURIComponent(municipality)}`)
      .then(r => r.json()).then(d => { if (d.success) { setBairros(d.data); setBairro("all"); } }).catch(() => {});
  }, [municipality, level]);

  function renderMap(data, isBairro) {
    if (!L.current || !mapInst.current) return;
    if (layerRef.current) mapInst.current.removeLayer(layerRef.current);

    const geojson = JSON.parse(data.geojson);
    const popup = p => {
      const c = getSev(p.severity, p.flooded);
      return `<div style="font-family:var(--body)min-width:180px;font-size:12px;color:#e8f0ea;">
        <div style="font-family:var(--display)font-size:14px;font-weight:700;color:#fff;margin-bottom:8px;">${p.name}</div>
        <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.07);">
          <span style="color:rgba(232,240,234,0.5)">Status</span>
          <span style="font-weight:600;color:${p.flooded?"#ff5c5c":"#3ddc68"}">${p.flooded?"INUNDADA":"SEGURA"}</span>
        </div>
        ${p.flooded ? `
        <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.07);">
          <span style="color:rgba(232,240,234,0.5)">Severidade</span>
          <span style="color:${c.hex};font-weight:600;">${p.severity}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.07);">
          <span style="color:rgba(232,240,234,0.5)">Nível água</span>
          <span style="color:#fff;">${p.waterLevel?.toFixed(2)} m</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.07);">
          <span style="color:rgba(232,240,234,0.5)">Pop. afectada</span>
          <span style="color:#ff5c5c;font-weight:600;">${fmt(p.affectedPopulation)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:5px 0;">
          <span style="color:rgba(232,240,234,0.5)">Recuperação</span>
          <span style="color:#fff;">${p.recoveryDays} dias</span>
        </div>` : ""}
        ${p.elevation != null ? `<div style="display:flex;justify-content:space-between;padding:5px 0;border-top:1px solid rgba(255,255,255,0.07);margin-top:2px;"><span style="color:rgba(232,240,234,0.5)">Elevação</span><span style="color:#fff;">${p.elevation} m</span></div>` : ""}
      </div>`;
    };

    let layer;
    if (isBairro) {
      layer = L.current.geoJSON(geojson, {
        pointToLayer: (f, ll) => {
          const c = getSev(f.properties.severity, f.properties.flooded);
          return L.current.circleMarker(ll, {
            radius: f.properties.flooded ? 13 : 9,
            fillColor: c.fill, color: c.border,
            weight: 2, opacity: 1, fillOpacity: 0.92,
          });
        },
        onEachFeature: (f, l) => l.bindPopup(popup(f.properties), { className: "dark-popup" }),
      }).addTo(mapInst.current);
    } else {
      layer = L.current.geoJSON(geojson, {
        style: f => {
          const c = getSev(f.properties.severity, f.properties.flooded);
          return { fillColor: c.fill, fillOpacity: f.properties.flooded ? 0.78 : 0.28, color: c.border, weight: f.properties.flooded ? 2 : 1 };
        },
        onEachFeature: (f, l) => l.bindPopup(popup(f.properties), { className: "dark-popup" }),
      }).addTo(mapInst.current);
    }

    layerRef.current = layer;
    try { mapInst.current.fitBounds(layer.getBounds(), { padding: [50, 50] }); } catch (_) {}
  }

  async function run() {
    setError(""); setLoading(true); setSidebarOpen(false);
    const payload = {
      level, province,
      municipality: ["municipality","bairro"].includes(level) ? municipality : "all",
      bairro: level === "bairro" ? bairro : "all",
      floodRate: parseFloat(floodRate),
      waterLevel: waterLevel ? parseFloat(waterLevel) : null,
    };
    try {
      const res = await fetch(`${API_URL}/api/simulate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erro na simulação");
      setStats(data.statistics);
      setResults(data.data || []);
      renderMap(data, level === "bairro");
      setPanelOpen(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  if (!mapInst.current) return;

  if (sidebarOpen) {
    mapInst.current.dragging.disable();
    mapInst.current.scrollWheelZoom.disable();
    mapInst.current.doubleClickZoom.disable();
    mapInst.current.boxZoom.disable();
    mapInst.current.keyboard.disable();
    if (mapInst.current.tap) mapInst.current.tap.disable();
  } else {
    mapInst.current.dragging.enable();
    mapInst.current.scrollWheelZoom.enable();
    mapInst.current.doubleClickZoom.enable();
    mapInst.current.boxZoom.enable();
    mapInst.current.keyboard.enable();
    if (mapInst.current.tap) mapInst.current.tap.enable();
  }
}, [sidebarOpen]);

  const flooded = results.filter(r => r.flooded);
  const riskPct = stats ? Math.round(stats.avgRisk) : 0;

  return (
    <>
      <LeafletLoader onLoad={initMap} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #080f0a; --bg2: #0e1a10; --bg3: #132016; --bg4: #1a2b1e;
          --border: rgba(255,255,255,0.07); --border-hi: rgba(255,255,255,0.13);
          --text: #e8f0ea; --muted: rgba(232,240,234,0.45); --faint: rgba(232,240,234,0.2);
          --green: #3ddc68; --green-dim: rgba(61,220,104,0.1);
          --red: #ff5c5c; --amber: #f5a623;
          --display: 'Inter', sans-serif; --body: 'Inter', sans-serif;
          --r: 6px; --r-lg: 12px;
          --ease: cubic-bezier(0.22,1,0.36,1);
          --bar: 52px;
          --side: 300px;
          /* FIX 3 — Safe area insets para iPhone com notch/home indicator */
          --safe-top: env(safe-area-inset-top, 0px);
          --safe-bottom: env(safe-area-inset-bottom, 0px);
          --safe-left: env(safe-area-inset-left, 0px);
          --safe-right: env(safe-area-inset-right, 0px);
        }

        /* FIX 4 — position: fixed no body evita reflow ao abrir teclado virtual no iOS */
        html { height: 100%; }
        body {
          font-family: var(--body);
          background: var(--bg);
          color: var(--text);
          -webkit-font-smoothing: antialiased;
          /* Mantém o layout estável quando o teclado virtual abre no iOS */
          position: fixed;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        /* TOPBAR — FIX 5: inclui safe-area-inset-top para notch */
        .topbar {
          height: calc(var(--bar) + var(--safe-top));
          padding-top: var(--safe-top);
          background: var(--bg2); border-bottom: 1px solid var(--border);
          display: flex; align-items: center;
          padding-left: calc(clamp(0.75rem,2vw,1rem) + var(--safe-left));
          padding-right: calc(clamp(0.75rem,2vw,1rem) + var(--safe-right));
          gap: 10px;
          position: relative; z-index: 300; flex-shrink: 0; overflow: hidden;
        }
        .back-btn {
          background: none; border: none; cursor: pointer;
          color: var(--muted); font-family: var(--body); font-size: 0.8rem;
          display: flex; align-items: center; gap: 6px;
          padding: 6px 8px; border-radius: var(--r);
          transition: color 0.2s, background 0.2s; flex-shrink: 0;
          -webkit-tap-highlight-color: transparent;
          /* FIX 6 — área de toque maior para mobile */
          min-height: 44px; min-width: 44px; justify-content: center;
        }
        .back-btn:hover { color: var(--text); background: rgba(255,255,255,0.05); }
        .top-sep { width: 1px; height: 20px; background: var(--border-hi); flex-shrink: 0; }
        .top-title {
          font-family: var(--display); font-size: clamp(0.72rem,2.2vw,0.9rem); font-weight: 700;
          color: var(--text); display: flex; align-items: center; gap: 8px;
          letter-spacing: -0.01em; min-width: 0; overflow: hidden;
        }
        .top-title span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .top-dot {
          width: 7px; height: 7px; border-radius: 50%; background: var(--green); flex-shrink: 0;
          animation: gpulse 2.5s ease-in-out infinite;
        }
        @keyframes gpulse { 0%,100%{box-shadow:0 0 0 0 rgba(61,220,104,0.4)} 50%{box-shadow:0 0 0 6px rgba(61,220,104,0)} }
        .top-right { margin-left: auto; display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .top-badge {
          font-size: 0.7rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
          background: var(--green-dim); color: var(--green);
          border: 1px solid rgba(61,220,104,0.2); padding: 3px 10px; border-radius: 40px;
          white-space: nowrap;
        }
        .menu-btn {
          background: rgba(255,255,255,0.06); border: 1px solid var(--border-hi);
          color: var(--text); border-radius: var(--r);
          padding: 6px 12px; font-family: var(--body); font-size: 0.78rem;
          cursor: pointer; display: none; align-items: center; gap: 6px;
          transition: background 0.2s; white-space: nowrap;
          -webkit-tap-highlight-color: transparent;
          /* FIX 6 — área de toque mínima para mobile */
          min-height: 44px;
        }
        .menu-btn:hover { background: rgba(255,255,255,0.1); }

        /* SHELL — FIX 7: fallback vh antes do dvh */
        .shell {
          display: flex;
          height: calc(100vh - calc(var(--bar) + var(--safe-top)));
          height: calc(100dvh - calc(var(--bar) + var(--safe-top)));
          overflow: hidden;
          position: relative;
        }

        /* SIDEBAR */
        .sidebar {
          width: var(--side); flex-shrink: 0;
          background: var(--bg2); border-right: 1px solid var(--border);
          display: flex; flex-direction: column;
          overflow-y: auto; overflow-x: hidden;
          z-index: 1000;
          transition: transform 0.35s var(--ease);
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }
        .sidebar::-webkit-scrollbar { width: 4px; }
        .sidebar::-webkit-scrollbar-track { background: transparent; }
        .sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

        .sidebar-head {
          padding: 1.1rem 1.25rem 0.85rem;
          border-bottom: 1px solid var(--border); flex-shrink: 0;
        }
        .sidebar-eyebrow {
          font-size: 0.65rem; font-weight: 600; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--green); margin-bottom: 3px;
        }
        .sidebar-title { font-family: var(--display); font-size: 1rem; font-weight: 700; letter-spacing: -0.015em; }
        .controls { padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 13px; flex: 1; }
        .field { display: flex; flex-direction: column; gap: 5px; }
        .field-label {
          font-size: 0.72rem; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase;
          color: var(--muted); display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 4px;
        }
        .field-hint { font-size: 0.66rem; color: var(--faint); font-weight: 300; text-transform: none; letter-spacing: 0; }
        .sel-wrap { position: relative; }
        .sel-wrap::after {
          content: ''; position: absolute; right: 10px; top: 50%;
          transform: translateY(-50%) rotate(45deg);
          width: 5px; height: 5px;
          border-right: 1.5px solid var(--muted); border-bottom: 1.5px solid var(--muted);
          pointer-events: none;
        }

        /* FIX 8 — font-size 16px GLOBAL para evitar zoom no iOS (não só no media query) */
        .ctrl-sel, .ctrl-input {
          width: 100%; background: var(--bg3);
          border: 1px solid var(--border-hi); border-radius: var(--r);
          padding: 10px 12px; font-family: var(--body); font-size: 16px;
          color: var(--text); appearance: none; -webkit-appearance: none;
          outline: none; transition: border-color 0.2s;
          /* FIX 9 — área de toque mínima de 44px para mobile */
          min-height: 44px;
        }
        .ctrl-sel { padding-right: 28px; }
        .ctrl-sel:focus, .ctrl-input:focus { border-color: var(--green); }
        .ctrl-input::placeholder { color: var(--faint); }
        option { background: #132016; }

        /* FIX 10 — touch-action no range slider para não conflitar com scroll */
        .range-row { display: flex; align-items: center; gap: 10px; }
        .ctrl-range {
          flex: 1; -webkit-appearance: none; height: 3px;
          background: var(--border-hi); border-radius: 2px; outline: none; cursor: pointer;
          min-width: 0; touch-action: pan-x;
        }
        .ctrl-range::-webkit-slider-thumb {
          -webkit-appearance: none; width: 22px; height: 22px;
          border-radius: 50%; background: var(--green); cursor: pointer;
          border: 2px solid var(--bg2); box-shadow: 0 0 0 2px rgba(61,220,104,0.25);
          transition: box-shadow 0.2s;
        }
        .ctrl-range::-webkit-slider-thumb:hover { box-shadow: 0 0 0 4px rgba(61,220,104,0.2); }
        .ctrl-range::-moz-range-thumb {
          width: 20px; height: 20px; border-radius: 50%; background: var(--green);
          cursor: pointer; border: 2px solid var(--bg2); box-shadow: none;
        }
        .range-val {
          font-family: var(--display); font-size: 0.88rem; font-weight: 700;
          color: var(--green); min-width: 38px; text-align: right; flex-shrink: 0;
        }
        .run-btn {
          width: 100%; background: var(--green); color: #080f0a;
          border: none; border-radius: var(--r); padding: 12px 16px; margin-top: 4px;
          font-family: var(--display); font-size: 0.88rem; font-weight: 700;
          cursor: pointer; letter-spacing: 0.02em;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: opacity 0.2s, transform 0.25s var(--ease);
          -webkit-tap-highlight-color: transparent;
          /* FIX 6 — área de toque mínima */
          min-height: 48px;
        }
        .run-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .run-btn:active { transform: scale(0.98); }
        .run-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
        .err-box {
          background: rgba(255,92,92,0.08); border: 1px solid rgba(255,92,92,0.25);
          border-radius: var(--r); padding: 10px 12px;
          font-size: 0.8rem; color: var(--red); line-height: 1.5;
        }

        /* FIX 11 — stats-grid com minmax(0, 1fr) para evitar overflow */
        .stats-grid {
          display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px;
          padding: 1rem 1.25rem; border-top: 1px solid var(--border); flex-shrink: 0;
          /* FIX 5 — safe area no fundo da sidebar em landscape com notch lateral */
          padding-bottom: calc(1rem + var(--safe-bottom));
        }
        .stat-tile {
          background: var(--bg3); border: 1px solid var(--border);
          border-radius: var(--r); padding: 10px 12px; text-align: center;
          transition: border-color 0.2s;
        }
        .stat-tile:hover { border-color: var(--border-hi); }
        .stat-val {
          font-family: var(--display); font-size: 1.3rem; font-weight: 800;
          line-height: 1; margin-bottom: 3px; letter-spacing: -0.02em;
        }
        .v-green { color: var(--green); } .v-red { color: var(--red); } .v-amber { color: var(--amber); }
        .stat-lbl { font-size: 0.62rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--faint); }

        /* MAIN */
        .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; position: relative; }
        .map-wrap { flex: 1; position: relative; min-height: 0; }
        #the-map { width: 100%; height: 100%; }

        .dark-popup .leaflet-popup-content-wrapper {
          background: #0e1a10; border: 1px solid rgba(255,255,255,0.13);
          border-radius: 10px; box-shadow: 0 8px 32px rgba(0,0,0,0.6); padding: 12px 14px;
        }
        .dark-popup .leaflet-popup-tip { background: #0e1a10; }
        .dark-popup .leaflet-popup-content { margin: 0; }
        .dark-popup .leaflet-popup-close-button { color: rgba(232,240,234,0.45) !important; top: 8px !important; right: 8px !important; }

        /* FIX 12 — legenda com safe-area no lado esquerdo para iPhones em landscape */
        .legend {
          position: absolute;
          bottom: calc(18px + var(--safe-bottom));
          left: calc(14px + var(--safe-left));
          background: rgba(8,15,10,0.9); border: 1px solid rgba(255,255,255,0.13);
          border-radius: var(--r-lg); padding: 12px 14px;
          z-index: 50; min-width: 140px;
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        }
        .legend-title {
          font-size: 0.62rem; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--faint); margin-bottom: 9px;
        }
        .leg-row { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; font-size: 0.78rem; color: var(--muted); }
        .leg-dot { width: 11px; height: 11px; border-radius: 50%; flex-shrink: 0; }
        .leg-sq  { width: 18px; height: 11px; border-radius: 3px; flex-shrink: 0; }

        .loading-cover {
          position: absolute; inset: 0; background: rgba(8,15,10,0.82);
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;
          z-index: 400;
          backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
        }
        .spin {
          width: 38px; height: 38px; border: 3px solid rgba(255,255,255,0.1);
          border-top-color: var(--green); border-radius: 50%;
          animation: spinn 0.75s linear infinite;
        }
        @keyframes spinn { to { transform: rotate(360deg); } }
        .loading-txt { font-size: 0.82rem; color: var(--muted); font-weight: 300; }

        /* RESULTS DRAWER — FIX 13: safe-area no fundo */
        .results-drawer {
          background: var(--bg2); border-top: 1px solid var(--border);
          flex-shrink: 0; overflow: hidden;
          transition: max-height 0.4s var(--ease);
          max-height: 38vh;
          display: flex; flex-direction: column;
        }
        .results-drawer.collapsed { max-height: 44px; }
        .drawer-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 16px; height: 44px; min-height: 44px;
          border-bottom: 1px solid var(--border); flex-shrink: 0;
          cursor: pointer; user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        .drawer-header:hover { background: rgba(255,255,255,0.02); }
        .drawer-left { display: flex; align-items: center; gap: 10px; }
        .drawer-title { font-family: var(--display); font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em; white-space: nowrap; }
        .drawer-count {
          font-size: 0.7rem; font-weight: 600;
          background: rgba(255,92,92,0.12); color: var(--red);
          border: 1px solid rgba(255,92,92,0.2); padding: 2px 9px; border-radius: 40px;
          white-space: nowrap;
        }
        .drawer-count.ok { background: var(--green-dim); color: var(--green); border-color: rgba(61,220,104,0.2); }
        .drawer-chev { color: var(--faint); transition: transform 0.3s var(--ease); flex-shrink: 0; }
        .results-drawer.collapsed .drawer-chev { transform: rotate(180deg); }
        .drawer-body {
          overflow-y: auto; padding: 14px 16px; flex: 1;
          /* FIX 5 — safe area no fundo para iPhone com home indicator */
          padding-bottom: calc(14px + var(--safe-bottom));
          scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent;
          /* FIX 14 — smooth scroll no iOS */
          -webkit-overflow-scrolling: touch;
        }
        .drawer-body::-webkit-scrollbar { width: 4px; }
        .drawer-body::-webkit-scrollbar-track { background: transparent; }
        .drawer-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 2rem 1rem; text-align: center; }
        .empty-icon { width: 44px; height: 44px; border: 1.5px solid var(--border-hi); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--faint); font-size: 1.3rem; }
        .empty-txt { font-size: 0.84rem; color: var(--faint); font-weight: 300; line-height: 1.6; }

        .safe-banner { background: rgba(61,220,104,0.05); border: 1px solid rgba(61,220,104,0.15); border-radius: var(--r-lg); padding: 1.5rem; text-align: center; }
        .safe-icon { font-size: 1.4rem; margin-bottom: 6px; }
        .safe-title { font-family: var(--display); font-size: 0.95rem; font-weight: 700; color: var(--green); margin-bottom: 3px; }
        .safe-sub { font-size: 0.82rem; color: var(--muted); font-weight: 300; }

        .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 8px; }
        .r-card {
          background: var(--bg3); border: 1px solid var(--border);
          border-radius: var(--r-lg); padding: 14px; border-left-width: 3px;
          transition: transform 0.2s var(--ease), background 0.2s;
        }
        .r-card:hover { transform: translateY(-2px); background: var(--bg4); }
        .r-name { font-family: var(--display); font-size: 0.88rem; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.01em; }
        .r-badge { display: inline-block; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; padding: 3px 9px; border-radius: 40px; margin-bottom: 10px; }
        .r-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; padding: 4px 0; border-bottom: 1px solid var(--border); color: var(--muted); }
        .r-row:last-child { border-bottom: none; }
        .r-row strong { color: var(--text); font-weight: 500; }

        /* BACKDROP */
        .backdrop { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 900; }
        .backdrop.on { display: block; }

        /* FIX 15 — prefers-reduced-motion: desativa blur em dispositivos com baixa performance */
        @media (prefers-reduced-motion: reduce) {
          .legend, .loading-cover {
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
          }
          .legend { background: rgba(8,15,10,0.97); }
          .loading-cover { background: rgba(8,15,10,0.95); }
          .run-btn { transition: opacity 0.1s; }
          .top-dot { animation: none; }
          .spin { animation: spinn 1.5s linear infinite; }
        }

        /* ===================== RESPONSIVE ===================== */

        @media (max-width: 768px) {
          :root { --bar: 50px; --side: min(300px, 88vw); }
          .menu-btn { display: flex; }
          .top-badge { display: none; }
          .sidebar {
            position: fixed; top: calc(var(--bar) + var(--safe-top)); left: 0;
            height: calc(100vh - calc(var(--bar) + var(--safe-top)));
            height: calc(100dvh - calc(var(--bar) + var(--safe-top)));
            transform: translateX(-110%);
            box-shadow: 4px 0 24px rgba(0,0,0,0.5);
            /* FIX 16 — smooth scroll na sidebar no iOS */
            -webkit-overflow-scrolling: touch;
          }
          .sidebar.open { transform: translateX(0); }
          .results-drawer { max-height: 46vh; }
          .results-drawer.collapsed { max-height: 44px; }
          .cards-grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
        }

        @media (max-width: 480px) {
          :root { --bar: 48px; }
          .cards-grid { grid-template-columns: 1fr; }
          .legend { padding: 10px 12px; min-width: 120px; }
          .legend-title { font-size: 0.58rem; }
          .leg-row { font-size: 0.72rem; gap: 6px; }
          .controls { gap: 11px; }
          .back-btn span { display: none; }
          .back-btn { padding: 6px; }
          .top-sep { display: none; }
        }

        /* FIX 17 — telas muito pequenas (< 380px): legenda menor, sem sobreposição */
        @media (max-width: 380px) {
          .legend {
            bottom: calc(10px + var(--safe-bottom));
            left: calc(8px + var(--safe-left));
            padding: 8px 10px;
            min-width: 110px;
          }
          .legend-title { font-size: 0.55rem; margin-bottom: 6px; }
          .leg-row { font-size: 0.68rem; gap: 5px; margin-bottom: 3px; }
          .leg-dot { width: 9px; height: 9px; }
          .leg-sq  { width: 14px; height: 9px; }
        }

        /* FIX 18 — telas muito pequenas (< 260px): stats em coluna única */
        @media (max-width: 260px) {
          .stats-grid { grid-template-columns: 1fr; }
        }

        @media (hover: none) {
          .run-btn:hover:not(:disabled) { opacity: 1; transform: none; }
          .r-card:hover { transform: none; background: var(--bg3); }
          .back-btn:hover { color: var(--muted); background: none; }
          .stat-tile:hover { border-color: var(--border); }
        }

        /* FIX 19 — landscape com altura baixa: drawer fechado por padrão, mapa tem mais espaço */
        @media (max-height: 500px) and (orientation: landscape) {
          .results-drawer { max-height: 44px; }
          .results-drawer.force-open { max-height: 50vh; }
          .legend {
            padding: 8px 10px;
            bottom: calc(10px + var(--safe-bottom));
          }
          .legend-title { margin-bottom: 5px; }
          .leg-row { margin-bottom: 3px; font-size: 0.7rem; }
          /* Sidebar mais compacta em landscape */
          .controls { gap: 9px; }
          .sidebar-head { padding: 0.75rem 1.25rem 0.6rem; }
          .ctrl-sel, .ctrl-input { padding: 8px 12px; min-height: 40px; }
          .run-btn { min-height: 42px; padding: 10px 16px; }
        }

        /* FIX 20 — landscape mobile: sidebar ocupa altura correta com safe areas */
        @media (max-height: 500px) and (orientation: landscape) and (max-width: 900px) {
          .sidebar {
            top: calc(var(--bar) + var(--safe-top));
            height: calc(100vh - calc(var(--bar) + var(--safe-top)));
            height: calc(100dvh - calc(var(--bar) + var(--safe-top)));
            /* Em landscape, safe-area fica nas laterais */
            padding-left: var(--safe-left);
          }
        }

        #the-map {
          position: relative;
          z-index: 0;
        }

      .sidebar {
          pointer-events: auto;
        }

      .backdrop {
        pointer-events: auto;
      }
      `}</style>

      {/* TOPBAR */}
      <div className="topbar">
        <button className="back-btn" onClick={() => navigate("/")}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M13 8H3M7 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Voltar</span>
        </button>
        <div className="top-sep" />
        <div className="top-title">
          <span className="top-dot" />
          <span>Simulador de Inundações</span>
        </div>
        <div className="top-right">
          <span className="top-badge">Luanda</span>
          <button className="menu-btn" onClick={() => setSidebarOpen(o => !o)}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Configurar
          </button>
        </div>
      </div>

      <div className="shell">
        {/* FIX — backdrop fecha ao tocar fora da sidebar */}
        <div className={`backdrop${sidebarOpen ? " on" : ""}`} onClick={() => setSidebarOpen(false)} />

        {/* SIDEBAR */}
        <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
          <div className="sidebar-head">
            <div className="sidebar-eyebrow">Configuração</div>
            <div className="sidebar-title">Parâmetros da simulação</div>
          </div>
          <div className="controls">
            <div className="field">
              <label className="field-label">Nível de análise</label>
              <div className="sel-wrap">
                <select className="ctrl-sel" value={level} onChange={e => setLevel(e.target.value)}>
                  <option value="province">Província</option>
                  <option value="municipality">Município</option>
                  <option value="bairro">Bairro</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label className="field-label">Província</label>
              <div className="sel-wrap">
                <select className="ctrl-sel" value={province} onChange={e => setProvince(e.target.value)}>
                  <option value="all">Todas</option>
                  {provinces.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
            </div>
            {(level === "municipality" || level === "bairro") && (
              <div className="field">
                <label className="field-label">Município</label>
                <div className="sel-wrap">
                  <select className="ctrl-sel" value={municipality} onChange={e => setMunicipality(e.target.value)}>
                    <option value="all">Todos</option>
                    {municipalities.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
              </div>
            )}
            {level === "bairro" && bairros.length > 0 && (
              <div className="field">
                <label className="field-label">Bairro</label>
                <div className="sel-wrap">
                  <select className="ctrl-sel" value={bairro} onChange={e => setBairro(e.target.value)}>
                    <option value="all">Todos</option>
                    {bairros.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                  </select>
                </div>
              </div>
            )}
            <div className="field">
              <label className="field-label">
                Taxa de inundação
                <span className="field-hint">0 sem risco · 100 máximo</span>
              </label>
              <div className="range-row">
                <input type="range" min="0" max="100" step="1"
                  className="ctrl-range" value={floodRate}
                  onChange={e => setFloodRate(e.target.value)} />
                <span className="range-val">{floodRate}%</span>
              </div>
            </div>
            <div className="field">
              <label className="field-label">
                Nível de água (m)
                <span className="field-hint">opcional</span>
              </label>
              {/* FIX — inputMode="decimal" abre teclado numérico correto no iOS/Android */}
              <input
                type="number"
                className="ctrl-input"
                placeholder="Ex: 10.5"
                step="0.1"
                min="0"
                inputMode="decimal"
                value={waterLevel}
                onChange={e => setWaterLevel(e.target.value)}
              />
            </div>
            {error && <div className="err-box">{error}</div>}
            <button className="run-btn" onClick={run} disabled={loading}>
              {loading
                ? <><div className="spin" style={{width:16,height:16,borderWidth:2}} /> A calcular...</>
                : <>Executar simulação <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></>
              }
            </button>
          </div>
          {/* {stats && (
            <div className="stats-grid">
              <div className="stat-tile">
                <div className={`stat-val ${stats.floodedCount > 0 ? "v-red" : "v-green"}`}>{stats.floodedCount}</div>
                <div className="stat-lbl">Inundadas</div>
              </div>
              <div className="stat-tile">
                <div className="stat-val v-red">{fmt(stats.totalAffected)}</div>
                <div className="stat-lbl">Pop. afectada</div>
              </div>
              <div className="stat-tile">
                <div className="stat-val v-green">{results.length}</div>
                <div className="stat-lbl">Analisadas</div>
              </div>
              <div className="stat-tile">
                <div className={`stat-val ${riskPct > 50 ? "v-red" : riskPct > 25 ? "v-amber" : "v-green"}`}>{riskPct}%</div>
                <div className="stat-lbl">Taxa risco</div>
              </div>
            </div>
          )} */}
        </aside>

        {/* MAIN */}
        <div className="main">
          <div className="map-wrap">
            <div id="the-map" ref={mapRef} />
            {loading && (
              <div className="loading-cover">
                <div className="spin" />
                <div className="loading-txt">A calcular cenário de inundação...</div>
              </div>
            )}
            <div className="legend">
              <div className="legend-title">Severidade</div>
              {Object.entries(SEV).map(([k, c]) => (
                <div className="leg-row" key={k}>
                  {level === "bairro"
                    ? <div className="leg-dot" style={{background:c.fill, border:`1.5px solid ${c.border}`}} />
                    : <div className="leg-sq"  style={{background:c.fill, border:`1px solid ${c.border}`}} />
                  }
                  {c.label}
                </div>
              ))}
            </div>
          </div>

          {/* RESULTS DRAWER */}
          <div className={`results-drawer${panelOpen ? "" : " collapsed"}`}>
            <div className="drawer-header" onClick={() => setPanelOpen(o => !o)}>
              <div className="drawer-left">
                <div className="drawer-title">Resultados detalhados</div>
                {results.length > 0 && (
                  <div className={`drawer-count${flooded.length === 0 ? " ok" : ""}`}>
                    {flooded.length > 0 ? `${flooded.length} em risco` : "Área segura"}
                  </div>
                )}
              </div>
              <svg className="drawer-chev" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="drawer-body">
              {results.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">◈</div>
                  <div className="empty-txt">Configure os parâmetros e execute a simulação<br/>para ver os resultados aqui.</div>
                </div>
              )}
              {results.length > 0 && flooded.length === 0 && (
                <div className="safe-banner">
                  <div className="safe-icon">✓</div>
                  <div className="safe-title">Área segura</div>
                  <div className="safe-sub">Nenhuma inundação detectada com estes parâmetros.</div>
                </div>
              )}
              {flooded.length > 0 && (
                <div className="cards-grid">
                  {flooded.map((p, i) => {
                    const c = getSev(p.severity, true);
                    return (
                      <div key={i} className="r-card" style={{borderLeftColor: c.hex}}>
                        <div className="r-name">{p.name}</div>
                        <span className="r-badge" style={{background: c.fill, color: c.hex, border: `1px solid ${c.border}`}}>
                          {p.severity}
                        </span>
                        <div className="r-row"><span>Nível água</span><strong style={{color:c.hex}}>{p.waterLevel?.toFixed(2)} m</strong></div>
                        <div className="r-row"><span>Pop. afectada</span><strong style={{color:"var(--red)"}}>{fmt(p.affectedPopulation)}</strong></div>
                        <div className="r-row"><span>Recuperação</span><strong>{p.recoveryDays} dias</strong></div>
                        {p.elevation != null && <div className="r-row"><span>Elevação</span><strong>{p.elevation} m</strong></div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/*
        NOTA: Adicionar ao <head> do HTML principal (index.html ou equivalente):
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
        Isso ativa o env(safe-area-inset-*) para iPhones com notch/home indicator.
      */}
    </>
  );
}