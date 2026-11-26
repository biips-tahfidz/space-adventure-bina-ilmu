// Generator Suara Ledakan Menggelegar & Laser via Web Audio API (Ringan, 0KB file eksternal)
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Efek suara tembakan laser cepat saat siswa memilih amunisi
export function mainkanSuaraLaser() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.19);
  } catch (_) {}
}

// Efek suara ledakan menggelegar 3 detik (Sub-bass boom + gemuruh white noise)
export function mainkanSuaraLedakanMenggelegar() {
  try {
    const ctx = getAudioContext();
    const durasi = 2.9;
    const now = ctx.currentTime;

    // 1. Gelombang Sub-Bass Boom (Dentuman dalam)
    const osc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(135, now);
    osc.frequency.exponentialRampToValueAtTime(24, now + durasi);

    bassGain.gain.setValueAtTime(0.95, now);
    bassGain.gain.exponentialRampToValueAtTime(0.01, now + durasi);

    osc.connect(bassGain);
    bassGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + durasi);

    // 2. Gemuruh Ledakan (Filtered White Noise)
    const bufferSize = ctx.sampleRate * durasi;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 1.1));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(950, now);
    filter.frequency.exponentialRampToValueAtTime(110, now + durasi);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.9, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + durasi);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + durasi);
  } catch (_) {}
}

// Efek Visual + Suara Ledakan 3 Detik Penuh Tanpa Tertutup Soal
let sedangMeledak = false;
export function picuLedakan3Detik(pesan = '💥 TARGET HANCUR!') {
  if (sedangMeledak) return;
  sedangMeledak = true;

  const stage = document.getElementById('explosion-stage');
  const caption = document.getElementById('explosion-text');
  caption.textContent = pesan;

  document.body.classList.add('exploding');
  stage.classList.remove('hidden');
  mainkanSuaraLedakanMenggelegar();

  setTimeout(() => {
    stage.classList.add('hidden');
    document.body.classList.remove('exploding');
    sedangMeledak = false;
  }, 3000);
}

// Animasi Bintang Latar Belakang Ringan (Canvas 60FPS)
export function initSpaceCanvas() {
  const canvas = document.getElementById('space-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = Array.from({ length: 75 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.4,
      s: Math.random() * 0.4 + 0.1,
    }));
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#e2e8f0';
    for (const st of stars) {
      st.y += st.s;
      if (st.y > canvas.height) st.y = 0;
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  resize();
  loop();
}
