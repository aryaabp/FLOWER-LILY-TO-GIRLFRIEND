/**
 * Bunga Lily Mekar Bercabang - Permintaan Maaf
 * Inspired by @buildmeri procedural & pointillism blooming art.
 * Multi-branched Lily stalk with 3 blooming flowers & interactive unclickable playful button.
 */

// ==========================================
// 1. Audio Engine (Procedural Romantic Piano)
// ==========================================
class PianoSynth {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.timer = null;
    this.currentStep = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playNote(freq, time, duration = 2.4, velocity = 0.26) {
    if (!this.ctx) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, time);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 1.002, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, time);
    filter.frequency.exponentialRampToValueAtTime(360, time + duration);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(velocity, time + 0.025);
    gain.gain.exponentialRampToValueAtTime(velocity * 0.45, time + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration);
    osc2.stop(time + duration);
  }

  start() {
    this.init();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.scheduleNotes();
  }

  stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  scheduleNotes() {
    if (!this.isPlaying) return;

    // Soothing romantic chord progression (C - G - Am - F)
    const C4 = 261.63, E4 = 329.63, G4 = 392.00, B4 = 493.88;
    const G3 = 196.00, D4 = 293.66;
    const A3 = 220.00, C5 = 523.25, E5 = 659.25;
    const F3 = 174.61, A4 = 440.00;

    const pattern = [
      { bass: C4 / 2, notes: [C4, E4, G4, C5] },
      { bass: G3, notes: [G3, D4, G4, B4] },
      { bass: A3, notes: [A3, C4, E4, A4] },
      { bass: F3, notes: [F3, A4, C5, E5] },
    ];

    const currentChord = pattern[this.currentStep % pattern.length];
    const now = this.ctx.currentTime;

    this.playNote(currentChord.bass, now, 3.2, 0.22);
    currentChord.notes.forEach((freq, idx) => {
      this.playNote(freq, now + idx * 0.45, 2.2, 0.16);
    });

    this.currentStep++;
    this.timer = setTimeout(() => {
      this.scheduleNotes();
    }, 2200);
  }
}

const synth = new PianoSynth();

// ==========================================
// 2. Pointillism Branched Lily Canvas Engine
// ==========================================
const canvas = document.getElementById('flowerCanvas');
const ctx = canvas.getContext('2d');

let width = window.innerWidth;
let height = window.innerHeight;
let dpr = Math.min(window.devicePixelRatio || 1, 2);
let floatingTexts = null;

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.scale(dpr, dpr);
  if (floatingTexts) {
    floatingTexts.init();
  }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Ambient starry sky
function initStars() {
  const container = document.getElementById('starsContainer');
  container.innerHTML = '';
  const starCount = Math.floor((width * height) / 8000);
  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.className = 'star-point';
    const size = Math.random() * 2.2 + 0.8;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.setProperty('--duration', (Math.random() * 3 + 2.5) + 's');
    star.style.animationDelay = (Math.random() * 4) + 's';
    container.appendChild(star);
  }
}
initStars();

// Math utility helpers
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
function smoothstep(a, b, x) {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Single Flower Head Model (6 Petals, Stamens, Sparks)
class LilyHead {
  constructor(scale = 1.0, tilt = 0, phaseOffset = 0) {
    this.scale = scale;
    this.tilt = tilt; // angle tilt of this flower branch
    this.phaseOffset = phaseOffset;
    this.generateParticles();
  }

  generateParticles() {
    this.petals = [];
    this.stamens = [];
    this.sparks = [];

    // 6 Lily Tepals (3 outer sepals, 3 inner petals)
    const petalCount = 6;
    for (let p = 0; p < petalCount; p++) {
      const angle = (p * Math.PI * 2) / petalCount + (p % 2 === 0 ? 0 : 0.08);
      const isInner = p % 2 === 1;
      const dots = [];

      const uSteps = 26;
      const vSteps = 10;

      for (let ui = 0; ui <= uSteps; ui++) {
        const u = ui / uSteps;
        const widthProfile = Math.pow(Math.sin(Math.PI * Math.pow(u, 0.72)), 0.88);

        for (let vi = -vSteps; vi <= vSteps; vi++) {
          const v = vi / vSteps;
          const jitterU = (Math.random() - 0.5) * 0.02;
          const jitterV = (Math.random() - 0.5) * 0.04;
          const sampleU = clamp(u + jitterU, 0, 1);
          const sampleV = clamp(v + jitterV, -1, 1);
          const distFromCenter = Math.abs(sampleV);

          let r, g, b, alpha = 0.88;
          if (sampleU < 0.22) {
            // Lime green / chartreuse throat
            r = lerp(165, 235, sampleU / 0.22);
            g = lerp(225, 240, sampleU / 0.22);
            b = lerp(120, 190, sampleU / 0.22);
          } else {
            // Blushing pink center gradient fading to lily white at rims
            const pinkIntensity = (1 - distFromCenter * 0.85) * (1 - sampleU * 0.5);
            r = Math.round(lerp(255, 244, pinkIntensity));
            g = Math.round(lerp(255, 114, pinkIntensity));
            b = Math.round(lerp(255, 182, pinkIntensity));

            // Tiger lily / Stargazer freckles
            if (sampleU > 0.25 && sampleU < 0.65 && distFromCenter < 0.4 && Math.random() < 0.22) {
              r = 180; g = 35; b = 75;
            }
          }

          dots.push({
            u: sampleU,
            v: sampleV,
            widthProfile,
            radius: (Math.random() * 1.5 + 1.2) * this.scale,
            r, g, b, alpha,
            isEdge: distFromCenter > 0.82
          });
        }
      }

      this.petals.push({
        baseAngle: angle,
        dots,
        length: (isInner ? 160 : 178) * this.scale,
        maxWidth: (isInner ? 50 : 44) * this.scale,
      });
    }

    // 6 Stamens with delicate golden anthers
    for (let s = 0; s < 6; s++) {
      const angle = (s * Math.PI * 2) / 6 + Math.PI / 6;
      this.stamens.push({
        angle,
        length: 70 * this.scale,
      });
    }

    // Stardust Sparks
    for (let i = 0; i < 40; i++) {
      this.sparks.push({
        x: (Math.random() - 0.5) * 140 * this.scale,
        y: (Math.random() - 0.5) * 140 * this.scale,
        speed: Math.random() * 0.4 + 0.2,
        phase: Math.random() * Math.PI * 2,
        size: (Math.random() * 2.2 + 1) * this.scale,
        life: Math.random()
      });
    }
  }

  render(ctx, hx, hy, bloom, budProgress, time, sway) {
    if (budProgress <= 0) return;

    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(this.tilt + sway * 0.5);

    const pitch = 0.42;

    // Sort petals for natural z-indexing
    const sortedPetals = [...this.petals].map((petal) => {
      const angle = petal.baseAngle + sway * 0.3;
      const zDepth = Math.cos(angle);
      return { ...petal, currentAngle: angle, zDepth };
    }).sort((a, b) => a.zDepth - b.zDepth);

    // Back Petals
    sortedPetals.forEach(petal => {
      if (petal.zDepth <= 0.1) {
        this.renderSinglePetal(ctx, petal, bloom, budProgress, pitch, time);
      }
    });

    // Stamens & Pistil
    this.drawCenterStamens(ctx, bloom, pitch, time, sway);

    // Front Petals
    sortedPetals.forEach(petal => {
      if (petal.zDepth > 0.1) {
        this.renderSinglePetal(ctx, petal, bloom, budProgress, pitch, time);
      }
    });

    // Stardust emission
    if (bloom > 0.35) {
      this.drawSparks(ctx, 0, 0, bloom, time);
    }

    ctx.restore();
  }

  renderSinglePetal(ctx, petal, bloom, budProgress, pitch, time) {
    const angle = petal.currentAngle;
    const maxL = petal.length;
    const maxW = petal.maxWidth;

    const spread = lerp(0.18, 0.95, bloom);
    const curlBack = lerp(-0.15, 0.65, bloom);

    ctx.save();
    ctx.rotate(angle);

    const dots = petal.dots;
    const len = dots.length;

    for (let i = 0; i < len; i++) {
      const dot = dots[i];
      const u = dot.u;
      const v = dot.v;

      const r = u * maxL * spread * (budProgress * 0.9 + 0.1);
      const zCurv = (Math.pow(u, 1.8) * curlBack * 55 * this.scale) - (u * 25 * (1 - bloom) * this.scale);
      const w = v * maxW * dot.widthProfile * (0.3 + 0.7 * bloom);

      const px = w;
      const py = -r * Math.cos(pitch) + zCurv * Math.sin(pitch);

      let alpha = dot.alpha;
      if (bloom > 0.8) {
        alpha += Math.sin(time * 2.5 + u * 6 + this.phaseOffset) * 0.12;
      }

      ctx.fillStyle = `rgba(${dot.r}, ${dot.g}, ${dot.b}, ${clamp(alpha, 0.2, 1)})`;
      ctx.beginPath();
      ctx.arc(px, py, dot.radius * (0.8 + 0.3 * bloom), 0, Math.PI * 2);
      ctx.fill();

      if (dot.isEdge && bloom > 0.6) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * bloom})`;
        ctx.beginPath();
        ctx.arc(px, py, dot.radius * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  drawCenterStamens(ctx, bloom, pitch, time, sway) {
    if (bloom < 0.25) return;
    const progress = smoothstep(0.25, 1.0, bloom);

    ctx.save();
    this.stamens.forEach(stamen => {
      const angle = stamen.angle + sway * 0.3;
      const currentLen = stamen.length * progress;
      const flare = lerp(0.2, 0.75, progress);

      const steps = 14;
      let lastX = 0, lastY = 0;

      ctx.strokeStyle = `rgba(220, 245, 210, ${0.85 * progress})`;
      ctx.lineWidth = 2 * this.scale;
      ctx.beginPath();
      ctx.moveTo(0, 0);

      for (let i = 1; i <= steps; i++) {
        const u = i / steps;
        const rad = u * currentLen * flare;
        const arch = Math.pow(u, 2) * 16 * progress * this.scale;
        const sx = Math.cos(angle) * rad;
        const sy = Math.sin(angle) * rad * Math.cos(pitch) - arch;

        ctx.lineTo(sx, sy);
        lastX = sx;
        lastY = sy;
      }
      ctx.stroke();

      const antherGlow = 0.8 + Math.sin(time * 4 + angle + this.phaseOffset) * 0.2;
      ctx.save();
      ctx.translate(lastX, lastY);
      ctx.rotate(angle + Math.PI / 2);

      ctx.fillStyle = `rgba(245, 158, 11, ${antherGlow})`;
      ctx.shadowColor = 'rgba(251, 191, 36, 0.8)';
      ctx.shadowBlur = 10 * progress;
      ctx.beginPath();
      ctx.ellipse(0, 0, 6.5 * progress * this.scale, 3 * progress * this.scale, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(-2 * this.scale, 0, 1.3 * this.scale, 0, Math.PI * 2);
      ctx.arc(2 * this.scale, -1 * this.scale, 1.1 * this.scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // Central Pistil
    const pistilLen = 80 * progress * this.scale;
    ctx.strokeStyle = 'rgba(163, 230, 53, 0.9)';
    ctx.lineWidth = 3 * this.scale;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -pistilLen * Math.cos(pitch));
    ctx.stroke();

    ctx.fillStyle = 'rgba(190, 242, 100, 0.95)';
    ctx.beginPath();
    ctx.arc(0, -pistilLen * Math.cos(pitch), 4 * progress * this.scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawSparks(ctx, hx, hy, bloom, time) {
    ctx.save();
    this.sparks.forEach(sp => {
      sp.life += 0.008 * sp.speed;
      if (sp.life > 1) {
        sp.life = 0;
        sp.x = (Math.random() - 0.5) * 110 * this.scale;
        sp.y = (Math.random() - 0.5) * 110 * this.scale;
      }

      const currentY = hy + sp.y - sp.life * 120 * bloom * this.scale;
      const currentX = hx + sp.x + Math.sin(time * 2 + sp.phase) * 16;
      const alpha = Math.sin(sp.life * Math.PI) * bloom * 0.8;

      ctx.fillStyle = sp.phase > Math.PI ? `rgba(254, 240, 138, ${alpha})` : `rgba(251, 207, 232, ${alpha})`;
      ctx.shadowColor = '#f472b6';
      ctx.shadowBlur = 7;
      ctx.beginPath();
      ctx.arc(currentX, currentY, sp.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }
}

// Multi-branched Lily Plant
class BranchedLilyPlant {
  constructor() {
    this.reset();

    // 3 Flower Heads: Center (Main), Left branch, Right branch
    this.centerHead = new LilyHead(1.0, 0, 0);
    this.leftHead = new LilyHead(0.82, -0.42, 1.2);
    this.rightHead = new LilyHead(0.85, 0.38, 2.4);

    // Leaves along stems
    this.leaves = [
      { stem: 'main', t: 0.28, side: 1, length: 115, width: 22, angle: 0.55 },
      { stem: 'main', t: 0.45, side: -1, length: 125, width: 24, angle: -0.6 },
      { stem: 'left', t: 0.45, side: -1, length: 85, width: 18, angle: -0.5 },
      { stem: 'right', t: 0.45, side: 1, length: 85, width: 18, angle: 0.5 },
      { stem: 'center', t: 0.35, side: 1, length: 75, width: 16, angle: 0.45 },
      { stem: 'center', t: 0.55, side: -1, length: 70, width: 15, angle: -0.42 },
    ];
  }

  reset() {
    this.progress = 0;
    this.time = 0;
    this.isBlooming = false;
    this.hasFinishedBloom = false;
    this.swayAngle = 0;
  }

  start() {
    this.reset();
    this.isBlooming = true;
  }

  update(dt) {
    this.time += dt;

    if (this.isBlooming && this.progress < 1) {
      this.progress += dt * 0.11; // smooth growth over ~9 seconds
      if (this.progress >= 1) {
        this.progress = 1;
        this.hasFinishedBloom = true;
        onBloomComplete();
      }
    }

    this.swayAngle = Math.sin(this.time * 1.3) * 0.045;
  }

  render(ctx) {
    const p = this.progress;

    // Key points of the plant
    const rootX = width * 0.5;
    const rootY = height * 0.98;

    // Primary branch junction node
    const nodeTargetY = height * 0.60;
    const mainStemGrow = smoothstep(0.0, 0.4, p);
    const nodeY = lerp(rootY, nodeTargetY, mainStemGrow);
    const nodeX = rootX + Math.sin(this.swayAngle * 0.7) * 15 * mainStemGrow;

    // 1. Draw Main Lower Stem (Root to Branch Node)
    this.drawStemSegment(ctx, rootX, rootY, nodeX, nodeY, mainStemGrow, 7, 5, -20);

    // Leaves on main stem
    const leafGrow = smoothstep(0.2, 0.65, p);
    if (leafGrow > 0) {
      this.drawStemLeaves(ctx, rootX, rootY, nodeX, nodeY, leafGrow, 'main');
    }

    // Branch growth timelines
    const branchGrow = smoothstep(0.28, 0.75, p);
    if (branchGrow <= 0) return;

    // Branch endpoints (Targets)
    const branchSpanX = Math.min(width * 0.28, 145);

    // Center Branch & Flower Head
    const centerHeadTargetX = rootX + Math.sin(this.swayAngle) * 35;
    const centerHeadTargetY = height * 0.30;
    const centerHeadX = lerp(nodeX, centerHeadTargetX, branchGrow);
    const centerHeadY = lerp(nodeY, centerHeadTargetY, branchGrow);

    // Left Branch & Flower Head
    const leftHeadTargetX = rootX - branchSpanX + Math.sin(this.swayAngle + 0.5) * 25;
    const leftHeadTargetY = height * 0.42;
    const leftHeadX = lerp(nodeX, leftHeadTargetX, branchGrow);
    const leftHeadY = lerp(nodeY, leftHeadTargetY, branchGrow);

    // Right Branch & Flower Head
    const rightHeadTargetX = rootX + branchSpanX + Math.sin(this.swayAngle - 0.5) * 25;
    const rightHeadTargetY = height * 0.45;
    const rightHeadX = lerp(nodeX, rightHeadTargetX, branchGrow);
    const rightHeadY = lerp(nodeY, rightHeadTargetY, branchGrow);

    // 2. Draw 3 Branch Stems
    // Left branch
    this.drawStemSegment(ctx, nodeX, nodeY, leftHeadX, leftHeadY, branchGrow, 4.5, 3, -40);
    // Right branch
    this.drawStemSegment(ctx, nodeX, nodeY, rightHeadX, rightHeadY, branchGrow, 4.5, 3, 40);
    // Center branch
    this.drawStemSegment(ctx, nodeX, nodeY, centerHeadX, centerHeadY, branchGrow, 5, 3.5, 0);

    // 3. Draw Leaves on branches
    if (leafGrow > 0.3) {
      const bLeafGrow = smoothstep(0.3, 0.8, p);
      this.drawStemLeaves(ctx, nodeX, nodeY, leftHeadX, leftHeadY, bLeafGrow, 'left');
      this.drawStemLeaves(ctx, nodeX, nodeY, rightHeadX, rightHeadY, bLeafGrow, 'right');
      this.drawStemLeaves(ctx, nodeX, nodeY, centerHeadX, centerHeadY, bLeafGrow, 'center');
    }

    // 4. Staggered Blooming for the 3 Flower Heads
    const centerBud = smoothstep(0.38, 0.72, p);
    const centerBloom = smoothstep(0.48, 0.98, p);

    const leftBud = smoothstep(0.44, 0.76, p);
    const leftBloom = smoothstep(0.54, 1.0, p);

    const rightBud = smoothstep(0.46, 0.78, p);
    const rightBloom = smoothstep(0.56, 1.0, p);

    // Render Side Flowers first (back depth), Center Flower last (front depth)
    this.leftHead.render(ctx, leftHeadX, leftHeadY, leftBloom, leftBud, this.time, this.swayAngle);
    this.rightHead.render(ctx, rightHeadX, rightHeadY, rightBloom, rightBud, this.time, this.swayAngle);
    this.centerHead.render(ctx, centerHeadX, centerHeadY, centerBloom, centerBud, this.time, this.swayAngle);
  }

  drawStemSegment(ctx, x0, y0, x1, y1, grow, startW, endW, archOffset) {
    if (grow <= 0) return;
    const steps = Math.floor(55 * grow);
    const ctrlX = lerp(x0, x1, 0.5) + archOffset * grow;
    const ctrlY = lerp(y0, y1, 0.5);

    ctx.save();
    for (let i = 0; i <= steps; i++) {
      const t = i / 55;
      const bx = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * ctrlX + t * t * x1;
      const by = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * ctrlY + t * t * y1;
      const stemW = lerp(startW, endW, t);

      for (let s = -1; s <= 1; s += 0.5) {
        const px = bx + s * stemW + (Math.sin(i * 1.5) * 0.6);
        const py = by;
        const colG = Math.floor(lerp(120, 185, t));
        ctx.fillStyle = `rgba(45, ${colG}, 95, 0.85)`;
        ctx.beginPath();
        ctx.arc(px, py, 2.0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  drawStemLeaves(ctx, x0, y0, x1, y1, leafProgress, stemTag) {
    this.leaves.filter(l => l.stem === stemTag).forEach(leaf => {
      const stemT = leaf.t;
      const ctrlX = lerp(x0, x1, 0.5);
      const ctrlY = lerp(y0, y1, 0.5);

      const lx0 = (1 - stemT) * (1 - stemT) * x0 + 2 * (1 - stemT) * stemT * ctrlX + stemT * stemT * x1;
      const ly0 = (1 - stemT) * (1 - stemT) * y0 + 2 * (1 - stemT) * stemT * ctrlY + stemT * stemT * y1;

      const currentL = leaf.length * leafProgress;
      const steps = 20;

      ctx.save();
      for (let i = 0; i <= steps; i++) {
        const u = i / steps;
        const curAngle = leaf.angle + Math.sin(u * 1.5) * 0.25 * leaf.side;
        const dist = u * currentL;
        const lx = lx0 + Math.cos(curAngle) * dist * leaf.side;
        const ly = ly0 + Math.sin(curAngle) * dist + (u * u * 30);

        const w = Math.sin(Math.PI * u) * leaf.width * leafProgress;
        for (let v = -1; v <= 1; v += 0.4) {
          const px = lx - Math.sin(curAngle) * (v * w);
          const py = ly + Math.cos(curAngle) * (v * w);
          ctx.fillStyle = `rgba(38, ${Math.floor(lerp(130, 195, u))}, 90, 0.75)`;
          ctx.beginPath();
          ctx.arc(px, py, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    });
  }
}

const plant = new BranchedLilyPlant();

// ==========================================
// 3. 1,000 Floating "i love u sayang" Text Engine
// ==========================================
class FloatingTextEngine {
  constructor(count = 1000) {
    this.count = count;
    this.active = false;
    this.textVariations = [
      'i love u sayang',
      'i love u sayang 🤍',
      'i love u sayang 🌸',
      'i love u sayang ✨'
    ];
    this.buckets = {
      small: [],
      medium: [],
      large: []
    };
    this.init();
  }

  init() {
    this.buckets.small = [];
    this.buckets.medium = [];
    this.buckets.large = [];

    const isMobile = width <= 600;
    // Stratified column lanes across full width: neatly fills mobile screen from edge to edge
    const numCols = isMobile ? Math.max(6, Math.floor(width / 42)) : Math.max(14, Math.floor(width / 75));
    const colWidth = width / numCols;
    const perCol = Math.ceil(this.count / numCols);

    let created = 0;
    for (let c = 0; c < numCols; c++) {
      for (let r = 0; r < perCol && created < this.count; r++) {
        const bucketType = created % 3 === 0 ? 'small' : (created % 3 === 1 ? 'medium' : 'large');
        // Gentle opacity so the 3-branched lily stays radiant & dominant
        const baseAlpha = created % 3 === 0 ? 0.07 : (created % 3 === 1 ? 0.10 : 0.14);
        const alphaVal = (baseAlpha * (Math.random() * 0.4 + 0.8)).toFixed(2);
        const colGroup = created % 4;

        let rCol = 255, gCol = 255, bCol = 255;
        if (colGroup === 1) { rCol = 244; gCol = 114; bCol = 182; } // Soft rose pink
        else if (colGroup === 2) { rCol = 251; gCol = 207; bCol = 232; } // Light blush
        else if (colGroup === 3) { rCol = 254; gCol = 240; bCol = 138; } // Shimmering gold

        // Neat staggered vertical spacing filling full height immediately
        const rowStep = (height + 60) / perCol;
        const initialY = r * rowStep - 30 + (Math.random() - 0.5) * (rowStep * 0.5);

        // Neat horizontal lane with gentle jitter
        const laneCenterX = (c + 0.5) * colWidth;
        const initialX = laneCenterX + (Math.random() - 0.5) * (colWidth * 0.65);

        const p = {
          col: c,
          baseX: initialX,
          x: initialX,
          y: initialY,
          speedY: Math.random() * 0.38 + 0.22,
          swayAmp: Math.random() * 6 + 3,
          swayFreq: Math.random() * 1.4 + 0.8,
          phase: Math.random() * Math.PI * 2,
          fillStyle: `rgba(${rCol}, ${gCol}, ${bCol}, ${alphaVal})`,
          text: this.textVariations[created % this.textVariations.length]
        };

        this.buckets[bucketType].push(p);
        created++;
      }
    }
  }

  update(dt, time) {
    if (!this.active) return;
    const isMobile = width <= 600;
    const numCols = isMobile ? Math.max(6, Math.floor(width / 42)) : Math.max(14, Math.floor(width / 75));
    const colWidth = width / numCols;

    const bucketNames = ['small', 'medium', 'large'];
    for (let b = 0; b < 3; b++) {
      const list = this.buckets[bucketNames[b]];
      const len = list.length;
      for (let i = 0; i < len; i++) {
        const p = list[i];
        p.y -= p.speedY;
        const sway = Math.sin(time * p.swayFreq + p.phase) * p.swayAmp;
        p.x = p.baseX + sway;

        // Wrap around smoothly from top to bottom, preserving full screen coverage
        if (p.y < -35) {
          p.y = height + Math.random() * 25 + 10;
          const colX = (p.col + 0.5) * colWidth;
          p.baseX = colX + (Math.random() - 0.5) * (colWidth * 0.65);
        }
        if (p.x < -80) p.x = width + 40;
        if (p.x > width + 80) p.x = -40;
      }
    }
  }

  render(ctx) {
    if (!this.active) return;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const isMobile = width <= 600;
    // Mobile-optimized font sizes: crisp, neat, and non-overlapping
    const configs = isMobile ? [
      { key: 'small', font: "8.5px 'Plus Jakarta Sans', sans-serif" },
      { key: 'medium', font: "10px 'Plus Jakarta Sans', sans-serif" },
      { key: 'large', font: "11px 'Plus Jakarta Sans', sans-serif" }
    ] : [
      { key: 'small', font: "10px 'Plus Jakarta Sans', sans-serif" },
      { key: 'medium', font: "12px 'Plus Jakarta Sans', sans-serif" },
      { key: 'large', font: "13px 'Plus Jakarta Sans', sans-serif" }
    ];

    for (let c = 0; c < configs.length; c++) {
      const conf = configs[c];
      ctx.font = conf.font;
      const list = this.buckets[conf.key];
      const len = list.length;
      for (let i = 0; i < len; i++) {
        const p = list[i];
        ctx.fillStyle = p.fillStyle;
        ctx.fillText(p.text, p.x, p.y);
      }
    }
    ctx.restore();
  }
}

floatingTexts = new FloatingTextEngine(1000);

// Animation Loop (60 FPS)
let lastTimestamp = 0;
function animate(timestamp) {
  if (!lastTimestamp) lastTimestamp = timestamp;
  const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
  lastTimestamp = timestamp;

  ctx.clearRect(0, 0, width, height);

  // Render 1000 floating "i love u sayang" texts
  floatingTexts.update(dt, timestamp / 1000);
  floatingTexts.render(ctx);

  // Render 3-branched blooming lily plant
  plant.update(dt);
  plant.render(ctx);

  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// ==========================================
// 4. Minimalist Apology Interaction & Gift Box
// ==========================================
const introOverlay = document.getElementById('introOverlay');
const giftBoxBtn = document.getElementById('giftBoxBtn');
const interactionWrapper = document.getElementById('interactionWrapper');
const btnMusic = document.getElementById('btnMusic');
const musicIcon = document.getElementById('musicIcon');
const btnReplay = document.getElementById('btnReplay');

const btnForgive = document.getElementById('btnForgive');
const btnHesitant = document.getElementById('btnHesitant');
const buttonGroup = document.getElementById('buttonGroup');
const successBanner = document.getElementById('successBanner');

// Triggered when blooming finishes
function onBloomComplete() {
  setTimeout(() => {
    interactionWrapper.classList.add('visible');
  }, 1000);
}

// Click on Gift Box -> Opens with sparkles, starts 1,000 texts, music & blooming!
let hasOpenedBox = false;

function openGiftBox(e) {
  if (hasOpenedBox) return;
  hasOpenedBox = true;

  if (e) {
    e.stopPropagation();
  }

  if (giftBoxBtn) {
    giftBoxBtn.classList.add('opening');
  }

  try {
    synth.start();
  } catch (err) {
    console.warn(err);
  }

  floatingTexts.active = true;

  // Burst sparks from box
  createHeartExplosion(width / 2, height / 2);

  setTimeout(() => {
    if (introOverlay) {
      introOverlay.classList.add('fade-out');
    }
    plant.start();
  }, 500);
}

if (giftBoxBtn) {
  giftBoxBtn.addEventListener('click', openGiftBox);
  giftBoxBtn.addEventListener('pointerup', openGiftBox);
  giftBoxBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    openGiftBox(e);
  }, { passive: false });
}

if (introOverlay) {
  introOverlay.addEventListener('click', openGiftBox);
  introOverlay.addEventListener('pointerup', openGiftBox);
  introOverlay.addEventListener('touchend', (e) => {
    e.preventDefault();
    openGiftBox(e);
  }, { passive: false });
}

// Music Toggle Button
btnMusic.addEventListener('click', () => {
  if (synth.isPlaying) {
    synth.stop();
    musicIcon.textContent = '🔇';
  } else {
    synth.start();
    musicIcon.textContent = '🎵';
  }
});

// Replay Blooming Animation
btnReplay.addEventListener('click', () => {
  plant.start();
  floatingTexts.active = true;
  interactionWrapper.classList.remove('visible');
  interactionWrapper.classList.remove('fade-away');
  successBanner.classList.add('hidden');
  buttonGroup.classList.remove('hidden');
});

// "iya, dimaafin" Click Action -> Celebration hearts & then fade out completely
btnForgive.addEventListener('click', (e) => {
  buttonGroup.classList.add('hidden');
  successBanner.classList.remove('hidden');
  createHeartExplosion(e.clientX || width / 2, e.clientY || height * 0.7);

  // Bagian kotak ini hilang secara mulus agar keindahan bunga terlihat jelas
  setTimeout(() => {
    interactionWrapper.classList.remove('visible');
    interactionWrapper.classList.add('fade-away');
  }, 2200);
});

function createHeartExplosion(originX, originY) {
  const heartIcons = ['🤍', '🌸', '✨', '🤍', '🌸', '🤍', '🌷'];
  for (let i = 0; i < 30; i++) {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = heartIcons[Math.floor(Math.random() * heartIcons.length)];
    heart.style.left = (originX + (Math.random() - 0.5) * 160) + 'px';
    heart.style.top = (originY + (Math.random() - 0.5) * 60) + 'px';
    heart.style.fontSize = (Math.random() * 1.5 + 1.2) + 'rem';
    heart.style.setProperty('--rot', ((Math.random() - 0.5) * 60) + 'deg');
    document.body.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, 2500);
  }
}

// ==========================================
// 4. "Masih ngambek 🥺" Runaway Button (Unclickable)
// ==========================================
let hesitantCount = 0;
const hesitantResponses = [
  'eits gak kena 😜',
  'gak bisa diklik wleee 😝',
  'tombol ini rusak khusus kamu 😂',
  'pencet yang hijau ajaa 💚',
  'jangan ngambek lagii yaa cantikk 🥺',
  'gak boleh diklik pokoknya! 😋',
  'tuh kan lari lagi 🏃‍♂️💨',
  'maafin yaa sayang? 🥰'
];

let lastHesitantX = 0;
let lastHesitantY = 0;

function dodgeHesitantBtn(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  hesitantCount++;
  const labelSpan = btnHesitant.querySelector('span');
  if (labelSpan) {
    labelSpan.textContent = hesitantResponses[hesitantCount % hesitantResponses.length];
  }

  const isMobile = window.innerWidth <= 600;
  const maxRangeX = isMobile ? 85 : 140;
  const maxRangeY = isMobile ? 30 : 45;

  let newX = (Math.random() - 0.5) * 2 * maxRangeX;
  let newY = (Math.random() - 0.5) * 2 * maxRangeY;

  if (Math.abs(newX - lastHesitantX) < 40) {
    newX = newX >= 0 ? newX + 45 : newX - 45;
  }

  const rot = (Math.random() - 0.5) * 16;
  lastHesitantX = newX;
  lastHesitantY = newY;

  btnHesitant.style.transform = `translate(${newX}px, ${newY}px) rotate(${rot}deg) scale(0.96)`;
  setTimeout(() => {
    btnHesitant.style.transform = `translate(${newX}px, ${newY}px) rotate(${rot}deg) scale(1)`;
  }, 150);
}

// Autonomous continuous wandering
function autoWanderHesitant() {
  if (!interactionWrapper.classList.contains('visible') || buttonGroup.classList.contains('hidden')) {
    return;
  }
  const isMobile = window.innerWidth <= 600;
  const rangeX = isMobile ? 65 : 110;
  const rangeY = isMobile ? 24 : 35;

  const wanderX = (Math.random() - 0.5) * 2 * rangeX;
  const wanderY = (Math.random() - 0.5) * 2 * rangeY;
  const rot = (Math.random() - 0.5) * 12;

  lastHesitantX = wanderX;
  lastHesitantY = wanderY;
  btnHesitant.style.transform = `translate(${wanderX}px, ${wanderY}px) rotate(${rot}deg)`;
}

// Auto move every 1.5 seconds
setInterval(autoWanderHesitant, 1500);

// Block all clicks & touches
btnHesitant.setAttribute('tabindex', '-1');
btnHesitant.addEventListener('mouseenter', dodgeHesitantBtn);
btnHesitant.addEventListener('pointerenter', dodgeHesitantBtn);
btnHesitant.addEventListener('pointerdown', (e) => {
  dodgeHesitantBtn(e);
  return false;
});
btnHesitant.addEventListener('touchstart', (e) => {
  dodgeHesitantBtn(e);
  return false;
}, { passive: false });
btnHesitant.addEventListener('touchmove', (e) => {
  dodgeHesitantBtn(e);
  return false;
}, { passive: false });
btnHesitant.addEventListener('click', (e) => {
  dodgeHesitantBtn(e);
  return false;
});
