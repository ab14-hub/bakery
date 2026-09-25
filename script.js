/**
 * DOLCE & BERRY — 3D BROWNIE SCROLL HERO ENGINE
 * Single MP4 video scrubbed by scroll — GitHub Pages compatible
 */

(function () {
  'use strict';

  const VIDEO_SRC = 'brownie_scroll.mp4';
  const BG_COLOR  = '#1c1514';

  // --- DOM ---
  const canvas      = document.getElementById('brownie-canvas');
  if (!canvas) return;
  const ctx         = canvas.getContext('2d', { alpha: false });
  const heroSection = document.getElementById('hero');

  // --- VIDEO: attach to DOM so browser buffers it properly ---
  const video = document.createElement('video');
  video.src         = VIDEO_SRC;
  video.muted       = true;
  video.playsInline = true;
  video.preload     = 'auto';
  video.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;top:-9999px';
  document.body.appendChild(video);

  let videoDuration = 0;
  let videoReady    = false;
  let targetTime    = 0;
  let currentTime   = 0;
  let isSeeking     = false;

  let targetProgress  = 0;
  let currentProgress = 0;

  // --- RESIZE ---
  function resizeCanvas() {
    const dpr     = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = Math.round(canvas.clientWidth  * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    draw();
  }

  // --- DRAW CURRENT VIDEO FRAME ---
  function draw() {
    const cw = canvas.width;
    const ch = canvas.height;

    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, cw, ch);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (videoReady && video.readyState >= 2) {
      const vw    = video.videoWidth;
      const vh    = video.videoHeight;
      const scale = Math.max(cw / vw, ch / vh);
      const dw    = Math.round(vw * scale);
      const dh    = Math.round(vh * scale);
      ctx.drawImage(video, Math.round((cw - dw) / 2), Math.round((ch - dh) / 2), dw, dh);
    }

    drawText(cw, ch);
  }

  // --- TEXT OVERLAY ---
  function drawText(cw, ch) {
    const dpr   = Math.min(window.devicePixelRatio || 1, 2);
    const fsize = Math.round(cw / dpr / 11);

    ctx.save();
    const grad = ctx.createLinearGradient(0, 0, 0, ch * 0.45);
    grad.addColorStop(0, 'rgba(10,5,3,0.55)');
    grad.addColorStop(1, 'rgba(10,5,3,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch * 0.45);

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';
    ctx.shadowColor   = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur    = Math.round(fsize * 0.8);
    ctx.shadowOffsetY = Math.round(fsize * 0.15);
    ctx.font      = `${fsize}px 'Italiana', serif`;
    ctx.fillStyle = '#f5e9d6';
    ctx.fillText('TASTE THE MOMENT', cw / 2, Math.round(ch * 0.16));
    ctx.restore();
  }

  // --- SCROLL PROGRESS ---
  function getScrollProgress() {
    if (!heroSection) return 0;
    const rect  = heroSection.getBoundingClientRect();
    const track = rect.height - window.innerHeight;
    if (track <= 0) return 0;
    return Math.min(Math.max(-rect.top / track, 0), 1);
  }

  // --- MAIN RAF LOOP ---
  function loop() {
    // Smooth scroll progress
    targetProgress  = getScrollProgress();
    currentProgress += (targetProgress - currentProgress) * 0.14;

    if (videoReady && videoDuration > 0) {
      targetTime = currentProgress * videoDuration;

      // Seek only when not already seeking and when diff is meaningful
      if (!isSeeking && Math.abs(targetTime - video.currentTime) > 0.015) {
        isSeeking = true;
        video.currentTime = targetTime;
      }
    }

    requestAnimationFrame(loop);
  }

  // --- VIDEO EVENTS ---
  video.addEventListener('loadedmetadata', () => {
    videoDuration = video.duration;
    videoReady    = true;
    video.currentTime = 0;
    draw();
  });

  video.addEventListener('seeked', () => {
    isSeeking = false;
    draw(); // Redraw canvas after seek completes
  });

  video.addEventListener('canplay', () => {
    videoReady = true;
    draw();
  });

  // --- INIT ---
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  loop();

})();
