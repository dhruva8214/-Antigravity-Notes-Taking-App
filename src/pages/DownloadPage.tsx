import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

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

const platforms = [
    {
        id: 'android',
        name: 'Android APK',
        emoji: '[Android]',
        color: '#86efac',
        gradFrom: 'rgba(134,239,172,.15)',
        gradTo: 'rgba(134,239,172,.03)',
        border: 'rgba(134,239,172,.25)',
        badge: 'Direct Download',
        badgeBg: 'rgba(134,239,172,.12)',
        badgeColor: '#86efac',
        badgeBorder: 'rgba(134,239,172,.3)',
        subtitle: 'Download the Sketchbyte APK from GitHub Releases.',
        steps: [
            { icon: '1', title: 'Go to GitHub', desc: 'Click the download button to visit our official GitHub Releases page.' },
            { icon: '2', title: 'Download APK', desc: 'Look for the latest release and click on the .apk file to download it.' },
            { icon: '3', title: 'Install App', desc: 'Open the file on your Android device and allow installation from unknown sources.' },
            { icon: '4', title: 'Launch', desc: 'Open Sketchbyte and start using the app!' },
        ],
        githubLink: true,
    },
    {
        id: 'web',
        name: 'Web & Desktop (PWA)',
        emoji: '[Web/PC]',
        color: '#67e8f9',
        gradFrom: 'rgba(103,232,249,.15)',
        gradTo: 'rgba(103,232,249,.03)',
        border: 'rgba(103,232,249,.25)',
        badge: 'Browser App',
        badgeBg: 'rgba(103,232,249,.1)',
        badgeColor: '#67e8f9',
        badgeBorder: 'rgba(103,232,249,.28)',
        subtitle: 'Install via your browser on iOS, Windows, and Mac',
        steps: [
            { icon: '1', title: 'Open Site', desc: 'Visit sketchbyte.online in Chrome, Safari, or Edge.' },
            { icon: '2', title: 'Find Install Option', desc: 'On iOS: Tap Share -> Add to Home Screen. On PC: Click the Install icon in the address bar.' },
            { icon: '3', title: 'Confirm Install', desc: 'Confirm the prompt. The app will be added to your home screen or desktop.' },
            { icon: '4', title: 'Launch', desc: 'Open Sketchbyte like a native app. It runs in fullscreen!' },
        ],
        githubLink: false,
    }
];

const DownloadPage: React.FC = () => {
    const navigate = useNavigate();
    const [activePlatform, setActivePlatform] = useState<string | null>('android');
    const heroRef = useReveal();
    const platformsRef = useReveal();

    const selectedPlatform = platforms.find(p => p.id === activePlatform) ?? platforms[0];

    return (
        <div style={{ minHeight: '100vh', background: '#0f0e17', color: '#e2e8f0', fontFamily: 'Inter,system-ui,sans-serif', overflowX: 'hidden' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                *{box-sizing:border-box;}
                @keyframes orbPulse{0%,100%{opacity:.45;transform:scale(1)}50%{opacity:.65;transform:scale(1.08)}}
                @keyframes gradText{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
                @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
                @keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
                .reveal{opacity:0;transform:translateY(36px);transition:opacity .65s ease,transform .65s ease;}
                .dl-nav{position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 32px;height:62px;background:rgba(15,14,23,.92);backdrop-filter:blur(16px);border-bottom:1px solid rgba(255,255,255,.06);}
                .dl-nav-link{padding:6px 14px;border-radius:8px;border:none;background:transparent;color:rgba(148,163,184,.9);cursor:pointer;font-size:14px;font-weight:500;text-decoration:none;font-family:inherit;transition:all .15s;}
                .dl-nav-link:hover{color:#e2e8f0;background:rgba(255,255,255,.06);}
                .dl-btn-primary{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:12px;border:none;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:white;cursor:pointer;font-size:15px;font-weight:800;font-family:inherit;box-shadow:0 8px 28px rgba(124,58,237,.45);transition:all .2s;text-decoration:none;}
                .dl-btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 36px rgba(124,58,237,.6);}
                .dl-btn-ghost{display:inline-flex;align-items:center;gap:8px;padding:13px 24px;border-radius:12px;border:2px solid rgba(167,139,250,.3);background:transparent;color:#a78bfa;cursor:pointer;font-size:14px;font-weight:700;font-family:inherit;transition:all .2s;text-decoration:none;}
                .dl-btn-ghost:hover{background:rgba(167,139,250,.1);border-color:rgba(167,139,250,.6);}
                .platform-tab{padding:10px 20px;border-radius:12px;border:2px solid transparent;background:rgba(255,255,255,.03);cursor:pointer;font-size:14px;font-weight:700;font-family:inherit;transition:all .2s;display:flex;align-items:center;gap:8px;}
                .step-card{display:flex;align-items:flex-start;gap:16px;padding:16px;border-radius:14px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);transition:all .2s;}
                .step-card:hover{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.1);}
            `}</style>

            {/* NAV */}
            <nav className="dl-nav">
                <div
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800, fontSize: '18px', cursor: 'pointer' }}
                    onClick={() => navigate('/')}
                >
                    <span style={{ background: 'linear-gradient(135deg,#a78bfa,#67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '22px' }}>*</span>
                    Sketchbyte
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button onClick={() => navigate('/')} className="dl-nav-link">Home</button>
                    <button onClick={() => navigate('/canvas')} className="dl-nav-link">Whiteboard</button>
                    <button onClick={() => navigate('/study-planner')} className="dl-nav-link">Study Planner</button>
                    <button onClick={() => navigate('/canvas')} className="dl-btn-primary" style={{ padding: '8px 18px', fontSize: '14px' }}>
                        Launch Web App -&gt;
                    </button>
                </div>
            </nav>

            {/* HERO */}
            <section style={{ position: 'relative', textAlign: 'center', padding: '90px 24px 70px', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', width: 520, height: 520, top: '-10%', left: '-5%', borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,.18) 0%,transparent 70%)', filter: 'blur(72px)', animation: 'orbPulse 6s ease-in-out infinite', pointerEvents: 'none' }} />

                <div ref={heroRef} className="reveal">
                    {/* App Icon */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
                        <div style={{ width: '100px', height: '100px', borderRadius: '26px', background: 'linear-gradient(135deg,#a78bfa20,#67e8f920)', border: '2px solid rgba(167,139,250,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '52px', animation: 'float 4s ease-in-out infinite', boxShadow: '0 20px 60px rgba(124,58,237,.3)' }}>
                            S
                        </div>
                    </div>

                    <h1 style={{ fontSize: 'clamp(34px,6vw,66px)', fontWeight: 900, lineHeight: 1.08, margin: '0 auto 18px', maxWidth: '750px' }}>
                        Get Sketchbyte on
                        <br />
                        <span style={{ background: 'linear-gradient(135deg,#a78bfa 0%,#67e8f9 45%,#86efac 100%)', backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'gradText 4s ease infinite' }}>
                            Your Device.
                        </span>
                    </h1>
                    <p style={{ fontSize: '17px', color: 'rgba(148,163,184,.88)', maxWidth: '520px', margin: '0 auto 36px', lineHeight: 1.7 }}>
                        Download the official Android APK directly from GitHub, or install it as an app through your browser.
                    </p>
                </div>
            </section>

            {/* PLATFORM TABS */}
            <section id="platforms" style={{ padding: '40px 24px 80px', maxWidth: '1100px', margin: '0 auto' }}>
                <div ref={platformsRef} className="reveal">
                    {/* Tab selectors */}
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
                        {platforms.map(p => (
                            <button
                                key={p.id}
                                className="platform-tab"
                                onClick={() => setActivePlatform(p.id)}
                                style={{
                                    borderColor: activePlatform === p.id ? p.color : 'transparent',
                                    background: activePlatform === p.id ? p.gradFrom : 'rgba(255,255,255,.03)',
                                    color: activePlatform === p.id ? p.color : 'rgba(148,163,184,.8)',
                                }}
                            >
                                <span style={{ fontSize: '16px' }}>{p.emoji}</span>
                                {p.name}
                            </button>
                        ))}
                    </div>

                    {/* Platform content */}
                    <div style={{ borderRadius: '24px', border: `1px solid ${selectedPlatform.border}`, background: `linear-gradient(145deg,${selectedPlatform.gradFrom},${selectedPlatform.gradTo})`, padding: '36px', animation: 'fadeIn .35s ease' }} key={selectedPlatform.id}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: selectedPlatform.gradFrom, border: `1px solid ${selectedPlatform.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' }}>
                                {selectedPlatform.emoji}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', color: '#e2e8f0' }}>{selectedPlatform.name}</h3>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '999px', background: selectedPlatform.badgeBg, color: selectedPlatform.badgeColor, border: `1px solid ${selectedPlatform.badgeBorder}`, fontSize: '11px', fontWeight: 700 }}>
                                    ✓ {selectedPlatform.badge}
                                </span>
                            </div>
                        </div>

                        <p style={{ color: 'rgba(148,163,184,.85)', fontSize: '15px', marginBottom: '24px', lineHeight: 1.6 }}>
                            {selectedPlatform.subtitle}
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
                            {selectedPlatform.steps.map((step, i) => (
                                <div key={i} className="step-card">
                                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: selectedPlatform.gradFrom, border: `1px solid ${selectedPlatform.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800, color: selectedPlatform.color, flexShrink: 0 }}>
                                        {step.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px', color: '#e2e8f0' }}>{step.title}</div>
                                        <div style={{ fontSize: '13px', color: 'rgba(148,163,184,.75)', lineHeight: 1.55 }}>{step.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {selectedPlatform.githubLink && (
                                <a
                                    href="https://github.com/dhruva8214/Sketchbyte-Notes-Taking-App/releases"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="dl-btn-primary"
                                    style={{ textDecoration: 'none', background: 'linear-gradient(135deg,#16a34a,#15803d)' }}
                                >
                                    Download APK from GitHub -&gt;
                                </a>
                            )}
                            <button className="dl-btn-ghost" onClick={() => navigate('/canvas')}>
                                Open Web App
                            </button>
                        </div>
                    </div>
                </div>
            </section>

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

export default DownloadPage;
