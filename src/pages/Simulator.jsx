import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://inunda-es-sig.onrender.com";

const SEV = {
  Leve:     { fill: "rgba(59,173,227,0.55)",  border: "#1a7fa8", hex: "#3baee3", label: "Leve",     weight: 0.3  },
  Moderada: { fill: "rgba(245,166,35,0.65)",  border: "#c47d08", hex: "#f5a623", label: "Moderada", weight: 0.55 },
  Grave:    { fill: "rgba(255,92,92,0.70)",   border: "#c0392b", hex: "#ff5c5c", label: "Grave",    weight: 0.78 },
  Crítica:  { fill: "rgba(200,60,180,0.75)",  border: "#7b1fa2", hex: "#c83cb4", label: "Crítica",  weight: 1.0  },
  safe:     { fill: "rgba(61,220,104,0.18)",  border: "#2d6e42", hex: "#3ddc68", label: "Segura",   weight: 0    },
};

function getSev(severity, flooded) {
  if (!flooded || !severity || severity === "Nenhuma") return SEV.safe;
  return SEV[severity] || SEV.Moderada;
}

function fmt(n) { return new Intl.NumberFormat("pt-BR").format(n); }

// Componente para exibir detalhes aninhados
function NestedDetails({ items, type, level }) {
  const [expanded, setExpanded] = useState({});
  
  const toggleExpand = (name) => {
    setExpanded(prev => ({ ...prev, [name]: !prev[name] }));
  };
  
  const getStatusColor = (flooded, severity) => {
    const isFlooded = flooded === true || flooded === "true";
    if (!isFlooded) return { bg: SEV.safe.fill, text: SEV.safe.hex, border: SEV.safe.border };
    const sev = SEV[severity] || SEV.Moderada;
    return { bg: sev.fill, text: sev.hex, border: sev.border };
  };
  
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 8, letterSpacing: '0.05em' }}>
        📍 {type} nesta região:
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((item, idx) => {
          const status = getStatusColor(item.flooded, item.severity);
          const hasChildren = level === 'province' ? item.municipalities : (level === 'municipality' ? item.bairros : false);
          const isExpanded = expanded[item.name];
          
          return (
            <div key={idx} style={{ 
              background: 'var(--bg3)', 
              borderRadius: 8, 
              border: `1px solid ${status.border}`,
              overflow: 'hidden'
            }}>
              <div 
                onClick={() => hasChildren && toggleExpand(item.name)}
                style={{ 
                  padding: '10px 12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  cursor: hasChildren ? 'pointer' : 'default',
                  backgroundColor: isExpanded ? 'rgba(255,255,255,0.03)' : 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                  <span style={{ 
                    display: 'inline-block', 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    backgroundColor: status.text,
                    boxShadow: `0 0 4px ${status.text}`
                  }} />
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.name}</span>
                  {item.flooded && (
                    <span style={{ 
                      fontSize: '0.65rem', 
                      background: status.bg, 
                      color: status.text,
                      padding: '2px 8px', 
                      borderRadius: 20,
                      border: `1px solid ${status.border}`
                    }}>
                      {item.severity}
                    </span>
                  )}
                  {!item.flooded && (
                    <span style={{ fontSize: '0.65rem', color: SEV.safe.hex }}>✓ Segura</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {item.waterLevel > 0 && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                      💧 {item.waterLevel.toFixed(1)}m
                    </span>
                  )}
                  {hasChildren && (
                    <svg 
                      width="10" 
                      height="10" 
                      viewBox="0 0 12 12" 
                      fill="none"
                      style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                    >
                      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  )}
                </div>
              </div>
              
              {isExpanded && hasChildren && (
                <div style={{ padding: '8px 12px 12px 24px', borderTop: '1px solid var(--border)' }}>
                  {level === 'province' && item.municipalities && (
                    <NestedDetails 
                      items={item.municipalities.map(m => ({ ...m, flooded: m.flooded }))}
                      type="Municípios"
                      level="municipality"
                    />
                  )}
                  {level === 'municipality' && item.bairros && (
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: 6 }}>
                        🏘️ Bairros simulados:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {item.bairros.map((bairro, bIdx) => {
                          const bStatus = getStatusColor(bairro.flooded, bairro.severity);
                          return (
                            <div key={bIdx} style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              padding: '6px 8px',
                              background: 'var(--bg4)',
                              borderRadius: 6,
                              fontSize: '0.75rem'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ 
                                  width: 6, height: 6, borderRadius: '50%', 
                                  backgroundColor: bStatus.text 
                                }} />
                                <span>{bairro.name}</span>
                                {bairro.flooded ? (
                                  <span style={{ color: bStatus.text, fontSize: '0.65rem' }}>
                                    {bairro.severity}
                                  </span>
                                ) : (
                                  <span style={{ color: SEV.safe.hex, fontSize: '0.65rem' }}>Seguro</span>
                                )}
                              </div>
                              {bairro.waterLevel > 0 && (
                                <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>
                                  {bairro.waterLevel.toFixed(1)}m
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: 8 }}>
                        {item.bairros_flooded || 0} de {item.bairros_total || item.bairros?.length || 0} bairros inundados
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function extractHeatPoints(geometry, weight) {
  const points = [];
  if (!geometry) return points;

  if (geometry.type === "Point") {
    const [lon, lat] = geometry.coordinates;
    points.push([lat, lon, weight]);
    const spread = 0.006;
    const samples = 25;
    for (let i = 0; i < samples; i++) {
      const dx = (Math.random() - 0.5) * spread;
      const dy = (Math.random() - 0.5) * spread;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const decay = 1 - distance / spread;
      points.push([lat + dy, lon + dx, weight * Math.max(0.4, decay)]);
    }
    return points;
  }

  const rings = [];
  if (geometry.type === "Polygon") {
    rings.push(geometry.coordinates[0]);
  } else if (geometry.type === "MultiPolygon") {
    for (const poly of geometry.coordinates) rings.push(poly[0]);
  }

  for (const ring of rings) {
    if (!ring || ring.length < 3) continue;
    let sumLon = 0, sumLat = 0;
    for (const [lon, lat] of ring) { sumLon += lon; sumLat += lat; }
    const cLon = sumLon / ring.length;
    const cLat = sumLat / ring.length;
    points.push([cLat, cLon, weight]);
    const step = Math.max(1, Math.floor(ring.length / 40));
    for (let i = 0; i < ring.length; i += step) {
      const [lon, lat] = ring[i];
      for (const t of [0.2, 0.4, 0.6, 0.8]) {
        points.push([lat + t * (cLat - lat), lon + t * (cLon - lon), weight * (0.5 + t * 0.5)]);
      }
    }
  }
  return points;
}

function LeafletLoader({ onLoad }) {
  useEffect(() => {
    if (window._leafletReady) { onLoad(); return; }
    const loadScript = (src) => new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = src; s.onload = resolve;
      document.head.appendChild(s);
    });
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(css);
    loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js")
      .then(() => loadScript("https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js"))
      .then(() => { window._leafletReady = true; onLoad(); });
  }, []);
  return null;
}

const GLOSSARY = [
  {
    term: "Nível da água",
    def: "Altura estimada da água acima do solo durante a inundação, em metros. Calculado com base na elevação do terreno e na taxa de inundação configurada. Quanto maior, mais grave o impacto.",
  },
  {
    term: "Elevação do terreno",
    def: "Altitude média da zona em relação ao nível do mar (metros). Zonas mais baixas tendem a acumular mais água. Dados provenientes do modelo SRTM de 90 m de resolução.",
  },
  {
    term: "Taxa de inundação",
    def: "Percentagem do cenário de risco simulado (0–100%). Um valor mais alto simula eventos mais intensos, como chuvas extremas ou falhas de drenagem.",
  },
  {
    term: "Pop. afectada",
    def: "Estimativa da população residente na zona que ficaria directamente exposta à inundação. Baseada em dados populacionais por bairro/município.",
  },
  {
    term: "Dias de recuperação",
    def: "Estimativa do tempo necessário para a zona retornar ao estado normal após a inundação, considerando a severidade do evento e a infraestrutura local.",
  },
  {
    term: "Severidade",
    def: "Classificação do risco em quatro níveis — Leve, Moderada, Grave e Crítica — determinada pela combinação do nível de água, elevação e risco base da zona.",
  },
  {
    term: "Mapa de calor",
    def: "Visualização da intensidade do risco: cores frias (azul) indicam baixo risco; cores quentes (laranja/vermelho) indicam risco elevado. A sobreposição de manchas reflecte a concentração espacial do perigo.",
  },
];

export default function Simulator() {
  const navigate = useNavigate();
  const mapRef   = useRef(null);
  const mapInst  = useRef(null);
  const heatRef  = useRef(null);
  const markRef  = useRef(null);
  const polyRef  = useRef(null);
  const L        = useRef(null);

  const [level,        setLevel]        = useState("province");
  const [province,     setProvince]     = useState("all");
  const [municipality, setMunicipality] = useState("all");
  const [bairro,       setBairro]       = useState("all");
  const [floodRate,    setFloodRate]    = useState(50);
  const [waterLevel,   setWaterLevel]   = useState("");

  const [provinces,      setProvinces]      = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [bairros,        setBairros]        = useState([]);

  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [results,     setResults]     = useState([]);
  const [panelOpen,   setPanelOpen]   = useState(false);
  const [infoOpen,    setInfoOpen]    = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [provincesLoading, setProvincesLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  useEffect(() => {
    const h = () => { if (window.innerWidth > 768) setSidebarOpen(false); };
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const initMap = useCallback(() => {
    if (mapInst.current || !mapRef.current || !window.L) return;
    L.current = window.L;
    const map = L.current.map(mapRef.current, { zoomControl: false })
      .setView([-8.8383, 13.2344], 11);
    L.current.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap", maxZoom: 19,
    }).addTo(map);
    L.current.control.zoom({ position: "bottomright" }).addTo(map);
    mapInst.current = map;
  }, []);

  useEffect(() => {
    const fetchProvinces = async (attempt = 0) => {
      try {
        setProvincesLoading(true);
        const res = await fetch(`${API_URL}/api/provinces`);
        if (!res.ok) throw new Error("HTTP " + res.status);
        const d = await res.json();
        if (d.success && d.data?.length > 0) {
          setProvinces(d.data);
          setProvincesLoading(false);
        } else if (attempt < 3) {
          setTimeout(() => fetchProvinces(attempt + 1), 1500 * (attempt + 1));
        } else {
          setProvincesLoading(false);
        }
      } catch (_) {
        if (attempt < 3) setTimeout(() => fetchProvinces(attempt + 1), 1500 * (attempt + 1));
        else setProvincesLoading(false);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (province === "all") { setMunicipalities([]); setMunicipality("all"); return; }
    fetch(`${API_URL}/api/municipalities?province=${encodeURIComponent(province)}`)
      .then(r => r.json())
      .then(d => { if (d.success) { setMunicipalities(d.data); setMunicipality("all"); } })
      .catch(() => {});
  }, [province]);

  useEffect(() => {
    if (municipality === "all" || level !== "bairro") { setBairros([]); setBairro("all"); return; }
    fetch(`${API_URL}/api/bairros?province=${encodeURIComponent(province)}&municipality=${encodeURIComponent(municipality)}`)
      .then(r => r.json())
      .then(d => { if (d.success) { setBairros(d.data); setBairro("all"); } })
      .catch(() => {});
  }, [municipality, level]);

  function buildFloodedPopup(p) {
    const c = getSev(p.severity, true);
    return `<div style="font-family:sans-serif;min-width:205px;font-size:12px;color:#e8f0ea;">
      <div style="font-size:14px;font-weight:700;color:#fff;margin-bottom:8px;">${p.name || "—"}</div>
      <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.07);">
        <span style="color:rgba(232,240,234,0.5)">Severidade</span>
        <span style="color:${c.hex};font-weight:600;">${p.severity}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.07);">
        <span style="color:rgba(232,240,234,0.5)">Nível da água</span>
        <span style="color:#fff;font-weight:500;">${Number(p.waterLevel).toFixed(2)} m</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.07);">
        <span style="color:rgba(232,240,234,0.5)">Pop. afectada</span>
        <span style="color:#ff5c5c;font-weight:600;">${fmt(p.affectedPopulation)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:5px 0;${p.elevation != null ? "border-bottom:1px solid rgba(255,255,255,0.07);" : ""}">
        <span style="color:rgba(232,240,234,0.5)">Recuperação</span>
        <span style="color:#fff;">${p.recoveryDays} dias</span>
      </div>
      ${p.elevation != null ? `
      <div style="display:flex;justify-content:space-between;padding:5px 0;">
        <span style="color:rgba(232,240,234,0.5)">Elevação do terreno</span>
        <span style="color:#fff;">${Number(p.elevation).toFixed(1)} m</span>
      </div>` : ""}
      ${p.municipalities ? `<div style="padding:8px 0 2px;font-size:0.67rem;color:rgba(232,240,234,0.4);">📌 ${p.municipalities_flooded || 0} de ${p.municipalities_total || 0} municípios afectados</div>` : ""}
      ${p.bairros ? `<div style="padding:8px 0 2px;font-size:0.67rem;color:rgba(232,240,234,0.4);">🏘️ ${p.bairros_flooded || 0} de ${p.bairros_total || 0} bairros inundados</div>` : ""}
    </div>`;
  }

  function buildSafePopup(p) {
    return `<div style="font-family:sans-serif;min-width:190px;font-size:12px;color:#e8f0ea;">
      <div style="font-size:14px;font-weight:700;color:#fff;margin-bottom:8px;">${p.name || "—"}</div>
      <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.07);">
        <span style="color:rgba(232,240,234,0.5)">Status</span>
        <span style="font-weight:600;color:#3ddc68">✓ SEGURA</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.07);">
        <span style="color:rgba(232,240,234,0.5)">Nível da água</span>
        <span style="color:#3ddc68;">0.00 m</span>
      </div>
      ${p.elevation != null ? `
      <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.07);">
        <span style="color:rgba(232,240,234,0.5)">Elevação do terreno</span>
        <span style="color:#fff;">${Number(p.elevation).toFixed(1)} m</span>
      </div>` : ""}
      <div style="padding:8px 0 2px;font-size:0.67rem;color:rgba(232,240,234,0.3);line-height:1.5;">
        Zona sem risco detectado para os parâmetros actuais.
      </div>
    </div>`;
  }

  async function renderHeatMap(geojson, allResults, currentLevel, currentProvince, currentMunicipality) {
    if (!L.current || !mapInst.current) return;

    if (heatRef.current) { mapInst.current.removeLayer(heatRef.current); heatRef.current = null; }
    if (markRef.current) { mapInst.current.removeLayer(markRef.current); markRef.current = null; }
    if (polyRef.current) { mapInst.current.removeLayer(polyRef.current); polyRef.current = null; }

    const features = geojson?.features || [];
    if (features.length === 0) return;

    const firstGeomType = features[0]?.geometry?.type;
    const isBairroLevel = firstGeomType === "Point";

    if (isBairroLevel && currentMunicipality && currentMunicipality !== "all") {
      try {
        const res = await fetch(`${API_URL}/api/simulate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            level: "municipality",
            province: currentProvince,
            municipality: currentMunicipality,
            bairro: "all",
            floodRate: 0,
            waterLevel: null,
          }),
        });
        const mData = await res.json();
        if (mData.success) {
          let mGj;
          try { mGj = typeof mData.geojson === "string" ? JSON.parse(mData.geojson) : mData.geojson; } catch (_) {}
          const mFeat = mGj?.features?.find(f => f?.properties?.name === currentMunicipality || f?.properties?.NAME_2 === currentMunicipality);
          if (mFeat) {
            polyRef.current = L.current.geoJSON(mFeat, {
              style: {
                fillColor: "transparent",
                fillOpacity: 0,
                color: "rgba(255,255,255,0.35)",
                weight: 1.5,
                dashArray: "4 4",
              },
              interactive: false,
            }).addTo(mapInst.current);

            try {
              const bounds = polyRef.current.getBounds();
              if (bounds.isValid()) mapInst.current.fitBounds(bounds, { padding: [40, 40] });
            } catch (_) {}
          }
        }
      } catch (_) {}
    }

    const heatPoints = [];
    const boundsCoords = [];

    for (const feat of features) {
      const p = feat.properties;
      const g = feat.geometry;
      const isFlooded = p.flooded === true || p.flooded === "true";

      if (isFlooded) {
        const sev = getSev(p.severity, true);
        const weight = sev.weight ?? 0.5;
        const pts = extractHeatPoints(g, weight);
        heatPoints.push(...pts);
      }
      if (p.lat != null && p.lon != null) boundsCoords.push([p.lat, p.lon]);
    }

    for (const feat of features) {
      const p = feat.properties;
      if (p.lat != null && p.lon != null) boundsCoords.push([p.lat, p.lon]);
    }

    if (heatPoints.length > 0) {
      heatRef.current = L.current.heatLayer(heatPoints, {
        radius: 28, blur: 22, maxZoom: 17, max: 1.0, minOpacity: 0.35,
        gradient: {
          0.00: "#313695", 0.20: "#4575b4", 0.35: "#74add1",
          0.50: "#fee090", 0.65: "#fdae61", 0.80: "#f46d43",
          0.95: "#d73027", 1.00: "#a50026",
        },
      }).addTo(mapInst.current);
    }

    const markerGroup = L.current.layerGroup();
    for (const feat of features) {
      const p = feat.properties;
      if (p.lat == null || p.lon == null) continue;

      const isFlooded = p.flooded === true || p.flooded === "true";
      const popup = isFlooded ? buildFloodedPopup(p) : buildSafePopup(p);
      const marker = L.current.circleMarker([p.lat, p.lon], {
        radius: isFlooded ? 12 : 9,
        fillOpacity: 0, opacity: 0, interactive: true,
      });
      marker.bindPopup(popup, { className: "dark-popup", maxWidth: 280 });
      markerGroup.addLayer(marker);
    }
    markerGroup.addTo(mapInst.current);
    markRef.current = markerGroup;

    if (!isBairroLevel && boundsCoords.length > 0) {
      try {
        const bounds = L.current.latLngBounds(boundsCoords);
        if (bounds.isValid()) mapInst.current.fitBounds(bounds, { padding: [60, 60] });
      } catch (_) {}
    } else if (isBairroLevel && !polyRef.current && boundsCoords.length > 0) {
      mapInst.current.setView(boundsCoords[0], 14);
    }
  }

  async function run() {
    setError("");
    setLoading(true);
    setSidebarOpen(false);

    const payload = {
      level,
      province,
      municipality: ["municipality", "bairro"].includes(level) ? municipality : "all",
      bairro:       level === "bairro" ? bairro : "all",
      floodRate:    parseFloat(floodRate),
      waterLevel:   waterLevel ? parseFloat(waterLevel) : null,
    };

    try {
      const res  = await fetch(`${API_URL}/api/simulate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erro na simulação");

      let geojson = null;
      try {
        geojson = typeof data.geojson === "string" ? JSON.parse(data.geojson) : data.geojson;
        console.log("TIPO:", geojson.features[0].geometry.type);
      } catch (_) {}

      const allResults = data.data || [];

      await renderHeatMap(geojson, allResults, level, province, payload.municipality);
      setResults(allResults);
      setPanelOpen(true);

    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!mapInst.current) return;
    const map = mapInst.current;
    if (sidebarOpen) {
      map.dragging.disable(); map.scrollWheelZoom.disable();
      map.doubleClickZoom.disable(); map.boxZoom.disable(); map.keyboard.disable();
      if (map.tap) map.tap.disable();
    } else {
      map.dragging.enable(); map.scrollWheelZoom.enable();
      map.doubleClickZoom.enable(); map.boxZoom.enable(); map.keyboard.enable();
      if (map.tap) map.tap.enable();
    }
  }, [sidebarOpen]);

  const flooded = results.filter(r => r.flooded);

  return (
    <>
      <LeafletLoader onLoad={initMap} />

<style>{`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
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
    --bar: 52px; --side: 300px;
    --safe-top: env(safe-area-inset-top, 0px);
    --safe-bottom: env(safe-area-inset-bottom, 0px);
    --safe-left: env(safe-area-inset-left, 0px);
    --safe-right: env(safe-area-inset-right, 0px);
  }
  html { height: 100%; }
  body {
    font-family: var(--body); background: var(--bg); color: var(--text);
    -webkit-font-smoothing: antialiased; position: relative; width: 100%; height: 100%; overflow: hidden;
  }
  .topbar {
    height: calc(var(--bar) + var(--safe-top)); padding-top: var(--safe-top);
    background: var(--bg2); border-bottom: 1px solid var(--border);
    display: flex; align-items: center;
    padding-left: calc(clamp(0.75rem,2vw,1rem) + var(--safe-left));
    padding-right: calc(clamp(0.75rem,2vw,1rem) + var(--safe-right));
    gap: 10px; position: relative; z-index: 300; flex-shrink: 0;
  }
  .back-btn {
    background: none; border: none; cursor: pointer; color: var(--muted);
    font-family: var(--body); font-size: 0.8rem; display: flex; align-items: center; gap: 6px;
    padding: 6px 8px; border-radius: var(--r); transition: color 0.2s, background 0.2s; flex-shrink: 0;
    -webkit-tap-highlight-color: transparent; min-height: 44px; min-width: 44px; justify-content: center;
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
    background: var(--green-dim); color: var(--green); border: 1px solid rgba(61,220,104,0.2);
    padding: 3px 10px; border-radius: 40px; white-space: nowrap;
  }
  .menu-btn {
    background: rgba(255,255,255,0.06); border: 1px solid var(--border-hi); color: var(--text);
    border-radius: var(--r); padding: 6px 12px; font-family: var(--body); font-size: 0.78rem;
    cursor: pointer; display: none; align-items: center; gap: 6px;
    transition: background 0.2s; white-space: nowrap;
    -webkit-tap-highlight-color: transparent; min-height: 44px;
  }
  .menu-btn:hover { background: rgba(255,255,255,0.1); }
  .shell {
    display: flex;
    height: calc(100dvh - calc(var(--bar) + var(--safe-top)));
    overflow: hidden; position: relative;
  }
  .sidebar {
    width: var(--side); flex-shrink: 0; background: var(--bg2);
    border-right: 1px solid var(--border); display: flex; flex-direction: column;
    overflow-y: auto; overflow-x: hidden; z-index: 1000;
    transition: transform 0.35s var(--ease); scrollbar-width: thin;
  }
  .sidebar::-webkit-scrollbar { width: 4px; }
  .sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
  .sidebar-head { padding: 1.1rem 1.25rem 0.85rem; border-bottom: 1px solid var(--border); flex-shrink: 0; }
  .sidebar-eyebrow { font-size: 0.65rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--green); margin-bottom: 3px; }
  .sidebar-title { font-family: var(--display); font-size: 1rem; font-weight: 700; letter-spacing: -0.015em; }
  .controls { padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 13px; flex: 1; }
  .field { display: flex; flex-direction: column; gap: 5px; }
  .field-label {
    font-size: 0.72rem; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase;
    color: var(--muted); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 4px;
  }
  .field-hint { font-size: 0.66rem; color: var(--faint); font-weight: 300; text-transform: none; letter-spacing: 0; }
  .sel-wrap { position: relative; }
  .sel-wrap::after {
    content: ''; position: absolute; right: 10px; top: 50%;
    transform: translateY(-50%) rotate(45deg); width: 5px; height: 5px;
    border-right: 1.5px solid var(--muted); border-bottom: 1.5px solid var(--muted); pointer-events: none;
  }
  .ctrl-sel, .ctrl-input {
    width: 100%; background: var(--bg3); border: 1px solid var(--border-hi);
    border-radius: var(--r); padding: 10px 12px; font-family: var(--body); font-size: 16px;
    color: var(--text); appearance: none; -webkit-appearance: none;
    outline: none; transition: border-color 0.2s; min-height: 44px;
  }
  .ctrl-sel { padding-right: 28px; }
  .ctrl-sel:focus, .ctrl-input:focus { border-color: var(--green); }
  .ctrl-input::placeholder { color: var(--faint); }
  option { background: #132016; }
  .range-row { display: flex; align-items: center; gap: 10px; }
  .ctrl-range {
    flex: 1; -webkit-appearance: none; height: 3px; background: var(--border-hi);
    border-radius: 2px; outline: none; cursor: pointer; min-width: 0;
  }
  .ctrl-range::-webkit-slider-thumb {
    -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%;
    background: var(--green); cursor: pointer; border: 2px solid var(--bg2);
  }
  .range-val { font-family: var(--display); font-size: 0.88rem; font-weight: 700; color: var(--green); min-width: 38px; text-align: right; flex-shrink: 0; }
  .run-btn {
    width: 100%; background: var(--green); color: #080f0a; border: none;
    border-radius: var(--r); padding: 12px 16px; margin-top: 4px;
    font-family: var(--display); font-size: 0.88rem; font-weight: 700; cursor: pointer;
    letter-spacing: 0.02em; display: flex; align-items: center; justify-content: center;
    gap: 8px; transition: opacity 0.2s; min-height: 48px;
  }
  .run-btn:hover:not(:disabled) { opacity: 0.88; }
  .run-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .err-box {
    background: rgba(255,92,92,0.08); border: 1px solid rgba(255,92,92,0.25);
    border-radius: var(--r); padding: 10px 12px; font-size: 0.8rem; color: var(--red);
  }
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; position: relative; }
  .map-wrap { flex: 1; position: relative; min-height: 0; }
  #the-map { width: 100%; height: 100%; }
  .dark-popup .leaflet-popup-content-wrapper {
    background: #0e1a10; border: 1px solid rgba(255,255,255,0.13);
    border-radius: 10px; box-shadow: 0 8px 32px rgba(0,0,0,0.6); padding: 12px 14px;
  }
  .dark-popup .leaflet-popup-tip { background: #0e1a10; }
  .dark-popup .leaflet-popup-content { margin: 0; }
  .legend {
    position: absolute; bottom: calc(18px + var(--safe-bottom)); left: calc(14px + var(--safe-left));
    background: rgba(8,15,10,0.92); border: 1px solid rgba(255,255,255,0.13);
    border-radius: var(--r-lg); padding: 11px 13px; z-index: 500; min-width: 130px;
    backdrop-filter: blur(10px);
  }
  .legend-title { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--faint); margin-bottom: 10px; }
  .leg-gradient { width: 100%; height: 9px; border-radius: 3px; margin-bottom: 5px; background: linear-gradient(to right,#313695,#4575b4,#74add1,#fee090,#fdae61,#f46d43,#d73027,#a50026); }
  .leg-labels { display: flex; justify-content: space-between; font-size: 0.6rem; color: var(--faint); margin-bottom: 10px; }
  .leg-sep { height: 1px; background: var(--border); margin-bottom: 9px; }
  .leg-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 0.68rem; color: var(--muted); }
  .leg-dot { width: 11px; height: 11px; border-radius: 50%; flex-shrink: 0; border: 1.5px solid rgba(255,255,255,0.2); }
  .loading-cover {
    position: absolute; inset: 0; background: rgba(8,15,10,0.82);
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px;
    z-index: 400; backdrop-filter: blur(4px);
  }
  .spin {
    width: 38px; height: 38px; border: 3px solid rgba(255,255,255,0.1);
    border-top-color: var(--green); border-radius: 50%; animation: spinn 0.75s linear infinite;
  }
  @keyframes spinn { to { transform: rotate(360deg); } }
  .loading-txt { font-size: 0.82rem; color: var(--muted); font-weight: 300; font-family: var(--body); }
  
  /* ========== CORREÇÃO DO LAYOUT MEIO A MEIO ========== */
  .bottom-area {
    display: flex;
    flex-direction: row;
    flex-shrink: 0;
    border-top: 1px solid var(--border);
    max-height: 42vh;
    min-height: 0;
    transition: max-height 0.4s var(--ease);
    align-items: stretch;
    background: var(--bg);
    width: 100%;
    overflow: hidden;
  }
  .bottom-area.collapsed { max-height: 44px; }
  
  /* RESULTS PANE - METADE ESQUERDA (50%) */
  .results-pane,
  .info-pane {
    flex: 1 1 0;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Quando colapsado, o painel de resultados some/encolhe */
  .bottom-area.collapsed .results-pane {
    width: auto;
    flex: 1;
  }
  
  .bottom-area.collapsed .info-pane {
    width: auto;
    flex: 1;
  }
  
  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    height: 44px;
    min-height: 44px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
    cursor: pointer;
    background: var(--bg2);
  }
  .drawer-header:hover { background: rgba(255,255,255,0.02); }
  .drawer-left { display: flex; align-items: center; gap: 10px; }
  .drawer-title { font-family: var(--display); font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em; white-space: nowrap; }
  .drawer-count {
    font-size: 0.7rem;
    font-weight: 600;
    background: rgba(255,92,92,0.12);
    color: var(--red);
    border: 1px solid rgba(255,92,92,0.2);
    padding: 2px 9px;
    border-radius: 40px;
    white-space: nowrap;
  }
  .drawer-count.ok { background: var(--green-dim); color: var(--green); border-color: rgba(61,220,104,0.2); }
  .drawer-chev { color: var(--faint); transition: transform 0.3s var(--ease); flex-shrink: 0; }
  .bottom-area.collapsed .drawer-chev { transform: rotate(180deg); }
  
  .drawer-body {
    overflow-y: auto;
    padding: 14px 16px;
    flex: 1;
    padding-bottom: calc(14px + var(--safe-bottom));
    scrollbar-width: thin;
    min-height: 0;
    background: var(--bg);
  } 
  .info-body {
    overflow-y: auto;
    flex: 1;
    min-height: 0;
  }
  .drawer-body::-webkit-scrollbar { width: 4px; }
  .drawer-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
  
  .info-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 14px;
    height: 44px;
    min-height: 44px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
    cursor: pointer;
  }
  .info-header:hover { background: rgba(255,255,255,0.02); }
  .info-header-left { display: flex; align-items: center; gap: 8px; }
  .info-title { font-family: var(--display); font-size: 0.76rem; font-weight: 700; letter-spacing: 0.04em; white-space: nowrap; }
  .info-chev { color: var(--faint); transition: transform 0.3s var(--ease); flex-shrink: 0; }
  .info-pane.closed .info-chev { transform: rotate(-90deg); }
  
 .info-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 12px 14px calc(12px + var(--safe-bottom));
  scrollbar-width: thin;
}
  .info-body::-webkit-scrollbar { width: 4px; }
  .info-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
  .info-pane.closed .info-body { display: none; }
  
  .gloss-item { margin-bottom: 13px; padding-bottom: 13px; border-bottom: 1px solid var(--border); }
  .gloss-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
  .gloss-term {
    font-family: var(--display);
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 4px;
  }
  .gloss-def { font-size: 0.72rem; color: var(--muted); line-height: 1.65; font-weight: 300; }
  
  .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 2rem 1rem; text-align: center; }
  .empty-icon { width: 44px; height: 44px; border: 1.5px solid var(--border-hi); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--faint); font-size: 1.3rem; }
  .empty-txt { font-size: 0.84rem; color: var(--faint); font-weight: 300; line-height: 1.6; font-family: var(--body); }
  
  .cards-grid { 
    display: grid; 
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); 
    gap: 12px; 
  }
  .r-card {
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    padding: 14px;
    border-left-width: 3px;
    transition: transform 0.2s var(--ease), background 0.2s;
  }
  .r-card:hover { transform: translateY(-2px); background: var(--bg4); }
  .r-name { font-family: var(--display); font-size: 0.88rem; font-weight: 700; margin-bottom: 8px; }
  .r-badge {
    display: inline-block;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    padding: 3px 9px;
    border-radius: 40px;
    margin-bottom: 10px;
  }
  .r-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.78rem;
    padding: 4px 0;
    border-bottom: 1px solid var(--border);
    color: var(--muted);
  }
  .r-row:last-child { border-bottom: none; }
  .r-row strong { color: var(--text); font-weight: 500; }
  
  .backdrop { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 900; }
  .backdrop.on { display: block; }
  
  /* MOBILE: empilhar verticalmente */
  @media (max-width: 768px) {
    :root { --bar: 50px; --side: min(300px, 88vw); }
    .menu-btn { display: flex; }
    .top-badge { display: none; }
    .main { overflow: visible; }
    .bottom-area {
      min-height: 45vh;
      height: auto;
    }
    .sidebar {
      position: fixed;
      top: calc(var(--bar) + var(--safe-top));
      left: 0;
      height: calc(100vh - calc(var(--bar) + var(--safe-top)));
      transform: translateX(-110%);
      box-shadow: 4px 0 24px rgba(0,0,0,0.5);
    }
    .sidebar.open { transform: translateX(0); }
    .bottom-area {
      max-height: 55vh;
      flex-direction: column;
    }
    .bottom-area.collapsed { max-height: 44px; }

    .results-pane {
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .info-pane {
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
  
    .cards-grid { grid-template-columns: 1fr; }
    .legend { display: none; }
    
    .results-pane,
    .info-pane {
      width: 100%;
    flex: 1 1 100%;
    }
  }
  @media (max-width: 480px) {
    :root { --bar: 48px; }
    .cards-grid { grid-template-columns: 1fr; }
    .back-btn span { display: none; }
    .back-btn { padding: 6px; }
    .top-sep { display: none; }
  }
  @media (hover: none) {
    .run-btn:hover:not(:disabled) { opacity: 1; transform: none; }
    .r-card:hover { transform: none; background: var(--bg3); }
  }
  @media (max-height: 500px) and (orientation: landscape) {
    .bottom-area { max-height: 44px; }
  }
`}</style>

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
        <div className={`backdrop${sidebarOpen ? " on" : ""}`} onClick={() => setSidebarOpen(false)} />

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
              <label className="field-label">
                Província
                {provincesLoading && <span className="field-hint">A carregar...</span>}
              </label>
              <div className="sel-wrap">
                <select className="ctrl-sel" value={province} onChange={e => setProvince(e.target.value)} disabled={provincesLoading}>
                  <option value="all">{provincesLoading ? "A carregar províncias..." : "Todas"}</option>
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
              <input type="number" className="ctrl-input" placeholder="Ex: 10.5"
                step="0.1" min="0" inputMode="decimal"
                value={waterLevel} onChange={e => setWaterLevel(e.target.value)} />
            </div>
            {error && <div className="err-box">{error}</div>}
            <button className="run-btn" onClick={run} disabled={loading}>
              {loading
                ? <><div className="spin" style={{width:16,height:16,borderWidth:2}} /> A calcular...</>
                : <>Executar simulação <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></>
              }
            </button>
          </div>
        </aside>

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
              <div className="legend-title">Mapa de calor</div>
              <div className="leg-gradient" />
              <div className="leg-labels"><span>Baixo</span><span>Alto</span></div>
              <div className="leg-sep" />
              <div className="leg-sev-title">Severidade</div>
              <div className="leg-row"><div className="leg-dot" style={{background:"#313695"}} /><span>Leve</span></div>
              <div className="leg-row"><div className="leg-dot" style={{background:"#fdae61"}} /><span>Moderada</span></div>
              <div className="leg-row"><div className="leg-dot" style={{background:"#f46d43"}} /><span>Grave</span></div>
              <div className="leg-row"><div className="leg-dot" style={{background:"#a50026"}} /><span>Crítica</span></div>
              <div className="leg-sep" />
              <div className="leg-row"><div className="leg-dot" style={{background:"rgba(61,220,104,0.6)",border:"1.5px solid #2d6e42"}} /><span>Segura</span></div>
            </div>
          </div>

          <div className={`bottom-area${panelOpen ? "" : " collapsed"}`}>
            <div className="results-pane">
              <div className="drawer-header" onClick={() => setPanelOpen(o => !o)}>
                <div className="drawer-left">
                  <div className="drawer-title">Resultados detalhados</div>
                  {/* {results.length > 0 && (
                    <div className={`drawer-count${flooded.length === 0 ? " ok" : ""}`}>
                      {flooded.length > 0 ? `${flooded.length}/${results.length} em risco` : "Todas seguras"}
                    </div>
                  )} */}
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
                {results.length > 0 && (
                  <div className="cards-grid">
                    {results.map((p, i) => {
                      const isFlooded = p.flooded === true || p.flooded === "true";
                      const c = getSev(p.severity, isFlooded);
                      const hasMunicipios = level === 'province' && p.municipalities && p.municipalities.length > 0;
                      const hasBairros = level === 'municipality' && p.bairros && p.bairros.length > 0;
                      
                      return (
                        <div key={i} className="r-card" style={{borderLeftColor: isFlooded ? c.hex : SEV.safe.hex}}>
                          <div className="r-name">{p.name}</div>
                          <span className="r-badge" style={{
                            background: isFlooded ? c.fill : SEV.safe.fill,
                            color: isFlooded ? c.hex : SEV.safe.hex,
                            border: `1px solid ${isFlooded ? c.border : SEV.safe.border}`,
                          }}>
                            {isFlooded ? p.severity : "Segura"}
                          </span>
                          <div className="r-row">
                            <span>Nível água</span>
                            <strong style={{color: isFlooded ? c.hex : SEV.safe.hex}}>
                              {Number(p.waterLevel || 0).toFixed(2)} m
                            </strong>
                          </div>
                          {isFlooded && <>
                            <div className="r-row"><span>Pop. afectada</span><strong style={{color:"var(--red)"}}>{fmt(p.affectedPopulation)}</strong></div>
                            <div className="r-row"><span>Recuperação</span><strong>{p.recoveryDays} dias</strong></div>
                          </>}
                          {p.elevation != null && p.elevation !== 0 && (
                            <div className="r-row"><span>Elevação</span><strong>{Number(p.elevation).toFixed(1)} m</strong></div>
                          )}
                          
                          {/* DETALHAMENTO HIERÁRQUICO */}
                          {hasMunicipios && (
                            <NestedDetails 
                              items={p.municipalities} 
                              type="Municípios" 
                              level="province"
                            />
                          )}
                          
                          {hasBairros && (
                            <NestedDetails 
                              items={p.bairros} 
                              type="Bairros" 
                              level="municipality"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className={`info-pane${infoOpen ? "" : " closed"}`}>
              <div className="info-header" onClick={() => setInfoOpen(o => !o)}>
                <div className="info-header-left">
                  <div className="info-title">Guia de interpretação</div>
                </div>
                <svg className="info-chev" width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="info-body">
                {GLOSSARY.map((g, i) => (
                  <div className="gloss-item" key={i}>
                    <div className="gloss-term">{g.term}</div>
                    <div className="gloss-def">{g.def}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}