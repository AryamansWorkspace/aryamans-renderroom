import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Configuration ---
const BG_COLOR = '#0a0a0f';
const ACCENT_PURPLE = '#9D4EDD';
const ACCENT_BLUE = '#00B4D8';

const SOCIALS = {
  instagram: 'https://instagram.com/yourhandle',
  discord: 'https://discord.gg/yourserver',
  reddit: 'https://reddit.com/user/yourhandle',
};

// --- Placeholder data ---
const PLACEHOLDER_GRAPHICS = Array.from({ length: 8 }).map((_, i) => ({
  id: `g-${i}`,
  title: `Graphic ${i + 1}`,
  type: 'graphic',
}));

const PLACEHOLDER_VIDEOS = Array.from({ length: 6 }).map((_, i) => ({
  id: `v-${i}`,
  title: `Edit ${i + 1}`,
  type: 'video',
}));

export default function App() {
  const [page, setPage] = useState('home'); // 'home' | 'vault' | 'about' | 'contact'
  const [tab, setTab] = useState('graphics');
  const [modalItem, setModalItem] = useState(null);
  const audioRef = useRef(null);
  const [ambientOn, setAmbientOn] = useState(true);

  useEffect(() => {
    // create audio element for lofi (public/lofi.wav)
    audioRef.current = new Audio('/lofi.wav');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.12;
    // autoplay restrictions: start only after user interaction; we'll attempt to play but ignore errors
    if (ambientOn) {
      audioRef.current.play().catch(()=>{});
    }
    return () => {
      try{ audioRef.current.pause(); }catch(e){}
    }
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (ambientOn) {
      audioRef.current.play().catch(()=>{});
    } else {
      audioRef.current.pause();
    }
  }, [ambientOn]);

  // simple click/hover synthesized sounds using WebAudio (small beeps)
  const audioCtxRef = useRef(null);
  useEffect(()=> {
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  function playTone(freq=880,dur=0.04,gain=0.01) {
    const ctx = audioCtxRef.current;
    if(!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + dur);
  }

  function hoverPing(){ playTone(880,0.03,0.008); }
  function clickVault(){
    playTone(800,0.06,0.02);
    setTimeout(()=>playTone(600,0.06,0.02),60);
    setTimeout(()=>playTone(450,0.06,0.02),120);
  }

  // cursor trail canvas
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let particles = [];

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);

    function addParticle(x, y) {
      particles.push({ x, y, vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6, life: 1, r: 6 + Math.random() * 10 });
      if (particles.length > 120) particles.shift();
    }

    function onMove(e) {
      const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const y = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      for (let i = 0; i < 2; i++) addParticle(x + Math.random() * 6 - 3, y + Math.random() * 6 - 3);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });

    function draw() {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.01;
        p.r *= 0.995;
        if (p.life <= 0 || p.r < 0.3) {
          particles.splice(i, 1);
          i--;
          continue;
        }
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.2);
        grad.addColorStop(0, 'rgba(157,78,221,0.95)');
        grad.addColorStop(0.5, 'rgba(0,180,216,0.6)');
        grad.addColorStop(1, 'rgba(10,10,15,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
    };
  }, []);

  const galleryItems = tab === 'graphics' ? PLACEHOLDER_GRAPHICS : PLACEHOLDER_VIDEOS;

  return (
    <div className="min-h-screen text-white" style={{ background: BG_COLOR, fontFamily: 'Poppins, system-ui, sans-serif' }}>
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-50"></canvas>

      <header className="py-6 px-8 flex items-center justify-between z-40 relative">
        <div className="flex items-center gap-3">
          <div className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            <span style={{ background: `linear-gradient(90deg, ${ACCENT_PURPLE}, ${ACCENT_BLUE})`, WebkitBackgroundClip: 'text', color: 'transparent' }}>
              Aryaman’s RenderRoom
            </span>
          </div>
          <div className="ml-3 text-sm opacity-70">Where Graphics and Motion Collide</div>
        </div>

        <nav className="flex items-center gap-4">
          <button
            onMouseEnter={hoverPing}
            onClick={() => { clickVault(); setPage('vault'); }}
            className="px-4 py-2 rounded-md font-medium transition-all transform hover:scale-105"
            style={{
              background: `linear-gradient(90deg, rgba(157,78,221,0.12), rgba(0,180,216,0.06))`,
              border: `1px solid rgba(157,78,221,0.14)`,
              boxShadow: `0 6px 24px rgba(0,0,0,0.6)`,
            }}
          >
            <span className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7v6c0 5 4 9 10 9s10-4 10-9V7l-10-5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Enter Vault
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button onClick={() => setPage('about')} onMouseEnter={hoverPing} className="text-sm opacity-80 hover:opacity-100">About</button>
            <button onClick={() => setPage('contact')} onMouseEnter={hoverPing} className="text-sm opacity-80 hover:opacity-100">Contact</button>
          </div>

          <div className="flex items-center gap-2 pl-4 border-l border-white/6">
            <label className="flex items-center gap-2 text-sm opacity-80">
              <input type="checkbox" checked={ambientOn} onChange={(e) => setAmbientOn(e.target.checked)} />
              Ambient
            </label>
          </div>
        </nav>
      </header>

      <main className="px-8 pb-20 z-30 relative">
        <AnimatePresence mode="wait" initial={false}>
          {page === 'home' && (
            <motion.section key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-24">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-5xl font-extrabold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  <span style={{ background: `linear-gradient(90deg, ${ACCENT_PURPLE}, ${ACCENT_BLUE})`, WebkitBackgroundClip: 'text', color: 'transparent' }}>
                    Aryaman’s RenderRoom
                  </span>
                </h1>
                <p className="text-lg opacity-80 mb-8">Where Graphics and Motion Collide</p>

                <div className="flex items-center justify-center gap-4">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} onMouseEnter={hoverPing} onClick={() => { clickVault(); setPage('vault'); }} className="px-8 py-4 rounded-xl text-lg font-semibold" style={{ background: `linear-gradient(90deg, ${ACCENT_PURPLE}, ${ACCENT_BLUE})` }}>
                    Enter Vault
                  </motion.button>
                </div>

                <div className="mt-14 text-left space-y-6">
                  <div className="p-6 rounded-2xl" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <h3 className="font-bold mb-2">Prototype Features</h3>
                    <ul className="list-disc ml-5 opacity-80">
                      <li>Neon purple-blue theme</li>
                      <li>Cursor trail effect</li>
                      <li>Hover and vault sounds (synthesized)</li>
                      <li>Gallery placeholders (graphics & video edits)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {page === 'vault' && (
            <motion.section key="vault" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="px-3 py-1 rounded-md text-sm" style={{ background: `linear-gradient(90deg, rgba(157,78,221,0.12), rgba(0,180,216,0.06))` }}>Vault</div>
                  <div className="text-sm opacity-80">Explore Graphics & Video Edits</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setTab('graphics')} onMouseEnter={hoverPing} className={`px-3 py-1 rounded ${tab === 'graphics' ? 'bg-white/6' : 'bg-transparent'}`}>Graphics</button>
                  <button onClick={() => setTab('videos')} onMouseEnter={hoverPing} className={`px-3 py-1 rounded ${tab === 'videos' ? 'bg-white/6' : 'bg-transparent'}`}>Video Edits</button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {galleryItems.map((it) => (
                  <motion.div key={it.id} layout whileHover={{ scale: 1.03 }} className="rounded-xl overflow-hidden shadow-lg cursor-pointer" onMouseEnter={hoverPing} onClick={() => setModalItem(it)}>
                    <div className="h-48 flex items-end p-3" style={{ background: 'linear-gradient(135deg, rgba(157,78,221,0.16), rgba(0,180,216,0.08))' }}>
                      <div>
                        <div className="text-sm opacity-80">{it.type === 'graphic' ? 'Graphic' : 'Video Edit'}</div>
                        <div className="font-semibold text-lg">{it.title}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <AnimatePresence>
                {modalItem && (
                  <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="absolute inset-0 bg-black/70" onClick={() => setModalItem(null)}></div>
                    <motion.div initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }} className="relative max-w-4xl w-full bg-[#07070b] rounded-2xl p-6 border border-white/4 shadow-2xl">
                      <button className="absolute top-4 right-4 text-sm opacity-80" onClick={() => setModalItem(null)}>Close</button>
                      <div className="h-96 bg-gradient-to-br from-purple-800 to-cyan-700 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-xl font-bold mb-2">{modalItem.title}</div>
                          <div className="opacity-80">Placeholder visual — replace with your image or embedded video</div>
                        </div>
                      </div>
                      <div className="mt-4 text-sm opacity-80">
                        This is a prototype modal. Replace this area with detailed descriptions, links, or embedded players when integrating real content.
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )}

          {page === 'about' && (
            <motion.section key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-10 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>About</h2>
              <p className="opacity-80 mb-4">I’m Aryaman — I craft visuals and edits that tell stories. This is a prototype of <strong>Aryaman’s RenderRoom</strong> — a dark, neon-styled portfolio to showcase graphic designs and motion edits.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.005))' }}>
                  <h4 className="font-semibold mb-2">Skills</h4>
                  <ul className="list-disc ml-5 opacity-80">
                    <li>Photoshop</li>
                    <li>Premiere Pro</li>
                    <li>After Effects</li>
                    <li>Illustrator</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.005))' }}>
                  <h4 className="font-semibold mb-2">Tools</h4>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-md border border-white/6">Photoshop</span>
                    <span className="px-3 py-1 rounded-md border border-white/6">Premiere Pro</span>
                    <span className="px-3 py-1 rounded-md border border-white/6">After Effects</span>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {page === 'contact' && (
            <motion.section key="contact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-10 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Reach Me</h2>
              <p className="opacity-80 mb-6">Connect on socials or drop a message.</p>
              <div className="flex items-center gap-4">
                <a href={SOCIALS.instagram} target="_blank" rel="noreferrer" onMouseEnter={hoverPing} className="flex items-center gap-2 px-4 py-2 rounded-md border border-white/6">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Instagram
                </a>
                <a href={SOCIALS.discord} target="_blank" rel="noreferrer" onMouseEnter={hoverPing} className="flex items-center gap-2 px-4 py-2 rounded-md border border-white/6">
                  Discord
                </a>
                <a href={SOCIALS.reddit} target="_blank" rel="noreferrer" onMouseEnter={hoverPing} className="flex items-center gap-2 px-4 py-2 rounded-md border border-white/6">
                  Reddit
                </a>
              </div>

              <div className="mt-8 text-sm opacity-70">Footer — © 2025 Aryaman’s RenderRoom</div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <div className="fixed left-4 bottom-4 z-50">
        <label className="flex items-center gap-2 text-xs opacity-80 bg-white/2 px-2 py-1 rounded">
          <input type="checkbox" checked={ambientOn} onChange={(e)=>setAmbientOn(e.target.checked)} />
          Lofi Ambient
        </label>
      </div>

      <div className="fixed right-6 bottom-6 z-40 text-xs opacity-80">
        Prototype — Admin uploads live in full app (not included here)
      </div>
    </div>
  );
}
