/**
 * DOLCE & BERRY — 3D BROWNIE SCROLL HERO ENGINE
 * Ultra-smooth 60fps frame sequence with fallback + "TASTE THE MOMENT"
 */

(function () {
  'use strict';

  // --- CONFIGURATION ---
  const TOTAL_FRAMES    = 120;
  const FRAME_DIR       = 'brownie';
  const FRAME_PREFIX    = 'ezgif-frame-';
  const FRAME_EXT       = '.jpg';
  const BG_COLOR        = '#1c1514';

  // --- DOM ---
  const canvas      = document.getElementById('brownie-canvas');
  if (!canvas) return;
  const ctx         = canvas.getContext('2d', { alpha: false });
  const heroSection = document.getElementById('hero');

  // --- STATE ---
  const images          = [];
  let loadedCount       = 0;
  let targetProgress    = 0;
  let currentProgress   = 0;
  let currentFrameIndex = 0;

  // --- HELPER ---
  function getFrameUrl(n) {
    return `${FRAME_DIR}/${FRAME_PREFIX}${String(n).padStart(3, '0')}${FRAME_EXT}`;
  }

  function resizeCanvas() {
    const dpr     = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = Math.round(canvas.clientWidth  * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    renderFrame(currentFrameIndex);
  }

  // --- RENDER ---
  function renderFrame(idx) {
    // If the requested frame isn't loaded yet, fallback to the nearest loaded frame
    let img = images[idx];
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let i = idx; i >= 0; i--) {
        if (images[i] && images[i].complete && images[i].naturalWidth > 0) {
          img = images[i];
          break;
        }
      }
    }
    if (!img || !img.complete || img.naturalWidth === 0) {
      img = images[0];
    }

    const cw = canvas.width;
    const ch = canvas.height;

    // Dark background
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, cw, ch);

    if (img && img.complete && img.naturalWidth > 0) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw brownie frame — cover (full width, no gaps)
      const iw    = img.naturalWidth;
      const ih    = img.naturalHeight;
      const scale = Math.max(cw / iw, ch / ih);
      const dw    = Math.round(iw * scale);
      const dh    = Math.round(ih * scale);
      const dx    = Math.round((cw - dw) / 2);
      const dy    = Math.round((ch - dh) / 2);
      ctx.drawImage(img, dx, dy, dw, dh);
    }

    // Text overlay — "TASTE THE MOMENT"
    drawText(cw, ch);
  }

  function drawText(cw, ch) {
    const dpr   = Math.min(window.devicePixelRatio || 1, 2);
    const fsize = Math.round(cw / dpr / 11);

    ctx.save();

    // Subtle dark vignette so text is readable over bright frames
    const grad = ctx.createLinearGradient(0, 0, 0, ch * 0.45);
    grad.addColorStop(0, 'rgba(10, 5, 3, 0.55)');
    grad.addColorStop(1, 'rgba(10, 5, 3, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch * 0.45);

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';
    ctx.shadowColor   = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur    = Math.round(fsize * 0.8);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = Math.round(fsize * 0.15);
    ctx.font      = `${fsize}px 'Italiana', serif`;
    ctx.fillStyle = '#f5e9d6';
    ctx.fillText('TASTE THE MOMENT', cw / 2, Math.round(ch * 0.16));

    ctx.restore();
  }

  // --- PRELOAD ---
  function preloadFrames() {
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFrameUrl(i);

      img.onload = () => {
        loadedCount++;
        if (loadedCount === 1) {
          resizeCanvas();
          renderFrame(0);
        } else if (currentFrameIndex === (i - 1)) {
          renderFrame(currentFrameIndex);
        }
      };

      images.push(img);
    }
  }

  // --- SCROLL LOOP ---
  function updateScroll() {
    if (heroSection) {
      const rect        = heroSection.getBoundingClientRect();
      const scrollTrack = rect.height - window.innerHeight;
      if (scrollTrack > 0) {
        targetProgress = Math.min(Math.max(-rect.top / scrollTrack, 0), 1);
      }
    }

    currentProgress += (targetProgress - currentProgress) * 0.14;

    const fi = Math.min(
      Math.floor(currentProgress * (TOTAL_FRAMES - 1)),
      TOTAL_FRAMES - 1
    );

    if (fi !== currentFrameIndex) {
      currentFrameIndex = fi;
      renderFrame(fi);
    }

    requestAnimationFrame(updateScroll);
  }

  // --- INIT ---
  window.addEventListener('resize', resizeCanvas);
  preloadFrames();
  resizeCanvas();
  requestAnimationFrame(updateScroll);

})();
