import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * AI LifeOS — 3D AI Neural Background Engine
 * High-performance WebGL 3D projection engine rendering a living 3D neural network,
 * central AI energy core, orbital rings, digital brain matrix, and mouse parallax.
 */
export const ThreeDBackground = ({ aiState = 'idle' }) => {
  const canvasRef = useRef(null);
  const location = useLocation();
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  const isFocusPage = location.pathname === '/focus';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = width < 768;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Handle Resize
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse Parallax Listener
    const handleMouseMove = (e) => {
      if (reducedMotion) return;
      mouseRef.current.targetX = (e.clientX - width / 2) / (width / 2);
      mouseRef.current.targetY = (e.clientY - height / 2) / (height / 2);
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Initialize 3D Neural Nodes
    const nodeCount = isMobile ? 25 : 55;
    const nodes = [];
    const focalLength = 400;

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: (Math.random() - 0.5) * 1200,
        y: (Math.random() - 0.5) * 800,
        z: Math.random() * 800 + 100,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2.5 + 1.5,
        color: i % 3 === 0 ? '#818cf8' : i % 3 === 1 ? '#38bdf8' : '#a855f7'
      });
    }

    // Data Pulses traveling between connected nodes
    const pulses = [];
    for (let i = 0; i < (isMobile ? 8 : 18); i++) {
      pulses.push({
        from: Math.floor(Math.random() * nodeCount),
        to: Math.floor(Math.random() * nodeCount),
        progress: Math.random(),
        speed: Math.random() * 0.01 + 0.005
      });
    }

    let coreRotation = 0;
    let pulseAngle = 0;

    // Main 3D Render Loop
    const render = () => {
      // Pause if tab is hidden
      if (document.hidden) {
        animFrameId = requestAnimationFrame(render);
        return;
      }

      // Smooth Lerp Mouse Parallax
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;
      const offsetX = mouseRef.current.x * 40;
      const offsetY = mouseRef.current.y * 30;

      // Clear Canvas with Dark Deep Background
      ctx.fillStyle = isFocusPage ? '#09090b' : '#030712';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2 + offsetX;
      const cy = height / 2 + offsetY;

      // --- 1. HOLOGRAPHIC 3D PERSPECTIVE GRID ---
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.04)';
      ctx.lineWidth = 1;
      const gridY = height * 0.7;
      for (let x = -width; x < width * 2; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x + offsetX * 0.5, gridY);
        ctx.lineTo(cx + (x - cx) * 3, height);
        ctx.stroke();
      }

      // --- 2. CENTRAL 3D AI ENERGY CORE ---
      coreRotation += aiState === 'thinking' ? 0.02 : isFocusPage ? 0.003 : 0.008;
      pulseAngle += aiState === 'thinking' ? 0.08 : 0.03;
      const corePulseScale = 1 + Math.sin(pulseAngle) * (aiState === 'thinking' ? 0.15 : 0.05);

      if (!isFocusPage) {
        ctx.save();
        ctx.translate(cx, cy - 40);

        // Outer Glow Aura
        const auraGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 160 * corePulseScale);
        auraGrad.addColorStop(0, aiState === 'thinking' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(99, 102, 241, 0.15)');
        auraGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.05)');
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 160 * corePulseScale, 0, Math.PI * 2);
        ctx.fill();

        // Orbital Ring 1
        ctx.strokeStyle = aiState === 'thinking' ? 'rgba(56, 189, 248, 0.4)' : 'rgba(129, 140, 248, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, 120 * corePulseScale, 35 * corePulseScale, coreRotation, 0, Math.PI * 2);
        ctx.stroke();

        // Orbital Ring 2
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.2)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 140 * corePulseScale, 45 * corePulseScale, -coreRotation * 0.8, 0, Math.PI * 2);
        ctx.stroke();

        // Inner Sphere
        const sphereGrad = ctx.createRadialGradient(-10, -10, 2, 0, 0, 25 * corePulseScale);
        sphereGrad.addColorStop(0, '#ffffff');
        sphereGrad.addColorStop(0.4, '#818cf8');
        sphereGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
        ctx.fillStyle = sphereGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 25 * corePulseScale, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // --- 3. 3D NEURAL NODES & CONNECTIONS ---
      // Update node 3D positions
      nodes.forEach((n) => {
        if (!reducedMotion) {
          n.x += n.vx * (aiState === 'thinking' ? 1.8 : 1.0);
          n.y += n.vy * (aiState === 'thinking' ? 1.8 : 1.0);
          n.z += n.vz * (aiState === 'thinking' ? 1.8 : 1.0);

          if (Math.abs(n.x) > 600) n.vx *= -1;
          if (Math.abs(n.y) > 400) n.vy *= -1;
          if (n.z < 50 || n.z > 900) n.vz *= -1;
        }

        // Project 3D to 2D
        const scale = focalLength / (focalLength + n.z);
        n.projX = cx + n.x * scale;
        n.projY = cy + n.y * scale;
        n.projRadius = n.radius * scale;
        n.alpha = Math.min(1, scale * 1.2) * (isFocusPage ? 0.3 : 0.8);
      });

      // Draw 3D Connecting Lines
      ctx.lineWidth = 0.8;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dz = n1.z - n2.z;
          const distSq = dx * dx + dy * dy + dz * dz;

          if (distSq < 220 * 220) {
            const lineAlpha = (1 - Math.sqrt(distSq) / 220) * 0.25 * Math.min(n1.alpha, n2.alpha);
            ctx.strokeStyle = `rgba(129, 140, 248, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(n1.projX, n1.projY);
            ctx.lineTo(n2.projX, n2.projY);
            ctx.stroke();
          }
        }
      }

      // --- 4. DATA FLOW PULSES ---
      pulses.forEach((p) => {
        p.progress += p.speed * (aiState === 'thinking' ? 2.5 : 1.0);
        if (p.progress >= 1) {
          p.progress = 0;
          p.from = Math.floor(Math.random() * nodeCount);
          p.to = Math.floor(Math.random() * nodeCount);
        }

        const n1 = nodes[p.from];
        const n2 = nodes[p.to];
        if (n1 && n2) {
          const px = n1.projX + (n2.projX - n1.projX) * p.progress;
          const py = n1.projY + (n2.projY - n1.projY) * p.progress;

          ctx.fillStyle = aiState === 'thinking' ? '#38bdf8' : '#a855f7';
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw 3D Neural Nodes
      nodes.forEach((n) => {
        ctx.fillStyle = n.color;
        ctx.globalAlpha = n.alpha;
        ctx.beginPath();
        ctx.arc(n.projX, n.projY, Math.max(1, n.projRadius), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [location.pathname, aiState]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-700"
      style={{ opacity: isFocusPage ? 0.4 : 0.85 }}
    />
  );
};
