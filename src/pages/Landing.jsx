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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveStep((s) => (s + 1) % HOW_STEPS.length), 3000);
    return () => clearInterval(t);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const go = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

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
          --red: #ff5c5c;
          --amber: #f5a623;
          --display: 'Inter', sans-serif;
          --body: 'Inter', sans-serif;
          --r: 6px;
          --r-lg: 14px;
          --ease: cubic-bezier(0.22, 1, 0.36, 1);
          --nav-h: 60px;
        }

        html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
        body {
          font-family: var(--body);
          background: var(--bg);
          color: var(--text);
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        /* NAV */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 300;
          height: var(--nav-h);
          display: flex; align-items: center;
          padding: 0 clamp(1rem, 4vw, 3.5rem);
          transition: background 0.4s var(--ease), border-color 0.4s;
          border-bottom: 1px solid transparent;
        }
        .nav.scrolled {
          background: rgba(8,15,10,0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-color: var(--border);
        }
        .nav-logo {
          font-family: var(--display); font-weight: 700;
          font-size: clamp(0.88rem, 2.5vw, 1rem);
          color: var(--text); text-decoration: none;
          display: flex; align-items: center; gap: 10px;
          letter-spacing: -0.01em; flex-shrink: 0;
        }
        .nav-logo-mark {
          width: 28px; height: 28px; flex-shrink: 0;
          border: 1.5px solid var(--green); border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
        }
        .nav-logo-mark::after {
          content: ''; width: 10px; height: 10px;
          background: var(--green); border-radius: 2px; display: block;
        }
        .nav-links {
          display: flex; gap: 2rem; list-style: none;
          position: absolute; left: 50%; transform: translateX(-50%);
        }
        .nav-links a {
          font-size: 0.82rem; font-weight: 400;
          color: var(--muted); text-decoration: none;
          transition: color 0.2s; letter-spacing: 0.02em; white-space: nowrap;
        }
        .nav-links a:hover { color: var(--text); }
        .nav-cta {
          margin-left: auto;
          background: var(--green); color: #080f0a;
          border: none; border-radius: var(--r);
          padding: 8px 20px;
          font-family: var(--display); font-size: 0.82rem; font-weight: 700;
          cursor: pointer; letter-spacing: 0.03em; white-space: nowrap;
          transition: opacity 0.2s, transform 0.2s;
          -webkit-tap-highlight-color: transparent;
        }
        .nav-cta:hover { opacity: 0.88; transform: translateY(-1px); }

        /* Hamburger */
        .nav-hamburger {
          display: none; margin-left: auto;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border-hi);
          border-radius: var(--r);
          color: var(--text); cursor: pointer;
          padding: 7px 10px; align-items: center; gap: 6px;
          font-family: var(--body); font-size: 0.78rem;
          transition: background 0.2s;
          -webkit-tap-highlight-color: transparent;
          flex-shrink: 0;
        }
        .nav-hamburger:hover { background: rgba(255,255,255,0.09); }

        /* Mobile drawer */
        .nav-drawer {
          display: none;
          position: fixed; top: var(--nav-h); left: 0; right: 0; bottom: 0;
          z-index: 290;
          flex-direction: column;
          background: rgba(8,15,10,0.97);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid var(--border);
          padding: 1.25rem 1rem;
          gap: 2px;
          transform: translateY(-110%);
          opacity: 0;
          transition: transform 0.35s var(--ease), opacity 0.3s;
          pointer-events: none;
          overflow-y: auto;
        }
        .nav-drawer.open {
          transform: translateY(0); opacity: 1; pointer-events: auto;
        }
        .nav-drawer-link {
          display: block; padding: 14px 16px;
          font-size: 1rem; font-weight: 400;
          color: var(--muted); text-decoration: none;
          border-radius: var(--r);
          transition: color 0.2s, background 0.2s;
        }
        .nav-drawer-link:hover, .nav-drawer-link:active { color: var(--text); background: rgba(255,255,255,0.04); }
        .nav-drawer-sep { height: 1px; background: var(--border); margin: 0.75rem 0; }
        .nav-drawer-cta {
          width: 100%; background: var(--green); color: #080f0a;
          border: none; border-radius: var(--r);
          padding: 14px 20px; margin-top: 4px;
          font-family: var(--display); font-size: 0.92rem; font-weight: 700;
          cursor: pointer; letter-spacing: 0.02em;
          transition: opacity 0.2s;
          -webkit-tap-highlight-color: transparent;
        }
        .nav-drawer-cta:hover { opacity: 0.88; }

        /* HERO */
        .hero {
          min-height: 100vh; min-height: 100dvh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: calc(var(--nav-h) + 2rem) clamp(1rem, 5vw, 4rem) clamp(3rem, 8vh, 5rem);
          text-align: center; position: relative; overflow: hidden; width: 100%;
        }
        .hero-grid-bg {
          position: absolute; inset: 0; z-index: 0;
          background-image:
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px);
          background-size: clamp(40px,8vw,60px) clamp(40px,8vw,60px);
          mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 100%);
        }
        .hero-glow {
          position: absolute; top: 20%; left: 50%;
          transform: translate(-50%, -50%);
          width: min(600px, 90vw); height: 400px;
          background: radial-gradient(ellipse, rgba(61,220,104,0.08) 0%, transparent 70%);
          z-index: 0; pointer-events: none;
        }
        .hero-content { position: relative; z-index: 1; max-width: min(860px, 94vw); width: 100%; }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--green-dim); border: 1px solid rgba(61,220,104,0.2);
          border-radius: 40px; padding: 6px clamp(12px,3vw,16px);
          font-size: clamp(0.66rem, 1.8vw, 0.75rem); font-weight: 500; letter-spacing: 0.06em;
          color: var(--green); margin-bottom: clamp(1.25rem,3vh,1.75rem);
          animation: fadeDown 0.7s var(--ease) both;
        }
        .hero-badge-dot {
          width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
          background: var(--green); animation: blink 1.8s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .hero-title {
          font-family: var(--display);
          font-size: clamp(2.1rem, 9vw, 5.5rem);
          font-weight: 800; line-height: 0.95; letter-spacing: -0.03em;
          margin-bottom: clamp(1.1rem,3vh,1.75rem);
          animation: fadeUp 0.8s var(--ease) 0.1s both;
        }
        .hero-title .line-accent { color: var(--green); display: block; }
        .hero-title .line-dim { color: var(--muted); display: block; font-weight: 600; }
        .hero-sub {
          font-size: clamp(0.9rem, 2.2vw, 1.15rem); font-weight: 300; color: var(--muted);
          line-height: 1.75; max-width: 52ch; margin: 0 auto clamp(1.75rem,4vh,2.5rem);
          animation: fadeUp 0.8s var(--ease) 0.2s both;
        }
        .hero-actions {
          display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;
          animation: fadeUp 0.8s var(--ease) 0.3s both;
        }
        .btn-main {
          background: var(--green); color: #080f0a;
          border: none; border-radius: var(--r);
          padding: clamp(10px,2.5vw,14px) clamp(20px,4vw,36px);
          font-family: var(--display); font-size: clamp(0.83rem,2vw,0.95rem); font-weight: 700;
          cursor: pointer; letter-spacing: 0.02em;
          display: inline-flex; align-items: center; gap: 8px; white-space: nowrap;
          transition: opacity 0.2s, transform 0.25s var(--ease);
          -webkit-tap-highlight-color: transparent;
        }
        .btn-main:hover { opacity: 0.88; transform: translateY(-2px); }
        .btn-main:active { transform: scale(0.97); opacity: 1; }
        .btn-ghost {
          background: transparent; color: var(--muted);
          border: 1px solid var(--border-hi); border-radius: var(--r);
          padding: clamp(9px,2.5vw,13px) clamp(16px,3.5vw,28px);
          font-family: var(--body); font-size: clamp(0.82rem,2vw,0.9rem); font-weight: 400;
          cursor: pointer; white-space: nowrap;
          transition: color 0.2s, border-color 0.2s, transform 0.2s;
          -webkit-tap-highlight-color: transparent;
        }
        .btn-ghost:hover { color: var(--text); border-color: rgba(255,255,255,0.28); transform: translateY(-1px); }
        .hero-scroll-hint {
          position: absolute; bottom: 1.5rem; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 7px;
          color: var(--faint); font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase;
          animation: fadeUp 1s var(--ease) 0.8s both;
        }
        .scroll-line {
          width: 1px; height: 40px;
          background: linear-gradient(to bottom, var(--faint), transparent);
          animation: scrollPulse 2s ease-in-out infinite;
        }
        @keyframes scrollPulse { 0%,100%{opacity:0.4} 50%{opacity:1} }

        /* TICKER */
        .ticker-wrap {
          border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
          overflow: hidden; padding: 12px 0; background: var(--bg2);
        }
        .ticker-track {
          display: flex; gap: 3rem; width: max-content;
          animation: ticker 24s linear infinite;
        }
        .ticker-item {
          display: flex; align-items: center; gap: 10px;
          font-size: clamp(0.68rem, 1.8vw, 0.78rem); font-weight: 500;
          letter-spacing: 0.05em; color: var(--muted); white-space: nowrap;
        }
        .ticker-sep { color: var(--green); }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }

        /* SECTION */
        .section { padding: clamp(4rem,10vh,8rem) clamp(1rem,5vw,4rem); max-width: 1160px; margin: 0 auto; }
        .section-full { padding: clamp(4rem,10vh,8rem) clamp(1rem,5vw,4rem); }
        .eyebrow {
          font-size: 0.7rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--green); margin-bottom: 1rem;
          display: flex; align-items: center; gap: 10px;
        }
        .eyebrow::before { content: ''; width: 20px; height: 1.5px; background: var(--green); flex-shrink: 0; }
        .section-title {
          font-family: var(--display); font-size: clamp(1.75rem,5vw,3.2rem);
          font-weight: 800; line-height: 1.08; letter-spacing: -0.025em; margin-bottom: 1.1rem;
        }
        .section-sub { font-size: clamp(0.88rem,1.8vw,1rem); font-weight: 300; color: var(--muted); max-width: 50ch; line-height: 1.8; }

        /* REVEAL */
        .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.65s var(--ease), transform 0.65s var(--ease); }
        .reveal.in { opacity: 1; transform: none; }
        .d1{transition-delay:0.08s} .d2{transition-delay:0.16s} .d3{transition-delay:0.24s}
        .d4{transition-delay:0.32s} .d5{transition-delay:0.40s} .d6{transition-delay:0.48s}

        /* HOW IT WORKS */
        .how-layout { display: grid; grid-template-columns: 1fr 1.4fr; gap: 4rem; align-items: start; margin-top: 3.5rem; }
        .how-steps { display: flex; flex-direction: column; gap: 4px; }
        .how-step-btn {
          background: none; border: 1px solid transparent; cursor: pointer;
          padding: 18px 20px; border-radius: var(--r-lg); text-align: left;
          transition: all 0.3s var(--ease); position: relative;
          -webkit-tap-highlight-color: transparent;
        }
        .how-step-btn.active { background: var(--bg3); border-color: var(--border-hi); }
        .how-step-num { font-family: var(--display); font-size: 0.7rem; font-weight: 700; color: var(--green); letter-spacing: 0.1em; margin-bottom: 5px; }
        .how-step-title { font-family: var(--display); font-size: clamp(0.9rem,2vw,1.05rem); font-weight: 700; color: var(--muted); transition: color 0.2s; }
        .how-step-btn.active .how-step-title { color: var(--text); }
        .how-step-progress {
          position: absolute; left: 0; top: 0; bottom: 0; width: 2px;
          background: var(--green); border-radius: 2px 0 0 2px;
          transform-origin: top; transform: scaleY(0); transition: none;
        }
        .how-step-btn.active .how-step-progress { transform: scaleY(1); transition: transform 3s linear; }
        .how-detail {
          background: var(--bg3); border: 1px solid var(--border-hi); border-radius: var(--r-lg);
          padding: clamp(1.5rem,3vw,2.5rem); min-height: 240px;
          display: flex; flex-direction: column; justify-content: space-between;
          position: relative; overflow: hidden;
        }
        .how-detail::before {
          content: ''; position: absolute; top: -60px; right: -60px;
          width: 200px; height: 200px; border-radius: 50%; background: var(--green-dim); pointer-events: none;
        }
        .how-detail-tag {
          font-size: 0.68rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--green); background: var(--green-dim); border: 1px solid rgba(61,220,104,0.15);
          padding: 4px 12px; border-radius: 40px; display: inline-block; margin-bottom: 1.1rem; width: fit-content;
        }
        .how-detail-num {
          font-family: var(--display); font-size: clamp(2.8rem,8vw,5rem); font-weight: 800;
          color: rgba(61,220,104,0.06); line-height: 1; margin-bottom: 0.65rem; letter-spacing: -0.04em;
        }
        .how-detail-title { font-family: var(--display); font-size: clamp(1.2rem,3vw,1.6rem); font-weight: 700; line-height: 1.15; margin-bottom: 0.65rem; letter-spacing: -0.02em; }
        .how-detail-desc { font-size: clamp(0.85rem,1.8vw,0.95rem); font-weight: 300; color: var(--muted); line-height: 1.75; }

        /* FOR WHOM */
        .whom-bg { background: var(--bg2); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .whom-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1px; margin-top: 3rem;
          background: var(--border); border-radius: var(--r-lg); overflow: hidden; border: 1px solid var(--border);
        }
        .whom-card { background: var(--bg2); padding: clamp(1.25rem,2.5vw,1.75rem) clamp(1rem,2vw,1.5rem); transition: background 0.25s; cursor: default; }
        .whom-card:hover { background: var(--bg3); }
        .whom-icon { font-size: 1.3rem; color: var(--green); margin-bottom: 0.85rem; display: block; font-family: monospace; transition: transform 0.3s var(--ease); }
        .whom-card:hover .whom-icon { transform: scale(1.2); }
        .whom-title { font-family: var(--display); font-size: clamp(0.82rem,1.8vw,0.95rem); font-weight: 700; color: var(--text); margin-bottom: 0.45rem; letter-spacing: -0.01em; }
        .whom-desc { font-size: clamp(0.77rem,1.5vw,0.84rem); font-weight: 300; color: var(--muted); line-height: 1.65; }

        /* METHODOLOGY */
        .meth-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; margin-top: 3.5rem; align-items: start; }
        .meth-table { width: 100%; border-collapse: collapse; }
        .meth-table tr { border-bottom: 1px solid var(--border); }
        .meth-table tr:last-child { border-bottom: none; }
        .meth-table td { padding: 13px 0; font-size: clamp(0.78rem,1.5vw,0.875rem); vertical-align: top; }
        .meth-table td:first-child { font-weight: 500; color: var(--text); width: 42%; padding-right: 1.25rem; font-family: var(--display); font-size: clamp(0.74rem,1.4vw,0.82rem); letter-spacing: 0.01em; }
        .meth-table td:last-child { color: var(--muted); font-weight: 300; }
        .meth-warn {
          margin-top: 1.5rem; border: 1px solid rgba(245,166,35,0.25); background: rgba(245,166,35,0.06);
          border-radius: var(--r-lg); padding: 1.1rem 1.4rem;
          font-size: clamp(0.77rem,1.5vw,0.84rem); color: var(--amber); line-height: 1.65; font-weight: 300;
        }
        .meth-cta {
          background: var(--bg3); border: 1px solid var(--border-hi); border-radius: var(--r-lg);
          padding: clamp(1.5rem,3vw,2.25rem) clamp(1.25rem,2.5vw,2rem);
          display: flex; flex-direction: column; gap: 1.1rem;
          position: sticky; top: 80px;
        }
        .meth-cta-label { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--green); }
        .meth-cta-title { font-family: var(--display); font-size: clamp(1.25rem,3vw,1.7rem); font-weight: 800; line-height: 1.15; letter-spacing: -0.025em; }
        .meth-cta-desc { font-size: clamp(0.8rem,1.6vw,0.88rem); font-weight: 300; color: var(--muted); line-height: 1.7; }

        /* FOOTER */
        .footer {
          border-top: 1px solid var(--border); background: var(--bg);
          padding: clamp(1.25rem,3vw,2rem) clamp(1rem,5vw,4rem);
          display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;
        }
        .footer-logo { font-family: var(--display); font-weight: 700; font-size: clamp(0.82rem,2vw,0.9rem); display: flex; align-items: center; gap: 8px; color: var(--text); }
        .footer-mark { width: 20px; height: 20px; flex-shrink: 0; border: 1.5px solid var(--green); border-radius: 4px; display: flex; align-items: center; justify-content: center; }
        .footer-mark::after { content: ''; width: 8px; height: 8px; background: var(--green); border-radius: 1px; display: block; }
        .footer-copy { font-size: clamp(0.68rem,1.5vw,0.76rem); color: var(--faint); }

        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
        @keyframes fadeDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:none} }

        /* RESPONSIVE */
        @media (max-width: 1024px) {
          .nav-links { gap: 1.5rem; }
          .whom-grid { grid-template-columns: repeat(2,1fr); }
          .meth-layout { gap: 3rem; }
        }
        @media (max-width: 900px) {
          .nav-links, .nav-cta { display: none; }
          .nav-hamburger { display: flex; }
          .nav-drawer { display: flex; }
          .how-layout { grid-template-columns: 1fr; gap: 1.75rem; margin-top: 2.5rem; }
          .meth-layout { grid-template-columns: 1fr; gap: 2.5rem; }
          .meth-cta { position: static; }
        }
        @media (max-width: 640px) {
          :root { --nav-h: 56px; --r-lg: 10px; }
          .hero { padding-top: calc(var(--nav-h) + 1.25rem); }
          .hero-sub { max-width: 40ch; }
          .whom-grid { grid-template-columns: 1fr; }
          .how-step-btn { padding: 14px 16px; }
          .how-detail { min-height: auto; }
          .how-detail .btn-main { margin-top: 1.5rem; width: 100%; justify-content: center; }
          .meth-table { display: flex; flex-direction: column; }
          .meth-table tr { display: flex; flex-direction: column; gap: 2px; border-bottom: none; padding: 10px 0; border-top: 1px solid var(--border); }
          .meth-table tr:first-child { border-top: none; }
          .meth-table td:first-child { color: var(--green); width: auto; padding-right: 0; font-size: 0.74rem; }
          .meth-table td:last-child { font-size: 0.8rem; }
          .meth-cta .btn-main { width: 100%; justify-content: center; }
          .footer { flex-direction: column; text-align: center; align-items: center; }
        }
        @media (max-width: 380px) {
          .hero-title { letter-spacing: -0.02em; }
          .hero-sub { font-size: 0.85rem; max-width: 36ch; }
        }
        @media (max-height: 500px) and (orientation: landscape) {
          .hero { min-height: auto; padding-top: calc(var(--nav-h) + 0.75rem); padding-bottom: 2rem; }
          .hero-glow, .hero-scroll-hint { display: none; }
          .hero-title { margin-bottom: 0.9rem; }
          .hero-sub { margin-bottom: 1.5rem; }
        }
        @media (hover: none) {
          .how-step-btn:hover:not(.active) { background: transparent; }
          .whom-card:hover { background: var(--bg2); }
          .btn-main:hover, .btn-ghost:hover, .nav-cta:hover { opacity: 1; transform: none; }
          .btn-ghost:hover { border-color: var(--border-hi); }
        }
      `}</style>

      {/* NAV */}
      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        <a className="nav-logo" href="#top">
          <span className="nav-logo-mark" />
          Inunda·SIG
        </a>
        <ul className="nav-links">
          {[["Como funciona", "como-funciona"], ["Para quem", "para-quem"], ["Metodologia", "metodologia"]].map(([l, id]) => (
            <li key={id}><a href={`#${id}`} onClick={e => { e.preventDefault(); go(id); }}>{l}</a></li>
          ))}
        </ul>
        <button className="nav-cta" onClick={() => navigate("/simulador")}>Abrir simulador →</button>
        <button className="nav-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            {menuOpen
              ? <path d="M3 3l12 12M3 15L15 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              : <path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            }
          </svg>
          {menuOpen ? "Fechar" : "Menu"}
        </button>
      </nav>

      <div className={`nav-drawer${menuOpen ? " open" : ""}`}>
        {[["Como funciona", "como-funciona"], ["Para quem", "para-quem"], ["Metodologia", "metodologia"]].map(([l, id]) => (
          <a key={id} className="nav-drawer-link" href={`#${id}`} onClick={e => { e.preventDefault(); go(id); }}>{l}</a>
        ))}
        <div className="nav-drawer-sep" />
        <button className="nav-drawer-cta" onClick={() => { navigate("/simulador"); setMenuOpen(false); }}>
          Abrir simulador →
        </button>
      </div>

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
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="btn-ghost" onClick={() => go("como-funciona")}>Como funciona</button>
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
          {Array(2).fill(["14 Municípios", "100+ Bairros mapeados", "Elevação SRTM real", "3 Níveis de análise", "Dados GADM 4.1", "Luanda · Angola", "Risco em tempo real", "Open-Elevation API"]).flat().map((t, i) => (
            <span className="ticker-item" key={i}>{t} <span className="ticker-sep">✦</span></span>
          ))}
        </div>
      </div>

      {/* HOW */}
      <div id="como-funciona">
        <div className="section">
          <div className="eyebrow reveal">Como funciona</div>
          <h2 className="section-title reveal d1">Três passos para analisar<br />o risco de inundação</h2>
          <p className="section-sub reveal d2">Da selecção da área à interpretação dos resultados — simples, rápido e directo.</p>
          <div className="how-layout">
            <div className="how-steps reveal d2">
              {HOW_STEPS.map((s, i) => (
                <button key={s.num} className={`how-step-btn${activeStep === i ? " active" : ""}`} onClick={() => setActiveStep(i)}>
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
              <button className="btn-main" style={{ marginTop: "2rem", alignSelf: "flex-start" }} onClick={() => navigate("/simulador")}>
                Experimentar agora →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FOR WHOM */}
      <div id="para-quem" className="whom-bg section-full">
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div className="eyebrow reveal">Para quem é</div>
          <h2 className="section-title reveal d1">Uma ferramenta para quem<br />toma decisões no território</h2>
          <div className="whom-grid">
            {FOR_WHOM.map((item, i) => (
              <div className={`whom-card reveal d${(i % 3) + 1}`} key={item.title}>
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
              <p className="section-sub reveal d2" style={{ marginBottom: "2rem" }}>
                O modelo combina dados geográficos oficiais, elevação real do terreno
                e classificação de risco por área para produzir estimativas de impacto.
              </p>
              <table className="meth-table reveal d3">
                <tbody>
                  {SOURCES.map(([k, v]) => (<tr key={k}><td>{k}</td><td>{v}</td></tr>))}
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
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-logo"><span className="footer-mark" />Inunda·SIG — Angola</div>
        <div className="footer-copy">Plataforma de simulação de risco de inundações</div>
      </footer>
    </>
  );
}