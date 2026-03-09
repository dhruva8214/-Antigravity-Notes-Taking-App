import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import {
    FiSun, FiMoon, FiBookOpen, FiCpu, FiZap, FiArrowRight,
    FiPenTool, FiSave, FiDownload, FiGrid, FiLayout,
    FiMonitor, FiCommand, FiStar, FiCheck,
} from 'react-icons/fi';

function useReveal() {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; obs.disconnect(); } },
            { threshold: 0.1 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return ref;
}

const ALL_FEATURES = [
    { icon: <FiPenTool size={22} />, color: '#f59e0b', title: '9 Drawing Tools', desc: 'Rectangle, circle, arrow, pencil, text, eraser, select and pan -- all with keyboard shortcuts.' },
    { icon: <FiSave size={22} />, color: '#34d399', title: 'Auto-Save', desc: 'Everything saved instantly in your browser. No account needed, no data lost.' },
    { icon: <FiDownload size={22} />, color: '#60a5fa', title: 'Export Anywhere', desc: 'Export as PNG, SVG, PDF, or reusable .antigravity JSON files.' },
    { icon: <FiGrid size={22} />, color: '#f472b6', title: 'Multiple Boards', desc: 'Create unlimited canvas boards, name them, switch between them in one click.' },
    { icon: <FiLayout size={22} />, color: '#fb923c', title: 'Dev Templates', desc: 'Ready-to-use flowcharts, DB schema diagrams, and DSA visualization templates.' },
    { icon: <FiMonitor size={22} />, color: '#a78bfa', title: 'Infinite Canvas', desc: 'Pan, zoom, and draw on an infinite dark canvas with no size restrictions.' },
    { icon: <FiCommand size={22} />, color: '#67e8f9', title: 'Keyboard Shortcuts', desc: 'Every tool has a hotkey. Ctrl+Z undo, Delete to remove, Ctrl+A select all.' },
    { icon: <FiStar size={22} />, color: '#fbbf24', title: '100% Free Forever', desc: 'No paywalls, no subscriptions, no gates. Built for students by a student.' },
];

const Landing: React.FC = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useThemeStore();
    const heroRef = useReveal();
    const newRef = useReveal();
    const allRef = useReveal();
    const ctaRef = useReveal();

    return (
        <div style={{ minHeight: '100vh', background: '#0f0e17', color: '#e2e8f0', fontFamily: 'Inter,system-ui,sans-serif', overflowX: 'hidden' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
                *{box-sizing:border-box;}
                @keyframes orbPulse{0%,100%{opacity:.45;transform:scale(1)}50%{opacity:.65;transform:scale(1.08)}}
                @keyframes gradText{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
                @keyframes borderGlow{0%,100%{box-shadow:0 0 0 0 rgba(167,139,250,0)}50%{box-shadow:0 0 24px 2px rgba(167,139,250,0.1)}}
                .reveal{opacity:0;transform:translateY(36px);transition:opacity .65s ease,transform .65s ease;}
                .sk-nav{position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 32px;height:62px;background:rgba(15,14,23,.9);backdrop-filter:blur(16px);border-bottom:1px solid rgba(255,255,255,.06);}
                .sk-link{padding:6px 14px;border-radius:8px;border:none;background:transparent;color:rgba(148,163,184,.9);cursor:pointer;font-size:14px;font-weight:500;text-decoration:none;font-family:inherit;transition:all .15s;}
                .sk-link:hover{color:#e2e8f0;background:rgba(255,255,255,.06);}
                .sk-cta-btn{padding:9px 22px;border-radius:10px;border:none;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:white;cursor:pointer;font-size:14px;font-weight:700;font-family:inherit;box-shadow:0 4px 18px rgba(124,58,237,.4);transition:all .2s;}
                .sk-cta-btn:hover{transform:translateY(-1px);box-shadow:0 6px 24px rgba(124,58,237,.55);}
                .sk-btn-primary{padding:14px 30px;border-radius:12px;border:none;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:white;cursor:pointer;font-size:16px;font-weight:800;font-family:inherit;box-shadow:0 8px 28px rgba(124,58,237,.45);transition:all .2s;}
                .sk-btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 36px rgba(124,58,237,.6);}
                .sk-btn-ghost{padding:13px 24px;border-radius:12px;border:2px solid rgba(167,139,250,.3);background:transparent;color:#a78bfa;cursor:pointer;font-size:15px;font-weight:700;font-family:inherit;transition:all .2s;}
                .sk-btn-ghost:hover{background:rgba(167,139,250,.1);border-color:rgba(167,139,250,.6);}
                .sk-btn-ghost-cyan{padding:13px 24px;border-radius:12px;border:2px solid rgba(103,232,249,.3);background:transparent;color:#67e8f9;cursor:pointer;font-size:15px;font-weight:700;font-family:inherit;transition:all .2s;}
                .sk-btn-ghost-cyan:hover{background:rgba(103,232,249,.1);border-color:rgba(103,232,249,.6);}
                .sk-feat-card{border-radius:16px;padding:22px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.025);transition:transform .2s,border-color .2s,box-shadow .2s;}
                .sk-feat-card:hover{transform:translateY(-3px);border-color:rgba(255,255,255,.15);box-shadow:0 12px 36px rgba(0,0,0,.35);}
                .sk-new-card{border-radius:20px;border:1px solid rgba(255,255,255,.08);background:linear-gradient(145deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.01) 100%);overflow:hidden;transition:transform .2s,box-shadow .2s;}
                .sk-new-card:hover{transform:translateY(-5px);}
                .sk-new-cta-btn{display:flex;align-items:center;gap:8px;margin:4px 24px 24px;padding:12px 20px;border-radius:12px;border:none;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;transition:all .2s;width:fit-content;}
                .sk-pill{padding:4px 12px;border-radius:999px;font-size:12px;font-weight:600;border:1px solid;}
                .sk-mockup{margin:0 20px 24px;border-radius:14px;border:1px solid rgba(255,255,255,.07);overflow:hidden;background:rgba(8,7,18,.8);}
                .sk-mockup-bar{display:flex;align-items:center;gap:8px;padding:10px 16px;border-bottom:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);}
                .sk-preview-card{border-radius:14px;padding:14px;border:1px solid;animation:borderGlow 3s ease-in-out infinite;}
            `}</style>

            {/* NAV */}
            <nav className="sk-nav">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800, fontSize: '18px', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <span style={{ background: 'linear-gradient(135deg,#a78bfa,#67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '22px' }}>*</span>
                    Sketchbyte
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <a href="#new" className="sk-link">What's New</a>
                    <a href="#all" className="sk-link">All Features</a>

                    <button onClick={toggleTheme} className="sk-link" style={{ border: 'none', fontSize: '17px', display: 'flex', cursor: 'pointer' }}>
                        {theme === 'dark' ? <FiSun /> : <FiMoon />}
                    </button>
                    <button onClick={() => navigate('/canvas')} className="sk-cta-btn">Launch App -&gt;</button>
                </div>
            </nav>

            {/* HERO */}
            <section style={{ position: 'relative', textAlign: 'center', padding: '100px 24px 80px', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', width: 520, height: 520, top: '-15%', left: '-10%', borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,.18) 0%,transparent 70%)', filter: 'blur(72px)', animation: 'orbPulse 6s ease-in-out infinite', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', width: 400, height: 400, top: '5%', right: '-8%', borderRadius: '50%', background: 'radial-gradient(circle,rgba(103,232,249,.12) 0%,transparent 70%)', filter: 'blur(72px)', animation: 'orbPulse 8s ease-in-out infinite 2s', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', width: 280, height: 280, bottom: '-10%', left: '35%', borderRadius: '50%', background: 'radial-gradient(circle,rgba(251,191,36,.09) 0%,transparent 70%)', filter: 'blur(72px)', animation: 'orbPulse 10s ease-in-out infinite 1s', pointerEvents: 'none' }} />

                <div ref={heroRef} className="reveal">
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 16px', borderRadius: '999px', border: '1px solid rgba(167,139,250,.3)', background: 'rgba(167,139,250,.08)', color: '#a78bfa', fontSize: '13px', fontWeight: 600, marginBottom: '24px' }}>
                        <FiZap size={12} /> Free - Unlimited - Open Source
                    </div>
                    <h1 style={{ fontSize: 'clamp(38px,7vw,76px)', fontWeight: 900, lineHeight: 1.05, margin: '0 auto 20px', maxWidth: '820px' }}>
                        The Visual Workspace<br />
                        <span style={{ background: 'linear-gradient(135deg,#a78bfa 0%,#67e8f9 40%,#fbbf24 100%)', backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'gradText 4s ease infinite' }}>for Every Student.</span>
                    </h1>
                    <p style={{ fontSize: '18px', color: 'rgba(148,163,184,.9)', maxWidth: '540px', margin: '0 auto 36px', lineHeight: 1.65 }}>
                        Whiteboard · Code Diagrams · AI Study Planner · AI Flashcards — everything a student needs, 100% free forever.
                    </p>
                    <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="sk-btn-primary" onClick={() => navigate('/canvas')}>Start Drawing — It's Free</button>
                        <button className="sk-btn-ghost" onClick={() => navigate('/study-planner')}>
                            <FiBookOpen size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />Study Planner
                        </button>
                        <button className="sk-btn-ghost" onClick={() => navigate('/flashcards')} style={{ color: '#fbbf24', borderColor: 'rgba(251,191,36,.35)' }}>
                            <FiZap size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />AI Flashcards ✨
                        </button>
                    </div>

                    {/* Animated diagram preview */}
                    <div style={{ maxWidth: '780px', margin: '52px auto 0', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
                        {[
                            { t: '<<class>>', n: 'User', f: ['id: number', 'name: string', 'email: string'], c: '#a78bfa' },
                            { t: '<<interface>>', n: 'Product', f: ['id: string', 'price: number', 'stock: int'], c: '#67e8f9' },
                            { t: '<<struct>>', n: 'Order', f: ['orderId: string', 'total: number', 'status: string'], c: '#86efac' },
                        ].map(card => (
                            <div key={card.n} className="sk-preview-card" style={{ background: `${card.c}08`, borderColor: `${card.c}28` }}>
                                <div style={{ fontSize: '10px', fontWeight: 700, color: card.c, opacity: .7, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '4px' }}>{card.t}</div>
                                <div style={{ fontSize: '16px', fontWeight: 800, color: card.c, marginBottom: '8px' }}>{card.n}</div>
                                {card.f.map(f => <div key={f} style={{ fontSize: '12px', fontFamily: 'monospace', opacity: .65, padding: '3px 0', borderTop: '1px solid rgba(255,255,255,.05)' }}>{f}</div>)}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* WHAT'S NEW */}
            <section id="new" style={{ padding: '72px 24px' }}>
                <div ref={newRef} className="reveal" style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px', borderRadius: '999px', border: '1px solid rgba(167,139,250,.3)', background: 'rgba(167,139,250,.08)', color: '#a78bfa', fontSize: '12px', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '18px' }}>
                        <FiZap size={12} /> What's New
                    </div>
                    <h2 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, margin: '0 0 12px' }}>Three Powerful New Features</h2>
                    <p style={{ color: 'rgba(148,163,184,.85)', fontSize: '16px', maxWidth: '520px', lineHeight: 1.6, margin: '0 0 40px' }}>
                        Built specifically for students and developers — including the brand-new <strong style={{ color: '#fbbf24' }}>AI Flashcards</strong>. All completely free with no sign-up required.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>

                        {/* Code to Diagram card */}
                        <div className="sk-new-card" style={{ boxShadow: '0 24px 60px rgba(167,139,250,.12)', borderColor: 'rgba(167,139,250,.2)' }}>
                            <div style={{ padding: '28px 28px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(167,139,250,.12)', color: '#a78bfa', border: '1px solid rgba(167,139,250,.3)', fontSize: '11px', fontWeight: 800, letterSpacing: '.06em', width: 'fit-content' }}>[NEW] FEATURE</span>
                                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(167,139,250,.12)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiCpu size={26} /></div>
                                <h3 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#e2e8f0' }}>Code -&gt; Diagram</h3>
                                <p style={{ color: 'rgba(148,163,184,.85)', fontSize: '15px', lineHeight: 1.65, margin: 0 }}>Paste any code and instantly get a visual class diagram on your canvas. Supports 12+ languages including TypeScript, Python, Java, Go, Rust and more.</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                                    {['12+ Languages', 'Auto-parse', 'Save as File', 'Add to Board', 'Class Diagrams'].map(p => (
                                        <span key={p} className="sk-pill" style={{ background: 'rgba(167,139,250,.08)', color: '#a78bfa', borderColor: 'rgba(167,139,250,.25)' }}>{p}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="sk-mockup">
                                <div className="sk-mockup-bar">
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        {['rgba(167,139,250,.5)', 'rgba(167,139,250,.3)', 'rgba(167,139,250,.15)'].map((c, i) => <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />)}
                                    </div>
                                    <span style={{ fontSize: '12px', color: 'rgba(148,163,184,.4)', fontWeight: 600 }}>animal.py</span>
                                </div>
                                <div style={{ padding: '16px', fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.9' }}>
                                    <div><span style={{ color: '#c084fc' }}>class </span><span style={{ color: '#67e8f9' }}>Animal</span>:</div>
                                    <div style={{ paddingLeft: '20px' }}>name: <span style={{ color: '#86efac' }}>str</span></div>
                                    <div style={{ paddingLeft: '20px' }}>age: <span style={{ color: '#86efac' }}>int</span></div>
                                    <div style={{ paddingLeft: '20px' }}>species: <span style={{ color: '#86efac' }}>str</span></div>
                                    <div style={{ marginTop: '6px' }}><span style={{ color: '#c084fc' }}>class </span><span style={{ color: '#67e8f9' }}>Dog</span>(<span style={{ color: '#86efac' }}>Animal</span>):</div>
                                    <div style={{ paddingLeft: '20px' }}>breed: <span style={{ color: '#86efac' }}>str</span></div>
                                    <div style={{ paddingLeft: '20px' }}>trained: <span style={{ color: '#86efac' }}>bool</span></div>
                                </div>
                            </div>
                            <button className="sk-new-cta-btn" onClick={() => navigate('/canvas')}
                                style={{ background: 'rgba(167,139,250,.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,.28)' }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(167,139,250,.2)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(167,139,250,.1)')}
                            ><FiCpu size={15} /> Try Code -&gt; Diagram <FiArrowRight size={13} /></button>
                        </div>

                        {/* Study Planner card */}
                        <div className="sk-new-card" style={{ boxShadow: '0 24px 60px rgba(103,232,249,.08)', borderColor: 'rgba(103,232,249,.18)' }}>
                            <div style={{ padding: '28px 28px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(103,232,249,.1)', color: '#67e8f9', border: '1px solid rgba(103,232,249,.3)', fontSize: '11px', fontWeight: 800, letterSpacing: '.06em', width: 'fit-content' }}>[NEW] FEATURE</span>
                                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(103,232,249,.1)', color: '#67e8f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiBookOpen size={26} /></div>
                                <h3 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#e2e8f0' }}>AI Study Planner</h3>
                                <p style={{ color: 'rgba(148,163,184,.85)', fontSize: '15px', lineHeight: 1.65, margin: 0 }}>Auto-generate a smart, personalized timetable. Weak-subject adaptive, spaced repetition built-in, progress dashboard and streak tracker -- works 100% offline.</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                                    {['Spaced Repetition', 'Weak Subject Mode', 'Daily Streak', 'Dashboard', '100% Offline'].map(p => (
                                        <span key={p} className="sk-pill" style={{ background: 'rgba(103,232,249,.08)', color: '#67e8f9', borderColor: 'rgba(103,232,249,.22)' }}>{p}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="sk-mockup">
                                <div className="sk-mockup-bar">
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        {['rgba(103,232,249,.5)', 'rgba(103,232,249,.3)', 'rgba(103,232,249,.15)'].map((c, i) => <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />)}
                                    </div>
                                    <span style={{ fontSize: '12px', color: 'rgba(148,163,184,.4)', fontWeight: 600 }}>[Date] Mon, 3 Mar</span>
                                </div>
                                <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {[
                                        { l: 'Data Structures - Arrays', t: '2h', type: 'Study', tc: '#a78bfa', tb: 'rgba(167,139,250,.1)', done: true },
                                        { l: 'DBMS - Normalization', t: '1.5h', type: 'Study', tc: '#a78bfa', tb: 'rgba(167,139,250,.1)', done: false },
                                        { l: 'All Subjects Revision', t: '1h', type: 'Revision', tc: '#67e8f9', tb: 'rgba(103,232,249,.1)', done: false },
                                    ].map((r, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '9px', background: r.done ? 'rgba(255,255,255,.02)' : r.tb, opacity: r.done ? .5 : 1 }}>
                                            <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: `2px solid ${r.done ? '#86efac' : r.tc}`, background: r.done ? 'rgba(134,239,172,.2)' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {r.done && <FiCheck size={10} color="#86efac" />}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '13px', fontWeight: 600, textDecoration: r.done ? 'line-through' : 'none' }}>{r.l}</div>
                                                <div style={{ fontSize: '11px', opacity: .55 }}>{r.t}</div>
                                            </div>
                                            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px', background: r.tb, color: r.tc, border: `1px solid ${r.tc}40` }}>{r.type}</span>
                                        </div>
                                    ))}
                                    <div style={{ marginTop: '4px', padding: '10px', borderRadius: '9px', background: 'rgba(255,255,255,.03)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(148,163,184,.55)', marginBottom: '6px' }}>
                                            <span>[Streak] 3-day streak</span><span style={{ color: '#67e8f9' }}>33% complete</span>
                                        </div>
                                        <div style={{ height: '6px', background: 'rgba(255,255,255,.05)', borderRadius: '999px' }}>
                                            <div style={{ width: '33%', height: '100%', background: 'linear-gradient(90deg,#67e8f9,#a78bfa)', borderRadius: '999px' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button className="sk-new-cta-btn" onClick={() => navigate('/study-planner')}
                                style={{ background: 'rgba(103,232,249,.08)', color: '#67e8f9', border: '1px solid rgba(103,232,249,.25)' }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(103,232,249,.18)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(103,232,249,.08)')}
                            ><FiBookOpen size={15} /> Open Study Planner <FiArrowRight size={13} /></button>
                        </div>

                        {/* AI Flashcards card */}
                        <div className="sk-new-card" style={{ boxShadow: '0 24px 60px rgba(251,191,36,.08)', borderColor: 'rgba(251,191,36,.2)' }}>
                            <div style={{ padding: '28px 28px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(251,191,36,.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,.3)', fontSize: '11px', fontWeight: 800, letterSpacing: '.06em', width: 'fit-content' }}>[NEW] FEATURE</span>
                                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(251,191,36,.1)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiZap size={26} /></div>
                                <h3 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#e2e8f0' }}>AI Flashcards</h3>
                                <p style={{ color: 'rgba(148,163,184,.85)', fontSize: '15px', lineHeight: 1.65, margin: 0 }}>Paste your notes and AI instantly creates study flashcards. Flip cards, Study Mode quiz, and export as PDF or CSV -- all in one place.</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                                    {['Groq AI', 'Flip Cards', 'Study Mode', 'Export PDF', 'Export CSV'].map(p => (
                                        <span key={p} className="sk-pill" style={{ background: 'rgba(251,191,36,.08)', color: '#fbbf24', borderColor: 'rgba(251,191,36,.25)' }}>{p}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="sk-mockup">
                                <div className="sk-mockup-bar">
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        {['rgba(251,191,36,.5)', 'rgba(251,191,36,.3)', 'rgba(251,191,36,.15)'].map((c, i) => <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />)}
                                    </div>
                                    <span style={{ fontSize: '12px', color: 'rgba(148,163,184,.4)', fontWeight: 600 }}>Biology Chapter 5</span>
                                </div>
                                <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {[
                                        { q: 'What is photosynthesis?', a: 'Plants convert sunlight into energy', flipped: false },
                                        { q: 'What is mitosis?', a: 'Cell division producing 2 identical cells', flipped: true },
                                    ].map((card, i) => (
                                        <div key={i} style={{ padding: '10px 12px', borderRadius: '10px', background: card.flipped ? 'rgba(251,191,36,.08)' : 'rgba(255,255,255,.03)', border: `1px solid ${card.flipped ? 'rgba(251,191,36,.3)' : 'rgba(255,255,255,.07)'}` }}>
                                            <div style={{ fontSize: '10px', fontWeight: 700, color: '#fbbf24', opacity: .7, marginBottom: '3px' }}>{card.flipped ? 'ANSWER' : 'QUESTION'}</div>
                                            <div style={{ fontSize: '12px', color: '#e2e8f0' }}>{card.flipped ? card.a : card.q}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button className="sk-new-cta-btn" onClick={() => navigate('/flashcards')}
                                style={{ background: 'rgba(251,191,36,.08)', color: '#fbbf24', border: '1px solid rgba(251,191,36,.25)' }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(251,191,36,.18)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(251,191,36,.08)')}
                            ><FiZap size={15} /> Try AI Flashcards <FiArrowRight size={13} /></button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ALL FEATURES */}
            <section id="all" style={{ padding: '0 24px 80px' }}>
                <div ref={allRef} className="reveal" style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px', borderRadius: '999px', border: '1px solid rgba(167,139,250,.3)', background: 'rgba(167,139,250,.08)', color: '#a78bfa', fontSize: '12px', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '18px' }}>
                        <FiGrid size={12} /> All Features
                    </div>
                    <h2 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, margin: '0 0 12px' }}>Everything You Need. Nothing You Don't.</h2>
                    <p style={{ color: 'rgba(148,163,184,.85)', fontSize: '16px', maxWidth: '500px', lineHeight: 1.6, margin: '0 0 36px' }}>Built for students, loved by developers. Every feature ships free, forever.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }}>
                        {ALL_FEATURES.map(f => (
                            <div key={f.title} className="sk-feat-card">
                                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${f.color}15`, color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>{f.icon}</div>
                                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 7px', color: '#e2e8f0' }}>{f.title}</h3>
                                <p style={{ fontSize: '13px', color: 'rgba(148,163,184,.8)', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>



            {/* FINAL CTA */}
            <div style={{ padding: '0 24px 80px', maxWidth: '1100px', margin: '0 auto' }}>
                <div ref={ctaRef} className="reveal" style={{ borderRadius: '24px', padding: '64px 48px', background: 'linear-gradient(135deg,#16103a 0%,#0f1729 100%)', border: '1px solid rgba(167,139,250,.18)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%,rgba(124,58,237,.2) 0%,transparent 60%)', pointerEvents: 'none' }} />
                    <h2 style={{ fontSize: 'clamp(26px,4vw,42px)', fontWeight: 900, margin: '0 0 14px', position: 'relative' }}>Your Complete Visual Study Ecosystem.</h2>
                    <p style={{ fontSize: '16px', color: 'rgba(148,163,184,.85)', margin: '0 auto 32px', maxWidth: '520px', position: 'relative' }}>Whiteboard · Code Diagrams · Study Planner · AI Flashcards — all in one place, all free.</p>
                    <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
                        <button className="sk-btn-primary" onClick={() => navigate('/canvas')}>Open Whiteboard →</button>
                        <button className="sk-btn-ghost" onClick={() => navigate('/study-planner')}>
                            <FiBookOpen size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />Study Planner
                        </button>
                        <button className="sk-btn-ghost" onClick={() => navigate('/code-to-diagram')} style={{ color: '#a78bfa', borderColor: 'rgba(167,139,250,.35)' }}>
                            <FiCpu size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />Code → Diagram
                        </button>
                        <button className="sk-btn-ghost" onClick={() => navigate('/flashcards')} style={{ color: '#fbbf24', borderColor: 'rgba(251,191,36,.35)' }}>
                            <FiZap size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />AI Flashcards ✨
                        </button>
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <footer style={{ textAlign: 'center', padding: '36px 24px', borderTop: '1px solid rgba(255,255,255,.06)', color: 'rgba(148,163,184,.5)', fontSize: '13px' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
                    * <span style={{ background: 'linear-gradient(135deg,#a78bfa,#67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sketchbyte</span>
                </div>
                <p style={{ margin: '0 0 4px' }}>Built with love for students and coders - Free forever</p>
                <p style={{ margin: 0 }}>Founded by <strong style={{ color: 'rgba(167,139,250,.8)' }}>Dhruva M</strong> - Think Without Limits.</p>
            </footer>
        </div>
    );
};

export default Landing;
