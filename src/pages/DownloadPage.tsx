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
        name: 'Android',
        emoji: '[Android]',
        color: '#86efac',
        gradFrom: 'rgba(134,239,172,.15)',
        gradTo: 'rgba(134,239,172,.03)',
        border: 'rgba(134,239,172,.25)',
        badge: 'APK Available',
        badgeBg: 'rgba(134,239,172,.12)',
        badgeColor: '#86efac',
        badgeBorder: 'rgba(134,239,172,.3)',
        subtitle: 'Install via Chrome or download APK',
        steps: [
            { icon: '1', title: 'Open in Chrome', desc: 'Visit sketchbyte.vercel.app in Google Chrome on your Android device.' },
            { icon: '2', title: 'Tap Menu', desc: 'Tap the three-dot menu in the top-right corner of Chrome.' },
            { icon: '3', title: 'Add to Home Screen', desc: 'Tap "Add to Home screen" and confirm. Sketchbyte will appear as a real app icon.' },
            { icon: '4', title: 'Launch', desc: 'Open the app from your home screen -- it runs in fullscreen with no browser UI.' },
        ],
        apk: true,
    },
    {
        id: 'ios',
        name: 'iPhone / iPad',
        emoji: '[Apple]',
        color: '#67e8f9',
        gradFrom: 'rgba(103,232,249,.15)',
        gradTo: 'rgba(103,232,249,.03)',
        border: 'rgba(103,232,249,.25)',
        badge: 'Safari PWA',
        badgeBg: 'rgba(103,232,249,.1)',
        badgeColor: '#67e8f9',
        badgeBorder: 'rgba(103,232,249,.28)',
        subtitle: 'Install via Safari in seconds',
        steps: [
            { icon: '1', title: 'Open in Safari', desc: 'Visit sketchbyte.vercel.app using Safari (not Chrome) on your iPhone or iPad.' },
            { icon: '2', title: 'Tap Share', desc: 'Tap the Share icon at the bottom of Safari. It looks like a box with an arrow.' },
            { icon: '3', title: 'Add to Home Screen', desc: 'Scroll down and tap "Add to Home Screen". Name it "Sketchbyte" and tap Add.' },
            { icon: '4', title: 'Launch', desc: 'The app appears on your home screen and opens in fullscreen -- just like a real app!' },
        ],
        apk: false,
    },
    {
        id: 'windows',
        name: 'Windows',
        emoji: '[PC]',
        color: '#a78bfa',
        gradFrom: 'rgba(167,139,250,.15)',
        gradTo: 'rgba(167,139,250,.03)',
        border: 'rgba(167,139,250,.25)',
        badge: 'Desktop App',
        badgeBg: 'rgba(167,139,250,.1)',
        badgeColor: '#a78bfa',
        badgeBorder: 'rgba(167,139,250,.28)',
        subtitle: 'Install via Chrome or Edge',
        steps: [
            { icon: '1', title: 'Open in Chrome / Edge', desc: 'Visit sketchbyte.vercel.app in Google Chrome or Microsoft Edge on Windows.' },
            { icon: '2', title: 'Click Install Icon', desc: 'Look for a plus or computer icon in the address bar on the right side. Click it.' },
            { icon: '3', title: 'Click Install', desc: 'A prompt will appear. Click "Install" to add Sketchbyte to your desktop and Start Menu.' },
            { icon: '4', title: 'Launch', desc: 'Sketchbyte opens in its own window -- no browser, no tabs. Just the app.' },
        ],
        apk: false,
    },
    {
        id: 'mac',
        name: 'macOS',
        emoji: '[Mac]',
        color: '#fbbf24',
        gradFrom: 'rgba(251,191,36,.15)',
        gradTo: 'rgba(251,191,36,.03)',
        border: 'rgba(251,191,36,.25)',
        badge: 'Desktop App',
        badgeBg: 'rgba(251,191,36,.1)',
        badgeColor: '#fbbf24',
        badgeBorder: 'rgba(251,191,36,.28)',
        subtitle: 'Install via Chrome or Safari',
        steps: [
            { icon: '1', title: 'Open in Chrome', desc: 'Visit sketchbyte.vercel.app in Google Chrome on your Mac.' },
            { icon: '2', title: 'Click Install Icon', desc: 'Click the plus icon in the right side of the address bar (or go to menu > Install Sketchbyte).' },
            { icon: '3', title: 'Click Install', desc: 'Confirm the install. The app will be added to your Applications folder and Dock.' },
            { icon: '4', title: 'Launch', desc: 'Open Sketchbyte from your Dock or Applications. Runs like a native Mac app.' },
        ],
        apk: false,
    },
];

const faqs = [
    { q: 'Is Sketchbyte completely free?', a: 'Yes! 100% free forever. No subscriptions, no sign-up required for the whiteboard. Just open and start drawing.' },
    { q: 'Does it work offline after installing?', a: 'Yes. After installing as a PWA, core features like the whiteboard and study planner work offline. Your data is saved locally in the browser.' },
    { q: 'What is a PWA?', a: 'A Progressive Web App is a website that can be installed like a native app on any device. It runs in its own window, works offline, and feels exactly like a real app -- but requires no App Store.' },
    { q: 'Can I get a real APK for Android?', a: 'Yes! The APK is built automatically and available on GitHub Releases and alternative stores like Aptoide.' },
    { q: 'Does it sync across devices?', a: 'Your account (Firebase login) syncs access. Canvas data is stored locally per device right now. Cloud sync is on our roadmap!' },
];

const DownloadPage: React.FC = () => {
    const navigate = useNavigate();
    const [activePlatform, setActivePlatform] = useState<string | null>(null);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const heroRef = useReveal();
    const platformsRef = useReveal();
    const apkRef = useReveal();
    const storesRef = useReveal();
    const faqRef = useReveal();

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
                .faq-item{border-radius:14px;border:1px solid rgba(255,255,255,.07);overflow:hidden;margin-bottom:10px;transition:border-color .2s;}
                .faq-item:hover{border-color:rgba(255,255,255,.14);}
                .faq-q{padding:20px 24px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-weight:600;font-size:15px;background:rgba(255,255,255,.025);}
                .faq-a{padding:0 24px 18px;color:rgba(148,163,184,.85);font-size:14px;line-height:1.7;}
                .apk-step{display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:12px;border:1px solid rgba(134,239,172,.12);background:rgba(134,239,172,.04);}
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
                <div style={{ position: 'absolute', width: 380, height: 380, top: '5%', right: '-5%', borderRadius: '50%', background: 'radial-gradient(circle,rgba(103,232,249,.12) 0%,transparent 70%)', filter: 'blur(72px)', animation: 'orbPulse 8s ease-in-out infinite 2s', pointerEvents: 'none' }} />

                <div ref={heroRef} className="reveal">
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '999px', border: '1px solid rgba(134,239,172,.3)', background: 'rgba(134,239,172,.08)', color: '#86efac', fontSize: '13px', fontWeight: 600, marginBottom: '24px' }}>
                        [Available on all your devices]
                    </div>

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
                            Every Device. For Free.
                        </span>
                    </h1>
                    <p style={{ fontSize: '17px', color: 'rgba(148,163,184,.88)', maxWidth: '520px', margin: '0 auto 36px', lineHeight: 1.7 }}>
                        Install Sketchbyte on your phone, tablet or desktop in under 60 seconds.
                        No App Store. No sign-up. Works on Android, iPhone, Windows and Mac.
                    </p>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="dl-btn-primary" onClick={() => navigate('/canvas')}>
                            Open Web App
                        </button>
                        <button className="dl-btn-ghost" onClick={() => document.getElementById('platforms')?.scrollIntoView({ behavior: 'smooth' })}>
                            See Install Guide
                        </button>
                    </div>

                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', marginTop: '52px', flexWrap: 'wrap' }}>
                        {[
                            { n: '4', label: 'Platforms Supported' },
                            { n: '60s', label: 'Install Time' },
                            { n: '100%', label: 'Free Forever' },
                            { n: '0', label: 'App Store Required' },
                        ].map(s => (
                            <div key={s.n} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '30px', fontWeight: 900, background: 'linear-gradient(135deg,#a78bfa,#67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.n}</div>
                                <div style={{ fontSize: '12px', color: 'rgba(148,163,184,.6)', fontWeight: 500, marginTop: '2px' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PLATFORM TABS */}
            <section id="platforms" style={{ padding: '40px 24px 80px', maxWidth: '1100px', margin: '0 auto' }}>
                <div ref={platformsRef} className="reveal">
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px', borderRadius: '999px', border: '1px solid rgba(167,139,250,.3)', background: 'rgba(167,139,250,.08)', color: '#a78bfa', fontSize: '12px', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '16px' }}>
                            [Install Guide]
                        </div>
                        <h2 style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 900, margin: '0 0 12px' }}>Choose Your Platform</h2>
                        <p style={{ color: 'rgba(148,163,184,.8)', fontSize: '15px', maxWidth: '440px', margin: '0 auto' }}>Step-by-step install guide for every device.</p>
                    </div>

                    {/* Tab selectors */}
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
                        {platforms.map(p => (
                            <button
                                key={p.id}
                                className="platform-tab"
                                onClick={() => setActivePlatform(p.id)}
                                style={{
                                    borderColor: (activePlatform ?? 'android') === p.id ? p.color : 'transparent',
                                    background: (activePlatform ?? 'android') === p.id ? `${p.gradFrom}` : 'rgba(255,255,255,.03)',
                                    color: (activePlatform ?? 'android') === p.id ? p.color : 'rgba(148,163,184,.8)',
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
                            <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: `${selectedPlatform.gradFrom}`, border: `1px solid ${selectedPlatform.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' }}>
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
                            {selectedPlatform.subtitle} -- takes less than 60 seconds, no App Store required.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
                            {selectedPlatform.steps.map((step, i) => (
                                <div key={i} className="step-card">
                                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: `${selectedPlatform.gradFrom}`, border: `1px solid ${selectedPlatform.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800, color: selectedPlatform.color, flexShrink: 0 }}>
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
                            <button className="dl-btn-primary" onClick={() => navigate('/canvas')}>
                                Open Web App First
                            </button>
                            {selectedPlatform.id === 'android' && (
                                <a
                                    href="https://github.com/dhruva8214/Sketchbyte-Notes-Taking-App/releases"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="dl-btn-ghost"
                                    style={{ textDecoration: 'none', color: '#86efac', borderColor: 'rgba(134,239,172,.3)' }}
                                >
                                    Download APK from GitHub Releases
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ANDROID APK SECTION */}
            <section style={{ padding: '0 24px 80px', maxWidth: '1100px', margin: '0 auto' }}>
                <div ref={apkRef} className="reveal">
                    <div style={{ borderRadius: '24px', border: '1px solid rgba(134,239,172,.2)', background: 'linear-gradient(135deg,rgba(134,239,172,.06) 0%,rgba(134,239,172,.01) 100%)', padding: '48px 40px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', width: 300, height: 300, top: '-20%', right: '-5%', borderRadius: '50%', background: 'radial-gradient(circle,rgba(134,239,172,.1) 0%,transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#86efac' }}>[Android]</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(134,239,172,.12)', color: '#86efac', border: '1px solid rgba(134,239,172,.3)', fontSize: '12px', fontWeight: 800 }}>
                                ANDROID APK
                            </span>
                        </div>
                        <h2 style={{ fontSize: 'clamp(22px,3.5vw,34px)', fontWeight: 900, margin: '0 0 12px', position: 'relative' }}>
                            Download the Android APK
                        </h2>
                        <p style={{ color: 'rgba(148,163,184,.85)', fontSize: '15px', maxWidth: '560px', lineHeight: 1.7, marginBottom: '32px', position: 'relative' }}>
                            Get the latest signed APK directly from <strong style={{ color: '#86efac' }}>GitHub Releases</strong> -- built automatically by our CI pipeline, always the latest version. Install directly on any Android device without Google Play.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px', position: 'relative' }}>
                            {[
                                { n: '1', t: 'Go to GitHub Releases', d: 'Click the button below to open the GitHub Releases page.' },
                                { n: '2', t: 'Download the APK', d: 'Click the latest .apk file to download it to your Android device.' },
                                { n: '3', t: 'Allow Unknown Sources', d: 'On your Android phone go to Settings and enable Install unknown apps.' },
                                { n: '4', t: 'Tap to Install', d: 'Open the downloaded .apk file and tap Install to complete setup.' },
                                { n: '5', t: 'Launch and Enjoy!', d: 'Open Sketchbyte from your app drawer and start learning!' },
                            ].map(step => (
                                <div key={step.n} className="apk-step">
                                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(134,239,172,.15)', border: '1px solid rgba(134,239,172,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: '#86efac', flexShrink: 0 }}>
                                        {step.n}
                                    </div>
                                    <div>
                                        <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '14px', marginRight: '8px' }}>{step.t}</span>
                                        <span style={{ fontSize: '13px', color: 'rgba(148,163,184,.75)' }}>{step.d}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <a
                            href="https://github.com/dhruva8214/Sketchbyte-Notes-Taking-App/releases"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="dl-btn-primary"
                            style={{ textDecoration: 'none', background: 'linear-gradient(135deg,#16a34a,#15803d)' }}
                        >
                            Download APK from GitHub Releases -&gt;
                        </a>
                    </div>
                </div>
            </section>

            {/* WHAT IS PWA */}
            <section style={{ padding: '0 24px 80px', maxWidth: '1100px', margin: '0 auto' }}>
                <div style={{ borderRadius: '20px', border: '1px solid rgba(167,139,250,.15)', background: 'rgba(167,139,250,.04)', padding: '36px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '999px', border: '1px solid rgba(167,139,250,.3)', background: 'rgba(167,139,250,.08)', color: '#a78bfa', fontSize: '11px', fontWeight: 800, marginBottom: '14px' }}>
                            [INFO] WHY PWA?
                        </div>
                        <h3 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 14px', color: '#e2e8f0' }}>Why not App Store?</h3>
                        <p style={{ color: 'rgba(148,163,184,.85)', fontSize: '15px', lineHeight: 1.7, margin: '0 0 20px' }}>
                            PWA (Progressive Web App) lets you install Sketchbyte directly from your browser -- no App Store fees, no waiting, no large downloads. You get the <strong style={{ color: '#a78bfa' }}>exact same features</strong> as a native app.
                        </p>
                        <button className="dl-btn-ghost" onClick={() => navigate('/canvas')}>
                            Try it in Browser First -&gt;
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { icon: '[Fast]', title: 'Instant Install', desc: '60 seconds. No waiting for app store approval.' },
                            { icon: '[Offline]', title: 'Works Offline', desc: 'After first load, the app works without internet.' },
                            { icon: '[Sync]', title: 'Always Up-to-Date', desc: 'Updates automatically -- no manual app updates.' },
                            { icon: '[Save]', title: 'No Storage Bloat', desc: 'Tiny footprint compared to native apps.' },
                        ].map(item => (
                            <div key={item.title} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.02)' }}>
                                <span style={{ fontSize: '14px', flexShrink: 0, fontWeight: 'bold' }}>{item.icon}</span>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0', marginBottom: '2px' }}>{item.title}</div>
                                    <div style={{ fontSize: '13px', color: 'rgba(148,163,184,.7)' }}>{item.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* STORE PUBLISHING SECTION */}
            <section id="stores" style={{ padding: '0 24px 80px', maxWidth: '1100px', margin: '0 auto' }}>
                <div ref={storesRef} className="reveal" style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px', borderRadius: '999px', border: '1px solid rgba(251,191,36,.3)', background: 'rgba(251,191,36,.08)', color: '#fbbf24', fontSize: '12px', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '16px' }}>
                        [App Stores]
                    </div>
                    <h2 style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 900, margin: '0 0 12px' }}>Available on These Stores</h2>
                    <p style={{ color: 'rgba(148,163,184,.8)', fontSize: '15px', maxWidth: '480px', margin: '0 auto', lineHeight: 1.65 }}>
                        Download the APK directly or find Sketchbyte on popular Android app stores.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>

                    {/* GitHub Releases */}
                    <div style={{ borderRadius: '20px', border: '1px solid rgba(226,232,240,.12)', background: 'linear-gradient(145deg,rgba(255,255,255,.04),rgba(255,255,255,.01))', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(226,232,240,.08)', border: '1px solid rgba(226,232,240,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold' }}>[GH]</div>
                            <div>
                                <div style={{ fontSize: '18px', fontWeight: 800, color: '#e2e8f0' }}>GitHub Releases</div>
                                <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: '999px', background: 'rgba(226,232,240,.08)', color: 'rgba(226,232,240,.6)', border: '1px solid rgba(226,232,240,.12)', fontSize: '11px', fontWeight: 700 }}>AUTO-BUILT</span>
                            </div>
                        </div>
                        <p style={{ fontSize: '13px', color: 'rgba(148,163,184,.8)', lineHeight: 1.65, margin: 0 }}>
                            Every release tag (e.g. <code style={{ background: 'rgba(255,255,255,.07)', padding: '1px 6px', borderRadius: '4px', fontSize: '12px' }}>v1.0.0</code>) automatically builds a signed APK and publishes it as a GitHub Release using our CI workflow.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {['Push a git tag: git tag v1.0.0', 'GitHub Actions builds the APK', 'Download .apk from Releases tab'].map((s, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'rgba(148,163,184,.8)' }}>
                                    <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(226,232,240,.08)', border: '1px solid rgba(226,232,240,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, flexShrink: 0, color: '#e2e8f0' }}>{i + 1}</span>
                                    {s}
                                </div>
                            ))}
                        </div>
                        <a href="https://github.com/dhruva8214/Sketchbyte-Notes-Taking-App/releases" target="_blank" rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 18px', borderRadius: '10px', border: '1px solid rgba(226,232,240,.18)', background: 'rgba(226,232,240,.05)', color: '#e2e8f0', textDecoration: 'none', fontSize: '13px', fontWeight: 700, transition: 'all .2s', marginTop: 'auto' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(226,232,240,.1)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(226,232,240,.05)'}
                        >
                            View GitHub Releases -&gt;
                        </a>
                    </div>

                    {/* Aptoide */}
                    <div style={{ borderRadius: '20px', border: '1px solid rgba(251,146,60,.18)', background: 'linear-gradient(145deg,rgba(251,146,60,.07),rgba(251,146,60,.01))', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(251,146,60,.1)', border: '1px solid rgba(251,146,60,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold' }}>[AP]</div>
                            <div>
                                <div style={{ fontSize: '18px', fontWeight: 800, color: '#e2e8f0' }}>Aptoide</div>
                                <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: '999px', background: 'rgba(251,146,60,.1)', color: '#fb923c', border: '1px solid rgba(251,146,60,.25)', fontSize: '11px', fontWeight: 700 }}>FREE TO PUBLISH</span>
                            </div>
                        </div>
                        <p style={{ fontSize: '13px', color: 'rgba(148,163,184,.8)', lineHeight: 1.65, margin: 0 }}>
                            Aptoide is the largest alternative Android app store with 300M+ users. Submit your APK through their developer portal -- no fees, no approval delay.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {['Create account at aptoide.com/dev', 'Upload your signed .apk file', 'Fill in app name, description, icon', 'Publish -- live within minutes'].map((s, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'rgba(148,163,184,.8)' }}>
                                    <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(251,146,60,.1)', border: '1px solid rgba(251,146,60,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, flexShrink: 0, color: '#fb923c' }}>{i + 1}</span>
                                    {s}
                                </div>
                            ))}
                        </div>
                        <a href="https://www.aptoide.com/developer" target="_blank" rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 18px', borderRadius: '10px', border: '1px solid rgba(251,146,60,.22)', background: 'rgba(251,146,60,.06)', color: '#fb923c', textDecoration: 'none', fontSize: '13px', fontWeight: 700, transition: 'all .2s', marginTop: 'auto' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(251,146,60,.14)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(251,146,60,.06)'}
                        >
                            Go to Aptoide Developer Portal -&gt;
                        </a>
                    </div>

                    {/* APKPure */}
                    <div style={{ borderRadius: '20px', border: '1px solid rgba(103,232,249,.18)', background: 'linear-gradient(145deg,rgba(103,232,249,.07),rgba(103,232,249,.01))', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(103,232,249,.1)', border: '1px solid rgba(103,232,249,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold' }}>[AP]</div>
                            <div>
                                <div style={{ fontSize: '18px', fontWeight: 800, color: '#e2e8f0' }}>APKPure</div>
                                <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: '999px', background: 'rgba(103,232,249,.1)', color: '#67e8f9', border: '1px solid rgba(103,232,249,.25)', fontSize: '11px', fontWeight: 700 }}>500M+ USERS</span>
                            </div>
                        </div>
                        <p style={{ fontSize: '13px', color: 'rgba(148,163,184,.8)', lineHeight: 1.65, margin: 0 }}>
                            APKPure is one of the most visited Android app sites worldwide. Upload your APK through their developer program to reach millions of Android users.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {['Register at developer.apkpure.com', 'Submit your signed .apk file', 'Add screenshots and description', 'Review takes 1-3 business days'].map((s, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'rgba(148,163,184,.8)' }}>
                                    <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(103,232,249,.1)', border: '1px solid rgba(103,232,249,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, flexShrink: 0, color: '#67e8f9' }}>{i + 1}</span>
                                    {s}
                                </div>
                            ))}
                        </div>
                        <a href="https://developer.apkpure.com" target="_blank" rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 18px', borderRadius: '10px', border: '1px solid rgba(103,232,249,.22)', background: 'rgba(103,232,249,.06)', color: '#67e8f9', textDecoration: 'none', fontSize: '13px', fontWeight: 700, transition: 'all .2s', marginTop: 'auto' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(103,232,249,.14)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(103,232,249,.06)'}
                        >
                            Go to APKPure Developer Portal -&gt;
                        </a>
                    </div>
                </div>

                {/* Instructions banner */}
                <div style={{ marginTop: '24px', padding: '20px 24px', borderRadius: '14px', border: '1px solid rgba(251,191,36,.18)', background: 'rgba(251,191,36,.05)', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <span style={{ fontSize: '18px', flexShrink: 0, fontWeight: 'bold', color: '#fbbf24' }}>[TIP]</span>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#fbbf24', marginBottom: '4px' }}>How to get your APK</div>
                        <div style={{ fontSize: '13px', color: 'rgba(148,163,184,.8)', lineHeight: 1.65 }}>
                            Run <code style={{ background: 'rgba(255,255,255,.06)', padding: '1px 6px', borderRadius: '4px' }}>scripts/generate-keystore.ps1</code> to create your signing key,
                            add the 4 GitHub Secrets it generates, then push a version tag: <code style={{ background: 'rgba(255,255,255,.06)', padding: '1px 6px', borderRadius: '4px' }}>git tag v1.0.0 &amp;&amp; git push origin v1.0.0</code>.
                            Your signed APK will appear in <strong style={{ color: '#e2e8f0' }}>GitHub Releases</strong> within ~5 minutes.
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section style={{ padding: '0 24px 80px', maxWidth: '760px', margin: '0 auto' }}>
                <div ref={faqRef} className="reveal">
                    <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                        <h2 style={{ fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 900, margin: '0 0 10px' }}>Frequently Asked Questions</h2>
                        <p style={{ color: 'rgba(148,163,184,.75)', fontSize: '15px' }}>Everything you need to know about installing Sketchbyte.</p>
                    </div>
                    <div>
                        {faqs.map((faq, i) => (
                            <div key={i} className="faq-item">
                                <div
                                    className="faq-q"
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                >
                                    <span>{faq.q}</span>
                                    <span style={{ color: '#a78bfa', fontWeight: 800, fontSize: '18px', transition: 'transform .2s', transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
                                </div>
                                {openFaq === i && (
                                    <div className="faq-a" style={{ animation: 'fadeIn .25s ease' }}>{faq.a}</div>
                                }}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: '0 24px 80px', maxWidth: '1100px', margin: '0 auto' }}>
                <div style={{ borderRadius: '24px', padding: '64px 48px', background: 'linear-gradient(135deg,#16103a 0%,#0f1729 100%)', border: '1px solid rgba(167,139,250,.18)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%,rgba(124,58,237,.2) 0%,transparent 60%)', pointerEvents: 'none' }} />
                    <h2 style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 900, margin: '0 0 14px', position: 'relative' }}>
                        Ready to Start Learning?
                    </h2>
                    <p style={{ fontSize: '16px', color: 'rgba(148,163,184,.85)', margin: '0 auto 32px', maxWidth: '440px', position: 'relative' }}>
                        Install takes 60 seconds. Or just use it in your browser right now -- no install needed.
                    </p>
                    <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
                        <button className="dl-btn-primary" onClick={() => navigate('/canvas')}>
                            Open Whiteboard -&gt;
                        </button>
                        <button className="dl-btn-ghost" onClick={() => navigate('/study-planner')}>
                            Study Planner
                        </button>
                        <button className="dl-btn-ghost" onClick={() => navigate('/')} style={{ color: '#67e8f9', borderColor: 'rgba(103,232,249,.3)' }}>
                            &lt;- Back to Home
                        </button>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{ textAlign: 'center', padding: '36px 24px', borderTop: '1px solid rgba(255,255,255,.06)', color: 'rgba(148,163,184,.5)', fontSize: '13px' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
                    * <span style={{ background: 'linear-gradient(135deg,#a78bfa,#67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sketchbyte</span>
                </div>
                <p style={{ margin: '0 0 4px' }}>Built with passion for students and coders · Free forever</p>
                <p style={{ margin: 0 }}>Founded by <strong style={{ color: 'rgba(167,139,250,.8)' }}>Dhruva M</strong> · Think Without Limits.</p>
            </footer>
        </div>
    );
};

export default DownloadPage;
