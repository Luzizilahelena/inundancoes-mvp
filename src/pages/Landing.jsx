import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const HOW_STEPS = [
  {
    num: "01",
    title: "Selecione a área",
    desc: "Escolha a província, município ou bairro dentro de Luanda que pretende analisar.",
    tag: "Geográfico",
  },
  {
    num: "02",
    title: "Defina o cenário",
    desc: "Configure a taxa de inundação e o nível de água para simular diferentes intensidades.",
    tag: "Parâmetros",
  },
  {
    num: "03",
    title: "Analise o impacto",
    desc: "Visualize no mapa as zonas afectadas, a população em risco e o tempo de recuperação.",
    tag: "Resultados",
  },
];

const FOR_WHOM = [
  { icon: "◈", title: "Administrações municipais", desc: "Planeamento e priorização de intervenções em zonas críticas." },
  { icon: "◉", title: "Protecção civil", desc: "Planos de resposta e evacuação baseados em cenários reais." },
  { icon: "◎", title: "ONG e resiliência climática", desc: "Identificação de comunidades vulneráveis para apoio." },
  { icon: "◇", title: "Urbanistas e engenheiros", desc: "Ordenamento do território e dimensionamento de infra-estruturas." },
  { icon: "◆", title: "Consultoras e seguradoras", desc: "Avaliação de risco territorial e análise de exposição." },
  { icon: "○", title: "Investigadores", desc: "Exploração de dados de risco hidrológico urbano em Angola." },
];

const SOURCES = [
  ["Dados geográficos", "GADM 4.1 — divisões administrativas oficiais"],
  ["Elevação do terreno", "Open-Elevation API · SRTM 90 m"],
  ["Dados populacionais", "Estimativas por município e bairro"],
  ["Modelo de risco", "Elevação + drenagem + classificação de risco base"],
  ["Limitações", "Resultados indicativos — validação no terreno recomendada"],
  ["Actualização", "2025"],
];

export default function Landing() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const revealRefs = useRef([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveStep((s) => (s + 1) % HOW_STEPS.length), 3000);
    return () => clearInterval(t);
  }, []);

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Epilogue:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #080f0a;
          --bg2: #0e1a10;
          --bg3: #132016;
          --border: rgba(255,255,255,0.07);
          --border-hi: rgba(255,255,255,0.14);
          --text: #e8f0ea;
          --muted: rgba(232,240,234,0.45);
          --faint: rgba(232,240,234,0.22);
          --green: #3ddc68;
          --green-dim: rgba(61,220,104,0.12);
          --green-mid: rgba(61,220,104,0.25);
          --red: #ff5c5c;
          --amber: #f5a623;
          --display: 'Syne', sans-serif;
          --body: 'Epilogue', sans-serif;
          --r: 6px;
          --r-lg: 14px;
          --ease: cubic-bezier(0.22, 1, 0.36, 1);
        }

        html { scroll-behavior: smooth; }
        body {
          font-family: var(--body);
          background: var(--bg);
          color: var(--text);
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        /* ─── NAV ─────────────────────────────── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          height: 60px;
          display: flex; align-items: center;
          padding: 0 clamp(1.25rem, 4vw, 3.5rem);
          transition: background 0.4s var(--ease), border-color 0.4s;
          border-bottom: 1px solid transparent;
        }
        .nav.scrolled {
          background: rgba(8,15,10,0.85);
          backdrop-filter: blur(16px);
          border-color: var(--border);
        }
        .nav-logo {
          font-family: var(--display);
          font-weight: 700; font-size: 1rem;
          color: var(--text); text-decoration: none;
          display: flex; align-items: center; gap: 10px;
          letter-spacing: -0.01em;
        }
        .nav-logo-mark {
          width: 28px; height: 28px;
          border: 1.5px solid var(--green);
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          position: relative;
        }
        .nav-logo-mark::after {
          content: '';
          width: 10px; height: 10px;
          background: var(--green);
          border-radius: 2px;
          display: block;
        }
        .nav-center {
          display: flex; gap: 2rem; list-style: none;
          position: absolute; left: 50%; transform: translateX(-50%);
        }
        .nav-center a {
          font-size: 0.82rem; font-weight: 400;
          color: var(--muted); text-decoration: none;
          transition: color 0.2s; letter-spacing: 0.02em;
        }
        .nav-center a:hover { color: var(--text); }
        .nav-cta {
          margin-left: auto;
          background: var(--green);
          color: #080f0a;
          border: none; border-radius: var(--r);
          padding: 8px 20px;
          font-family: var(--display); font-size: 0.82rem; font-weight: 700;
          cursor: pointer; letter-spacing: 0.03em;
          transition: opacity 0.2s, transform 0.2s;
        }
        .nav-cta:hover { opacity: 0.88; transform: translateY(-1px); }

        /* ─── HERO ────────────────────────────── */
        .hero {
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 0 clamp(1.25rem, 5vw, 4rem);
          padding-top: 60px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .hero-grid-bg {
          position: absolute; inset: 0; z-index: 0;
          background-image:
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 100%);
        }
        .hero-glow {
          position: absolute; top: 20%; left: 50%;
          transform: translate(-50%, -50%);
          width: 600px; height: 400px;
          background: radial-gradient(ellipse, rgba(61,220,104,0.08) 0%, transparent 70%);
          z-index: 0; pointer-events: none;
        }
        .hero-content { position: relative; z-index: 1; max-width: 860px; }

        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--green-dim);
          border: 1px solid rgba(61,220,104,0.2);
          border-radius: 40px;
          padding: 6px 16px;
          font-size: 0.75rem; font-weight: 500; letter-spacing: 0.06em;
          color: var(--green);
          margin-bottom: 2rem;
          animation: fadeDown 0.7s var(--ease) both;
        }
        .hero-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--green);
          animation: blink 1.8s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .hero-title {
          font-family: var(--display);
          font-size: clamp(3rem, 8vw, 6.5rem);
          font-weight: 800; line-height: 0.95;
          letter-spacing: -0.03em;
          margin-bottom: 1.75rem;
          animation: fadeUp 0.8s var(--ease) 0.1s both;
        }
        .hero-title .line-accent { color: var(--green); display: block; }
        .hero-title .line-dim { color: var(--muted); display: block; font-weight: 600; }

        .hero-sub {
          font-size: clamp(1rem, 1.8vw, 1.2rem);
          font-weight: 300; color: var(--muted);
          line-height: 1.75; max-width: 52ch; margin: 0 auto 2.5rem;
          animation: fadeUp 0.8s var(--ease) 0.2s both;
        }
        .hero-actions {
          display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;
          animation: fadeUp 0.8s var(--ease) 0.3s both;
        }

        .btn-main {
          background: var(--green); color: #080f0a;
          border: none; border-radius: var(--r);
          padding: 14px 36px;
          font-family: var(--display); font-size: 0.95rem; font-weight: 700;
          cursor: pointer; letter-spacing: 0.02em;
          display: inline-flex; align-items: center; gap: 10px;
          transition: opacity 0.2s, transform 0.25s var(--ease);
        }
        .btn-main:hover { opacity: 0.88; transform: translateY(-2px); }
        .btn-main:active { transform: scale(0.97); }
        .btn-ghost {
          background: transparent; color: var(--muted);
          border: 1px solid var(--border-hi);
          border-radius: var(--r); padding: 13px 28px;
          font-family: var(--body); font-size: 0.9rem; font-weight: 400;
          cursor: pointer;
          transition: color 0.2s, border-color 0.2s, transform 0.2s;
        }
        .btn-ghost:hover { color: var(--text); border-color: rgba(255,255,255,0.3); transform: translateY(-1px); }

        .hero-scroll-hint {
          position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          color: var(--faint); font-size: 0.72rem; letter-spacing: 0.1em;
          text-transform: uppercase;
          animation: fadeUp 1s var(--ease) 0.8s both;
        }
        .scroll-line {
          width: 1px; height: 48px;
          background: linear-gradient(to bottom, var(--faint), transparent);
          animation: scrollPulse 2s ease-in-out infinite;
        }
        @keyframes scrollPulse { 0%,100%{opacity:0.4} 50%{opacity:1} }

        /* ─── TICKER ──────────────────────────── */
        .ticker-wrap {
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          overflow: hidden; padding: 14px 0;
          background: var(--bg2);
        }
        .ticker-track {
          display: flex; gap: 3rem; width: max-content;
          animation: ticker 24s linear infinite;
        }
        .ticker-item {
          display: flex; align-items: center; gap: 10px;
          font-size: 0.78rem; font-weight: 500; letter-spacing: 0.05em;
          color: var(--muted); white-space: nowrap;
        }
        .ticker-sep { color: var(--green); }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }

        /* ─── SECTION SHELL ───────────────────── */
        .section {
          padding: clamp(5rem, 12vh, 9rem) clamp(1.25rem, 5vw, 4rem);
          max-width: 1160px; margin: 0 auto;
        }
        .section-full {
          padding: clamp(5rem, 12vh, 9rem) clamp(1.25rem, 5vw, 4rem);
        }
        .eyebrow {
          font-size: 0.7rem; font-weight: 600; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--green);
          margin-bottom: 1rem;
          display: flex; align-items: center; gap: 10px;
        }
        .eyebrow::before {
          content: ''; width: 24px; height: 1.5px; background: var(--green);
        }
        .section-title {
          font-family: var(--display);
          font-size: clamp(2rem, 4.5vw, 3.5rem);
          font-weight: 800; line-height: 1.05;
          letter-spacing: -0.025em;
          margin-bottom: 1.25rem;
        }
        .section-sub {
          font-size: 1rem; font-weight: 300;
          color: var(--muted); max-width: 50ch; line-height: 1.8;
        }

        /* ─── REVEAL ──────────────────────────── */
        .reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.7s var(--ease), transform 0.7s var(--ease); }
        .reveal.in { opacity: 1; transform: none; }
        .d1 { transition-delay: 0.08s; }
        .d2 { transition-delay: 0.16s; }
        .d3 { transition-delay: 0.24s; }
        .d4 { transition-delay: 0.32s; }
        .d5 { transition-delay: 0.40s; }
        .d6 { transition-delay: 0.48s; }

        /* ─── HOW IT WORKS ────────────────────── */
        .how-layout {
          display: grid; grid-template-columns: 1fr 2fr;
          gap: 5rem; align-items: start; margin-top: 4rem;
        }
        .how-steps { display: flex; flex-direction: column; gap: 4px; }
        .how-step-btn {
          background: none; border: none; cursor: pointer;
          padding: 20px 22px;
          border-radius: var(--r-lg);
          border: 1px solid transparent;
          text-align: left;
          transition: all 0.3s var(--ease);
          position: relative;
        }
        .how-step-btn.active {
          background: var(--bg3);
          border-color: var(--border-hi);
        }
        .how-step-btn:hover:not(.active) {
          background: rgba(255,255,255,0.02);
        }
        .how-step-num {
          font-family: var(--display); font-size: 0.7rem; font-weight: 700;
          color: var(--green); letter-spacing: 0.1em; margin-bottom: 6px;
        }
        .how-step-title {
          font-family: var(--display); font-size: 1.05rem; font-weight: 700;
          color: var(--text); margin-bottom: 0px;
          transition: color 0.2s;
        }
        .how-step-btn:not(.active) .how-step-title { color: var(--muted); }
        .how-step-progress {
          position: absolute; left: 0; top: 0; bottom: 0;
          width: 2px; background: var(--green); border-radius: 2px 0 0 2px;
          transform-origin: top; transform: scaleY(0);
          transition: none;
        }
        .how-step-btn.active .how-step-progress {
          transform: scaleY(1);
          transition: transform 3s linear;
        }
        .how-detail {
          background: var(--bg3);
          border: 1px solid var(--border-hi);
          border-radius: var(--r-lg);
          padding: 2.5rem;
          min-height: 260px;
          display: flex; flex-direction: column; justify-content: space-between;
          position: relative; overflow: hidden;
        }
        .how-detail::before {
          content: '';
          position: absolute; top: -60px; right: -60px;
          width: 200px; height: 200px;
          border-radius: 50%;
          background: var(--green-dim);
          pointer-events: none;
        }
        .how-detail-tag {
          font-size: 0.7rem; font-weight: 600; letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--green);
          background: var(--green-dim);
          border: 1px solid rgba(61,220,104,0.15);
          padding: 4px 12px; border-radius: 40px;
          display: inline-block; margin-bottom: 1.5rem;
          width: fit-content;
        }
        .how-detail-num {
          font-family: var(--display);
          font-size: 5rem; font-weight: 800;
          color: rgba(61,220,104,0.06);
          line-height: 1; margin-bottom: 1rem;
          letter-spacing: -0.04em;
        }
        .how-detail-title {
          font-family: var(--display);
          font-size: 1.6rem; font-weight: 700;
          line-height: 1.15; margin-bottom: 0.75rem;
          letter-spacing: -0.02em;
        }
        .how-detail-desc {
          font-size: 0.95rem; font-weight: 300;
          color: var(--muted); line-height: 1.75;
        }

        /* ─── FOR WHOM ────────────────────────── */
        .whom-bg {
          background: var(--bg2);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .whom-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          margin-top: 3.5rem;
          background: var(--border);
          border-radius: var(--r-lg);
          overflow: hidden;
          border: 1px solid var(--border);
        }
        .whom-card {
          background: var(--bg2); padding: 2rem 1.75rem;
          transition: background 0.25s;
          cursor: default;
        }
        .whom-card:hover { background: var(--bg3); }
        .whom-icon {
          font-size: 1.4rem; color: var(--green);
          margin-bottom: 1rem; display: block;
          font-family: monospace;
          transition: transform 0.3s var(--ease);
        }
        .whom-card:hover .whom-icon { transform: scale(1.2); }
        .whom-title {
          font-family: var(--display); font-size: 0.95rem; font-weight: 700;
          color: var(--text); margin-bottom: 0.5rem;
          letter-spacing: -0.01em;
        }
        .whom-desc {
          font-size: 0.84rem; font-weight: 300;
          color: var(--muted); line-height: 1.65;
        }

        /* ─── METHODOLOGY ─────────────────────── */
        .meth-layout {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 4rem; margin-top: 3.5rem; align-items: start;
        }
        .meth-table { width: 100%; border-collapse: collapse; }
        .meth-table tr { border-bottom: 1px solid var(--border); }
        .meth-table tr:last-child { border-bottom: none; }
        .meth-table td {
          padding: 14px 0; font-size: 0.875rem; vertical-align: top;
        }
        .meth-table td:first-child {
          font-weight: 500; color: var(--text); width: 42%; padding-right: 1.5rem;
          font-family: var(--display); font-size: 0.82rem; letter-spacing: 0.01em;
        }
        .meth-table td:last-child { color: var(--muted); font-weight: 300; }
        .meth-warn {
          margin-top: 1.5rem;
          border: 1px solid rgba(245,166,35,0.25);
          background: rgba(245,166,35,0.06);
          border-radius: var(--r-lg);
          padding: 1.25rem 1.5rem;
          font-size: 0.84rem; color: var(--amber);
          line-height: 1.65; font-weight: 300;
        }
        .meth-cta {
          background: var(--bg3);
          border: 1px solid var(--border-hi);
          border-radius: var(--r-lg);
          padding: 2.5rem 2rem;
          display: flex; flex-direction: column; gap: 1.25rem;
          position: sticky; top: 80px;
        }
        .meth-cta-label {
          font-size: 0.7rem; font-weight: 600; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--green);
        }
        .meth-cta-title {
          font-family: var(--display); font-size: 1.7rem; font-weight: 800;
          line-height: 1.15; letter-spacing: -0.025em;
        }
        .meth-cta-desc {
          font-size: 0.88rem; font-weight: 300;
          color: var(--muted); line-height: 1.7;
        }

        /* ─── FOOTER ──────────────────────────── */
        .footer {
          border-top: 1px solid var(--border);
          background: var(--bg);
          padding: 2rem clamp(1.25rem, 5vw, 4rem);
          display: flex; align-items: center;
          justify-content: space-between; flex-wrap: wrap; gap: 1rem;
        }
        .footer-logo {
          font-family: var(--display); font-weight: 700; font-size: 0.9rem;
          display: flex; align-items: center; gap: 8px; color: var(--text);
        }
        .footer-mark {
          width: 20px; height: 20px; border: 1.5px solid var(--green);
          border-radius: 4px; display: flex; align-items: center; justify-content: center;
        }
        .footer-mark::after {
          content: ''; width: 8px; height: 8px;
          background: var(--green); border-radius: 1px; display: block;
        }
        .footer-copy { font-size: 0.76rem; color: var(--faint); }

        /* ─── KEYFRAMES ───────────────────────── */
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
        @keyframes fadeDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:none} }

        /* ─── RESPONSIVE ──────────────────────── */
        @media (max-width: 900px) {
          .how-layout { grid-template-columns: 1fr; gap: 2rem; }
          .whom-grid { grid-template-columns: 1fr 1fr; }
          .meth-layout { grid-template-columns: 1fr; }
          .nav-center { display: none; }
          .meth-cta { position: static; }
        }
        @media (max-width: 600px) {
          .whom-grid { grid-template-columns: 1fr; }
          .hero-title { letter-spacing: -0.02em; }
        }
      `}</style>

      {/* NAV */}
      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        <a className="nav-logo" href="#top">
          <span className="nav-logo-mark" />
          Inunda·SIG
        </a>
        <ul className="nav-center">
          {[["Como funciona","#como-funciona"],["Para quem","#para-quem"],["Metodologia","#metodologia"]].map(([l,h]) => (
            <li key={h}><a href={h} onClick={e=>{e.preventDefault();go(h.slice(1))}}>{l}</a></li>
          ))}
        </ul>
        <button className="nav-cta" onClick={() => navigate("/simulador")}>
          Abrir simulador →
        </button>
      </nav>

      {/* HERO */}
      <section id="top" className="hero">
        <div className="hero-grid-bg" />
        <div className="hero-glow" />
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Plataforma de apoio à decisão · Angola
          </div>
          <h1 className="hero-title">
            <span className="line-dim">Simulador de</span>
            <span className="line-accent">Inundações</span>
            <span className="line-dim">Angola</span>
          </h1>
          <p className="hero-sub">
            Simule cenários de inundação, identifique zonas críticas e estime
            o impacto na população para apoiar decisões de prevenção,
            resposta e planeamento territorial.
          </p>
          <div className="hero-actions">
            <button className="btn-main" onClick={() => navigate("/simulador")}>
              Executar simulação
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="btn-ghost" onClick={() => go("como-funciona")}>
              Como funciona
            </button>
          </div>
        </div>
        <div className="hero-scroll-hint">
          <span>scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker-wrap">
        <div className="ticker-track">
          {Array(2).fill([
            "14 Municípios","100+ Bairros mapeados","Elevação SRTM real","3 Níveis de análise",
            "Dados GADM 4.1","Luanda · Angola","Risco em tempo real","Open-Elevation API",
          ]).flat().map((t,i) => (
            <span className="ticker-item" key={i}>
              {t} <span className="ticker-sep">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div id="como-funciona">
        <div className="section">
          <div className="eyebrow reveal">Como funciona</div>
          <h2 className="section-title reveal d1">Três passos para analisar<br/>o risco de inundação</h2>
          <p className="section-sub reveal d2">
            Da selecção da área à interpretação dos resultados — simples, rápido e directo.
          </p>
          <div className="how-layout">
            <div className="how-steps reveal d2">
              {HOW_STEPS.map((s, i) => (
                <button
                  key={s.num}
                  className={`how-step-btn${activeStep === i ? " active" : ""}`}
                  onClick={() => setActiveStep(i)}
                >
                  <div className="how-step-progress" />
                  <div className="how-step-num">— {s.num}</div>
                  <div className="how-step-title">{s.title}</div>
                </button>
              ))}
            </div>
            <div className="how-detail reveal d3">
              <div>
                <div className="how-detail-tag">{HOW_STEPS[activeStep].tag}</div>
                <div className="how-detail-num">{HOW_STEPS[activeStep].num}</div>
                <div className="how-detail-title">{HOW_STEPS[activeStep].title}</div>
                <p className="how-detail-desc">{HOW_STEPS[activeStep].desc}</p>
              </div>
              <button className="btn-main" style={{marginTop:"2rem",alignSelf:"flex-start"}} onClick={() => navigate("/simulador")}>
                Experimentar agora →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FOR WHOM */}
      <div id="para-quem" className="whom-bg section-full">
        <div style={{maxWidth:1160,margin:"0 auto"}}>
          <div className="eyebrow reveal">Para quem é</div>
          <h2 className="section-title reveal d1">Uma ferramenta para quem<br/>toma decisões no território</h2>
          <div className="whom-grid">
            {FOR_WHOM.map((item, i) => (
              <div className={`whom-card reveal d${(i%3)+1}`} key={item.title}>
                <span className="whom-icon">{item.icon}</span>
                <div className="whom-title">{item.title}</div>
                <p className="whom-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* METHODOLOGY */}
      <div id="metodologia">
        <div className="section">
          <div className="eyebrow reveal">Metodologia</div>
          <h2 className="section-title reveal d1">Base de dados e fontes</h2>
          <div className="meth-layout">
            <div>
              <p className="section-sub reveal d2" style={{marginBottom:"2rem"}}>
                O modelo combina dados geográficos oficiais, elevação real do terreno
                e classificação de risco por área para produzir estimativas de impacto.
              </p>
              <table className="meth-table reveal d3">
                <tbody>
                  {SOURCES.map(([k,v]) => (
                    <tr key={k}>
                      <td>{k}</td>
                      <td>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="meth-warn reveal d4">
                ⚠ Os resultados são indicativos e destinam-se a apoiar análise
                preliminar. Não substituem validação técnica no terreno por especialistas.
              </div>
            </div>
            <div>
              <div className="meth-cta reveal d3">
                <div className="meth-cta-label">Pronto para começar?</div>
                <div className="meth-cta-title">Explore os dados agora</div>
                <p className="meth-cta-desc">
                  Configure o cenário que pretende analisar e visualize
                  imediatamente o impacto estimado no mapa interactivo.
                </p>
                <button className="btn-main" onClick={() => navigate("/simulador")}>
                  Abrir simulador
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-logo">
          <span className="footer-mark" />
          Inunda·SIG — Angola
        </div>
        <div className="footer-copy">
          Plataforma de simulação de risco de inundações
        </div>
      </footer>
    </>
  );
}